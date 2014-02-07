
var helpers = require('./../helpers.js');

module.exports = function($scope, $location, pouchdb, TicklerWatch) {
    TicklerWatch.update();
    $scope.subtype="tickler";
    $scope.userdb = pouchdb;

    $scope.initNewTodo = function() {
        $scope.newTodo = $scope.userdb.newDoc(); 
        $scope.newTodo.type = "todo";
        $scope.newTodo.tags= [];
    };


    $scope.initNewTodo();
    
    $scope.addTodo = function() {
        $scope.newTodo.subtype=$scope.subtype;
        $scope.newTodo.save()
            .then(function() {
                $scope.getTicklers();
            });
        $scope.initNewTodo();
    };


    $scope.getTicklers = function() {
        date=helpers.getIsoDate((new Date()).addDays(1));
        date7=helpers.getIsoDate((new Date()).addDays(8));

        $scope.todos_grouped=[{title: "Pending", list: []}, {title: "Next 7 Days", list: []}, {title: "Future", list: []}];
        getTicklers(undefined, [date,], $scope.todos_grouped[0]);
        getTicklers([date], [date7], $scope.todos_grouped[1]);
        getTicklers([date7], undefined, $scope.todos_grouped[2]);
//        var startkey=[$scope.tags.selected];
//        var endkey=[$scope.tags.selected, {}];

        
        
        function getTicklers(startkey, endkey, storage){
        
            $scope.userdb.query("todo", "tickler_by_date", { startkey: startkey, endkey: endkey, include_docs: true })
                .then(function(data) {
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
    
};
    
module.exports.$inject = ['$scope', '$location', 'pouchdb', 'TicklerWatch'];
    
