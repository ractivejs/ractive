import { fatal, welcome } from '../utils/log';
import { missingPlugin } from '../config/errors';
import { magic as magicSupported } from '../config/environment';
import { ensureArray, combine } from '../utils/array';
import { findInViewHierarchy } from '../shared/registry';
import arrayAdaptor from './static/adaptors/array/index';
import magicAdaptor from './static/adaptors/magic';
import magicArrayAdaptor from './static/adaptors/magicArray';
import { create, extend } from '../utils/object';
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

	for ( const key in computed ) {
		const signature = getComputationSignature( ractive, key, computed[ key ] );
		viewmodel.compute( key, signature );
	}
}

function getAdaptors ( ractive, protoAdapt, options ) {
	protoAdapt = protoAdapt.map( lookup );
	const adapt = ensureArray( options.adapt ).map( lookup );

	const builtins = [];
	const srcs = [ protoAdapt, adapt ];
	if ( ractive.parent && !ractive.isolated ) {
		srcs.push( ractive.parent.viewmodel.adaptors );
	}
	srcs.push( builtins );

	const magic = 'magic' in options ? options.magic : ractive.magic;
	const modifyArrays = 'modifyArrays' in options ? options.modifyArrays : ractive.modifyArrays;

	if ( magic ) {
		if ( !magicSupported ) {
			throw new Error( 'Getters and setters (magic mode) are not supported in this browser' );
		}

		if ( modifyArrays ) {
			builtins.push( magicArrayAdaptor );
		}

		builtins.push( magicAdaptor );
	}

	if ( modifyArrays ) {
		builtins.push( arrayAdaptor );
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
	ractive._subs = create( null );

	// storage for item configuration from instantiation to reset,
	// like dynamic functions or original values
	ractive._config = {};

	// events
	ractive.event = null;
	ractive._eventQueue = [];

	// live queries
	ractive._liveQueries = [];
	ractive._liveComponentQueries = [];

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
