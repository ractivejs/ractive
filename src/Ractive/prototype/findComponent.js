define([

], function (

) {

	'use strict';

	return function ( selector ) {
		return this.fragment.findComponent( selector );
	};

});