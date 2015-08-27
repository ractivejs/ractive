import { splitKeypath } from 'shared/keypaths';
import { isArray } from 'utils/is';

export default function observeList ( keypath, callback, options ) {
	if ( typeof keypath !== 'string' ) {
		throw new Error( 'ractive.observeList() must be passed a string as its first argument' );
	}

	const model = this.viewmodel.joinAll( splitKeypath( keypath ) );
	const observer = new ListObserver( this, model, callback, options || {} );

	// add observer to the Ractive instance, so it can be
	// cancelled on ractive.teardown()
	this._observers.push( observer );

	return {
		cancel () {
			observer.cancel();
		}
	};
}

function negativeOne () {
	return -1;
}

class ListObserver {
	constructor ( context, model, callback, options ) {
		this.context = context;
		this.model = model;
		this.keypath = model.getKeypath();
		this.callback = callback;

		this.pending = null;

		model.register( this );

		if ( options.init !== false ) {
			this.sliced = [];
			this.shuffle([]);
			this.handleChange();
		} else {
			this.sliced = this.slice();
		}
	}

	handleChange () {
		if ( this.pending ) {
			// post-shuffle
			this.callback( this.pending );
			this.pending = null;
		}

		else {
			// entire array changed
			this.shuffle( this.sliced.map( negativeOne ) );
			this.handleChange();
		}
	}

	shuffle ( newIndices ) {
		const newValue = this.slice();

		let inserted = [];
		let deleted = [];
		let start;

		let hadIndex = {};

		newIndices.forEach( ( newIndex, oldIndex ) => {
			hadIndex[ newIndex ] = true;

			if ( newIndex !== oldIndex && start === undefined ) {
				start = oldIndex;
			}

			if ( newIndex === -1 ) {
				deleted.push( this.sliced[ oldIndex ] );
			}
		});

		if ( start === undefined ) start = newIndices.length;

		let len = newValue.length;
		for ( let i = 0; i < len; i += 1 ) {
			if ( !hadIndex[i] ) inserted.push( newValue[i] );
		}

		this.pending = { inserted, deleted, start };
		this.sliced = newValue;
	}

	slice () {
		const value = this.model.get();
		return isArray( value ) ? value.slice() : [];
	}
}
