import { capture, startCapturing, stopCapturing } from 'global/capture';
import { warnIfDebug } from 'utils/log';
import Model from './Model';
import { removeFromArray } from 'utils/array';
import { isEqual } from 'utils/is';
import { handleChange, mark as markChild } from 'shared/methodCallers';

// TODO `mark` appears to conflict with method name,
// hence `markChild` - revert once bundler is fixed

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

		this.isReadonly = !this.signature.setter;

		this.context = viewmodel.computationContext;

		this.dependencies = [];

		this.children = [];
		this.childByKey = {};

		this.deps = [];

		this.boundsSensitive = true;
		this.dirty = true;
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );

		if ( this.dirty ) {
			this.value = this.getValue();
			this.adapt();
			this.dirty = false;
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
			if ( console.groupCollapsed ) console.groupCollapsed( '%cshow details', 'color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;' );
			const functionBody = prettify( this.signature.getterString );
			const stack = this.signature.getterUseStack ? '\n\n' + truncateStack( err.stack ) : '';
			console.error( `${err.name}: ${err.message}\n\n${functionBody}${stack}` );
			if ( console.groupCollapsed ) console.groupEnd();
		}

		const dependencies = stopCapturing();
		this.setDependencies( dependencies );

		return result;
	}

	handleChange () {
		this.dirty = true;

		this.deps.forEach( handleChange );
		this.children.forEach( markChild ); // TODO rename to mark once bundling glitch fixed
		this.clearUnresolveds(); // TODO same question as on Model - necessary for primitives?
	}

	init () {
	}

	mark () {
		this.handleChange();
	}

	register ( dependant ) {
		this.deps.push( dependant );
	}

	set ( value ) {
		if ( !this.signature.setter ) {
			throw new Error( `Cannot set read-only computed property '${this.key}'` );
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

	unregister ( dependant ) {
		removeFromArray( this.deps, dependant );
	}
}
