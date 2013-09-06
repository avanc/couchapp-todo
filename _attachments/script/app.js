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
                        '<a href="" class="done-{{todo.done}}" ng-click="toggleDetails()">{{todo.title}}</a> <a href="" ng_show="showDetails" ng-click="editTodo()">e</a>' +
                        '<input style="float:right" type="checkbox" ng-model="todo.done" ng-change="saveTodo()"> ' +
                        '<div ng_show="showDetails">{{todo.details}}</div>' +
                    '</div>' +
                    '<div ng_show="editing">' +
                        '<input type="text" ng-model="todo.title"> <a href="" ng-click="saveTodo()">s</a><br>' +
                        '<div ng_hide="editingonly">' +
                            '<input type="textarea" ng-model="todo.details" placeholder="Details"><br>' +
                            '<span ng-repeat="tag in todo.tags">{{tag}}<a href="" ng-click="removeTag(tag)">&times;</a> </span>' +
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
   

function TodoCtrl($scope, cornercouch) {
    $scope.server = cornercouch();

    $scope.server.session();
    $scope.userdb = $scope.server.getDB('klomp');

    $scope.tags={list: []};
    
    $scope.userdb.query("todo", "tags", { group: true })
        .success(function(data, status) {
            var tags=[];
            for (var i=0; i<data.rows.length; i++) {
                var row = data.rows[i];
                tags.push(row.key);
            }
            $scope.tags.list=tags;
            $scope.changedTag($scope.tags.list[0]);
        });

    
        
    $scope.initNewTodo = function() {
        $scope.newTodo = $scope.userdb.newDoc(); 
        $scope.newTodo.type = "todo";
        $scope.newTodo.tags= ["new"];
    }   

    $scope.initNewTodo();

    
    $scope.addTodo = function() {
        $scope.newTodo.tags.push($scope.tags.selected);
        $scope.newTodo.save()
            .success(function() {
                $scope.changedTag();
            });
        $scope.initNewTodo();
    };
     

    $scope.changedTag = function(tag) {
        if (typeof(tag)!=="undefined") {
            $scope.tags.selected=tag;
        }

        $scope.userdb.query("todo", "by_tag", { startkey: [$scope.tags.selected], endkey: [$scope.tags.selected, {}], include_docs: true })
            .success(function(data, status) {
                var todos=[];
                for (var i=0; i<data.rows.length; i++) {
                    var row = data.rows[i];
                    todos.push($scope.userdb.newDoc(row.doc));
                }
                $scope.todos=todos;
            });
    };

        
    $scope.remaining = function() {
        var count = 0;
        angular.forEach($scope.todos, function(todo) {
            count += todo.done ? 0 : 1;
        });
        return count;
    };
     
    $scope.archive = function() {
        var oldTodos = $scope.todos;
        $scope.todos = [];
        angular.forEach(oldTodos, function(todo) {
            if (!todo.done) $scope.todos.push(todo);
        });
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


function StatisticsCtrl($scope, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.userdb = $scope.server.getDB('klomp');

    $scope.data={weight: [[[]], [[]]]};
    
    $scope.userdb.query("health_diary", "heart_pulse", { include_docs: false, descending: true})
        .success(function(data, status) {
            var pulse=[];
            for (var i=0; i<data.rows.length; i++) {
                var row = data.rows[i];
                pulse.push([getTimestamp(row.key[0], row.key[1]), row.value]);
            }
            $scope.data.pulse=[pulse];
        });

    $scope.userdb.query("health_diary", "heart_pressure", { include_docs: false, descending: true})
        .success(function(data, status) {
            var diastolic=[];
            var systolic=[];
            
            for (var i=0; i<data.rows.length; i++) {
                var row = data.rows[i];
                diastolic.push([getTimestamp(row.key[0], row.key[1]), row.value["diastolic"]]);
                systolic.push([getTimestamp(row.key[0], row.key[1]), row.value["systolic"]]);
            }
            $scope.data.pressure=[diastolic, systolic];
        });
    

    $scope.userdb.query("health_diary", "weight_dressed", { include_docs: false, descending: true})
        .success(function(data, status) {
            var weight=[];
            
            for (var i=0; i<data.rows.length; i++) {
                var row = data.rows[i];
                weight.push([getTimestamp(row.key[0], row.key[1]), row.value]);
            }
            $scope.data.weight=[$scope.data.weight[0],weight];
        });
        
    $scope.userdb.query("health_diary", "weight_naked", { include_docs: false, descending: true})
        .success(function(data, status) {
            var weight=[];
            
            for (var i=0; i<data.rows.length; i++) {
                var row = data.rows[i];
                weight.push([getTimestamp(row.key[0], row.key[1]), row.value]);
            }
            $scope.data.weight=[weight, $scope.data.weight[1]];
        });

        
}

function getIsoDate(date) {
    if ( typeof(date) == "undefined" ) {
        date= new Date();
    }

    var year = date.getFullYear();
    
    var month = date.getMonth()+1;
    if(month <= 9)
        month = '0'+month;

    var day= date.getDate();
    if(day <= 9)
        day = '0'+day;

    var isoDate = year +'-'+ month +'-'+ day;
    return isoDate;
}

function getTime(date) {
    if ( typeof(date) == "undefined" ) {
        date= new Date();
    }

    var hours = date.getHours();
    var minutes = date.getMinutes();
    
    if(minutes <= 9)
        minutes = '0'+minutes;
    if(hours <= 9)
        hours = '0'+hours;

    var isoTime = hours +':'+ minutes;
    return isoTime;
}

function getTimestamp(date, time) {
    if (typeof(time) === "undefined") {
        return (new Date(date)).getTime();
    }
    else {
        // Check, if time has leading zero
        if (time.split(":")[0].length==2) {
            return (new Date(date+ "T" + time+":00")).getTime();
        }
        else
        {
            return (new Date(date+ "T0" + time+":00")).getTime();
        }
    }
    
}