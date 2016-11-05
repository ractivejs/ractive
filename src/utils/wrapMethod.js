export default function ( method, superMethod, force ) {

	if ( force || needsSuper( method, superMethod ) )  {

		return function () {

			const hasSuper = ( '_super' in this );
			const _super = this._super;

			this._super = superMethod;

			const result = method.apply( this, arguments );

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

function needsSuper ( method, superMethod ) {
	return typeof superMethod === 'function' && /_super/.test( method );
}
