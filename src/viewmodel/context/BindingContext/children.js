import BindingContext from '../BindingContext';
import UnresolvedContext from '../UnresolvedContext';
import ArrayIndexContext from '../ArrayIndexContext';
import { isArray, isNumeric } from 'utils/is';
import { hasChildFor } from '../shared/hasChildren';

export function join ( keypath ) {
	return this.doJoin( toKeys( keypath ), false, true );
}

export function tryJoin ( keypath ) {
	return this.doJoin( toKeys( keypath ), true, true );
}

function toKeys ( keypath ) {
	return isArray( keypath ) ? keypath : ( '' + keypath ).split( '.' );
}

export function getJoinContext () {
	return this;
}

export function doJoin ( keys, testFirstKey = false, firstKey = false ) {
	const key = keys.shift();
	let child = this.findChild( key );

	if ( !child ) {

		child = this.getSpecial( key );

		// for a tryJoin, the first key has
		// to exist as a prop of this model
		if ( firstKey ) {
			if ( !child && testFirstKey && !this.hasChild( key ) ) {
				return;
			}
		}

		if ( !child ) {
			child = this.createChild( key );
		}

		this.addChild( child );
	}

	if ( keys.length ) {
		child = child.doJoin( keys );
	}

	return child;
}

export function findChild ( key ) {
	const hash = this.propertyHash;
	if ( hash && hash.hasOwnProperty( key ) ) {
		return hash[ key ];
	}
}

export function hashChild ( key, child ) {
	const hash = this.propertyHash || ( this.propertyHash = {} );
	hash[ key ] = child;
}

export function hasChild ( propertyOrIndex ) {
	return hasChildFor( this.get(), propertyOrIndex );
}

export function createChild ( key ) {
	return isNumeric( key ) ? new ArrayIndexContext( +key, this ) : new BindingContext( key );
}

export function addChild ( child, key = child.key, addToProperties = true ) {

	if ( !child.parent && !( child instanceof UnresolvedContext ) ) {
		child.parent = this;
		child.owner = this.owner;
	}

	if ( this.dirty && !child.dirty ) {
		child.dirty = true;
	}

	if ( addToProperties ) {
		if  ( key === child.key ) {
			this.properties ? this.properties.push( child ) : this.properties = [ child ];
		}
		this.hashChild( key, child );
	}

	if ( this.watchers ) {
		this.watchers.notify( key, child );
	}

	return child;
}
