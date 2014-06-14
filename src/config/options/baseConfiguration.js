import defaults from 'config/defaults/options';
import extendObject from 'utils/extend';

function BaseConfiguration ( config ) {
	extendObject( this, config );
	this.useDefaults = defaults.hasOwnProperty( config.name );
}

BaseConfiguration.prototype = {

	extend: function ( Parent, proto, options ) {
		var option;

		if( this.preExtend ) {
			options = options || {};
			this.preExtend( Parent, proto, options );
		}

		if ( options && ( this.name in options ) ) {
			option = options[ this.name ];
		}

		if ( this.postExtend ) {
			option = this.postExtend( proto, option );
		}

		if ( !empty( option ) ) {

			proto[ this.name ] = option;
		}
	},

	init: function ( Parent, ractive, options ) {
		var option;


		if( this.preInit ) {
			options = options || {};
			this.preInit( Parent, ractive, options );
		}

		if ( options && ( this.name in options ) ) {
			option = options[ this.name ];
		}

		if( this.postInit ) {
			option = this.postInit( ractive, option );
		}

		if ( !empty( option ) ) {
			ractive [ this.name ] = option;
		}
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

function empty ( value ) {

	// allow '', 0, false, etc:
	return typeof value === 'undefined' || value === null;
}

export default function baseConfig ( config ) {
	return new BaseConfiguration( config );
}

