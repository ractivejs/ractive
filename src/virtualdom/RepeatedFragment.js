import Fragment from './Fragment';
import { isArray, isObject } from 'utils/is';
import { toEscapedString, toString, update } from 'shared/methodCallers';
import findParentNode from './items/shared/findParentNode';

function getRefs ( ref, value, parent ) {
	let refs;

	if ( ref ) {
		refs = {};
		Object.keys( parent ).forEach( ref => {
			refs[ ref ] = parent[ ref ];
		});
		refs[ ref ] = value;
	} else {
		refs = parent;
	}

	return refs;
}

export default class RepeatedFragment {
	constructor ( options ) {
		this.parent = options.owner.parentFragment;

		// bit of a hack, so reference resolution works without another
		// layer of indirection
		this.parentFragment = this;
		this.owner = options.owner;
		this.ractive = this.parent.ractive;

		this.template = options.template;

		this.indexRef = options.indexRef;
		this.keyRef = options.keyRef;
		this.indexRefResolvers = []; // no keyRefResolvers - key can never change

		this.indexByKey = null; // for `{{#each object}}...`
	}

	bind ( context ) {
		this.context = context;

		// {{#each array}}...
		if ( isArray( context.value ) ) {
			this.iterations = context.value.map( ( childValue, index ) => this.createIteration( index, index ) );
		}

		// {{#each object}}...
		else if ( isObject( context.value ) ) {
			this.indexByKey = {};
			this.iterations = Object.keys( context.value ).map( ( key, index ) => {
				this.indexByKey[ key ] = index;
				return this.createIteration( key, index );
			});
		}
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parent.bubble();
		}
	}

	createIteration ( key, index ) {
		const parentFragment = this.owner.parentFragment;
		const keyRefs = getRefs( this.keyRef, key, parentFragment.keyRefs );
		const indexRefs = getRefs( this.indexRef, index, parentFragment.indexRefs );

		const fragment = new Fragment({
			owner: this,
			template: this.template,
			indexRefs,
			keyRefs
		});

		fragment.key = key; // TODO this is a bit hacky
		fragment.index = index;

		fragment.bind( this.context.join([ key ]) ); // TODO join method that accepts non-array
		return fragment;
	}

	render () {
		// TODO use docFrag.cloneNode...

		const docFrag = document.createDocumentFragment();
		this.iterations.forEach( fragment => docFrag.appendChild( fragment.render() ) );
		return docFrag;
	}

	toString ( escape ) {
		return this.iterations.map( escape ? toEscapedString : toString ).join( '' );
	}

	// TODO smart update
	update () {
		if ( !this.dirty ) return;

		const value = this.context.value;

		let toRemove;
		let oldKeys;

		if ( isArray( value ) ) {
			if ( this.iterations.length > value.length ) {
				toRemove = this.iterations.splice( value.length );
			}
		} else if ( isObject( value ) ) {
			toRemove = [];
			oldKeys = {};
			let i = this.iterations.length;

			while ( i-- ) {
				const fragment = this.iterations[i];
				if ( fragment.key in value ) {
					oldKeys[ fragment.key ] = true;
				} else {
					this.iterations.splice( i, 1 );
					toRemove.push( fragment );
				}
			}
		} else {
			toRemove = this.iterations;
			this.iterations = [];
		}

		if ( toRemove ) {
			toRemove.forEach( fragment => {
				fragment.unbind();
				fragment.unrender( true );
			});
		}

		// update the remaining ones
		this.iterations.forEach( update );

		// add new iterations
		const newLength = isArray( value ) ? value.length : Object.keys( value ).length;
		if ( newLength > this.iterations.length ) {
			const docFrag = document.createDocumentFragment();
			let i = this.iterations.length;

			if ( isArray( value ) ) {
				while ( i < value.length ) {
					const fragment = this.createIteration( i, i );

					this.iterations.push( fragment );
					docFrag.appendChild( fragment.render() );

					i += 1;
				}
			}

			else if ( isObject( value ) ) {
				Object.keys( value ).forEach( key => {
					if ( !( key in oldKeys ) ) {
						const fragment = this.createIteration( key, i );

						this.iterations.push( fragment );
						docFrag.appendChild( fragment.render() );

						i += 1;
					}
				});
			}

			const parentNode = findParentNode( this.owner );
			const anchor = this.parent.findNextNode( this );

			parentNode.insertBefore( docFrag, anchor );
		}

		this.dirty = false;
	}
}
