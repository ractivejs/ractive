import circular from 'circular';
import runloop from 'global/runloop';
import isArray from 'utils/isArray';
import isEqual from 'utils/isEqual';
import registerDependant from 'shared/registerDependant';
import unregisterDependant from 'shared/unregisterDependant';

var get, set;

circular.push( function () {
    get = circular.get;
    set = circular.set;
});

var Binding = function ( ractive, keypath, otherInstance, otherKeypath, priority ) {
    this.root = ractive;
    this.keypath = keypath;
    this.priority = priority;

    this.otherInstance = otherInstance;
    this.otherKeypath = otherKeypath;

    registerDependant( this );

    this.value = get( this.root, this.keypath );
};

Binding.prototype = {
    update: function () {
        var value;

        // Only *you* can prevent infinite loops
			if ( this.updating ) {
            return;
        }

        value = get( this.root, this.keypath );

        // Is this a smart array update? If so, it'll update on its
        // own, we shouldn't do anything
        if ( isArray( value ) && value._ractive && value._ractive.setting ) {
            return;
        }

        if ( !isEqual( value, this.value ) ) {
            this.updating = true;

            // TODO maybe the case that `value === this.value` - should that result
            // in an update rather than a set?

				//we have already done this, stop infinite loop
				if (!(this.counterpart && this.counterpart.updating)) {
					runloop.addInstance(this.otherInstance);
					set(this.otherInstance, this.otherKeypath, value);
				}
				//this should be set for the binding even if the counterpart wasnt set. so that it lines up.
            this.value = value;

            // TODO will the counterpart update after this line, during
            // the runloop end cycle? may be a problem...
            this.updating = false;
        }
    },

    reassign: function ( newKeypath ) {
        unregisterDependant( this );
        unregisterDependant( this.counterpart );

        this.keypath = newKeypath;
        this.counterpart.otherKeypath = newKeypath;

        registerDependant( this );
        registerDependant( this.counterpart );
    },

    teardown: function () {
        unregisterDependant( this );
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

    bindings[ hash ] = true;

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
}
