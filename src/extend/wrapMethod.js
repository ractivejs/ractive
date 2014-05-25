var noop = () => {};

export default function ( method, superMethod ) {
	if ( /_super/.test( method ) ) {
		return function () {

			var _super = this._super, result;
			this._super = superMethod || noop;

			result = method.apply( this, arguments );

			//TODO: test if _super existed so we don't spam the this with property
			this._super = _super;
			return result;
		};
	}

	else {
		return method;
	}
}
