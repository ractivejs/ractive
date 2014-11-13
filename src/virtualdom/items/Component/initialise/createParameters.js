import ComponentParameter from 'virtualdom/items/Component/initialise/ComponentParameter';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import decodeKeypath from 'shared/decodeKeypath';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';
import parseJSON from 'utils/parseJSON';
import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';
import types from 'config/types';

export default function createParameters ( component, attributes) {
	var parameters;

	if( !attributes ) {
		return { data: {}, mappings: null };
	}

	parameters = new Parameters( component, attributes );

	return { data: parameters.data, mappings: parameters.mappings };
}

function Parameters ( component, attributes ) {
	this.component = component;
	this.source = component.root.viewmodel;
	this.data = {};
	this.mappings = {};
	this.keys = Object.keys( attributes );

	this.keys.forEach( key => {
		var template = attributes[ key ];

		// We have static data
		if ( typeof template === 'string' ) {
			this.addStatic( key, template );
		}

		// Empty string
		// TODO valueless attributes also end up here currently
		// (i.e. `<widget bool>` === `<widget bool=''>`) - this
		// is probably incorrect
		else if ( template === 0 ) {
			this.addData( key );
		}

		// Single interpolator
		else if ( template.length === 1 && template[0].t === types.INTERPOLATOR ) {
			this.addReference( key, template[0] );
		}

		// We have a 'complex' parameter, e.g.
		// `<widget foo='{{bar}} {{baz}}'/>`
		else {
			this.addComplex( key, template );
		}

	});
}

Parameters.prototype = {
	addData: function ( key, value ) {
		this.data[ key ] = value;
	},

	addMapping: function ( key, keypath ) {
		this.mappings[ key ] = {
			origin: this.source.origin( keypath ),
			keypath: keypath
		};
	},

	addUnresolvedMapping: function ( key ) {
		this.mappings[ key ] = {
			origin: this.source
		};
	},

	addStatic: function ( key, template ) {
		var parsed = parseJSON( template );
		this.addData( key, parsed ? parsed.value : template );
	},

	addComplex: function ( key, template ) {
		var param = new ComponentParameter( this.component, key, template );
		this.addData( key , param.value );
		this.component.complexParameters.push( param );
	},

	addReference: function ( key, template ) {
		var ref, resolver, resolve, target;

		target = new NotReadyResolver( this, key);
		resolve = target.resolve.bind( target );

		if ( ref = template.r ) {
			resolver = createReferenceResolver( this.component, template.r, resolve );
		} else if ( template.x ) {
			resolver = new ExpressionResolver( this.component, this.component.parentFragment, template.x, resolve );
		} else if ( template.rx ) {
			resolver = new ReferenceExpressionResolver( this.component, template.rx, resolve );
		}

		if ( !target.resolved ) {
			// note the mapping anyway, for the benefit of child
			// components
			this.addUnresolvedMapping( key );
		}

		// TODO: If resolved, assuming may have additional callbacks.
		// But is that always true? Can we short-circuit this?
		target = new ReadyResolver( this, key );
		resolver.callback = target.resolve.bind(target);

		this.component.resolvers.push( resolver );
	}
}

function NotReadyResolver ( parameters, key ) {
	this.parameters = parameters;
	this.source = this.parameters.component.root.viewmodel;
	this.key = key;
	this.resolved = false;
}

NotReadyResolver.prototype.resolve = function ( keypath ) {
	this.resolved = true;

	if ( keypath[0] === '@' ) {
		this.parameters.addData( this.key, decodeKeypath( keypath ) );
	}
	else {
		let value = this.source.get( keypath );
		this.parameters.addMapping( this.key, keypath );

		if( value !== undefined ){
			this.parameters.addData( this.key, value );
		}
	}
}

function ReadyResolver ( parameters, key ) {
	this.parameters = parameters;
	this.key = key;
}

ReadyResolver.prototype.resolve = function ( keypath ) {
	var viewmodel = this.parameters.component.instance.viewmodel;

	if ( keypath[0] === '@' ) {
		viewmodel.set( this.key, decodeKeypath( keypath ) );
	}
	else {
		viewmodel.mappings[ this.key ].resolve( keypath );

		// TODO don't think this is necessary, need to test...
		// if( value !== undefined ){
		// 	this.parameters.addData( key, value );
		// }
	}
}
