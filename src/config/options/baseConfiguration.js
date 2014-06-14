import defaults from 'config/defaults/options';
import extendObject from 'utils/extend';

function BaseConfiguration ( config ) {
	extendObject( this, config );
	this.useDefaults = defaults.hasOwnProperty( config.name );
}


function configure ( Parent, ractive, options, name, pre, post ) {
	var option;


	if( pre ) {
		options = options || {};
		pre( Parent, ractive, options );
	}

	if ( options && ( name in options ) ) {
		option = options[ name ];
	}

	if( post ) {
		option = post( ractive, option );
	}

	if ( !empty( option ) ) {
		ractive [ name ] = option;
	}
}

BaseConfiguration.prototype = {



	extend: function ( Parent, proto, options ) {

		configure( Parent, proto, options,
			// temp
			this.name,
			this.preExtend ? this.preExtend.bind(this) : void 0,
			this.postExtend ? this.postExtend.bind(this) : void 0
		);
	},

	init: function ( Parent, ractive, options ) {

		configure( Parent, ractive, options,
			// temp
			this.name,
			this.preInit ? this.preInit.bind(this) : void 0,
			this.postInit ? this.postInit.bind(this) : void 0
		);
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

