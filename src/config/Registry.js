import create from 'utils/create';
import defineProperty from 'utils/defineProperty';
import 'legacy';

function Registry () {

}

defineExtend ( Registry )

function defineExtend ( target ) {
	defineProperty( target, 'extend', {
		value: extend,
		writable: true,
		enumerable: false,
		configurable: false
	});
}

function extend ( items ) {

	var proto;

	function ChildRegistry(){}

	defineExtend( ChildRegistry );

	proto = create( this.prototype );

	defineProperty( proto, 'constructor', { value: ChildRegistry } );

	for( let key in items ) {
		proto[ key ] = items[ key ];
	}

	ChildRegistry.prototype = proto;

	return ChildRegistry;
}

export default Registry;
