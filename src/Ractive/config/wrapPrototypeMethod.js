import noop from 'utils/noop';

export default function wrap ( parent, name, method ) {
	if ( !/_super/.test( method ) ) {
		return method;
	}

	var wrapper = function wrapSuper () {
		var superMethod = getSuperMethod( wrapper._parent, name ),
			hasSuper = ( '_super' in this ),
			oldSuper = this._super,
			result;

		this._super = superMethod;

		result = method.apply( this, arguments );

		if ( hasSuper ) {
			this._super = oldSuper;
		} else {
			delete this._super;
		}

		return result;
	};

	wrapper._parent = parent;
	wrapper._method = method;

	return wrapper;
}

function getSuperMethod ( parent, name ) {
	var value, method;

	if ( name in parent ) {
		value = parent[name];

		if ( typeof value === 'function' ) {
			method = value;
		} else {
			method = function returnValue () {
				return value;
			};
		}
	} else {
		method = noop;
	}

	return method;
}
