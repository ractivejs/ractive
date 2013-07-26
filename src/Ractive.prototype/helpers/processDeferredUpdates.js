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
		attribute = ractive._defSelectValues.pop();

		attribute.parentNode.value = attribute.value;

		// value may not be what we think it should be, if the relevant <option>
		// element doesn't exist!
		attribute.value = attribute.parentNode.value;
	}
};