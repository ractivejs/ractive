import { isObject } from '../../utils/is';
import { warnOnceIfDebug } from '../../utils/log';
import { splitKeypath } from '../../shared/keypaths';
import resolveReference from '../../view/resolvers/resolveReference';
import Observer from './observe/Observer';
import PatternObserver from './observe/Pattern';
import ArrayObserver from './observe/Array';

export default function observe ( keypath, callback, options ) {
	const observers = [];
	let map;
	let opts;

	if ( isObject( keypath ) ) {
		map = keypath;
		opts = callback || {};
	} else {
		if ( typeof keypath === 'function' ) {
			map = { '': keypath };
			opts = callback || {};
		} else {
			map = {};
			map[ keypath ] = callback;
			opts = options || {};
		}
	}

	let silent = false;
	Object.keys( map ).forEach( keypath => {
		const callback = map[ keypath ];
		const caller = function ( ...args ) {
			if ( silent ) return;
			return callback.apply( this, args );
		};

		let keypaths = keypath.split( ' ' );
		if ( keypaths.length > 1 ) keypaths = keypaths.filter( k => k );

		keypaths.forEach( keypath => {
			opts.keypath = keypath;
			const observer = createObserver( this, keypath, caller, opts );
			if ( observer ) observers.push( observer );
		});
	});

	// add observers to the Ractive instance, so they can be
	// cancelled on ractive.teardown()
	this._observers.push.apply( this._observers, observers );

	return {
		cancel: () => observers.forEach( o => o.cancel() ),
		isSilenced: () => silent,
		silence: () => silent = true,
		resume: () => silent = false
	};
}

function createObserver ( ractive, keypath, callback, options ) {
	const keys = splitKeypath( keypath );
	let wildcardIndex = keys.indexOf( '*' );
	if ( !~wildcardIndex ) wildcardIndex = keys.indexOf( '**' );

	options.fragment = options.fragment || ractive.fragment;

	let model;
	if ( !options.fragment ) {
		model = ractive.viewmodel.joinKey( keys[0] );
	} else {
		// .*.whatever relative wildcard is a special case because splitkeypath doesn't handle the leading .
		if ( ~keys[0].indexOf( '.*' ) ) {
			model = options.fragment.findContext();
			wildcardIndex = 0;
			keys[0] = keys[0].slice( 1 );
		} else {
			model = wildcardIndex === 0 ? options.fragment.findContext() : resolveReference( options.fragment, keys[0] );
		}
	}

	// the model may not exist key
	if ( !model ) model = ractive.viewmodel.joinKey( keys[0] );

	if ( !~wildcardIndex ) {
		model = model.joinAll( keys.slice( 1 ) );
		if ( options.array ) {
			return new ArrayObserver( ractive, model, callback, options );
		} else {
			return new Observer( ractive, model, callback, options );
		}
	} else {
		const double = keys.indexOf( '**' );
		if ( ~double ) {
			if ( double + 1 !== keys.length || ~keys.indexOf( '*' ) ) {
				warnOnceIfDebug( `Recursive observers may only specify a single '**' at the end of the path.` );
				return;
			}
		}

		model = model.joinAll( keys.slice( 1, wildcardIndex ) );

		return new PatternObserver( ractive, model, keys.slice( wildcardIndex ), callback, options );
	}
}
