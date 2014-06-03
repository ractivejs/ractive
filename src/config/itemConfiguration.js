import defineProperty from 'utils/defineProperty';
import initOptions from 'config/initOptions';

function ItemConfiguration ( config ) {
	this.config = config;
	this.name = config.name;
	config.useDefaults = initOptions.defaults.hasOwnProperty( config.name );
}

ItemConfiguration.prototype = {

	extend: function ( Parent, Child, options ) {
		options = options || {};
		extend( this.config, Child,
			getParentValue( Parent, this.config ),
			getChildValue( this.name, options )
		);
	},

	init: function ( Parent, ractive, options ) {
		options = options || {};
		init ( this.config, ractive,
			getParentValue( Parent, this.config ),
			getChildValue( this.name, options) );
	},

	reset: function ( ractive ) {
		return reset( this.config, ractive );
	}
};

function getChildValue ( name, options ) {
	if ( options ) { return options[ name ]; }
}

function getParentValue ( Parent, config ) {
	if ( Parent ) {

		if ( config.useDefaults ) { Parent = Parent.defaults; }
		return Parent[ config.name];
	}
}

function extend ( config, Target, parentValue, value ) {

	var result = config.extend( Target, parentValue, value );

	if ( config.postExtend ) {
		result = config.postExtend( Target, result );
	}

	if ( config.useDefaults ) {
		Target = Target.defaults;
	}

	assign( config, Target, result );
}

function init ( config, ractive, parentValue, value ) {

	var result = config.init( ractive, parentValue, value );

	if( config.postInit ) {
		result = config.postInit( ractive, result ) || result;
	}

	assign ( config, ractive, result );
}

function reset ( config, ractive ) {

	if ( !config.reset ) { return; }

	var result = config.reset( ractive );

	if ( result ) {

		if( config.postInit ) {
			result = config.postInit( ractive, result ) || result;
		}

		ractive[ config.name ] = result;
		return true;
	}
}

function assign ( config, target, value ) {

	if ( empty( config, value ) ) { return; }

	target[ config.name ] = value;
}

function empty ( config, value ) {

	// allow '', 0, false, etc:
	return typeof value === 'undefined' || value === null;

}



export default function extend ( config ) {
	return new ItemConfiguration( config );
}

