processDeferredUpdates = function ( ractive ) {
	var evaluator, attribute;

	while ( ractive._defEvals.length ) {
		 evaluator = ractive._defEvals.pop();
		 evaluator.update().deferred = false;
	}

	while ( ractive._defAttrs.length ) {
		attribute = ractive._defAttrs.pop();
		attribute.update().deferred = false;
	}

	while ( ractive._defSelectValues.length ) {
		ractive._defSelectValues.pop().deferredUpdate();
	}

	while ( ractive._defCheckboxes.length ) {
		getValueFromCheckboxes( ractive, ractive._defCheckboxes.pop() );
	}

	while ( ractive._defRadios.length ) {
		ractive._defRadios.pop().update();
	}
};