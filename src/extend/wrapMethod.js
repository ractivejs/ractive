var noop = () => {};

export default function ( method, superMethod ) {


	if ( superMethod && typeof superMethod === 'function' && /_super/.test( method ) ) {

		return function () {

			var hasSuper = ( '_super' in this ), _super = this._super, result;

			this._super = superMethod;

			result = method.apply( this, arguments );

			if ( hasSuper ) {
				this._super = _super;
			}

			return result;
		};
	}

	else {
		return method;
	}
}
