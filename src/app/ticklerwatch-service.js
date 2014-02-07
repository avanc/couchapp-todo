
var helpers = require('./helpers.js');

module.exports = function($rootScope, $timeout, pouchdb) {
    var pending=false;
    var timestamp = new Date(0);

    var userdb = pouchdb;

    function update() {
        var current_timestamp = new Date();
        
        if ( (current_timestamp-timestamp)>60000 ) { // Update every minute at most
            timestamp=current_timestamp;
            var date=helpers.getIsoDate(timestamp);
            userdb.query("todo", "tickler_by_date", { startkey: undefined, endkey: [date, {}], include_docs: false })
                .then(function(data) {
                    pending=data.rows.length>0;
                });
        }
    }
    
    return {
        pendingTicklers: function() {
            return pending;
        },
        update: update
    };
};

module.exports.$inject = ['$rootScope', '$timeout', 'pouchdb'];
    
