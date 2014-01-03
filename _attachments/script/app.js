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




var App = angular.module('TodoApp', ['CornerCouch'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {controller: OverviewCtrl, templateUrl: 'overview.html'})
            .when('/next', {controller: NextCtrl, templateUrl: 'next.html'})
            .when('/future', {controller: FutureCtrl, templateUrl: 'next.html'})
            .when('/waiting', {controller: WaitingCtrl, templateUrl: 'next.html'})
            .when('/tickler', {controller: TicklerCtrl, templateUrl: 'tickler.html'})
            .otherwise({redirectTo: '/'});
    })
    .service( 'TicklerWatch', [ '$rootScope', '$timeout', '$location', 'cornercouch', function( $rootScope, $timeout, $location, cornercouch) {
        var pending=false;
        var server = cornercouch();
        var timestamp = new Date(0);
        server.session();
        var userdb = server.getDB(getDatabaseName($location));

        function update() {
            var current_timestamp = new Date();
            
            if ( (current_timestamp-timestamp)>60000 ) { // Update every minute at most
                timestamp=current_timestamp;
                var date=getIsoDate(timestamp);
                userdb.query("todo", "tickler_by_date", { startkey: undefined, endkey: [date, {}], include_docs: false })
                    .success(function(data, status) {
                        pending=data.rows.length>0;
                    });
            }
        };
        
        return {
            pendingTicklers: function() {
                return pending;
            },
            update: update
        };
    }]);



    
App.directive('mytodo', function () {
    return {
        restrict: 'E',
        template:   '<div ng-hide="editing">' +
                        '<input style="float:right" type="checkbox" ng-model="todo.done" ng-change="saveTodo()"> ' +
                        '<a class="todo_title done-{{todo.done}}" href="" ng-click="toggleDetails()"><span class="todo_date" ng_show="isTickler()">{{todo.date}} </span>{{todo.title}}<span ng_show="detailsavailable() && !showDetails"> &hellip;</span></a> <a href="" ng_show="showDetails" ng-click="editTodo()">&#9998;</a>' +
                        '<div ng_show="showDetails" markup="todo.details"></div>' +
                        '<span ng_show="showDetails" class="tag" ng-repeat="tag in todo.tags">{{tag}}</span>' +
                    '</div>' +
                    '<div ng_show="editing">' +
                        '<input class="todo_title" type="text" ng-model="todo.title"> <a href="" ng-click="saveTodo()">&#10003;</a> <a href="" ng-click="loadTodo()">&#10007;</a><br>' +
                        '<label>Type: </label><select ng-model="todo.subtype" ng-options="subtype for subtype in subtypes" ></select><br>' +
                        '<span ng_show="isTickler()"><input type="text" ng-model="todo.date"><select ng-model="todo.recurrence" ng-options="option for option in recurrencies" ></select><br></span>' +
                        '<textarea class="details_input" ng-model="todo.details.content" placeholder="Details"></textarea><br>' +
                        '<select ng-model="todo.details.language"><option value="unformatted">Unformated</option><option value="markdown">Markdown</option><option value="textile">Textile</option></select><br>' +
                        '<span class="tag" ng-repeat="tag in todo.tags">{{tag}}&nbsp;<a href="" ng-click="removeTag(tag)">&times;</a> </span>' +
                        '<form style="display: inline;" ng-submit="addTag()">' +
                            '<input class="tag" type="text" style="width: 10em;" ng-model="tagText" placeholder="add new tag">' +
                        '</form>' +
                    
                    '</div>',
        scope: {
            todo : "="
        },
        link: function (scope, elem, attrs) {
            scope.subtypes = ["next", "future", "waiting", "tickler"];
            scope.recurrencies = ["daily", "weekly", "monthly", "yearly"];
            
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

            scope.isTickler = function(){
                return (scope.todo.subtype==="tickler");
            }
            
            scope.detailsavailable = function(){
                if (typeof(scope.todo.details)=="undefined") {
                    return false;
                }
                else if (typeof(scope.todo.details.content)=="undefined") {
                    return false;
                }
                else if (scope.todo.details.content=="") {
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
                    if (v.hasOwnProperty("language")) {
                        if (v.language=="markdown") {
                            var htmlText = converter.makeHtml(v.content);
                            elem.html(htmlText);
                        }
                        else if (v.language=="textile") {
                            var htmlText = convert_textile(v.content);
                            elem.html(htmlText);
                        }
                        else {
                            elem.html(v.content); 
                        }
                    }
                    else {
                        elem.html(v); 
                    }
                }
            }, true);
        }
    }
});


function AppCtrl($scope, TicklerWatch) {
    $scope.pendingTicklers=TicklerWatch.pendingTicklers;
    TicklerWatch.update();
}


function OverviewCtrl($scope, $location, cornercouch, TicklerWatch) {
    TicklerWatch.update();
}

function NextCtrl($scope, $location, cornercouch, TicklerWatch) {
    $scope.subtype="next";
    TodoCtrl($scope, $location, cornercouch, TicklerWatch);
}

function FutureCtrl($scope, $location, cornercouch, TicklerWatch) {
    $scope.subtype="future";
    TodoCtrl($scope, $location, cornercouch, TicklerWatch);
}

function WaitingCtrl($scope, $location, cornercouch, TicklerWatch) {
    $scope.subtype="waiting";
    TodoCtrl($scope, $location, cornercouch, TicklerWatch);
}

function TodoCtrl($scope, $location, cornercouch, TicklerWatch) {
    TicklerWatch.update();
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.userdb = $scope.server.getDB(getDatabaseName($location));

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
        $scope.newTodo.tags= [];
    }   

    $scope.initNewTodo();
    $scope.updateTagsList();
    
    $scope.addTodo = function() {
        $scope.newTodo.subtype=$scope.subtype;
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

        $scope.userdb.query("todo", $scope.subtype + "_by_tag", { startkey: startkey, endkey: endkey, include_docs: true })
            .success(function(data, status) {
                for (var i=0; i<data.rows.length; i++) {
                    var row = data.rows[i];
                    var current_tag=row.key[0];
                    if (!$scope.todos_bytags.hasOwnProperty(current_tag)) {
                        $scope.todos_bytags[current_tag]={tag: current_tag, list: []};
                    }
                    var newdoc=$scope.userdb.newDoc(row.doc);
                    if (typeof(newdoc.subtype)=="undefined") {
                        newdoc.subtype="next";
                    }
                    $scope.todos_bytags[current_tag].list.push(newdoc);
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



function TicklerCtrl($scope, $location, cornercouch, TicklerWatch) {
    TicklerWatch.update();
    $scope.subtype="tickler";
    $scope.server = cornercouch();

    $scope.server.session();
    $scope.userdb = $scope.server.getDB(getDatabaseName($location));

      
    $scope.initNewTodo = function() {
        $scope.newTodo = $scope.userdb.newDoc(); 
        $scope.newTodo.type = "todo";
        $scope.newTodo.tags= [];
    }   


    $scope.initNewTodo();
    
    $scope.addTodo = function() {
        $scope.newTodo.subtype=$scope.subtype;
        $scope.newTodo.save()
            .success(function() {
                $scope.getTicklers();
            });
        $scope.initNewTodo();
    };


    $scope.getTicklers = function() {
        date=getIsoDate((new Date()).addDays(1));
        date7=getIsoDate((new Date()).addDays(8));

        $scope.todos_grouped=[{title: "Pending", list: []}, {title: "Next 7 Days", list: []}, {title: "Future", list: []}];
        getTicklers(undefined, [date,], $scope.todos_grouped[0]);
        getTicklers([date], [date7], $scope.todos_grouped[1]);
        getTicklers([date7], undefined, $scope.todos_grouped[2]);
//        var startkey=[$scope.tags.selected];
//        var endkey=[$scope.tags.selected, {}];

        
        
        function getTicklers(startkey, endkey, storage){
        
            $scope.userdb.query("todo", "tickler_by_date", { startkey: startkey, endkey: endkey, include_docs: true })
                .success(function(data, status) {
                    storage.list=[];
                    for (var i=0; i<data.rows.length; i++) {
                        var row = data.rows[i];
                        var newdoc=$scope.userdb.newDoc(row.doc);
                        storage.list.push(newdoc);
                    }
                });
        }
  
    };

    
    $scope.getTicklers();
        
    $scope.countRemaining = function() {
        var count = 0;
        angular.forEach($scope.todos_grouped, function(todos) {
            angular.forEach(todos.list, function(todo) {
                count += todo.done ? 0 : 1;
            });
        });
        return count;
    };
     
    $scope.countAll = function() {
        var count = 0;
        angular.forEach($scope.todos_grouped, function(todos) {
            count+= todos.list.length;
        });
        return count;
    };

    $scope.archive = function() {
        angular.forEach($scope.todos_grouped, function(todos) {
            angular.forEach(todos.list, function(todo) {
                if (todo.done)
                {
                    todo.remove();
                }
            });
            
            //$scope.changedTag();
            // Has to be done after success!
        });
    };
    
}

function getDatabaseName($location) {
    var parser = document.createElement('a');

    parser.href = $location.absUrl();
//    parser.protocol; // => "http:"
//    parser.hostname; // => "example.com"
//    parser.port; // => "3000"
//    parser.pathname; // => "/pathname/"
//    parser.search; // => "?search=test"
//    parser.hash; // => "#hash"
//    parser.host; // => "example.com:3000"

    var pattern= new RegExp('/([^/]+)/_design/.*');
    var match = pattern.exec(parser.pathname);
    return match[1];
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

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
    return this;
};
