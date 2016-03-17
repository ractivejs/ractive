import resolveReference from '../resolvers/resolveReference';
import { defineProperties } from '../../utils/object';
import gatherRefs from './gatherRefs';
import { warnOnceIfDebug } from '../../utils/log';

// get relative keypaths and values
function get ( keypath ) {
	if ( !keypath ) return this._element.parentFragment.findContext().get();

	const model = resolveReference( this._element.parentFragment, keypath );

	return model ? model.get() : undefined;
}

function resolve ( path, ractive ) {
	const frag = this._element.parentFragment;

	if ( typeof path !== 'string' ) {
		return frag.findContext().getKeypath( path === undefined ? frag.ractive : path );
	}

	const model = resolveReference( frag, path );

	return model ? model.getKeypath( ractive === undefined ? frag.ractive : ractive ) : path;
}

// the usual mutation suspects
function add ( keypath, value ) {
	return this.ractive.add( this.resolve( keypath ), value );
}

function animate ( keypath, value, options ) {
	return this.ractive.animate( this.resolve( keypath ), value, options );
}

function link ( source, dest ) {
	return this.ractive.link( this.resolve( source ), this.resolve( dest ) );
}

function merge ( keypath, array ) {
	return this.ractive.merge( this.resolve( keypath ), array );
}

function pop ( keypath ) {
	return this.ractive.pop( this.resolve( keypath ) );
}

function push ( keypath, ...values ) {
	values.unshift( this.resolve( keypath ) );
	return this.ractive.push.apply( this.ractive, values );
}

function set ( keypath, value ) {
	return this.ractive.set( this.resolve( keypath ), value );
}

function shift ( keypath ) {
	return this.ractive.shift( this.resolve( keypath ) );
}

function splice ( keypath, index, drop, ...add ) {
	add.unshift( this.resolve( keypath ), index, drop );
	return this.ractive.splice.apply( this.ractive, add );
}

function subtract ( keypath, value ) {
	return this.ractive.subtract( this.resolve( keypath ), value );
}

function toggle ( keypath ) {
	return this.ractive.toggle( this.resolve( keypath ) );
}

function unlink ( dest ) {
	return this.ractive.unlink( dest );
}

function unshift ( keypath, ...add ) {
	add.unshift( this.resolve( keypath ) );
	return this.ractive.unshift.apply( this.ractive, add );
}

function update ( keypath ) {
	return this.ractive.update( this.resolve( keypath ) );
}

function updateModel ( keypath, cascade ) {
	return this.ractive.updateModel( this.resolve( keypath ), cascade );
}

// two-way binding related helpers
function isBound () {
	const el = this._element;

	if ( el.binding ) return true;
	else return false;
}

function getBindingPath ( ractive ) {
	const el = this._element;

	if ( el.binding && el.binding.model ) return el.binding.model.getKeypath( ractive || el.parentFragment.ractive );
}

function getBinding () {
	const el = this._element;

	if ( el.binding && el.binding.model ) return el.binding.model.get();
}

function setBinding ( value ) {
	return this.ractive.set( this.getBindingPath(), value );
}

// deprecated getters
function keypath () {
	warnOnceIfDebug( `Object property keypath is deprecated, please use resolve() instead.` );
	return this.resolve();
}

function rootpath () {
	warnOnceIfDebug( `Object property rootpath is deprecated, please use resolve( ractive.root ) instead.` );
	return this.resolve( this.ractive.root );
}

function context () {
	warnOnceIfDebug( `Object property context is deprecated, please use get() instead.` );
	return this.get();
}

function index () {
	warnOnceIfDebug( `Object property index is deprecated, you can use get( "indexName" ) instead.` );
	return gatherRefs( this._element.parentFragment ).index;
}

function key () {
	warnOnceIfDebug( `Object property key is deprecated, you can use get( "keyName" ) instead.` );
	return gatherRefs( this._element.parentFragment ).key;
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
		set: { value: set },
		shift: { value: shift },
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

		keypath: { get: keypath },
		rootpath: { get: rootpath },
		context: { get: context },
		index: { get: index },
		key: { get: key }
	});

	return obj;
}
