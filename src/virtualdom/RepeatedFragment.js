import Fragment from './Fragment';
import { update } from 'shared/methodCallers';

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

		this.iterations = context.value.map( ( childValue, index ) => {
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

			fragment.bind( context.join([ index ]) ); // TODO join method that accepts non-array
			return fragment;
		});
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parent.bubble();
		}
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
		this.iterations.forEach( update );
	}
}
