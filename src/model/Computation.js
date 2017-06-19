/* global console */
/* eslint no-console:"off" */

import { capture, startCapturing, stopCapturing } from '../global/capture';
import { warnIfDebug } from '../utils/log';
import Model from './Model';
import { maybeBind } from './ModelBase';
import ComputationChild from './ComputationChild';
import { hasConsole } from '../config/environment';
import { isEqual } from '../utils/is';

export default class Computation extends Model {
	constructor ( viewmodel, signature, key ) {
		super( null, null );

		this.root = this.parent = viewmodel;
		this.signature = signature;

		this.key = key; // not actually used, but helps with debugging
		this.isExpression = key && key[0] === '@';

		this.isReadonly = !this.signature.setter;

		this.context = viewmodel.computationContext;

		this.dependencies = [];

		this.children = [];
		this.childByKey = {};

		this.deps = [];

		this.dirty = true;

		// TODO: is there a less hackish way to do this?
		this.shuffle = undefined;
	}

	get setRoot () {
		if ( this.signature.setter ) return this;
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );

		if ( this.dirty ) {
			this.dirty = false;
			const old = this.value;
			this.value = this.getValue();
			if ( !isEqual( old, this.value ) ) this.notifyUpstream();
			if ( this.wrapper ) this.newWrapperValue = this.value;
			this.adapt();
		}

		// if capturing, this value needs to be unwrapped because it's for external use
		return maybeBind( this, shouldCapture && this.wrapper ? this.wrapperValue : this.value );
	}

	getValue () {
		startCapturing();
		let result;

		try {
			result = this.signature.getter.call( this.context );
		} catch ( err ) {
			warnIfDebug( `Failed to compute ${this.getKeypath()}: ${err.message || err}` );

			// TODO this is all well and good in Chrome, but...
			// ...also, should encapsulate this stuff better, and only
			// show it if Ractive.DEBUG
			if ( hasConsole ) {
				if ( console.groupCollapsed ) console.groupCollapsed( '%cshow details', 'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;' );
				const sig = this.signature;
				console.error( `${err.name}: ${err.message}\n\n${sig.getterString}${sig.getterUseStack ? '\n\n' + err.stack : ''}` );
				if ( console.groupCollapsed ) console.groupEnd();
			}
		}

		const dependencies = stopCapturing();
		this.setDependencies( dependencies );

		return result;
	}

	mark () {
		this.handleChange();
	}

	rebind ( next, previous ) {
		// computations will grab all of their deps again automagically
		if ( next !== previous ) this.handleChange();
	}

	set ( value ) {
		if ( this.isReadonly ) {
			throw new Error( `Cannot set read-only computed value '${this.key}'` );
		}

		this.signature.setter( value );
		this.mark();
	}

	setDependencies ( dependencies ) {
		// unregister any soft dependencies we no longer have
		let i = this.dependencies.length;
		while ( i-- ) {
			const model = this.dependencies[i];
			if ( !~dependencies.indexOf( model ) ) model.unregister( this );
		}

		// and add any new ones
		i = dependencies.length;
		while ( i-- ) {
			const model = dependencies[i];
			if ( !~this.dependencies.indexOf( model ) ) model.register( this );
		}

		this.dependencies = dependencies;
	}

	teardown () {
		let i = this.dependencies.length;
		while ( i-- ) {
			if ( this.dependencies[i] ) this.dependencies[i].unregister( this );
		}
		if ( this.root.computations[this.key] === this ) delete this.root.computations[this.key];
		super.teardown();
	}
}

const prototype = Computation.prototype;
const child = ComputationChild.prototype;
prototype.handleChange = child.handleChange;
prototype.joinKey = child.joinKey;
