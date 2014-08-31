define(['Ractive/prototype/shared/makeQuery/sortByDocumentPosition','Ractive/prototype/shared/makeQuery/sortByItemPosition'],function (sortByDocumentPosition, sortByItemPosition) {

	'use strict';
	
	return function () {
		this.sort( this._isComponentQuery ? sortByItemPosition : sortByDocumentPosition );
		this._dirty = false;
	};

});