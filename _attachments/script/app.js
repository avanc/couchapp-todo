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
                        '<a href="" class="done-{{todo.done}}" ng-click="toggleDetails()">{{todo.text}}</a> <a href="" ng_show="showDetails" ng-click="editTodo()">e</a>' +
                        '<input style="float:right" type="checkbox" ng-model="todo.done"> ' +
                        '<div ng_show="showDetails">{{todo.details}}</div>' +
                    '</div>' +
                    '<div ng_show="editing">' +
                        '<input type="text" ng-model="todo.text"> <a href="" ng-click="saveTodo()">s</a><br>' +
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
                scope.editing=false;
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
   

function TodoCtrl($scope) {

    
    $scope.tags= {list:["Einkaufen", "Computer", "Lesen"]};
    $scope.todos_by_tag = {
        Einkaufen: [
            {text:'Milk', done:true, tags : ["Tag1", "Tag2"], details: "Hallo Welt!"},
            {text:'Butter', done:false, tags : ["Tag1", "Tag2"]}
        ], 
        Computer: [
            {text:'Backup', done:true, tags : ["Tag1", "Tag2"], details: "Hallo Welt!"},
            {text:'Clean Keyboard', done:false, tags : ["Tag1", "Tag2"]}
        ], 
        Lesen: [
            {text:'Bible', done:true, tags : ["Tag1", "Tag2"], details: "Hallo Welt!"}
        ]
    };
        
        
    $scope.addTodo = function() {
        $scope.todos.push({text:$scope.todoText, tags: ["new"], done:false});
        $scope.todoText = '';
    };
     

    $scope.changedTag = function() {
        $scope.todos=$scope.todos_by_tag[$scope.tags.selected];
    };

    $scope.tags.selected=$scope.tags.list[0];
    $scope.changedTag();
        
        
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

 