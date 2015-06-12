import Fragment from './Fragment';
import { isArray, isObject } from 'utils/is';
import { toEscapedString, toString, unbind, update } from 'shared/methodCallers';
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

		this.pendingNewIndices = null;
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

		return this;
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

	find ( selector ) {
		const len = this.iterations.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const found = this.iterations[i].find( selector );
			if ( found ) return found;
		}
	}

	findAll ( selector, queryResult ) {
		const len = this.iterations.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			this.iterations[i].findAll( selector, queryResult );
		}
	}

	findComponent ( name ) {
		const len = this.iterations.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const found = this.iterations[i].findComponent( name );
			if ( found ) return found;
		}
	}

	findAllComponents ( name, queryResult ) {
		const len = this.iterations.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			this.iterations[i].findAllComponents( name, queryResult );
		}
	}

	render () {
		// TODO use docFrag.cloneNode...

		const docFrag = document.createDocumentFragment();

		if ( this.iterations ) {
			this.iterations.forEach( fragment => docFrag.appendChild( fragment.render() ) );
		}

		return docFrag;
	}

	shuffle ( newIndices ) {
		if ( this.pendingNewIndices ) {
			throw new Error( 'Section was already shuffled!' );
		}

		this.pendingNewIndices = newIndices;
		this.dirty = true;
	}

	toString ( escape ) {
		return this.iterations ?
			this.iterations.map( escape ? toEscapedString : toString ).join( '' ) :
			'';
	}

	unbind () {
		this.iterations.forEach( unbind );
		return this;
	}

	// TODO smart update
	update () {
		if ( !this.dirty ) return;

		if ( this.pendingNewIndices ) {
			this.updatePostShuffle();
			return;
		}

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
		const newLength = isArray( value ) ?
			value.length :
			isObject( value ) ?
				Object.keys( value ).length :
				0;

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

	updatePostShuffle () {
		const newIndices = this.pendingNewIndices;
		const docFrag = document.createDocumentFragment();
		const parentNode = findParentNode( this.owner );

		let iterations = [];

		// TODO reorder fragments in the DOM...
		newIndices.forEach( ( newIndex, oldIndex ) => {
			const fragment = this.iterations[ oldIndex ];

			if ( newIndex === -1 ) {
				fragment.unbind();
				fragment.unrender( true );
			} else {
				iterations[ newIndex ] = fragment;
			}
		});

		// create new iterations
		const len = this.context.value.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			let fragment = iterations[i];

			if ( fragment ) {
				if ( docFrag.childNodes.length ) {
					parentNode.insertBefore( docFrag, fragment.firstNode() );
				}
			} else {
				fragment = this.createIteration( i, i );
				iterations[i] = fragment;

				docFrag.appendChild( fragment.render() );
			}
		}

		iterations.forEach( update );
		this.iterations = iterations;

		if ( docFrag.childNodes.length ) {
			parentNode.insertBefore( docFrag, this.owner.findNextNode() );
		}

		this.pendingNewIndices = null;
		this.dirty = false;
	}
}
