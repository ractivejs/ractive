var fillGaps = function ( target, source ) {
	var key;

	for ( key in source ) {
		if ( source.hasOwnProperty( key ) && !target.hasOwnProperty( key ) ) {
			target[ key ] = source[ key ];
		}
	}
};

extend = function ( childProps ) {

	var Parent, Child, key, inheritedOptions, blacklist, template, partials, partial;

	Parent = this;

	inheritedOptions = [ 'el', 'preserveWhitespace', 'append', 'twoway', 'modifyArrays' ];
	blacklist = inheritedOptions.concat( 'data', 'template', 'partials', 'transitions' );

	// Parse template
	if ( childProps.template ) {
		if ( typeof childProps.template === 'string' ) {
			if ( !Ractive.parse ) {
				throw new Error( missingParser );
			}

			template = Ractive.parse( childProps.template );
		} else {
			template = childProps.template;
		}
	}

	// Parse partials, if necessary
	if ( childProps.partials ) {
		partials = {};

		for ( key in childProps.partials ) {
			if ( childProps.partials.hasOwnProperty( key ) ) {
				if ( typeof childProps.partials[ key ] === 'string' ) {
					if ( !Ractive.parse ) {
						throw new Error( missingParser );
					}

					partial = Ractive.parse( childProps.partials[ key ], childProps );
				} else {
					partial = childProps.partials[ key ];
				}

				partials[ key ] = partial;
			}
		}
	}

	Child = function ( options ) {
		var key, i, optionName;

		// Add template to options, if necessary
		if ( !options.template && template ) {
			options.template = template;
		}

		// Extend subclass data with instance data
		if ( !options.data ) {
			options.data = {};
		}

		fillGaps( options.data, childProps.data );

		// Transitions
		if ( !options.transitions ) {
			options.transitions = {};
		}

		fillGaps( options.transitions, childProps.transitions );

		// Add in preparsed partials
		if ( partials ) {
			if ( !options.partials ) {
				options.partials = {};
			}

			fillGaps( options.partials, partials );
		}

		i = inheritedOptions.length;
		while ( i-- ) {
			optionName = inheritedOptions[i];
			if ( !options.hasOwnProperty( optionName ) && childProps.hasOwnProperty( optionName ) ) {
				options[ optionName ] = childProps[ optionName ];
			}
		}

		Ractive.call( this, options );

		if ( this.init ) {
			this.init.call( this, options );
		}
	};

	// extend child with parent methods
	for ( key in Parent.prototype ) {
		if ( Parent.prototype.hasOwnProperty( key ) ) {
			Child.prototype[ key ] = Parent.prototype[ key ];
		}
	}

	// Extend child with specified methods, as long as they don't override Ractive.prototype methods.
	// Blacklisted properties don't extend the child, as they are part of the initialisation options
	for ( key in childProps ) {
		if ( childProps.hasOwnProperty( key ) && blacklist.indexOf( key ) === -1 ) {
			if ( Ractive.prototype.hasOwnProperty( key ) ) {
				throw new Error( 'Cannot override "' + key + '" method or property of Ractive prototype' );
			}

			Child.prototype[ key ] = childProps[ key ];
		}
	}

	Child.extend = Parent.extend;

	return Child;
};