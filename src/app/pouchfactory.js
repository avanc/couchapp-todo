angular.module('PouchDB', ['ng', 'CornerCouch']).
factory('pouchdb', ['$location', 'cornercouch',  function($location, cornercouch) {
    var uri = parseUri($location.absUrl());
    var remoteDatabase = uri.protocol + '//' + uri.host + '/' + uri.database + '/';
    var database = cornercouch().getDB(uri.database);
    
    var replicationTo;
    var replicationFrom;
    var obj = {replicating :false};
    
    database.startReplication = function() {
        database.stopReplication();
        
        replicationTo = database.replicateTo(remoteDatabase, {
            continuous: true
        });
    
        replicationFrom = database.replicateFrom(remoteDatabase, {
            continuous: true
        });
        obj.replicating = true;
    };
    
    database.stopReplication = function() {
        if (typeof(replicationTo) != "undefined") {
            replicationTo.cancel();
            replicationTo = undefined;
        }
        if (typeof(replicationFrom) != "undefined") {
            replicationFrom.cancel();
            replicationFrom = undefined;
        }
        obj.replicating = false;
    };

    database.replicating = function() {
        return obj;
    };
    
    return database;
}]);
