import Fragment from './Fragment';
import { update } from 'shared/methodCallers';
import findParentNode from './items/shared/findParentNode';

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
		this.indexRefResolvers = [];
	}

	bind ( context ) {
		this.context = context;
		this.iterations = context.value.map( ( childValue, index ) => this.createIteration( index ) );
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parent.bubble();
		}
	}

	createIteration ( index ) {
		const parentIndexRefs = this.owner.parentFragment.indexRefs;
		let indexRefs;

		if ( this.indexRef ) {
			indexRefs = {};
			Object.keys( parentIndexRefs ).forEach( ref => {
				indexRefs[ ref ] = parentIndexRefs[ ref ];
			});
			indexRefs[ this.indexRef ] = index;
		} else {
			indexRefs = parentIndexRefs;
		}

		const fragment = new Fragment({
			owner: this,
			template: this.template,
			indexRefs
		});

		fragment.bind( this.context.join([ index ]) ); // TODO join method that accepts non-array
		return fragment;
	}

	render () {
		// TODO use docFrag.cloneNode...

		const docFrag = document.createDocumentFragment();
		this.iterations.forEach( fragment => docFrag.appendChild( fragment.render() ) );
		return docFrag;
	}

	toString () {
		return this.iterations.join( '' );
	}

	update () {
		const value = this.context.value;

		if ( this.iterations.length > value.length ) {
			this.iterations.splice( value.length ).forEach( fragment => {
				fragment.unbind();
				fragment.unrender( true );
			});
		}

		this.iterations.forEach( update );

		if ( value.length > this.iterations.length ) {
			const docFrag = document.createDocumentFragment();

			while ( this.iterations.length < value.length ) {
				const fragment = this.createIteration( this.iterations.length );

				this.iterations.push( fragment );
				docFrag.appendChild( fragment.render() );
			}

			const parentNode = findParentNode( this );
			const anchor = this.parent.findNextNode( this );
		
			parentNode.insertBefore( docFrag, anchor );
		}
	}
}
