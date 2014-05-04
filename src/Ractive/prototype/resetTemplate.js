define([
	'utils/Promise',
	'Ractive/initialise/initialiseRegistries',
	'Ractive/initialise/renderInstance'
], function (
	Promise,
	initialiseRegistries,
	renderInstance
) {

	'use strict';

	return function ( template, callback ) {
		var promise, changes, options = {
			updatesOnly: true,
			registries: ['template', 'partials']
		};

		if ( typeof template === 'function' && !callback ) {
			callback = template;
			template = void 0;
		}

		if (template){
			options.newValues = {
				template: template
			};
		}

		changes = initialiseRegistries ( this,
			this.constructor.defaults,
			this.initOptions,
			options);

		if ( changes.length ) {

			this.teardown();

			this._initing = true;

			promise = renderInstance ( this, this.initOptions );

			// same as initialise, but should this be in then()?
			this._initing = false;

		} else {
			promise = Promise.resolve();
		}

		if ( callback ) {
			promise.then( callback );
		}

		return promise;
	};

});
