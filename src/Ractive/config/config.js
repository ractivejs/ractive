import adaptConfigurator from './custom/adapt';
import cssConfigurator from './custom/css/css';
import dataConfigurator from './custom/data';
import templateConfigurator from './custom/template/template';
import defaults from './defaults';
import registries from './registries';
import wrapPrototype from './wrapPrototypeMethod';
import deprecate from './deprecate';

var config, order, defaultKeys, custom, isBlacklisted, isStandardKey;

custom = {
	adapt: adaptConfigurator,
	css: cssConfigurator,
	data: dataConfigurator,
	template: templateConfigurator
};

defaultKeys = Object.keys( defaults );

isStandardKey = makeObj( defaultKeys.filter( key => !custom[ key ] ) );

// blacklisted keys that we don't double extend
isBlacklisted = makeObj( defaultKeys.concat( registries.map( r => r.name ) ) );

order = [].concat(
	defaultKeys.filter( key => !registries[ key ] && !custom[ key ] ),
	registries,
	custom.data,
	custom.template,
	custom.css
);

config = {
	extend: ( Parent, proto, options ) => configure( 'extend', Parent, proto, options ),

	init: ( Parent, ractive, options ) => configure( 'init', Parent, ractive, options ),

	reset: ractive => {
		return order.filter( c => {
			return c.reset && c.reset( ractive );
		}).map( c => c.name );
	},

	// this defines the order. TODO this isn't used anywhere in the codebase,
	// only in the test suite - should get rid of it
	order: order,

	// TODO kill this off
	getConstructTarget: ( ractive, options ) => {
		if ( options.onconstruct ) {
			// pretend this object literal is the ractive instance
			return {
				onconstruct: wrapPrototype( ractive, 'onconstruct', options.onconstruct ).bind(ractive),
				fire: ractive.fire.bind(ractive)
			};
		} else {
			return ractive;
		}
	}
};

function configure ( method, Parent, target, options ) {
	deprecate( options );

	for ( let key in options ) {
		if ( isStandardKey[ key ] ) {
			let value = options[ key ];

			if ( typeof value === 'function' ) {
				value = wrapPrototype( Parent.prototype, key, value );
			}

			target[ key ] = value;
		}
	}

	registries.forEach( registry => {
		registry[ method ]( Parent, target, options );
	});

	adaptConfigurator[ method ]( Parent, target, options );
	dataConfigurator[ method ]( Parent, target, options );
	templateConfigurator[ method ]( Parent, target, options );
	cssConfigurator[ method ]( Parent, target, options );

	extendOtherMethods( Parent.prototype, target, options );
}

function extendOtherMethods ( parent, target, options ) {
	for ( let key in options ) {
		if ( !isBlacklisted[ key ] && options.hasOwnProperty( key ) ) {
			let member = options[ key ];

			// if this is a method that overwrites a method, wrap it:
			if ( typeof member === 'function' ) {
				member = wrapPrototype( parent, key, member );
			}

			target[ key ] = member;
		}
	}
}

function makeObj ( array ) {
	var obj = {};
	array.forEach( x => obj[x] = true );
	return obj;
}

export default config;
