import types from 'config/types';
import teardown from 'shared/teardown';
import Mustache from 'parallel-dom/shared/Mustache/_Mustache';
import detach from 'parallel-dom/items/shared/detach';

var DomInterpolator, lessThan, greaterThan;
lessThan = /</g;
greaterThan = />/g;

DomInterpolator = function ( options, docFrag ) {
	this.type = types.INTERPOLATOR;

	if ( docFrag ) {
		this.node = document.createTextNode( '' );
		docFrag.appendChild( this.node );
	}

	// extend Mustache
	Mustache.init( this, options );
};

DomInterpolator.prototype = {
	update: Mustache.update,
	resolve: Mustache.resolve,
	reassign: Mustache.reassign,
	detach: detach,

	teardown: function ( destroy ) {
		if ( destroy ) {
			this.detach();
		}

		teardown( this );
	},

	render: function () {
		return this.node = document.createTextNode( this.value != undefined ? this.value : '' );
	},

	unrender: function () {
		throw new Error( 'TODO not implemented' );
	},

	// TEMP
	setValue: function ( value ) {
		if ( this.node ) {
			this.node.data = ( value == undefined ? '' : value );
		}
	},

	firstNode: function () {
		return this.node;
	},

	toString: function () {
		var value = ( this.value != undefined ? '' + this.value : '' );
		return value.replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
	}
};

export default DomInterpolator;
