import defineProperty from 'utils/defineProperty';
import initOptions from 'config/initOptions';
import extendObject from 'utils/extend';

function BaseConfiguration ( config ) {
	extendObject( this, config );
	this.useDefaults = initOptions.defaults.hasOwnProperty( config.name );
}

BaseConfiguration.prototype = {

	extend: function ( Parent, Child, options ) {
		options = options || {};

		var parentValue = this.getParentValue( Parent ),
			optionValue = this.getOptionValue( options );

		var result = this.extendValue( Child, parentValue, optionValue );

		if ( this.postExtend ) {
			result = this.postExtend( Child, result );
		}

		if ( this.useDefaults ) {
			Child = Child.defaults;
		}

		this.assign( Child, result );
	},

	init: function ( Parent, ractive, options ) {

		options = options || {};

		var parentValue = this.getParentValue( Parent ),
			optionValue = this.getOptionValue( options );

		var result = this.initValue( ractive, parentValue, optionValue );

		if( this.postInit ) {
			result = this.postInit( ractive, result ) || result;
		}

		this.assign ( ractive, result );
	},

	reset: function ( ractive ) {

		if ( !this.resetValue ) { return; }

		var result = this.resetValue( ractive );

		if ( result ) {

			if( this.postInit ) {
				result = this.postInit( ractive, result ) || result;
			}

			ractive[ this.name ] = result;
			return true;
		}
	},

	assign: function( target, value ) {

		if ( empty( value ) ) { return; }

		target[ this.name ] = value;
	},

	getParentValue: function ( parent ) {
		if ( parent ) {

			if ( this.useDefaults ) { parent = parent.defaults; }

			return parent[ this.name];
		}
	},

	getOptionValue : function ( options ) {
		if ( options ) { return options[ this.name ]; }
	}
};

function empty ( value ) {

	// allow '', 0, false, etc:
	return typeof value === 'undefined' || value === null;
}



export default function baseConfig ( config ) {
	return new BaseConfiguration( config );
}

