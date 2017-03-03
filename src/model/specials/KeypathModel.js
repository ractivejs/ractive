import { removeFromArray } from '../../utils/array';
import { handleChange } from '../../shared/methodCallers';
import { capture } from '../../global/capture';
import noop from '../../utils/noop';

export default class KeypathModel {
	constructor ( parent, ractive ) {
		this.parent = parent;
		this.ractive = ractive;
		this.value = ractive ? parent.getKeypath( ractive ) : parent.getKeypath();
		this.deps = [];
		this.children = {};
		this.isReadonly = this.isKeypath = true;
	}

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );
		return this.value;
	}

	getChild ( ractive ) {
		if ( !( ractive._guid in this.children ) ) {
			const model = new KeypathModel( this.parent, ractive );
			this.children[ ractive._guid ] = model;
			model.owner = this;
		}
		return this.children[ ractive._guid ];
	}

	getKeypath () {
		return this.value;
	}

	handleChange () {
		const keys = Object.keys( this.children );
		let i = keys.length;
		while ( i-- ) {
			this.children[ keys[i] ].handleChange();
		}

		this.deps.forEach( handleChange );
	}

	rebindChildren ( next ) {
		const keys = Object.keys( this.children );
		let i = keys.length;
		while ( i-- ) {
			const child = this.children[keys[i]];
			child.value = next.getKeypath( child.ractive );
			child.handleChange();
		}
	}

	rebind ( next, previous ) {
		const model = next ? next.getKeypathModel( this.ractive ) : undefined;

		const keys = Object.keys( this.children );
		let i = keys.length;
		while ( i-- ) {
			this.children[ keys[i] ].rebind( next, previous, false );
		}

		i = this.deps.length;
		while ( i-- ) {
			this.deps[i].rebind( model, this, false );
		}
	}

	register ( dep ) {
		this.deps.push( dep );
	}

	removeChild( model ) {
		if ( model.ractive ) delete this.children[ model.ractive._guid ];
	}

	teardown () {
		if ( this.owner ) this.owner.removeChild( this );

		const keys = Object.keys( this.children );
		let i = keys.length;
		while ( i-- ) {
			this.children[ keys[i] ].teardown();
		}
	}

	unregister ( dep ) {
		removeFromArray( this.deps, dep );
		if ( !this.deps.length ) this.teardown();
	}
}

KeypathModel.prototype.reference = noop;
KeypathModel.prototype.unreference = noop;
