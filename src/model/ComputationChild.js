import { capture } from '../global/capture';
import Model from './Model';
import { handleChange, mark } from '../shared/methodCallers';

export default class ComputationChild extends Model {
	constructor ( parent, key ) {
		super( parent, key );

		const parentValue = parent.get();
		if ( parentValue ) {
			this.value = parentValue[ key ];
			this.adapt();
		}

		if ( this.root.ractive.derivedBindings ) this.isReadonly = false;
	}

	applyValue ( value ) {
		super.applyValue( value );

		// if the parent is an expression with a computation, make sure the computation cache is updated too
		if ( this.parent.computation && this.parent.computation.value ) this.parent.computation.value[ this.key ] = value;

		// find the computation and mark the things it depends on
		let computation, source = this;
		while ( !computation && ( source = source.parent ) ) {
			computation = source.computation || ( source.signature ? source : undefined );
		}

		if ( computation ) {
			computation.dependencies.forEach( mark );
		}
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );

		const parentValue = this.parent.get();
		return parentValue ? parentValue[ this.key ] : undefined;
	}

	handleChange () {
		this.dirty = true;

		this.deps.forEach( handleChange );
		this.children.forEach( handleChange );
		this.clearUnresolveds(); // TODO is this necessary?
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

	// TODO this causes problems with inter-component mappings
	// set () {
	// 	throw new Error( `Cannot set read-only property of computed value (${this.getKeypath()})` );
	// }
}
