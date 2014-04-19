define([
	'config/types',
	'utils/parseJSON',
	'render/shared/Fragment/_Fragment',
	'render/StringFragment/Interpolator',
	'render/StringFragment/Section',
	'render/StringFragment/Text',
	'render/StringFragment/prototype/getValue',
	'circular'
], function (
	types,
	parseJSON,
	Fragment,
	Interpolator,
	Section,
	Text,
	getValue,
	circular
) {

	'use strict';

	var StringFragment = function ( options ) {
		Fragment.init( this, options );
	};

	StringFragment.prototype = {
		reassign: Fragment.reassign,

		createItem: function ( options ) {
			if ( typeof options.descriptor === 'string' ) {
				return new Text( options.descriptor );
			}

			switch ( options.descriptor.t ) {
				case types.INTERPOLATOR: return new Interpolator( options );
				case types.TRIPLE: return new Interpolator( options );
				case types.SECTION: return new Section( options );

				default: throw 'Something went wrong in a rather interesting way';
			}
		},

		bubble: function () {
			this.dirtyValue = this.dirtyArgs = true;
			this.owner.bubble();
		},

		teardown: function () {
			var numItems, i;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}
		},

		getValue: getValue,

		isSimple: function () {
			var i, item, containsInterpolator;

			if ( this.simple !== undefined ) {
				return this.simple;
			}

			i = this.items.length;
			while ( i-- ) {
				item = this.items[i];
				if ( item.type === types.TEXT ) {
					continue;
				}

				// we can only have one interpolator and still be self-updating
				if ( item.type === types.INTERPOLATOR ) {
					if ( containsInterpolator ) {
						return false;
					} else {
						containsInterpolator = true;
						continue;
					}
				}

				// anything that isn't text or an interpolator (i.e. a section)
				// and we can't self-update
				return ( this.simple = false );
			}

			return ( this.simple = true );
		},

		toString: function () {
			return this.items.join( '' );
		},

		toJSON: function () {
			var value = this.getValue(), parsed;

			if ( typeof value === 'string' ) {
				parsed = parseJSON( value );
				value = parsed ? parsed.value : value;
			}

			return value;
		}
	};

	circular.StringFragment = StringFragment;
	return StringFragment;

});
