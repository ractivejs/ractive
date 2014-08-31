define(function () {

    'use strict';
    
    var i = 0;
    
    return function () {
        return 'r-' + i++;
    };

});