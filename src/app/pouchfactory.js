require('./angular-cornerpouch.js');
var helpers = require('./helpers.js');

angular.module('PouchDB', ['ng', 'CornerCouch']).
factory('pouchdb', ['$location', 'cornercouch',  function($location, cornercouch) {
    var uri = helpers.parseUri($location.absUrl());
    var remoteDatabase = uri.protocol + '//' + uri.host + '/' + uri.database + '/';
    var database = cornercouch().getDB(uri.database);
    
    var replicationTo;
    var replicationFrom;
    var obj = {replicating :false};
    
    var onComplete1 = function() {
            //alert("onComplete1");
    };
    var onComplete2 = function() {
            //alert("onComplete2");
    };
    var onChange1 = function() {
            //alert("onChange1");
    };
    var onChange2 = function() {
            //alert("onChange");
    };
    
    database.startReplication = function() {
        database.stopReplication();
        
        replicationTo = database.replicateTo(remoteDatabase, {
            continuous: true,
            complete: onComplete1,
            onChange: onChange1
        });
    
        replicationFrom = database.replicateFrom(remoteDatabase, {
            continuous: true,
            filter: 'todo/filterTodos',
            complete: onComplete2,
            onChange: onChange2
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
