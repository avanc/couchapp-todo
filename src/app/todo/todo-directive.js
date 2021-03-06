
var helpers = require('./../helpers.js');

module.exports = function () {
    return {
        restrict: 'E',
        template:   '<div ng-hide="editing">' +
                        '<input style="float:right" type="checkbox" ng-hide="isRecurrenceTickler()" ng-model="todo.done" ng-change="tickTodo()"> ' +
                        '<a href="" ng-click="deferRecurrence()" class="textbutton" style="float:right" ng-show="isRecurrenceTickler()">{{ getDeferString() }}</a> ' +
                        '<a class="todo_title done-{{todo.done}}" href="" ng-click="toggleDetails()"><span class="todo_date" ng_show="isTickler()">{{todo.date}} </span>{{todo.title}}' +
                        '<span ng_show="detailsavailable() && !showDetails"> &hellip;</span></a> <a href="" ng_show="showDetails" ng-click="editTodo()">&#9998;</a>' +
                        '<div ng_show="showDetails" markup="todo.details"></div>' +
                        '<span ng_show="showDetails" class="tag" ng-repeat="tag in todo.tags">{{tag}}</span>' +
                    '</div>' +
                    '<div ng_show="editing">' +
                        '<input class="todo_title" type="text" ng-model="todo.title"> <a href="" ng-click="saveTodo()">&#10003;</a> <a href="" ng-click="loadTodo()">&#10007;</a><br>' +
                        '<label>Type: </label><select ng-model="todo.subtype" ng-options="subtype for subtype in subtypes" ></select><br>' +
                        '<span ng_show="isTickler()"><input type="date" ng-model="todo.date"><select ng-model="todo.recurrence" ng-options="option for option in recurrencies" ></select><br></span>' +
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
            scope.recurrencies = ["no recurrence", "daily", "weekly", "monthly", "quarterly", "yearly"];
            
            scope.toggleDetails = function() {
                scope.showDetails=!scope.showDetails;
            };

            scope.editTodo = function() {
                scope.editing=true;
            };

            scope.saveTodo = function() {
                scope.todo.save().then( function() {
                    scope.editing=false;
                });
            };

            scope.getDeferString = function() {
                if (scope.todo.recurrence==="daily") {
                    return "+d";
                }
                else if (scope.todo.recurrence==="weekly") {
                    return "+w";
                }
                else if (scope.todo.recurrence==="monthly") {
                    return "+m";
                }
                else if (scope.todo.recurrence==="quarterly") {
                    return "+q";
                }
                else if (scope.todo.recurrence==="yearly") {
                    return "+y";
                }
                else {
                    return "n.a.";
                }
                    
            };
            
            scope.deferRecurrence = function() {
                if (scope.todo.subtype==="tickler") {
                    var date;
                    if (scope.todo.recurrence==="daily") {
                        date = new Date(scope.todo.date);
                        date.addDays(1);
                        scope.todo.date = helpers.getIsoDate(date);
                    }
                    else if (scope.todo.recurrence==="weekly") {
                        date = new Date(scope.todo.date);
                        date.addWeeks(1);
                        scope.todo.date = helpers.getIsoDate(date);
                    }
                    else if (scope.todo.recurrence==="monthly") {
                        date = new Date(scope.todo.date);
                        date.addMonths(1);
                        scope.todo.date = helpers.getIsoDate(date);
                    }
                    else if (scope.todo.recurrence==="quarterly") {
                        date = new Date(scope.todo.date);
                        date.addMonths(3);
                        scope.todo.date = helpers.getIsoDate(date);
                    }
                    else if (scope.todo.recurrence==="yearly") {
                        date = new Date(scope.todo.date);
                        date.addYears(1);
                        scope.todo.date = helpers.getIsoDate(date);
                    }
                }
                scope.saveTodo();
                
            };
            
            scope.tickTodo = function() {
                scope.saveTodo();
            };

            scope.loadTodo = function() {
                scope.todo.load().then( function() {
                    scope.editing=false;
                });
            };

            scope.isTickler = function(){
                return (scope.todo.subtype==="tickler");
            };

            scope.isRecurrenceTickler = function(){
                return ( (scope.todo.subtype==="tickler") && (scope.recurrencies.indexOf(scope.todo.recurrence) > 0) );
            };
            
            scope.detailsavailable = function(){
                if (typeof(scope.todo.details)=="undefined") {
                    return false;
                }
                else if (typeof(scope.todo.details.content)=="undefined") {
                    return false;
                }
                else if (scope.todo.details.content==="") {
                    return false;
                }
                else {
                    return true;
                }
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
    };
};