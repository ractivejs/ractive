import adapt from 'config/options/adapt';
import basicConfig from 'config/options/option';
import css from 'config/options/css/css';
import data from 'config/options/data';
import defaults from 'config/options/defaults';
import complete from 'config/options/complete';
import magic from 'config/options/magic';
import parseOptions from 'config/options/groups/parse';
import registries from 'config/options/groups/registries';
import template from 'config/options/template/template';

var custom, options, config;

custom = {
	data: data,
	complete: complete,
	adapt: adapt,
	magic: magic,
	template: template,
	css: css
}

// fill in basicConfig for all default options not covered by
// registries, parse options, and any custom configuration
options = Object.keys( defaults )
	.filter( key => {
		return !registries[ key ]
			&& !custom[ key ]
			&& !parseOptions[ key ];
	})
	.map( basicConfig );

// this defines the order:
config = [].concat(
	custom.data,
	parseOptions,
	options,
	custom.adapt,
	custom.magic,
	custom.complete,
	registries,
	custom.template,
	custom.css
);

// for iteration
config.keys = config.map( config => {
	return config.name;
});

// for blacklist test
config.keys.forEach( ( key, i ) => {
	config.keys[ key ] = config[ i ];
});

config.parseOptions = parseOptions;
config.registries = registries;

config.extend = function ( Parent, Child, options ) {
	config.forEach( c => {
		c.extend( Parent, Child, options );
	});
};

config.init = function ( Parent, ractive, options ) {
	config.forEach( c => {
		c.init( Parent, ractive, options );
	});
};

config.reset = function ( ractive ) {
	return config.filter( c => {
		return c.reset && c.reset( ractive );
	});
};

config.find = function ( ractive, registryName, key ) {

	var item, parent;

	if ( item = ractive[ registryName ][ key ] ) {
		return item;
	}

	if ( parent = ractive._parent ) {
		return this.find( parent, registryName, key );
	}

};

export default config;




