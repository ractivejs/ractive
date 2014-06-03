import initOptions from 'config/initOptions';
import registries from 'config/registries';
import newreg from 'config/registries/registries';
import defineProperty from 'utils/defineProperty';
import wrapMethod from 'extend/wrapMethod';
import augment from 'extend/utils/augment';

var blacklisted = registries.concat( initOptions.keys ).reduce( ( list, property ) => {

	list[ property ] = true;
	return list;

}, {} );

// This is where we augment the class-level options (inherited from
// Parent) with the values passed to Parent.extend()

// export default function ( Child, childProps ) {


// 	for ( let key in childProps ) {
// 		if ( !blacklisted[ key ] && childProps.hasOwnProperty( key ) ) {
// 			let member = childProps[ key ];

// 			// if this is a method that overwrites a prototype method, we may need
// 			// to wrap it
// 			if ( typeof member === 'function' && typeof Child.prototype[ key ] === 'function' ) {
// 				Child.prototype[ key ] = wrapMethod( member, Child.prototype[ key ] );
// 			} else {
// 				Child.prototype[ key ] = member;
// 			}
// 		}
// 	}

// }
