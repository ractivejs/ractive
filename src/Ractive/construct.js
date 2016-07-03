import { fatal, welcome } from '../utils/log';
import { missingPlugin } from '../config/errors';
import { magic as magicSupported } from '../config/environment';
import { ensureArray } from '../utils/array';
import { findInViewHierarchy } from '../shared/registry';
import arrayAdaptor from './static/adaptors/array/index';
import magicAdaptor from './static/adaptors/magic';
import magicArrayAdaptor from './static/adaptors/magicArray';
import { create, defineProperty, extend } from '../utils/object';
import dataConfigurator from './config/custom/data';
import RootModel from '../model/RootModel';
import Hook from '../events/Hook';
import getComputationSignature from './helpers/getComputationSignature';
import Ractive from '../Ractive';

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

	// TODO remove this, eventually
	defineProperty( ractive, 'data', { get: deprecateRactiveData });

	// TODO don't allow `onconstruct` with `new Ractive()`, there's no need for it
	constructHook.fire( ractive, options );

	// Add registries
	registryNames.forEach( name => {
		ractive[ name ] = extend( create( ractive.constructor[ name ] || null ), options[ name ] );
	});

	// Create a viewmodel
	const viewmodel = new RootModel({
		adapt: getAdaptors( ractive, ractive.adapt, options ),
		data: dataConfigurator.init( ractive.constructor, ractive, options ),
		ractive
	});

	ractive.viewmodel = viewmodel;

	// Add computed properties
	const computed = extend( create( ractive.constructor.prototype.computed ), options.computed );

	for ( let key in computed ) {
		const signature = getComputationSignature( ractive, key, computed[ key ] );
		viewmodel.compute( key, signature );
	}
}

function combine ( a, b ) {
	const c = a.slice();
	let i = b.length;

	while ( i-- ) {
		if ( !~c.indexOf( b[i] ) ) {
			c.push( b[i] );
		}
	}

	return c;
}

function getAdaptors ( ractive, protoAdapt, options ) {
	protoAdapt = protoAdapt.map( lookup );
	let adapt = ensureArray( options.adapt ).map( lookup );

	adapt = combine( protoAdapt, adapt );

	const magic = 'magic' in options ? options.magic : ractive.magic;
	const modifyArrays = 'modifyArrays' in options ? options.modifyArrays : ractive.modifyArrays;

	if ( magic ) {
		if ( !magicSupported ) {
			throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
		}

		if ( modifyArrays ) {
			adapt.push( magicArrayAdaptor );
		}

		adapt.push( magicAdaptor );
	}

	if ( modifyArrays ) {
		adapt.push( arrayAdaptor );
	}

	return adapt;


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
	ractive._subs = create( null );

	// storage for item configuration from instantiation to reset,
	// like dynamic functions or original values
	ractive._config = {};

	// nodes registry
	ractive.nodes = {};

	// events
	ractive.event = null;
	ractive._eventQueue = [];

	// live queries
	ractive._liveQueries = [];
	ractive._liveComponentQueries = [];

	// observers
	ractive._observers = [];

	// links
	ractive._links = {};

	// external children
	ractive._children = [];
	ractive._anchors = [];

	// manual mappings
	ractive._mappings = {};

	if(!ractive.component){
		ractive.root = ractive;
		ractive.parent = ractive.container = null; // TODO container still applicable?
	}

}

function deprecateRactiveData () {
	throw new Error( 'Using `ractive.data` is no longer supported - you must use the `ractive.get()` API instead' );
}
