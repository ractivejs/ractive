/*utils.notifyObservers = function ( root, keypath ) {
	var observersGroupedByPriority = root._observers[ keypath ] || [], i, j, priorityGroup, observer;

	for ( i=0; i<observersGroupedByPriority.length; i+=1 ) {
		priorityGroup = observersGroupedByPriority[i];

		if ( priorityGroup ) {
			for ( j=0; j<priorityGroup.length; j+=1 ) {
				observer = priorityGroup[j];
				observer.update( root.get( observer.keys ) );
			}
		}
	}
};*/