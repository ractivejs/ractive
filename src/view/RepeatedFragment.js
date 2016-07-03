import Fragment from './Fragment';
import { createDocumentFragment } from '../utils/dom';
import { isArray, isObject } from '../utils/is';
import { toEscapedString, toString, unbind, unrender, unrenderAndDestroy, update } from '../shared/methodCallers';

export default class RepeatedFragment {
	constructor ( options ) {
		this.parent = options.owner.parentFragment;

		// bit of a hack, so reference resolution works without another
		// layer of indirection
		this.parentFragment = this;
		this.owner = options.owner;
		this.ractive = this.parent.ractive;

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
		const value = context.get();

		// {{#each array}}...
		if ( this.isArray = isArray( value ) ) {
			// we can't use map, because of sparse arrays
			this.iterations = [];
			for ( let i = 0; i < value.length; i += 1 ) {
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

	bubble () {
		this.owner.bubble();
	}

	createIteration ( key, index ) {
		const fragment = new Fragment({
			owner: this,
			template: this.template
		});

		// TODO this is a bit hacky
		fragment.key = key;
		fragment.index = index;
		fragment.isIteration = true;

		const model = this.context.joinKey( key );

		// set up an iteration alias if there is one
		if ( this.owner.template.z ) {
			fragment.aliases = {};
			fragment.aliases[ this.owner.template.z[0].n ] = model;
		}

		return fragment.bind( model );
	}

	detach () {
		const docFrag = createDocumentFragment();
		this.iterations.forEach( fragment => docFrag.appendChild( fragment.detach() ) );
		return docFrag;
	}

	find ( selector, options ) {
		const len = this.iterations.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const found = this.iterations[i].find( selector, options );
			if ( found ) return found;
		}
	}

	findAll ( selector, query ) {
		const len = this.iterations.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			this.iterations[i].findAll( selector, query );
		}
	}

	findComponent ( name, options ) {
		const len = this.iterations.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const found = this.iterations[i].findComponent( name, options );
			if ( found ) return found;
		}
	}

	findAllComponents ( name, query ) {
		const len = this.iterations.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			this.iterations[i].findAllComponents( name, query );
		}
	}

	findNextNode ( iteration ) {
		if ( iteration.index < this.iterations.length - 1 ) {
			for ( let i = iteration.index + 1; i < this.iterations.length; i++ ) {
				let node = this.iterations[ i ].firstNode( true );
				if ( node ) return node;
			}
		}

		return this.owner.findNextNode();
	}

	firstNode ( skipParent ) {
		return this.iterations[0] ? this.iterations[0].firstNode( skipParent ) : null;
	}

	rebind ( context ) {
		this.context = context;

		this.iterations.forEach( ( fragment ) => {
			const model = context.joinKey( fragment.key || fragment.index );
			if ( this.owner.template.z ) {
				fragment.aliases = {};
				fragment.aliases[ this.owner.template.z[0].n ] = model;
			}
			fragment.rebind( model );
		});
	}

	render ( target, occupants ) {
		// TODO use docFrag.cloneNode...

		if ( this.iterations ) {
			this.iterations.forEach( fragment => fragment.render( target, occupants ) );
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

	toString ( escape ) {
		return this.iterations ?
			this.iterations.map( escape ? toEscapedString : toString ).join( '' ) :
			'';
	}

	unbind () {
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
			this.updatePostShuffle();
			return;
		}

		if ( this.updating ) return;
		this.updating = true;

		const value = this.context.get(),
			  wasArray = this.isArray;

		let toRemove;
		let oldKeys;
		let reset = true;
		let i;

		if ( this.isArray = isArray( value ) ) {
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
		this.iterations.forEach( update );

		// add new iterations
		const newLength = isArray( value ) ?
			value.length :
			isObject( value ) ?
				Object.keys( value ).length :
				0;

		let docFrag;
		let fragment;

		if ( newLength > this.iterations.length ) {
			docFrag = this.rendered ? createDocumentFragment() : null;
			i = this.iterations.length;

			if ( isArray( value ) ) {
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
		const len = this.context.get().length, oldLen = this.previousIterations.length;
		let i;
		const removed = {};

		newIndices.forEach( ( newIndex, oldIndex ) => {
			const fragment = this.previousIterations[ oldIndex ];

			if ( newIndex === -1 ) {
				removed[ oldIndex ] = fragment;
			} else if ( fragment.index !== newIndex ) {
				fragment.index = newIndex;
				const model = this.context.joinKey( newIndex );
				if ( this.owner.template.z ) {
					fragment.aliases = {};
					fragment.aliases[ this.owner.template.z[0].n ] = model;
				}
				fragment.rebind( model );
			}
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
	}
}
