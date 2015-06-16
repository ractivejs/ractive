import { arrayContentsMatch } from 'utils/array';
import { isEqual } from 'utils/is';
import { splitKeypath } from 'shared/keypaths';
import runloop from 'global/runloop';

export default function Ractive$updateModel ( keypath, cascade ) {
	const promise = runloop.start( this, true );
	let bindings;

	if ( !keypath ) {
		this.viewmodel.updateFromBindings( true );
	} else {
		this.viewmodel.join( splitKeypath( keypath ) ).updateFromBindings( cascade );
	}

	runloop.end();

	return promise;
}

function setValues ( bindings ) {
	var values = {}, checkboxGroups = [];

	bindings.forEach( b => {
		var oldValue, newValue, context = b.keypath;

		// special case - radio name bindings
		if ( b.radioName && !b.element.node.checked ) {
			return;
		}

		// special case - checkbox name bindings come in groups, so
		// we want to get the value once at most
		if ( b.checkboxName ) {
			let keypath = context.getKeypath();

			if ( !checkboxGroups[ keypath ] && !b.changed() ) {
				checkboxGroups.push( context );
				checkboxGroups[ keypath ] = b;
			}

			return;
		}

		oldValue = b.attribute.value;
		newValue = b.getValue();

		if ( arrayContentsMatch( oldValue, newValue ) ) {
			return;
		}

		if ( !isEqual( oldValue, newValue ) ) {
			context.set( newValue );
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
				model.set( newValue );
			}
		});
	}
}
