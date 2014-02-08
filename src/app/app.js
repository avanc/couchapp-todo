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


require('./../contrib/angular');
require('./../contrib/angular-route');
require('./pouchfactory.js');

var TodoController = require('./controller/todo-controller.js');

var App = angular.module('TodoApp', ['ngRoute', 'CornerCouch', 'PouchDB'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {controller: require('./controller/overview-controller.js'), templateUrl: 'overview.html'})
            .when('/next', {controller: TodoController("next"), templateUrl: 'next.html'})
            .when('/future', {controller: TodoController("future"), templateUrl: 'next.html'})
            .when('/waiting', {controller: TodoController("waiting"), templateUrl: 'next.html'})
            .when('/tickler', {controller: require('./controller/tickler-controller.js'), templateUrl: 'tickler.html'})
            .otherwise({redirectTo: '/'});
    })
    .service( 'TicklerWatch', require('./ticklerwatch-service.js'));

App.directive('mytodo', require('./todo/todo-directive.js'));
App.directive('markup', require('./markup/markup-directive.js'));

App.controller('AppCtrl', require('./controller/app-controller.js'));

