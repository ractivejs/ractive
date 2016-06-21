import { removeFromArray } from '../../utils/array';
import { handleChange, teardown } from '../../shared/methodCallers';

export default class KeypathModel {
	constructor ( parent, ractive ) {
		this.parent = parent;
		this.ractive = ractive;
		this.value = ractive ? parent.getKeypath( ractive ) : parent.getKeypath();
		this.dependants = [];
		this.children = [];
	}

	addChild( model ) {
		this.children.push( model );
		model.owner = this;
	}

	get () {
		return this.value;
	}

	getKeypath () {
		return this.value;
	}

	handleChange () {
		this.value = this.ractive ? this.parent.getKeypath( this.ractive ) : this.parent.getKeypath();
		if ( this.ractive && this.owner ) {
			this.ractive.viewmodel.keypathModels[ this.owner.value ] = this;
		}
		this.children.forEach( handleChange );
		this.dependants.forEach( handleChange );
	}

	register ( dependant ) {
		this.dependants.push( dependant );
	}

	removeChild( model ) {
		removeFromArray( this.children, model );
	}

	teardown () {
		if ( this.owner ) this.owner.removeChild( this );
		this.children.forEach( teardown );
	}

	tryRebind () {
		const next = this.parent.tryRebind();
		if ( next ) return next.getKeypathModel( this.ractive );
		return next;
	}

	unregister ( dependant ) {
		removeFromArray( this.dependants, dependant );
	}
}
