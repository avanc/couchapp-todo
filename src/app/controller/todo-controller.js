
module.exports = function(subtype) {
    var controller = function($scope, $location, pouchdb, Configuration, TicklerWatch) {
        $scope.subtype=subtype;
        TicklerWatch.update();
        
        $scope.userdb = pouchdb;
        
        $scope.tags={list: []};
        $scope.tags.selected=$location.search().tag;
        if (typeof($scope.tags.selected)==="undefined") {
            $scope.tags.selected="[All Tags]";
        }
        
        $scope.updateTagsList = function() {
            $scope.userdb.query("todo", "tags", { group: true })
                .then(function(data) {
                    var tags=["[All Tags]"];
                    for (var i=0; i<data.rows.length; i++) {
                        var row = data.rows[i];
                        tags.push(row.key);
                    }
                    $scope.tags.list=tags;
                });
            
        };

    
        
            
        $scope.initNewTodo = function() {
            $scope.newTodo = $scope.userdb.newDoc(); 
            $scope.newTodo.type = "todo";
            $scope.newTodo.tags= [];
            $scope.newTodo.details = {"content": ""};
            Configuration.global.get("DefaultMarkupLanguage").then(function(value) {
                if (typeof($scope.newTodo.details.language)==="undefined") {
                    $scope.newTodo.details.language = value;
                }
            });
        };

        
        $scope.addTodo = function() {
            $scope.newTodo.subtype=$scope.subtype;
            $scope.newTodo.tags.push($scope.tags.selected);
            $scope.newTodo.save()
                .then(function() {
                    $scope.changedTag();
                    $scope.updateTagsList();
                });
            $scope.initNewTodo();
        };
        

        $scope.changedTag = function() {
            $location.search({"tag": $scope.tags.selected});

            var startkey=[$scope.tags.selected];
            var endkey=[$scope.tags.selected, {}];
            
            $scope.todos_bytags={};

            if ($scope.tags.selected==="[All Tags]") {
                startkey=undefined;
                endkey=undefined;
            }

            $scope.userdb.query("todo", $scope.subtype + "_by_tag", { startkey: startkey, endkey: endkey, include_docs: true })
                .then(function(data) {
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

        
        $scope.initNewTodo();
        $scope.updateTagsList();
        $scope.changedTag();

        
    };

    controller.$inject = ['$scope', '$location', 'pouchdb', 'Configuration', 'TicklerWatch'];
    
    return controller;
};
