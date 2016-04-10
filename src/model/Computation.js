/* global console */

import { capture, startCapturing, stopCapturing } from '../global/capture';
import { warnIfDebug } from '../utils/log';
import Model from './Model';
import ComputationChild from './ComputationChild';
import { handleChange } from '../shared/methodCallers';
import { hasConsole } from '../config/environment';

// TODO this is probably a bit anal, maybe we should leave it out
function prettify ( fnBody ) {
	const lines = fnBody
		.replace( /^\t+/gm, tabs => tabs.split( '\t' ).join( '  ' ) )
		.split( '\n' );

	const minIndent = lines.length < 2 ? 0 :
		lines.slice( 1 ).reduce( ( prev, line ) => {
			return Math.min( prev, /^\s*/.exec( line )[0].length );
		}, Infinity );

	return lines.map( ( line, i ) => {
		return '    ' + ( i ? line.substring( minIndent ) : line );
	}).join( '\n' );
}

// Ditto. This function truncates the stack to only include app code
function truncateStack ( stack ) {
	if ( !stack ) return '';

	const lines = stack.split( '\n' );
	const name = Computation.name + '.getValue';

	let truncated = [];

	const len = lines.length;
	for ( let i = 1; i < len; i += 1 ) {
		const line = lines[i];

		if ( ~line.indexOf( name ) ) {
			return truncated.join( '\n' );
		} else {
			truncated.push( line );
		}
	}
}

export default class Computation extends Model {
	constructor ( viewmodel, signature, key ) {
		super( null, null );

		this.root = this.parent = viewmodel;
		this.signature = signature;

		this.key = key; // not actually used, but helps with debugging
		this.isExpression = key && key[0] === '#';

		this.isReadonly = !this.signature.setter;

		this.context = viewmodel.computationContext;

		this.dependencies = [];

		this.children = [];
		this.childByKey = {};

		this.deps = [];

		this.boundsSensitive = true;
		this.dirty = true;

		// TODO: is there a less hackish way to do this?
		this.shuffle = undefined;
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );

		if ( this.dirty ) {
			this.dirty = false;
			this.value = this.getValue();
			this.adapt();
		}

		return this.value;
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
				const functionBody = prettify( this.signature.getterString );
				const stack = this.signature.getterUseStack ? '\n\n' + truncateStack( err.stack ) : '';
				console.error( `${err.name}: ${err.message}\n\n${functionBody}${stack}` );
				if ( console.groupCollapsed ) console.groupEnd();
			}
		}

		const dependencies = stopCapturing();
		this.setDependencies( dependencies );

		return result;
	}

	handleChange () {
		this.dirty = true;

		this.deps.forEach( handleChange );
		this.children.forEach( handleChange );
		this.clearUnresolveds(); // TODO same question as on Model - necessary for primitives?
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new ComputationChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	mark () {
		this.handleChange();
	}

	set ( value ) {
		if ( !this.signature.setter ) {
			throw new Error( `Cannot set read-only computed value '${this.key}'` );
		}

		this.signature.setter( value );
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
