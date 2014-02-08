require('./angular-cornerpouch.js');
var helpers = require('./helpers.js');

angular.module('PouchDB', ['ng', 'CornerCouch']).
factory('pouchdb', ['$rootScope', '$location', '$timeout', 'cornercouch',  function($scope, $location, $timeout, cornercouch) {
    var uri = helpers.parseUri($location.absUrl());
    var remoteDatabase = uri.protocol + '//' + uri.host + '/' + uri.database + '/';
    var database = cornercouch().getDB(uri.database);
    
    var replicationTo;
    var replicationFrom;
    var obj = {replicating :false};
    
    var onComplete = function(res, err) {
        console.log("Canceled continous replication");
        database.stopReplication();
    };
    
    var onChange = function(res) {
        $scope.$apply( function() {
            console.log("Changes during replication");
            obj.replicating = "active";
            $timeout(function() {
                if (obj.replicating!==false) {
                    obj.replicating=true;
                }
            }, 2000);
        });
        
    };
    
    
    database.startReplication = function() {
        database.stopReplication();
        
        replicationTo = database.replicateTo(remoteDatabase, {
            continuous: true,
            complete: onComplete,
            onChange: onChange
        });
    
        replicationFrom = database.replicateFrom(remoteDatabase, {
            continuous: true,
            filter: 'todo/filterTodos',
            complete: onComplete,
            onChange: onChange
        });
        
        obj.replicating = true;
    };
    
    database.stopReplication = function() {
        if (typeof(replicationTo) != "undefined") {
            if (!replicationTo.cancelled) {
                replicationTo.cancel();
            }
            replicationTo = undefined;
        }
        if (typeof(replicationFrom) != "undefined") {
            if (!replicationFrom.cancelled) {
                replicationFrom.cancel();
            }
            replicationFrom = undefined;
        }
        obj.replicating = false;
    };

    database.replicating = function() {
        return obj;
    };
    
    return database;
}]);
