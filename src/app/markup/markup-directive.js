
var marked = require('marked');
var textile = require('textile-js');

module.exports = function () {
    return {
        restrict: 'A',
        scope: true, //Child scope
        link: function (scope, elem, attrs) {
                        
            scope.$watch(attrs.markup, function(v) {
                if (typeof(v)!== "undefined") {
                    if (v.hasOwnProperty("language")) {
                        if (v.hasOwnProperty("content")) {
                            if (v.language=="markdown") {
                                elem.html(marked(v.content));
                            }
                            else if (v.language=="textile") {
                                elem.html(textile(v.content));
                            }
                            else {
                                elem.html(v.content); 
                            }
                        }
                    }
                    else {
                        elem.html(v); 
                    }
                }
            }, true);
        }
    };
};
