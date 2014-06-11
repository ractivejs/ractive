import defaults from 'config/defaults/options';
import extendObject from 'utils/extend';

function BaseConfiguration ( config ) {
	extendObject( this, config );
	this.useDefaults = defaults.hasOwnProperty( config.name );
}

BaseConfiguration.prototype = {

	extend: function ( Parent, Child, options ) {
		var parentValue, optionValue, result;

		options = options || {};

		if( this.preExtend ) {
			this.preExtend( Parent, Child, options );
		}

		parentValue = this.getParentValue( Parent );
		optionValue = this.getOptionValue( options );

		result = this.extendValue( Child, parentValue, optionValue );

		if ( this.postExtend ) {
			result = this.postExtend( Child, result );
		}

		if ( this.useDefaults ) {
			Child = Child.defaults;
		}

		this.assign( Child, result );
	},

	init: function ( Parent, ractive, options ) {
		var parentValue, optionValue, result;

		options = options || {};

		if( this.preInit ) {
			this.preInit( Parent, ractive, options );
		}

		parentValue = this.getParentValue( Parent );
		optionValue = this.getOptionValue( options );

		result = this.initValue( ractive, parentValue, optionValue );

		if( this.postInit ) {
			result = this.postInit( ractive, result );
		}

		this.assign ( ractive, result );
	},

	reset: function ( ractive ) {

		if ( !this.resetValue ) { return; }

		var result = this.resetValue( ractive );

		if ( result ) {

			if( this.postInit ) {
				result = this.postInit( ractive, result );
			}

			ractive[ this.name ] = result;
			return true;
		}
	},

	assign: function ( target, value ) {

		if ( value == undefined ) { return; }

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



export default function baseConfig ( config ) {
	return new BaseConfiguration( config );
}

