
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

    return {
        local: local,
        global: global
    };
};

module.exports.$inject = ['$cookieStore', 'pouchdb'];
    
