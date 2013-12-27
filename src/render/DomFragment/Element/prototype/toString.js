define([ 'config/voidElementNames' ], function ( voidElementNames ) {

	'use strict';

	return function () {
		var str, i, len;

		str = '<' + ( this.descriptor.y ? '!doctype' : this.descriptor.e );

		len = this.attributes.length;
		for ( i=0; i<len; i+=1 ) {
			str += ' ' + this.attributes[i].toString();
		}

		str += '>';

		if ( this.html ) {
			str += this.html;
		} else if ( this.fragment ) {
			str += this.fragment.toString();
		}

		// add a closing tag if this isn't a void element
		if ( voidElementNames.indexOf( this.descriptor.e ) === -1 ) {
			str += '</' + this.descriptor.e + '>';
		}

		return str;
	};

});