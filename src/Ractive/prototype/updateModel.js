import { arrayContentsMatch } from 'utils/array';
import { isEqual } from 'utils/is';

export default function Ractive$updateModel ( keypath, cascade ) {
	var values, key, bindings;

	if ( typeof keypath === 'string' && !cascade ) {
		bindings = this._twowayBindings[ keypath ];
	} else {
		bindings = [];

		for ( key in this._twowayBindings ) {
			if ( !keypath || this.viewmodel.getModel( key ).equalsOrStartsWith( keypath ) ) { // TODO is this right?
				bindings.push.apply( bindings, this._twowayBindings[ key ]);
			}
		}
	}

	values = consolidate( this, bindings );
	return this.set( values );
}

function consolidate ( ractive, bindings ) {
	var values = {}, checkboxGroups = [];

	bindings.forEach( b => {
		var oldValue, newValue;

		// special case - radio name bindings
		if ( b.radioName && !b.element.node.checked ) {
			return;
		}

		// special case - checkbox name bindings come in groups, so
		// we want to get the value once at most
		if ( b.checkboxName ) {
			if ( !checkboxGroups[ b.keypath.getKeypath() ] && !b.changed() ) {
				checkboxGroups.push( b.keypath );
				checkboxGroups[ b.keypath.getKeypath() ] = b;
			}

			return;
		}

		oldValue = b.attribute.value;
		newValue = b.getValue();

		if ( arrayContentsMatch( oldValue, newValue ) ) {
			return;
		}

		if ( !isEqual( oldValue, newValue ) ) {
			values[ b.keypath.getKeypath() ] = newValue;
		}
	});

	// Handle groups of `<input type='checkbox' name='{{foo}}' ...>`
	if ( checkboxGroups.length ) {
		checkboxGroups.forEach( model => {
			var binding, oldValue, newValue;

			binding = checkboxGroups[ model.getKeypath() ]; // one to represent the entire group
			oldValue = binding.attribute.value;
			newValue = binding.getValue();

			if ( !arrayContentsMatch( oldValue, newValue ) ) {
				values[ model.getKeypath() ] = newValue;
			}
		});
	}

	return values;
}
