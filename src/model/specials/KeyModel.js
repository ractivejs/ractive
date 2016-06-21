import { removeFromArray } from '../../utils/array';
import { handleChange } from '../../shared/methodCallers';
import { unescapeKey } from '../../shared/keypaths';
import runloop from '../../global/runloop';

export default class KeyModel {
	constructor ( key, parent ) {
		this.value = key;
		this.isReadonly = true;
		this.dependants = [];
		this.parent = parent;
	}

	get () {
		return unescapeKey( this.value );
	}

	getKeypath () {
		return unescapeKey( this.value );
	}

	rebind ( key ) {
		this.value = key;
		this.dependants.forEach( handleChange );
	}

	register ( dependant ) {
		this.dependants.push( dependant );
	}

	tryRebind () {
		const shuffle = runloop.findShuffle( this.parent.getKeypath() );

		if ( shuffle === false ) return;
		else if ( !shuffle ) return false;

		const path = [];
		let model = this.parent;
		while ( model && model.parent !== shuffle.model ) {
			path.unshift( model.key );
			model = model.parent;
		}

		if ( !model ) return false;
		if ( typeof path[0] !== 'number' || shuffle.indicies[ path[0] ] === -1 ) return;

		// parent is shuffling
		if ( path.length === 1 ) {
			return this.parent.parent.getIndexModel( shuffle.indices[ this.value ] );
		} else {
			path[0] = shuffle.indices[ path[0] ];
			if ( typeof this.value === 'number' ) return model.joinAll( path ).getIndexModel( this.value );
			else return model.joinAll( path ).join( this.value ).getKeyModel();
		}
	}

	unregister ( dependant ) {
		removeFromArray( this.dependants, dependant );
	}
}
