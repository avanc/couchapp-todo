var helpers = {};

helpers.parseUri = function(uri) {
    var parser = document.createElement('a');
    parser.href = uri;
    var result = {};
    result.protocol = parser.protocol; // => "http:"
    result.hostname = parser.hostname; // => "example.com"
    result.port = parser.port; // => "3000"
    result.pathname = parser.pathname; // => "/pathname/"
    result.search = parser.search; // => "?search=test"
    result.hash = parser.hash; // => "#hash"
    result.host = parser.host; // => "example.com:3000"

    var pattern= new RegExp('/([^/]+)/_design/.*');
    var match = pattern.exec(result.pathname);
    result.database = match[1];
    
    return result;
};

helpers.getIsoDate = function(date) {
    if ( typeof(date) == "undefined" ) {
        date= new Date();
    }

    var year = date.getFullYear();
    
    var month = date.getMonth()+1;
    if(month <= 9)
        month = '0'+month;

    var day= date.getDate();
    if(day <= 9)
        day = '0'+day;

    var isoDate = year +'-'+ month +'-'+ day;
    return isoDate;
};

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
    return this;
};

module.exports = helpers;