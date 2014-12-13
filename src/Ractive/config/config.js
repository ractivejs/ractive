import css from './custom/css/css';
import data from './custom/data';
import template from './custom/template/template';

import defaults from './defaults/options';

import parseOptions from './options/groups/parseOptions';
import registries from './options/groups/registries';

import wrapPrototype from './wrapPrototypeMethod';
import deprecate from './deprecate';


var defaultKeys, custom, options, config, blacklisted, isStandardKey;

custom = {
	data: data,
	template: template,
	css: css
};

defaultKeys = Object.keys( defaults );

options = defaultKeys.filter( key => !registries[ key ] && !custom[ key ] && !~parseOptions.indexOf( key ) );

isStandardKey = {};
defaultKeys.filter( key => !custom[ key ] && !~parseOptions.indexOf( key ) ).forEach( key => isStandardKey[ key ] = true );

// this defines the order:
config = [].concat(
	custom.data,
	parseOptions,
	options,
	registries,
	custom.template,
	custom.css
);

for ( let key in custom ) {
	config[ key ] = custom[ key ];
}

// for iteration
config.keys = defaultKeys
	.concat( registries.map( r => r.name ) )
	.concat( [ 'css' ] );

// blacklisted key's that we don't double extend
blacklisted = config.keys.reduce( (list, key) => ( list[ key ] = true, list ), {} );

config.parseOptions = parseOptions;
config.registries = registries;

function customConfig ( method, key, Parent, instance, options ) {
	custom[ key ][ method ]( Parent, instance, options );
}

config.extend = ( Parent, proto, options ) => configure( 'extend', Parent, proto, options );
config.init = ( Parent, ractive, options ) => configure( 'init', Parent, ractive, options );

function configure ( method, Parent, instance, options ) {
	deprecate( options );

	customConfig( method, 'data', Parent, instance, options );

	config.parseOptions.forEach( key => {
		if ( key in options ) {
			instance[ key ] = options[ key ];
		}
	});

	for ( let key in options ) {
		if ( isStandardKey[ key ] ) {
			let value = options[ key ];
			instance[ key ] = ( typeof value === 'function' )
				? wrapPrototype( Parent.prototype, key, value )
				: value;
		}
	}

	config.registries.forEach( registry => {
		registry[ method ]( Parent, instance, options );
	});

	customConfig( method, 'template', Parent, instance, options );
	customConfig( method, 'css', Parent, instance, options );

	extendOtherMethods( Parent.prototype, instance, options );
}

function extendOtherMethods ( parent, instance, options ) {
	for ( let key in options ) {
		if ( !( key in blacklisted ) && options.hasOwnProperty( key ) ) {
			let member = options[ key ];

			// if this is a method that overwrites a method, wrap it:
			if ( typeof member === 'function' ) {
				member = wrapPrototype( parent, key, member );
			}

			instance[ key ] = member;
		}
	}
}

config.reset = function ( ractive ) {
	return config.filter( c => {
		return c.reset && c.reset( ractive );
	}).map( c => c.name );
};

config.getConstructTarget = function ( ractive, options ) {
	if( options.onconstruct ) {
		// pretend this object literal is the ractive instance
		return {
			onconstruct: wrapPrototype( ractive, 'onconstruct', options.onconstruct ).bind(ractive),
			fire: ractive.fire.bind(ractive)
		};
	}
	else {
		return ractive;
	}
};

export default config;
