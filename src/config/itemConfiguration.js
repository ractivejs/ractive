
function ItemConfiguration ( config ) {
	this.config = config;
	this.name = config.name;
}

ItemConfiguration.prototype = {

	extend: function ( Parent, Child, options ) {
		options = options || {};
		configure( this.config, Child,
			getParentValue( Parent, this.config ),
			getChildValue( this.config.name, options )
		);
	},

	init: function ( Parent, ractive, options ) {
		options = options || {};
		init ( this.config, ractive,
			getParentValue( Parent, this.config ),
			getChildValue( this.config.name, options) );
	},

	reset: function ( ractive ) {
		return reset( this.config, ractive );
	}
};

export default function configure ( config ) {
	return new ItemConfiguration( config );
}

function getChildValue ( name, options ) {
	if ( options ) { return options[ name ]; }
}

function getParentValue ( Parent, config ) {
	if ( Parent ) {

		if ( config.useDefaults ) { Parent = Parent.defaults; }
		return Parent[ config.name];
	}
}

function configure ( config, Target, parentValue, value ) {

	var result = config.extend( Target, parentValue, value );

	if ( config.postExtend ) {
		result = config.postExtend( Target, result ) || result;
	}

	if ( config.useDefaults ) {
		Target = Target.defaults;
	}

	Target[ config.name ] = result;
}


function init ( config, ractive, parentValue, value ) {

	var result = config.init( ractive, parentValue, value );

	if( config.postInit ) {
		result = config.postInit( ractive, result ) || result;
	}

	ractive[ config.name ] = result;
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

