import arrayContentsMatch from 'utils/arrayContentsMatch';
import isEqual from 'utils/isEqual';

export default function Ractive$updateModel ( keypath, cascade ) {
	var values;

	if ( typeof keypath !== 'string' ) {
		keypath = '';
		cascade = true;
	}

	consolidateChangedValues( this, keypath, values = {}, cascade );
	return this.set( values );
}

function consolidateChangedValues ( ractive, keypath, values, cascade ) {
	var bindings, childDeps, i, binding, oldValue, newValue, checkboxGroups = [];

	bindings = ractive._twowayBindings[ keypath ];

	if ( bindings && ( i = bindings.length ) ) {
		while ( i-- ) {
			binding = bindings[i];

			// special case - radio name bindings
			if ( binding.radioName && !binding.element.node.checked ) {
				continue;
			}

			// special case - checkbox name bindings come in groups, so
			// we want to get the value once at most
			if ( binding.checkboxName ) {
				if ( !checkboxGroups[ binding.keypath ] && !binding.changed() ) {
					checkboxGroups.push( binding.keypath );
					checkboxGroups[ binding.keypath ] = binding;
				}

				continue;
			}

			oldValue = binding.attribute.value;
			newValue = binding.getValue();

			if ( arrayContentsMatch( oldValue, newValue ) ) {
				continue;
			}

			if ( !isEqual( oldValue, newValue ) ) {
				values[ keypath ] = newValue;
			}
		}
	}

	// Handle groups of `<input type='checkbox' name='{{foo}}' ...>`
	if ( checkboxGroups.length ) {
		checkboxGroups.forEach( keypath => {
			var binding, oldValue, newValue;

			binding = checkboxGroups[ keypath ]; // one to represent the entire group
			oldValue = binding.attribute.value;
			newValue = binding.getValue();

			if ( !arrayContentsMatch( oldValue, newValue ) ) {
				values[ keypath ] = newValue;
			}
		});
	}

	if ( !cascade ) {
		return;
	}

	// cascade
	childDeps = ractive.viewmodel.depsMap[ 'default' ][ keypath ];

	if ( childDeps ) {
		i = childDeps.length;
		while ( i-- ) {
			consolidateChangedValues( ractive, childDeps[i], values, cascade );
		}
	}
}
