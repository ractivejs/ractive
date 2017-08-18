import Fragment from './Fragment';
import { createDocumentFragment } from '../utils/dom';
import { isObject } from '../utils/is';
import { findMap } from '../utils/array';
import { toEscapedString, toString, destroyed, shuffled, unbind, unrender, unrenderAndDestroy, update } from '../shared/methodCallers';
import findElement from './items/shared/findElement';

export default class RepeatedFragment {
	constructor ( options ) {
		this.parent = options.owner.parentFragment;

		// bit of a hack, so reference resolution works without another
		// layer of indirection
		this.parentFragment = this;
		this.owner = options.owner;
		this.ractive = this.parent.ractive;
		this.delegate = this.ractive.delegate !== false && ( this.parent.delegate || findDelegate( findElement( options.owner ) ) );
		// delegation disabled by directive
		if ( this.delegate && this.delegate.delegate === false ) this.delegate = false;
		// let the element know it's a delegate handler
		if ( this.delegate ) this.delegate.delegate = this.delegate;

		// encapsulated styles should be inherited until they get applied by an element
		this.cssIds = 'cssIds' in options ? options.cssIds : ( this.parent ? this.parent.cssIds : null );

		this.context = null;
		this.rendered = false;
		this.iterations = [];

		this.template = options.template;

		this.indexRef = options.indexRef;
		this.keyRef = options.keyRef;

		this.pendingNewIndices = null;
		this.previousIterations = null;

		// track array versus object so updates of type rest
		this.isArray = false;
	}

	bind ( context ) {
		this.context = context;
		this.bound = true;
		const value = context.get();

		// {{#each array}}...
		if ( this.isArray = Array.isArray( value ) ) {
			// we can't use map, because of sparse arrays
			this.iterations = [];
			const max = value.length;
			for ( let i = 0; i < max; i += 1 ) {
				this.iterations[i] = this.createIteration( i, i );
			}
		}

		// {{#each object}}...
		else if ( isObject( value ) ) {
			this.isArray = false;

			// TODO this is a dreadful hack. There must be a neater way
			if ( this.indexRef ) {
				const refs = this.indexRef.split( ',' );
				this.keyRef = refs[0];
				this.indexRef = refs[1];
			}

			this.iterations = Object.keys( value ).map( ( key, index ) => {
				return this.createIteration( key, index );
			});
		}

		return this;
	}

	bubble ( index ) {
		if  ( !this.bubbled ) this.bubbled = [];
		this.bubbled.push( index );

		this.owner.bubble();
	}

	createIteration ( key, index ) {
		const fragment = new Fragment({
			owner: this,
			template: this.template
		});

		fragment.key = key;
		fragment.index = index;
		fragment.isIteration = true;
		fragment.delegate = this.delegate;

		const model = this.context.joinKey( key );

		// set up an iteration alias if there is one
		if ( this.owner.template.z ) {
			fragment.aliases = {};
			fragment.aliases[ this.owner.template.z[0].n ] = model;
		}

		return fragment.bind( model );
	}

	destroyed () {
		this.iterations.forEach( destroyed );
	}

	detach () {
		const docFrag = createDocumentFragment();
		this.iterations.forEach( fragment => docFrag.appendChild( fragment.detach() ) );
		return docFrag;
	}

	find ( selector, options ) {
		return findMap( this.iterations, i => i.find( selector, options ) );
	}

	findAll ( selector, options ) {
		return this.iterations.forEach( i => i.findAll( selector, options ) );
	}

	findComponent ( name, options ) {
		return findMap( this.iterations, i => i.findComponent( name, options ) );
	}

	findAllComponents ( name, options ) {
		return this.iterations.forEach( i => i.findAllComponents( name, options ) );
	}

	findNextNode ( iteration ) {
		if ( iteration.index < this.iterations.length - 1 ) {
			for ( let i = iteration.index + 1; i < this.iterations.length; i++ ) {
				const node = this.iterations[ i ].firstNode( true );
				if ( node ) return node;
			}
		}

		return this.owner.findNextNode();
	}

	firstNode ( skipParent ) {
		return this.iterations[0] ? this.iterations[0].firstNode( skipParent ) : null;
	}

	rebind ( next ) {
		this.context = next;
		this.iterations.forEach( fragment => {
			const model = next ? next.joinKey( fragment.key ) : undefined;
			fragment.context = model;
			if ( this.owner.template.z ) {
				fragment.aliases = {};
				fragment.aliases[ this.owner.template.z[0].n ] = model;
			}
		});
	}

	render ( target, occupants ) {
		// TODO use docFrag.cloneNode...

		const xs = this.iterations;
		if ( xs ) {
			const len = xs.length;
			for ( let i = 0; i < len; i++ ) {
				xs[i].render( target, occupants );
			}
		}

		this.rendered = true;
	}

	shuffle ( newIndices ) {
		if ( !this.pendingNewIndices ) this.previousIterations = this.iterations.slice();

		if ( !this.pendingNewIndices ) this.pendingNewIndices = [];

		this.pendingNewIndices.push( newIndices );

		const iterations = [];

		newIndices.forEach( ( newIndex, oldIndex ) => {
			if ( newIndex === -1 ) return;

			const fragment = this.iterations[ oldIndex ];
			iterations[ newIndex ] = fragment;

			if ( newIndex !== oldIndex && fragment ) fragment.dirty = true;
		});

		this.iterations = iterations;

		this.bubble();
	}

	shuffled () {
		this.iterations.forEach( shuffled );
	}

	toString ( escape ) {
		return this.iterations ?
			this.iterations.map( escape ? toEscapedString : toString ).join( '' ) :
			'';
	}

	unbind () {
		this.bound = false;
		this.iterations.forEach( unbind );
		return this;
	}

	unrender ( shouldDestroy ) {
		this.iterations.forEach( shouldDestroy ? unrenderAndDestroy : unrender );
		if ( this.pendingNewIndices && this.previousIterations ) {
			this.previousIterations.forEach( fragment => {
				if ( fragment.rendered ) shouldDestroy ? unrenderAndDestroy( fragment ) : unrender( fragment );
			});
		}
		this.rendered = false;
	}

	// TODO smart update
	update () {
		// skip dirty check, since this is basically just a facade

		if ( this.pendingNewIndices ) {
			this.bubbled.length = 0;
			this.updatePostShuffle();
			return;
		}

		if ( this.updating ) return;
		this.updating = true;

		const value = this.context.get();
		const wasArray = this.isArray;

		let toRemove;
		let oldKeys;
		let reset = true;
		let i;

		if ( this.isArray = Array.isArray( value ) ) {
			if ( wasArray ) {
				reset = false;
				if ( this.iterations.length > value.length ) {
					toRemove = this.iterations.splice( value.length );
				}
			}
		} else if ( isObject( value ) && !wasArray ) {
			reset = false;
			toRemove = [];
			oldKeys = {};
			i = this.iterations.length;

			while ( i-- ) {
				const fragment = this.iterations[i];
				if ( fragment.key in value ) {
					oldKeys[ fragment.key ] = true;
				} else {
					this.iterations.splice( i, 1 );
					toRemove.push( fragment );
				}
			}
		}

		if ( reset ) {
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
		if ( !reset && this.isArray && this.bubbled && this.bubbled.length ) {
			const bubbled = this.bubbled;
			this.bubbled = [];
			bubbled.forEach( i => this.iterations[i] && this.iterations[i].update() );
		} else {
			this.iterations.forEach( update );
		}

		// add new iterations
		const newLength = Array.isArray( value ) ?
			value.length :
			isObject( value ) ?
				Object.keys( value ).length :
				0;

		let docFrag;
		let fragment;

		if ( newLength > this.iterations.length ) {
			docFrag = this.rendered ? createDocumentFragment() : null;
			i = this.iterations.length;

			if ( Array.isArray( value ) ) {
				while ( i < value.length ) {
					fragment = this.createIteration( i, i );

					this.iterations.push( fragment );
					if ( this.rendered ) fragment.render( docFrag );

					i += 1;
				}
			}

			else if ( isObject( value ) ) {
				// TODO this is a dreadful hack. There must be a neater way
				if ( this.indexRef && !this.keyRef ) {
					const refs = this.indexRef.split( ',' );
					this.keyRef = refs[0];
					this.indexRef = refs[1];
				}

				Object.keys( value ).forEach( key => {
					if ( !oldKeys || !( key in oldKeys ) ) {
						fragment = this.createIteration( key, i );

						this.iterations.push( fragment );
						if ( this.rendered ) fragment.render( docFrag );

						i += 1;
					}
				});
			}

			if ( this.rendered ) {
				const parentNode = this.parent.findParentNode();
				const anchor = this.parent.findNextNode( this.owner );

				parentNode.insertBefore( docFrag, anchor );
			}
		}

		this.updating = false;
	}

	updatePostShuffle () {
		const newIndices = this.pendingNewIndices[ 0 ];

		// map first shuffle through
		this.pendingNewIndices.slice( 1 ).forEach( indices => {
			newIndices.forEach( ( newIndex, oldIndex ) => {
				newIndices[ oldIndex ] = indices[ newIndex ];
			});
		});

		// This algorithm (for detaching incorrectly-ordered fragments from the DOM and
		// storing them in a document fragment for later reinsertion) seems a bit hokey,
		// but it seems to work for now
		const len = this.context.get().length;
		const oldLen = this.previousIterations.length;
		const removed = {};
		let i;

		newIndices.forEach( ( newIndex, oldIndex ) => {
			const fragment = this.previousIterations[ oldIndex ];
			this.previousIterations[ oldIndex ] = null;

			if ( newIndex === -1 ) {
				removed[ oldIndex ] = fragment;
			} else if ( fragment.index !== newIndex ) {
				const model = this.context.joinKey( newIndex );
				fragment.index = fragment.key = newIndex;
				fragment.context = model;
				if ( this.owner.template.z ) {
					fragment.aliases = {};
					fragment.aliases[ this.owner.template.z[0].n ] = model;
				}
			}
		});

		// if the array was spliced outside of ractive, sometimes there are leftover fragments not in the newIndices
		this.previousIterations.forEach( ( frag, i ) => {
			if ( frag ) removed[ i ] = frag;
		});

		// create new/move existing iterations
		const docFrag = this.rendered ? createDocumentFragment() : null;
		const parentNode = this.rendered ? this.parent.findParentNode() : null;

		const contiguous = 'startIndex' in newIndices;
		i = contiguous ? newIndices.startIndex : 0;

		for ( i; i < len; i++ ) {
			const frag = this.iterations[i];

			if ( frag && contiguous ) {
				// attach any built-up iterations
				if ( this.rendered ) {
					if ( removed[i] ) docFrag.appendChild( removed[i].detach() );
					if ( docFrag.childNodes.length  ) parentNode.insertBefore( docFrag, frag.firstNode() );
				}
				continue;
			}

			if ( !frag ) this.iterations[i] = this.createIteration( i, i );

			if ( this.rendered ) {
				if ( removed[i] ) docFrag.appendChild( removed[i].detach() );

				if ( frag ) docFrag.appendChild( frag.detach() );
				else {
					this.iterations[i].render( docFrag );
				}
			}
		}

		// append any leftovers
		if ( this.rendered ) {
			for ( i = len; i < oldLen; i++ ) {
				if ( removed[i] ) docFrag.appendChild( removed[i].detach() );
			}

			if ( docFrag.childNodes.length ) {
				parentNode.insertBefore( docFrag, this.owner.findNextNode() );
			}
		}

		// trigger removal on old nodes
		Object.keys( removed ).forEach( k => removed[k].unbind().unrender( true ) );

		this.iterations.forEach( update );

		this.pendingNewIndices = null;

		this.shuffled();
	}
}

// find the topmost delegate
function findDelegate ( start ) {
	let el = start;
	let delegate = start;

	while ( el ) {
		if ( el.delegate ) delegate = el;
		el = el.parent;
	}

	return delegate;
}
