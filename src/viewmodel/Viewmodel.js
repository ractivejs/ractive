import { capture } from 'global/capture';
import ComputedNode from './nodes/ComputedNode';
import DataNode from './nodes/DataNode';
import { handleChange, mark } from 'shared/methodCallers';

export default class Viewmodel extends DataNode {
	constructor ( options ) {
		super( null, null );

		this.isRoot = true;
		this.root = this;
		this.ractive = options.ractive; // TODO sever this link

		this.value = options.data;
		this.adaptors = options.adapt;
		this.adapt();

		this.mappings = {};

		this.computationContext = options.ractive;
		this.computations = {};

		if ( options.computations ) {
			Object.keys( options.computations ).forEach( key => {
				const signature = options.computations[ key ];
				const computation = this.compute( key, signature );
				computation.init();
			});
		}
	}

	applyChanges () {
		this._changeHash = {};
		this.flush();

		return this._changeHash;
	}

	compute ( key, signature ) {
		const computation = new ComputedNode( this, signature, key );
		this.computations[ key ] = computation;

		return computation;
	}

	get () {
		capture( this );
		return this.value;
	}

	getKeypath () {
		return '';
	}

	has ( key ) {
		return ( key in this.mappings ) || ( key in this.computations ) || super.has( key );
	}

	joinKey ( key ) {
		return this.mappings[ key ] || this.computations[ key ] || super.joinKey( key );
	}

	map ( localKey, origin ) {
		// TODO remapping
		this.mappings[ localKey ] = origin;
	}

	set ( value ) {
		// TODO wrapping root node is a baaaad idea. We should prevent this
		const wrapper = this.wrapper;
		if ( wrapper ) {
			const shouldTeardown = !wrapper.reset || wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				wrapper.teardown();
				this.wrapper = null;
				this.value = value;
				this.adapt();
			}
		} else {
			this.value = value;
			this.adapt();
		}

		this.deps.forEach( handleChange );
		this.children.forEach( mark );
		this.clearUnresolveds(); // TODO do we need to do this with primitive values? if not, what about e.g. unresolved `length` property of null -> string?
	}

	update () {
		// noop
	}

	updateFromBindings ( cascade ) {
		super.updateFromBindings( cascade );

		if ( cascade ) {
			// TODO computations as well?
			Object.keys( this.mappings ).forEach( key => {
				const model = this.mappings[ key ];
				model.updateFromBindings( cascade );
			});
		}
	}
}
