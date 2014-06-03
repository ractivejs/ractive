import create from 'utils/create';
import defineProperty from 'utils/defineProperty';
import getGuid from 'utils/getGuid';
import config from 'config/configuration';
import extendObject from 'utils/extend';
import inheritFromChildProps from 'extend/inheritFromChildProps';
import initChildInstance from 'extend/initChildInstance';
import circular from 'circular';

var Ractive;

circular.push( function () {
	Ractive = circular.Ractive;
});

export default function extend ( childProps ) {

	var Parent = this, Child, adaptor, i;

	// if we're extending with another Ractive instance, inherit its
	// prototype methods and default options as well
	if ( childProps.prototype instanceof Ractive ) {
		// Should this go: prototype -> defaults -> properties ?
		childProps = ( extendObject( {}, childProps, childProps.prototype, childProps.defaults ) );
	}

	// create Child constructor
	Child = function ( options ) {
		initChildInstance( this, Child, options || {});
	};

	Child.prototype = create( Parent.prototype );
	Child.prototype.constructor = Child;
	Child.extend = extend;

	// each component needs a guid, for managing CSS etc
	defineProperty( Child, '_guid', { value: getGuid() });

	// extend configuration
	config.extend( Parent, Child, childProps );

	// Add new prototype methods and init options
	//inheritFromChildProps( Child, childProps );

	return Child;
}
