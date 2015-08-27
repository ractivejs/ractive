import { removeFromArray } from 'utils/array';

let groups = {};

export default function getBindingGroup ( id, group, model, getValue ) {
	const hash = id + group + model.getKeypath();
	return groups[ hash ] || ( groups[ hash ] = new BindingGroup( model, getValue ) );
}

class BindingGroup {
	constructor ( model, getValue ) {
		this.model = model;
		this.getValue = getValue;

		this.bindings = [];
	}

	add ( binding ) {
		this.bindings.push( binding );
	}

	bind () {
		this.model.registerTwowayBinding( this );
		this.bound = true;
	}

	remove ( binding ) {
		removeFromArray( this.bindings, binding );
		if ( !this.bindings.length ) {
			this.unbind();
		}
	}

	unbind () {
		this.model.unregisterTwowayBinding( this );
		this.bound = false;
	}
}
