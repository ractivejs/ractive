import noop from '../../utils/noop';

export default function wrap ( parent, name, method ) {
	if ( !/_super/.test( method ) ) return method;

	function wrapper () {
		const superMethod = getSuperMethod( wrapper._parent, name );
		const hasSuper = '_super' in this;
		const oldSuper = this._super;

		this._super = superMethod;

		const result = method.apply( this, arguments );

		if ( hasSuper ) {
			this._super = oldSuper;
		} else {
			delete this._super;
		}

		return result;
	}

	wrapper._parent = parent;
	wrapper._method = method;

	return wrapper;
}

function getSuperMethod ( parent, name ) {
	if ( name in parent ) {
		const value = parent[ name ];

		return typeof value === 'function' ?
			value :
			() => value;
	}

	return noop;
}
