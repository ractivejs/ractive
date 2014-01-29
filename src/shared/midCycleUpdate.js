define([ 'shared/getValueFromCheckboxes' ], function ( getValueFromCheckboxes ) {

	'use strict';

	// TODO can this be neatened up at all?
	return function ( ractive ) {
		var deferred, evaluator, selectValue, attribute, keypath, radio;

		deferred = ractive._deferred;

		while ( evaluator = deferred.evals.pop() ) {
			evaluator.update().deferred = false;
		}

		while ( selectValue = deferred.selectValues.pop() ) {
			selectValue.deferredUpdate();
		}

		while ( attribute = deferred.attrs.pop() ) {
			attribute.update().deferred = false;
		}

		while ( keypath = deferred.checkboxes.pop() ) {
			ractive.set( keypath, getValueFromCheckboxes( ractive, keypath ) );
		}

		while ( radio = deferred.radios.pop() ) {
			radio.update();
		}
	};

});
