import resolveReference from '../resolvers/resolveReference';
import { defineProperties } from '../../utils/object';
import gatherRefs from './gatherRefs';
import { warnOnceIfDebug } from '../../utils/log';
import { set as sharedSet } from '../../shared/set';
import { isNumeric, isObject } from '../../utils/is';
import makeArrayMethod from '../../Ractive/prototype/shared/makeArrayMethod';
import { animate as protoAnimate } from '../../Ractive/prototype/animate';
import { merge as protoMerge } from '../../Ractive/prototype/merge';
import { update as protoUpdate } from '../../Ractive/prototype/update';
import runloop from '../../global/runloop';

const modelPush = makeArrayMethod( 'push' ).model;
const modelPop = makeArrayMethod( 'pop' ).model;
const modelShift = makeArrayMethod( 'shift' ).model;
const modelUnshift = makeArrayMethod( 'unshift' ).model;
const modelSort = makeArrayMethod( 'sort' ).model;
const modelSplice = makeArrayMethod( 'splice' ).model;
const modelReverse = makeArrayMethod( 'reverse' ).model;

// TODO: at some point perhaps this could support relative * keypaths?
function build ( el, keypath, value ) {
	const sets = [];

	// set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		for ( const k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				sets.push( [ findModel( el, k ).model, keypath[k] ] );
			}
		}

	}
	// set a single keypath
	else {
		sets.push( [ findModel( el, keypath ).model, value ] );
	}

	return sets;
}

// get relative keypaths and values
function get ( keypath ) {
	if ( !keypath ) return this._element.parentFragment.findContext().get( true );

	const model = resolveReference( this._element.parentFragment, keypath );

	return model ? model.get( true ) : undefined;
}

function resolve ( path, ractive ) {
	const { model, instance } = findModel( this, path );
	return model ? model.getKeypath( ractive || instance ) : path;
}

function findModel ( el, path ) {
	const frag = el._element.parentFragment;

	if ( typeof path !== 'string' ) {
		return { model: frag.findContext(), instance: path };
	}

	return { model: resolveReference( frag, path ), instance: frag.ractive };
}

// the usual mutation suspects
function add ( keypath, value ) {
	if ( value === undefined ) value = 1;
	if ( !isNumeric( value ) ) throw new Error( 'Bad arguments' );
	return sharedSet( this.ractive, build( this, keypath, value ).map( pair => {
		const [ model, val ] = pair, value = model.get();
		if ( !isNumeric( val ) || !isNumeric( value ) ) throw new Error( 'Cannot add non-numeric value' );
		return [ model, value + val ];
	}) );
}

function animate ( keypath, value, options ) {
	const model = findModel( this, keypath ).model;
	return protoAnimate( this.ractive, model, value, options );
}

function link ( source, dest ) {
	const there = findModel( this, source ).model, here = findModel( this, dest ).model;
	const promise = runloop.start( this.ractive, true );
	here.link( there, source );
	runloop.end();
	return promise;
}

function merge ( keypath, array, options ) {
	return protoMerge( this.ractive, findModel( this, keypath ).model, array, options );
}

function pop ( keypath ) {
	return modelPop( findModel( this, keypath ).model, [] );
}

function push ( keypath, ...values ) {
	return modelPush( findModel( this, keypath ).model, values );
}

function reverse ( keypath ) {
	return modelReverse( findModel( this, keypath ).model, [] );
}

function set ( keypath, value ) {
	return sharedSet( this.ractive, build( this, keypath, value ) );
}

function shift ( keypath ) {
	return modelShift( findModel( this, keypath ).model, [] );
}

function splice ( keypath, index, drop, ...add ) {
	add.unshift( index, drop );
	return modelSplice( findModel( this, keypath ).model, add );
}

function sort ( keypath ) {
	return modelSort( findModel( this, keypath ).model, [] );
}

function subtract ( keypath, value ) {
	if ( value === undefined ) value = 1;
	if ( !isNumeric( value ) ) throw new Error( 'Bad arguments' );
	return sharedSet( this.ractive, build( this, keypath, value ).map( pair => {
		const [ model, val ] = pair, value = model.get();
		if ( !isNumeric( val ) || !isNumeric( value ) ) throw new Error( 'Cannot add non-numeric value' );
		return [ model, value - val ];
	}) );
}

function toggle ( keypath ) {
	const { model } = findModel( this, keypath );
	return sharedSet( this.ractive, [ [ model, !model.get() ] ] );
}

function unlink ( dest ) {
	const here = findModel( this, dest ).model;
	const promise = runloop.start( this.ractive, true );
	if ( here.owner && here.owner._link ) here.owner.unlink();
	runloop.end();
	return promise;
}

function unshift ( keypath, ...add ) {
	return modelUnshift( findModel( this, keypath ).model, add );
}

function update ( keypath ) {
	return protoUpdate( this.ractive, findModel( this, keypath ).model );
}

function updateModel ( keypath, cascade ) {
	const { model } = findModel( this, keypath );
	const promise = runloop.start( this.ractive, true );
	model.updateFromBindings( cascade );
	runloop.end();
	return promise;
}

// two-way binding related helpers
function isBound () {
	const { model } = getBindingModel( this );
	return !!model;
}

function getBindingPath ( ractive ) {
	const { model, instance } = getBindingModel( this );
	if ( model ) return model.getKeypath( ractive || instance );
}

function getBinding () {
	const { model } = getBindingModel( this );
	if ( model ) return model.get( true );
}

function getBindingModel ( ctx ) {
	const el = ctx._element;
	return { model: el.binding && el.binding.model, instance: el.parentFragment.ractive };
}

function setBinding ( value ) {
	const { model } = getBindingModel( this );
	return sharedSet( this.ractive, [ [ model, value ] ] );
}

export function addHelpers ( obj, element ) {
	defineProperties( obj, {
		_element: { value: element },
		ractive: { value: element.parentFragment.ractive },
		resolve: { value: resolve },
		get: { value: get },

		add: { value: add },
		animate: { value: animate },
		link: { value: link },
		merge: { value: merge },
		pop: { value: pop },
		push: { value: push },
		reverse: { value: reverse },
		set: { value: set },
		shift: { value: shift },
		sort: { value: sort },
		splice: { value: splice },
		subtract: { value: subtract },
		toggle: { value: toggle },
		unlink: { value: unlink },
		unshift: { value: unshift },
		update: { value: update },
		updateModel: { value: updateModel },

		isBound: { value: isBound },
		getBindingPath: { value: getBindingPath },
		getBinding: { value: getBinding },
		setBinding: { value: setBinding },
	});

	return obj;
}
