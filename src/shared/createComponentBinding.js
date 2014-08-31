import circular from 'circular';
import isArray from 'utils/isArray';
import isEqual from 'utils/isEqual';

var runloop;

circular.push( () => runloop = circular.runloop );

var Binding = function ( ractive, keypath, otherInstance, otherKeypath, priority ) {
	this.root = ractive;
	this.keypath = keypath;
	this.priority = priority;

	this.otherInstance = otherInstance;
	this.otherKeypath = otherKeypath;

	this.bind();

	this.value = this.root.viewmodel.get( this.keypath );
};

Binding.prototype = {
	setValue: function ( value ) {
		// Only *you* can prevent infinite loops
		if ( this.updating || this.counterpart && this.counterpart.updating ) {
			this.value = value;
			return;
		}

		// Is this a smart array update? If so, it'll update on its
		// own, we shouldn't do anything
		if ( isArray( value ) && value._ractive && value._ractive.setting ) {
			return;
		}

		if ( !isEqual( value, this.value ) ) {
			this.updating = true;

			// TODO maybe the case that `value === this.value` - should that result
			// in an update rather than a set?
			runloop.addViewmodel( this.otherInstance.viewmodel );
			this.otherInstance.viewmodel.set( this.otherKeypath, value );
			this.value = value;

			// TODO will the counterpart update after this line, during
			// the runloop end cycle? may be a problem...
			runloop.scheduleTask( () => this.updating = false );
		}
	},

	bind: function () {
		this.root.viewmodel.register( this.keypath, this );
	},

	rebind: function ( newKeypath ) {
		this.unbind();

		this.keypath = newKeypath;
		this.counterpart.otherKeypath = newKeypath;

		this.bind();
	},

	unbind: function () {
		this.root.viewmodel.unregister( this.keypath, this );
	}
};

export default function createComponentBinding ( component, parentInstance, parentKeypath, childKeypath ) {
	var hash, childInstance, bindings, priority, parentToChildBinding, childToParentBinding;

	hash = parentKeypath + '=' + childKeypath;
	bindings = component.bindings;

	if ( bindings[ hash ] ) {
		// TODO does this ever happen?
		return;
	}

	childInstance = component.instance;
	priority = component.parentFragment.priority;

	parentToChildBinding = new Binding( parentInstance, parentKeypath, childInstance, childKeypath, priority );
	bindings.push( parentToChildBinding );

	if ( childInstance.twoway ) {
		childToParentBinding = new Binding( childInstance, childKeypath, parentInstance, parentKeypath, 1 );
		bindings.push( childToParentBinding );

		parentToChildBinding.counterpart = childToParentBinding;
		childToParentBinding.counterpart = parentToChildBinding;
	}

	bindings[ hash ] = parentToChildBinding;
}
