var PouchDB = require('pouchdb');


// Copyright: 2013, Jochen Eddelbüttel
// MIT License applies
//
angular.module('CornerCouch', ['ng']).
factory('cornercouch', ['$rootScope', '$q', function($rootScope, $q) {

    // Shorthand angular
    var ng = angular;
    
    // Database-level constructor
    // Database name is required parameter
    function CouchDB(dbName, serverUri, getMethod) {
        
        var pouchdb = new PouchDB(dbName);

        // Inner document constructor
        // Template object can be passed in and gets copied over
        function CouchDoc(init) {
            ng.copy(init || {}, this);
        }

        CouchDoc.prototype.load = function(id, docParams) {
            var doc = this;
            var deferred = $q.defer();
            var callback = function(err, res) {
                return $rootScope.$apply(function() {
                    if (err) {
                        return deferred.reject(err);
                    } else {
                        ng.copy(res, doc);
                        return deferred.resolve(doc);
                    }
                });
            };

            pouchdb.get(id, callback);
            return deferred.promise;
        };

        CouchDoc.prototype.save = function() {
            var doc = this;
            var deferred = $q.defer();
            var callback = function(err, res) {
                return $rootScope.$apply(function() {
                    if (err) {
                        return deferred.reject(err);
                    } else {
                        if (res.id)  doc._id  = res.id;
                        if (res.rev) doc._rev = res.rev;
                        return deferred.resolve(doc);
                    }
                });
            };

            if (this._id) {
                pouchdb.put(this, callback);
            }
            else {
                pouchdb.post(this, callback);
            }

            return deferred.promise;
        };

        CouchDoc.prototype.remove = function() {
            this._deleted=true;
            return this.save();
        };

        // Document constructor
        this.docClass = CouchDoc;

        // Basic fields
        this.pouchdb = pouchdb;

        // Query cursor
        this.rows = [];
        this.prevRows = [];
        this.nextRow = null;
    }

    CouchDB.prototype.getInfo = function () {
        var db = this;
        var deferred = $q.defer();
        var callback = function(err, res) {
            return $rootScope.$apply(function() {
                if (err) {
                    return deferred.reject(err);
                } else {
                    db.info = res;
                    return deferred.resolve(db);
                }
            });
        };

        this.pouchdb.info(callback);

        return deferred.promise;
    };

    CouchDB.prototype.replicateTo = function (remoteDatabase, options) {
        return this.pouchdb.replicate.to(remoteDatabase, options);
    };
    
    CouchDB.prototype.replicateFrom = function (remoteDatabase, options) {
        return this.pouchdb.replicate.from(remoteDatabase, options);
    };

    CouchDB.prototype.newDoc = function(initData) {
        return new this.docClass(initData);
    };

    CouchDB.prototype.getDoc = function(id) {

        var doc = new this.docClass();
        doc.load(id);
        return doc;
    
    };

    CouchDB.prototype.getQueryDoc = function(idx) {

        var row = this.rows[idx];
        
        if (!row.doc) return this.getDoc(row.id);
        
        var doc = row.doc;
        
        if (doc instanceof this.docClass) return doc;

        doc = this.newDoc(doc);
        row.doc = doc;
        return doc;
    };

    CouchDB.prototype.queryView = function(viewURL, qparams)
    {
        var db = this;
        var deferred = $q.defer();
        var callback = function(err, res) {
            return $rootScope.$apply(function() {
                if (err) {
                    return deferred.reject(err);
                } else {
                    db.rows = res.rows;
                    return deferred.resolve(res);
                }
            });
        };

//        if (qparams) {
//            // Raise limit by 1 for pagination
//            if (qparams.limit) qparams.limit++;
//            // Convert key parameters to JSON
//            for (p in qparams) switch (p) {
//                case "key":
//                case "keys":
//                case "startkey":
//                case "endkey":
//                    qparams[p] = ng.toJson(qparams[p]);
//            }
//        }

        this.pouchdb.query(viewURL, qparams, callback);

        return deferred.promise;
    };

    CouchDB.prototype.query = function(design, view, qparams)
    {
        return this.queryView(
            encodeURIComponent(design) +
            "/"   + encodeURIComponent(view),
            qparams
        );
    };


    
    function CouchServer(url, getMethod) {
        if (url) {
            this.uri = url;
            this.method = getMethod || "JSONP";
        }
        else {
            this.uri = "";
            this.method = "GET";
        }         
    }

    CouchServer.prototype.getDB = function(dbName) {
        return new CouchDB(dbName, this.uri, this.method);
    };
    
    CouchServer.prototype.getUserDB = function() {
        if (!this.userDB) this.userDB = this.getDB("_users");
        return this.userDB;
    };
    
    CouchServer.prototype.getUserDoc = function () {
        var db = this.getUserDB();
        if (this.userCtx.name)
            this.userDoc = db.getDoc("org.couchdb.user:" + this.userCtx.name);
        else
            this.userDoc = db.newDoc();
        return this.userDoc;
    };
    
    CouchServer.prototype.getDatabases = function () {
        var server = this;
        var deferred = $q.defer();
        var callback = function(err, res) {
            return $rootScope.$apply(function() {
                if (err) {
                    return deferred.reject(err);
                } else {
                    server.databases = res;
                    return deferred.resolve(res);
                }
            });
        };

        PouchDB.allDBs(callback);
    };
    
    CouchServer.prototype.createDB = function(dbName) {
        var server = this;
        var deferred = $q.defer();
        var callback = function(err, res) {
            return $rootScope.$apply(function() {
                if (err) {
                    return deferred.reject(err);
                } else {
                    server.databases = res;
                    return deferred.resolve(res);
                }
            });
        };

        var db = new PouchDB(dbName);
        if (server.databases) server.databases.push(dbName);

	return deferred.promise;
    };

    // This is 'cornercouch' - a factory for CouchServer objects
    return function (url, method) {
        return new CouchServer(url, method);
    };

}]);
