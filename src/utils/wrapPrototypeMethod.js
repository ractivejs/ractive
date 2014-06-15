
var noop = () => {};

export default function wrap ( instance, parent, name, method ) {

	if ( !( /_super/.test( method ) ) ) { return method; }

	var wrapper = function wrapSuper () {

		var superMethod = getSuperMethod( wrapper._parent, name ),
			hasSuper = ( '_super' in instance ),
			oldSuper = instance._super,
			result;

		instance._super = superMethod;

		result = method.apply( instance, arguments)

		if ( hasSuper ) {
			instance._super = oldSuper;
		} else {
			delete instance._super
		}

		return result;

	}

	wrapper._parent = parent;
	wrapper._method = method;

	return wrapper;
}

function getSuperMethod ( parent, name ) {

	var method;

	if ( name in parent ) {

		let value = parent[name];

		if ( typeof value === 'function' ) {

			method = value;
		}
		else {

			method = function returnValue () {
				return value;
			}
		}

	}
	else {

		method = noop;
	}

	return method;
}

