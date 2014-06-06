import adapt from 'config/options/adapt';
import basicConfig from 'config/options/option';
import css from 'config/options/css/css';
import data from 'config/options/data';
import debug from 'config/options/debug';
import defaults from 'config/defaults/options';
import complete from 'config/options/complete';
import magic from 'config/options/magic';
import computed from 'config/options/computed';
import template from 'config/options/template/template';
import parseOptions from 'config/options/groups/parseOptions';
import registries from 'config/options/groups/registries';

var custom, options, config;

custom = {
	data: data,
	debug: debug,
	complete: complete,
	computed: computed,
	adapt: adapt,
	magic: magic,
	template: template,
	css: css
}

// fill in basicConfig for all default options not covered by
// registries, parse options, and any custom configuration
options = Object.keys( defaults )
	.filter( key => !registries[ key ] && !custom[ key ] && !parseOptions[ key ] )
	.map( basicConfig );

// this defines the order:
config = [].concat(
	custom.debug,
	custom.data,
	parseOptions,
	options,
	custom.adapt,
	custom.magic,
	custom.complete,
	custom.computed,
	registries,
	custom.template,
	custom.css
);

// for iteration
config.keys = config.map( config => config.name );

// for lookup and blacklist test
config.keys.forEach( ( key, i ) => {
	config[ key ] = config[ i ];
	config.keys[ key ] = true;
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

export default config;




