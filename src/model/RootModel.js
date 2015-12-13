import { capture } from '../global/capture';
import { extend } from '../utils/object';
import Computation from './Computation';
import Model from './Model';
import { handleChange, mark } from '../shared/methodCallers';
import RactiveModel from './specials/RactiveModel';
import GlobalModel from './specials/GlobalModel';

export default class RootModel extends Model {
	constructor ( options ) {
		super( null, null );

		// TODO deprecate this
		this.changes = {};

		this.isRoot = true;
		this.root = this;
		this.ractive = options.ractive; // TODO sever this link

		this.value = options.data;
		this.adaptors = options.adapt;
		this.adapt();

		this.mappings = {};

		this.computationContext = options.ractive;
		this.computations = {};
	}

	applyChanges () {
		this._changeHash = {};
		this.flush();

		return this._changeHash;
	}

	compute ( key, signature ) {
		const computation = new Computation( this, signature, key );
		this.computations[ key ] = computation;

		return computation;
	}

	extendChildren ( fn ) {
		const mappings = this.mappings;
		Object.keys( mappings ).forEach( key => {
			fn( key, mappings[ key ] );
		});

		const computations = this.computations;
		Object.keys( computations ).forEach( key => {
			const computation = computations[ key ];
			// exclude template expressions
			if ( !computation.isExpression ) {
				fn( key, computation );
			}
		});
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );
		let result = extend( {}, this.value );

		this.extendChildren( ( key, model ) => {
			result[ key ] = model.value;
		})

		return result;
	}

	getKeypath () {
		return '';
	}

	getRactiveModel() {
		return this.ractiveModel || ( this.ractiveModel = new RactiveModel( this.ractive ) );
	}

	getValueChildren () {
		const children = super.getValueChildren( this.value );

		this.extendChildren( ( key, model ) => {
			children.push( model );
		})

		return children;
	}

	handleChange () {
		this.deps.forEach( handleChange );
	}

	has ( key ) {
		return ( key in this.mappings ) || ( key in this.computations ) || super.has( key );
	}

	joinKey ( key ) {
		if ( key === '@global' ) return GlobalModel;
		if ( key === '@ractive' ) return this.getRactiveModel();

		return this.mappings.hasOwnProperty( key ) ? this.mappings[ key ] :
		       this.computations.hasOwnProperty( key ) ? this.computations[ key ] :
		       super.joinKey( key );
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

	retrieve () {
		return this.value;
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
