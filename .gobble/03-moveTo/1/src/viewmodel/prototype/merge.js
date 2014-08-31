define(['config/types','utils/warn','viewmodel/prototype/merge/mapOldToNewIndex'],function (types, warn, mapOldToNewIndex) {

	'use strict';
	
	var __export;
	
	var comparators = {};
	
	__export = function Viewmodel$merge ( keypath, currentArray, array, options ) {var this$0 = this;
	
		var oldArray,
			newArray,
			comparator,
			newIndices,
			dependants;
	
		this.mark( keypath );
	
		if ( options && options.compare ) {
	
			comparator = getComparatorFunction( options.compare );
	
			try {
				oldArray = currentArray.map( comparator );
				newArray = array.map( comparator );
			} catch ( err ) {
				// fallback to an identity check - worst case scenario we have
				// to do more DOM manipulation than we thought...
	
				// ...unless we're in debug mode of course
				if ( this.debug ) {
					throw err;
				} else {
					warn( 'Merge operation: comparison failed. Falling back to identity checking' );
				}
	
				oldArray = currentArray;
				newArray = array;
			}
	
		} else {
			oldArray = currentArray;
			newArray = array;
		}
	
		// find new indices for members of oldArray
		newIndices = mapOldToNewIndex( oldArray, newArray );
	
		// Indices that are being removed should be marked as dirty
		newIndices.forEach( function( newIndex, oldIndex )  {
			if ( newIndex === -1 ) {
				this$0.mark( keypath + '.' + oldIndex );
			}
		});
	
		// Update the model
		// TODO allow existing array to be updated in place, rather than replaced?
		this.set( keypath, array, true );
	
		if ( dependants = this.deps[ 'default' ][ keypath ] ) {
			dependants.filter( canMerge ).forEach( function(dependant ) {return dependant.merge( newIndices )} );
		}
	
		if ( currentArray.length !== array.length ) {
			this.mark( keypath + '.length', true );
		}
	};
	
	function canMerge ( dependant ) {
		return typeof dependant.merge === 'function' && ( !dependant.subtype || dependant.subtype === types.SECTION_EACH );
	}
	
	function stringify ( item ) {
		return JSON.stringify( item );
	}
	
	function getComparatorFunction ( comparator ) {
		// If `compare` is `true`, we use JSON.stringify to compare
		// objects that are the same shape, but non-identical - i.e.
		// { foo: 'bar' } !== { foo: 'bar' }
		if ( comparator === true ) {
			return stringify;
		}
	
		if ( typeof comparator === 'string' ) {
			if ( !comparators[ comparator ] ) {
				comparators[ comparator ] = function ( item ) {
					return item[ comparator ];
				};
			}
	
			return comparators[ comparator ];
		}
	
		if ( typeof comparator === 'function' ) {
			return comparator;
		}
	
		throw new Error( 'The `compare` option must be a function, or a string representing an identifying field (or `true` to use JSON.stringify)' );
	}
	return __export;

});