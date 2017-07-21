import { capture } from '../global/capture';
import Model from './Model';
import { handleChange, marked } from '../shared/methodCallers';

export default class ComputationChild extends Model {
	constructor ( parent, key ) {
		super( parent, key );

		this.dirty = true;
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );

		if ( this.dirty ) {
			const parentValue = this.parent.get();
			this.value = parentValue ? parentValue[ this.key ] : undefined;
		}

		return this.value;
	}

	handleChange () {
		this.dirty = true;

		this.links.forEach( marked );
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
}
