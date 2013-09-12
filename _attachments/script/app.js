/*!
 * Copyright (C) 2013, Sven Klomp
 * 
 * Released under the MIT license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 */




var App = angular.module('TodoApp', ['CornerCouch']);



    
App.directive('mytodo', function () {
    return {
        restrict: 'E',
        template:   '<div ng-hide="editing">' +
                        '<a class="todo_title" href="" class="done-{{todo.done}}" ng-click="toggleDetails()">{{todo.title}}<span ng_show="detailsavailable()">&#8675;</span></a> <a href="" ng_show="showDetails" ng-click="editTodo()">e</a>' +
                        '<input style="float:right" type="checkbox" ng-model="todo.done" ng-change="saveTodo()"> ' +
                        '<div ng_show="showDetails" markup="todo.details"></div>' +
                    '</div>' +
                    '<div ng_show="editing">' +
                        '<input type="text" ng-model="todo.title"> <a href="" ng-click="saveTodo()">s</a> <a href="" ng-click="loadTodo()">c</a><br>' +
                        '<div ng_hide="editingonly">' +
                            '<textarea class="details_input" ng-model="todo.details" placeholder="Details"></textarea><br>' +
                            '<span class="tag" ng-repeat="tag in todo.tags">{{tag}}&nbsp;<a href="" ng-click="removeTag(tag)">&times;</a> </span>' +
                            '<form ng-submit="addTag()">' +
                                '<input type="text" ng-model="tagText" size="30" placeholder="add new tag">' +
                                '<input type="submit" value="add">' +
                            '</form>' +
                        '</div>' +
                    '</div>',
        scope: {
            todo : "="
        },
        link: function (scope, elem, attrs) {
            scope.toggleDetails = function() {
                scope.showDetails=!scope.showDetails;
            };

            scope.editTodo = function() {
                scope.editing=true;
            };

            scope.saveTodo = function() {
                scope.todo.save().success( function() {
                    scope.editing=false;
                });
            };

            scope.loadTodo = function() {
                scope.todo.load().success( function() {
                    scope.editing=false;
                });
            };

            scope.detailsavailable = function(){
                if (typeof(scope.todo.details)=="undefined") {
                    return false;
                }
                else if (scope.todo.details=="") {
                    return false;
                }
                else {
                    return true;
                }
            }
            
            scope.addTag = function() {
                scope.todo.tags.push(scope.tagText);
                scope.tagText = '';
            };
         
            scope.removeTag = function(tag) {
                var index = scope.todo.tags.indexOf(tag);
                scope.todo.tags.splice(index, 1);
            };

        }
    }
});
   

App.directive('markup', function () {
    return {
        restrict: 'A',
        scope: true, //Child scope
        link: function (scope, elem, attrs) {
            var converter = new Showdown.converter();
            
            scope.$watch(attrs.markup, function(v) {
                if (typeof(v)!== "undefined") {
                    var htmlText = converter.makeHtml(v);
                    elem.html(htmlText);
                    
                }
            });
        }
    }
});



function TodoCtrl($scope, cornercouch) {
    $scope.server = cornercouch();

    $scope.server.session();
    $scope.userdb = $scope.server.getDB('klomp');

    $scope.tags={list: []};
    
    $scope.updateTagsList = function() {
    
        $scope.userdb.query("todo", "tags", { group: true })
            .success(function(data, status) {
                var tags=["[All Tags]"];
                for (var i=0; i<data.rows.length; i++) {
                    var row = data.rows[i];
                    tags.push(row.key);
                }
                $scope.tags.list=tags;
            if (typeof($scope.tags.selected) == "undefined") {
                $scope.changedTag($scope.tags.list[0]);
            }
        });
    };

 
    
        
    $scope.initNewTodo = function() {
        $scope.newTodo = $scope.userdb.newDoc(); 
        $scope.newTodo.type = "todo";
        $scope.newTodo.tags= ["new"];
    }   

    $scope.initNewTodo();
    $scope.updateTagsList();
    
    $scope.addTodo = function() {
        $scope.newTodo.tags.push($scope.tags.selected);
        $scope.newTodo.save()
            .success(function() {
                $scope.changedTag();
                $scope.updateTagsList();
            });
        $scope.initNewTodo();
    };
     

    $scope.changedTag = function(tag) {
        if (typeof(tag)!=="undefined") {
            $scope.tags.selected=tag;
        }

        var startkey=[$scope.tags.selected];
        var endkey=[$scope.tags.selected, {}];
        
        $scope.todos_bytags={};

        if ($scope.tags.selected==="[All Tags]") {
            var startkey=undefined;
            var endkey=undefined;
        }

        $scope.userdb.query("todo", "by_tag", { startkey: startkey, endkey: endkey, include_docs: true })
            .success(function(data, status) {
                for (var i=0; i<data.rows.length; i++) {
                    var row = data.rows[i];
                    var current_tag=row.key[0];
                    if (!$scope.todos_bytags.hasOwnProperty(current_tag)) {
                        $scope.todos_bytags[current_tag]={tag: current_tag, list: []};
                    }
                    $scope.todos_bytags[current_tag].list.push($scope.userdb.newDoc(row.doc));
                }
            });
  
    };

        
    $scope.countRemaining = function() {
        var count = 0;
        angular.forEach($scope.todos_bytags, function(todos) {
            angular.forEach(todos.list, function(todo) {
                count += todo.done ? 0 : 1;
            });
        });
        return count;
    };
     
    $scope.countAll = function() {
        var count = 0;
        angular.forEach($scope.todos_bytags, function(todos) {
            count+= todos.list.length;
        });
        return count;
    };

    $scope.archive = function() {
        if ($scope.todos_bytags.hasOwnProperty($scope.tags.selected)) {
            angular.forEach($scope.todos_bytags[$scope.tags.selected].list, function(todo) {
                alert(todo.title);
                if (todo.done)
                {
                    todo.remove();
                }
            });
            
            //$scope.changedTag();
            // Has to be done after success!
        }
    };
    
}

 
function InputCtrl($scope, $window, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.userdb = $scope.server.getDB('klomp');
    initEntry();
    
    $scope.submitData = function() {
        $scope.newentry.save()
            .success(function(data, status) {
                initEntry();
                $window.history.back();
            })
            .error(function(data, status) {
                alert(status);
                alert(data);
            });
    };
    
    function initEntry() {
        $scope.newentry = $scope.userdb.newDoc(); 
        $scope.newentry.type = "health";
        $scope.newentry.date = getIsoDate();
        $scope.newentry.time = getTime();
    }
}

