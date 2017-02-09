import resolveReference from '../view/resolvers/resolveReference';
import { set as sharedSet } from './set';
import { isNumeric, isObject } from '../utils/is';
import makeArrayMethod from '../Ractive/prototype/shared/makeArrayMethod';
import { animate as protoAnimate } from '../Ractive/prototype/animate';
import { merge as protoMerge } from '../Ractive/prototype/merge';
import { update as protoUpdate } from '../Ractive/prototype/update';
import runloop from '../global/runloop';
import findElement from '../view/items/shared/findElement';
import getRactiveContext, { extern } from './getRactiveContext';

const modelPush = makeArrayMethod( 'push' ).model;
const modelPop = makeArrayMethod( 'pop' ).model;
const modelShift = makeArrayMethod( 'shift' ).model;
const modelUnshift = makeArrayMethod( 'unshift' ).model;
const modelSort = makeArrayMethod( 'sort' ).model;
const modelSplice = makeArrayMethod( 'splice' ).model;
const modelReverse = makeArrayMethod( 'reverse' ).model;

export default class Context {
	constructor ( fragment, element ) {
		this.fragment = fragment;
		this.element = element || findElement( fragment );
		this.ractive = fragment.ractive;
	}

	get decorators () {
		const items = {};
		if ( !this.element ) return items;
		this.element.decorators.forEach( d => items[ d.name ] = d.intermediary );
		return items;
	}

	// the usual mutation suspects
	add ( keypath, value ) {
		if ( value === undefined ) value = 1;
		if ( !isNumeric( value ) ) throw new Error( 'Bad arguments' );
		return sharedSet( this.ractive, build( this, keypath, value ).map( pair => {
			const [ model, val ] = pair;
			const value = model.get();
			if ( !isNumeric( val ) || !isNumeric( value ) ) throw new Error( 'Cannot add non-numeric value' );
			return [ model, value + val ];
		}) );
	}

	animate ( keypath, value, options ) {
		const model = findModel( this, keypath ).model;
		return protoAnimate( this.ractive, model, value, options );
	}

	// get relative keypaths and values
	get ( keypath ) {
		if ( !keypath ) return this.fragment.findContext().get( true );

		const model = resolveReference( this.fragment, keypath );

		return model ? model.get( true ) : undefined;
	}

	link ( source, dest ) {
		const there = findModel( this, source ).model;
		const here = findModel( this, dest ).model;
		const promise = runloop.start( this.ractive, true );
		here.link( there, source );
		runloop.end();
		return promise;
	}

	merge ( keypath, array, options ) {
		return protoMerge( this.ractive, findModel( this, keypath ).model, array, options );
	}

	observe ( keypath, callback, options = {} ) {
		if ( isObject( keypath ) ) options = callback || {};
		options.fragment = this.fragment;
		return this.ractive.observe( keypath, callback, options );
	}

	observeOnce ( keypath, callback, options = {} ) {
		if ( isObject( keypath ) ) options = callback || {};
		options.fragment = this.fragment;
		return this.ractive.observeOnce( keypath, callback, options );
	}

	pop ( keypath ) {
		return modelPop( findModel( this, keypath ).model, [] );
	}

	push ( keypath, ...values ) {
		return modelPush( findModel( this, keypath ).model, values );
	}

	raise ( name, event, ...args ) {
		let element = this.element;

		while ( element ) {
			const events = element.events;
			for ( let i = 0; i < events.length; i++ ) {
				const ev = events[i];
				if ( ~ev.template.n.indexOf( name ) ) {
					ev.fire( ev.element.getContext( event ), args );
					return;
				}
			}

			element = element.parent;
		}
	}

	readLink ( keypath, options ) {
		return this.ractive.readLink( this.resolve( keypath ), options );
	}

	resolve ( path, ractive ) {
		const { model, instance } = findModel( this, path );
		return model ? model.getKeypath( ractive || instance ) : path;
	}

	reverse ( keypath ) {
		return modelReverse( findModel( this, keypath ).model, [] );
	}

	set ( keypath, value ) {
		return sharedSet( this.ractive, build( this, keypath, value ) );
	}

	shift ( keypath ) {
		return modelShift( findModel( this, keypath ).model, [] );
	}

	splice ( keypath, index, drop, ...add ) {
		add.unshift( index, drop );
		return modelSplice( findModel( this, keypath ).model, add );
	}

	sort ( keypath ) {
		return modelSort( findModel( this, keypath ).model, [] );
	}

	subtract ( keypath, value ) {
		if ( value === undefined ) value = 1;
		if ( !isNumeric( value ) ) throw new Error( 'Bad arguments' );
		return sharedSet( this.ractive, build( this, keypath, value ).map( pair => {
			const [ model, val ] = pair;
			const value = model.get();
			if ( !isNumeric( val ) || !isNumeric( value ) ) throw new Error( 'Cannot add non-numeric value' );
			return [ model, value - val ];
		}) );
	}

	toggle ( keypath ) {
		const { model } = findModel( this, keypath );
		return sharedSet( this.ractive, [ [ model, !model.get() ] ] );
	}

	unlink ( dest ) {
		const here = findModel( this, dest ).model;
		const promise = runloop.start( this.ractive, true );
		if ( here.owner && here.owner._link ) here.owner.unlink();
		runloop.end();
		return promise;
	}

	unshift ( keypath, ...add ) {
		return modelUnshift( findModel( this, keypath ).model, add );
	}

	update ( keypath ) {
		return protoUpdate( this.ractive, findModel( this, keypath ).model );
	}

	updateModel ( keypath, cascade ) {
		const { model } = findModel( this, keypath );
		const promise = runloop.start( this.ractive, true );
		model.updateFromBindings( cascade );
		runloop.end();
		return promise;
	}

	// two-way binding related helpers
	isBound () {
		const { model } = this.getBindingModel( this );
		return !!model;
	}

	getBindingPath ( ractive ) {
		const { model, instance } = this.getBindingModel( this );
		if ( model ) return model.getKeypath( ractive || instance );
	}

	getBinding () {
		const { model } = this.getBindingModel( this );
		if ( model ) return model.get( true );
	}

	getBindingModel ( ctx ) {
		const el = ctx.element;
		return { model: el.binding && el.binding.model, instance: el.parentFragment.ractive };
	}

	setBinding ( value ) {
		const { model } = this.getBindingModel( this );
		return sharedSet( this.ractive, [ [ model, value ] ] );
	}
}

Context.forRactive = getRactiveContext;
// circular deps are fun
extern.Context = Context;

// TODO: at some point perhaps this could support relative * keypaths?
function build ( ctx, keypath, value ) {
	const sets = [];

	// set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		for ( const k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				sets.push( [ findModel( ctx, k ).model, keypath[k] ] );
			}
		}

	}
	// set a single keypath
	else {
		sets.push( [ findModel( ctx, keypath ).model, value ] );
	}

	return sets;
}

function findModel ( ctx, path ) {
	const frag = ctx.fragment;

	if ( typeof path !== 'string' ) {
		return { model: frag.findContext(), instance: path };
	}

	return { model: resolveReference( frag, path ), instance: frag.ractive };
}
