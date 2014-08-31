define(['config/options/groups/optionGroup','config/options/Registry'],function (optionGroup, Registry) {

	'use strict';
	
	var keys = [
			'adaptors',
			'components',
			'computed',
			'decorators',
			'easing',
			'events',
			'interpolators',
			'partials',
			'transitions'
		],
		registries = optionGroup( keys, key => new Registry( key, key === 'computed' ) );
	
	return registries;

});