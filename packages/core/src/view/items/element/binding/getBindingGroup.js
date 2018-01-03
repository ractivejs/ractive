import { removeFromArray } from '../../../../utils/array';
import Binding from './Binding';

export default function getBindingGroup ( group, model, getValue ) {
	const hash = `${group}-bindingGroup`;
	return model[hash] || ( model[ hash ] = new BindingGroup( hash, model, getValue ) );
}

class BindingGroup {
	constructor ( hash, model, getValue ) {
		this.model = model;
		this.hash = hash;
		this.getValue = () => {
			this.value = getValue.call(this);
			return this.value;
		};

		this.bindings = [];
	}

	add ( binding ) {
		this.bindings.push( binding );
	}

	bind () {
		this.value = this.model.get();
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
		delete this.model[this.hash];
	}
}

BindingGroup.prototype.rebind = Binding.prototype.rebind;
