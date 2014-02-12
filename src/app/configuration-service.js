
var helpers = require('./helpers.js');

module.exports = function($cookieStore, pouchdb) {
    var local = {};
    var global = {};
    
    local.get = function(key) {
        return $cookieStore.get(key);
    };

    local.put = function(key, value) {
        $cookieStore.put(key, value);
    };

    local.remove = function(key) {
        $cookieStore.remove(key);
    };

    
    var promise = pouchdb.getCreateDoc("todoapp_configuration");

    global.get = function(key) {
        return promise.then(function(configDoc) {
                return configDoc[key];
            });
    };

    global.put = function(key, value) {
        return promise.then(function(configDoc) {
                configDoc[key]=value;
                return configDoc.save();
            });
    };
    
    global.remove = function(key) {
        return promise.then(function(configDoc) {
                delete configDoc[key];
                return configDoc.save();
            });
    };
    
    
    
    
    return {
        local: local,
        global: global
    };
};

module.exports.$inject = ['$cookieStore', 'pouchdb'];
    
