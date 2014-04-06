define([
	'config/types',
	'render/shared/Mustache/_Mustache',
	'render/shared/updateSection',
	'shared/teardown',
	'circular'
], function (
	types,
	Mustache,
	updateSection,
	teardown,
	circular
) {

	'use strict';

	var StringSection, StringFragment;

	circular.push( function () {
		StringFragment = circular.StringFragment;
	});

	StringSection = function ( options ) {
		this.type = types.SECTION;
		this.fragments = [];
		this.length = 0;

		Mustache.init( this, options );
	};

	StringSection.prototype = {
		update: Mustache.update,
		resolve: Mustache.resolve,
		reassign: Mustache.reassign,

		teardown: function () {
			this.teardownFragments();

			teardown( this );
		},

		teardownFragments: function () {
			while ( this.fragments.length ) {
				this.fragments.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.fragments.join( '' );
			this.parentFragment.bubble();
		},

		render: function ( value ) {
			var wrapped;

			// with sections, we need to get the fake value if we have a wrapped object
			if ( wrapped = this.root._wrapped[ this.keypath ] ) {
				value = wrapped.get();
			}

			updateSection( this, value );
			this.parentFragment.bubble();
		},

		createFragment: function ( options ) {
			return new StringFragment( options );
		},

		toString: function () {
			return this.fragments.join( '' );
		}
	};

	return StringSection;

});