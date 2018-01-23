import Model from '../Model';
import { Missing } from '../LinkModel';

export default class RactiveModel extends Model {
	constructor ( ractive ) {
		super( null, '' );
		this.value = ractive;
		this.isRoot = true;
		this.root = this;
		this.adaptors = [];
		this.ractive = ractive;
	}

	joinKey ( key ) {
		const model = super.joinKey( key );

		if ( ( key === 'root' || key === 'parent' ) && !model.isLink ) return initLink( model, key );
		else if ( key === 'data' ) return this.ractive.viewmodel;

		return model;
	}

	getKeypath() {
		return '@this';
	}

	retrieve () {
		return this.ractive;
	}
}

function initLink ( model, key ) {
	model.applyValue = function ( value ) {
		this.parent.value[ key ] = value;
		if ( value && value.viewmodel ) {
			this.link( value.viewmodel.getRactiveModel(), key );
			this._link.markedAll();
		} else {
			this.link( Object.create( Missing ), key );
			this._link.markedAll();
		}
	};

	model.applyValue( model.parent.ractive[ key ], key );
	model._link.set = v => model.applyValue( v );
	model._link.applyValue = v => model.applyValue( v );
	return model._link;
}
