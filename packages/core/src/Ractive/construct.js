import { fatal, warnIfDebug, welcome } from '../utils/log';
import { missingPlugin } from '../config/errors';
import { ensureArray, combine } from '../utils/array';
import { findInViewHierarchy } from '../shared/registry';
import dataConfigurator from './config/custom/data';
import RootModel from '../model/RootModel';
import Hook from '../events/Hook';
import getComputationSignature from './helpers/getComputationSignature';
import subscribe from './helpers/subscribe';
import Ractive from '../index';
import { ATTRIBUTE, INTERPOLATOR } from '../config/types';

const constructHook = new Hook( 'construct' );

const registryNames = [
	'adaptors',
	'components',
	'decorators',
	'easing',
	'events',
	'interpolators',
	'partials',
	'transitions'
];

let uid = 0;

export default function construct ( ractive, options ) {
	if ( Ractive.DEBUG ) welcome();

	initialiseProperties( ractive );
	handleAttributes( ractive );

	// set up event subscribers
	subscribe( ractive, options, 'on' );

	// if there's not a delegation setting, inherit from parent if it's not default
	if ( !options.hasOwnProperty( 'delegate' ) && ractive.parent && ractive.parent.delegate !== ractive.delegate ) {
		ractive.delegate = false;
	}

	// TODO don't allow `onconstruct` with `new Ractive()`, there's no need for it
	constructHook.fire( ractive, options );

	// Add registries
	let i = registryNames.length;
	while ( i-- ) {
		const name = registryNames[ i ];
		ractive[ name ] = Object.assign( Object.create( ractive.constructor[ name ] || null ), options[ name ] );
	}

	if ( ractive._attributePartial ) {
		ractive.partials['extra-attributes'] = ractive._attributePartial;
		delete ractive._attributePartial;
	}

	// Create a viewmodel
	const viewmodel = new RootModel({
		adapt: getAdaptors( ractive, ractive.adapt, options ),
		data: dataConfigurator.init( ractive.constructor, ractive, options ),
		ractive
	});

	ractive.viewmodel = viewmodel;

	// Add computed properties
	const computed = Object.assign( Object.create( ractive.constructor.prototype.computed ), options.computed );

	for ( const key in computed ) {
		if ( key === '__proto__' ) continue;
		const signature = getComputationSignature( ractive, key, computed[ key ] );
		viewmodel.compute( key, signature );
	}
}

function getAdaptors ( ractive, protoAdapt, options ) {
	protoAdapt = protoAdapt.map( lookup );
	const adapt = ensureArray( options.adapt ).map( lookup );

	const srcs = [ protoAdapt, adapt ];
	if ( ractive.parent && !ractive.isolated ) {
		srcs.push( ractive.parent.viewmodel.adaptors );
	}

	return combine.apply( null, srcs );

	function lookup ( adaptor ) {
		if ( typeof adaptor === 'string' ) {
			adaptor = findInViewHierarchy( 'adaptors', ractive, adaptor );

			if ( !adaptor ) {
				fatal( missingPlugin( adaptor, 'adaptor' ) );
			}
		}

		return adaptor;
	}
}

function initialiseProperties ( ractive ) {
	// Generate a unique identifier, for places where you'd use a weak map if it
	// existed
	ractive._guid = 'r-' + uid++;

	// events
	ractive._subs = Object.create( null );
	ractive._nsSubs = 0;

	// storage for item configuration from instantiation to reset,
	// like dynamic functions or original values
	ractive._config = {};

	// events
	ractive.event = null;
	ractive._eventQueue = [];

	// observers
	ractive._observers = [];

	// external children
	ractive._children = [];
	ractive._children.byName = {};
	ractive.children = ractive._children;

	if ( !ractive.component ) {
		ractive.root = ractive;
		ractive.parent = ractive.container = null; // TODO container still applicable?
	}
}

function handleAttributes ( ractive ) {
	const component = ractive.component;
	const attributes = ractive.constructor.attributes;

	if ( attributes && component ) {
		const tpl = component.template;
		const attrs = tpl.m ? tpl.m.slice() : [];

		// grab all of the passed attribute names
		const props = attrs.filter( a => a.t === ATTRIBUTE ).map( a => a.n );

		// warn about missing requireds
		attributes.required.forEach( p => {
			if ( !~props.indexOf( p ) ) {
				warnIfDebug( `Component '${component.name}' requires attribute '${p}' to be provided` );
			}
		});

		// set up a partial containing non-property attributes
		const all = attributes.optional.concat( attributes.required );
		const partial = [];
		let i = attrs.length;
		while ( i-- ) {
			const a = attrs[i];
			if ( a.t === ATTRIBUTE && !~all.indexOf( a.n ) ) {
				if ( attributes.mapAll ) {
					// map the attribute if requested and make the extra attribute in the partial refer to the mapping
					partial.unshift({ t: ATTRIBUTE, n: a.n, f: [{ t: INTERPOLATOR, r: `~/${a.n}` }] });
				} else {
					// transfer the attribute to the extra attributes partal
					partial.unshift( attrs.splice( i, 1 )[0] );
				}
			}
		}

		if ( partial.length ) component.template = { t: tpl.t, e: tpl.e, f: tpl.f, m: attrs, p: tpl.p };
		ractive._attributePartial = partial;
	}
}
