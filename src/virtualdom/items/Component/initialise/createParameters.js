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

	parameters = new ParameterMapper( component, attributes );

	/*
	var properties = parameters.keys.reduce( ( definition, key ) => {

		if ( parameters.mappings[key] ) {
			definition[ key ] = {
				get: function () {
					var mapping = this._mappings[ key ];
					return mapping.origin.get( mapping.keypath );
				},
				set: function ( value ) {
					var mapping = this._mappings[ key ];
					mapping.origin.set( mapping.keypath, value );
				},
				enumerable: true
			}
		}
		else {
			definition[ key ] = {
				get: function () {
					return this._data[ key ];
				}
			}
		}

		return definition;
	}, {});

	var proto = {};
	Object.defineProperties( proto, properties );
	function F ( options ) {
		this._mappings = options.mappings;
		this._data = options.data || {};
	}
	F.prototype = proto

	var d = new F( parameters );
	*/

	return { data: parameters.data, mappings: parameters.mappings };
}

function ParameterMapper ( component, attributes ) {
	this.component = component;
	this.parentViewmodel = component.root.viewmodel;
	this.data = {};
	this.mappings = {};
	this.keys = Object.keys( attributes );

	this.keys.forEach( key => {
		this.add( key, attributes[ key ] );
	});
}

ParameterMapper.prototype = {

	add: function ( key, template ) {
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
	},

	addData: function ( key, value ) {
		this.data[ key ] = value;
	},

	addMapping: function ( key, keypath ) {
		this.mappings[ key ] = {
			origin: this.parentViewmodel.origin( keypath ),
			keypath: keypath
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

		target = new ParameterResolve( this, key);
		resolve = target.resolve.bind( target );

		if ( ref = template.r ) {
			resolver = createReferenceResolver( this.component, template.r, resolve );
		} else if ( template.x ) {
			resolver = new ExpressionResolver( this.component, this.component.parentFragment, template.x, resolve );
		} else if ( template.rx ) {
			resolver = new ReferenceExpressionResolver( this.component, template.rx, resolve );
		}

		if ( !target.resolved ) {
			// note the mapping anyway, for the benefit of child components
			this.addMapping( key );
		}

		target.ready = true;

		this.component.resolvers.push( resolver );
	}
};

function ParameterResolve ( parameters, key ) {
	this.parameters = parameters;
	this.key = key;
	this.resolved = this.ready = false;
}

ParameterResolve.prototype = {
	resolve: function ( keypath ) {
		this.resolved = true;

		if ( this.ready ) {
			this.readyResolve( keypath );
		}
		else {
			this.notReadyResolve( keypath );
		}
	},

	isSpecial: function ( keypath ) {
		return keypath[0] === '@';
	},

	notReadyResolve: function ( keypath ) {
		this.resolved = true;

		if ( this.isSpecial( keypath ) ) {
			this.parameters.addData( this.key, decodeKeypath( keypath ) );
		}
		else {
			let value = this.parameters.component.root.viewmodel.get( keypath );
			this.parameters.addMapping( this.key, keypath );

			if( value !== undefined ){
				this.parameters.addData( this.key, value );
			}
		}
	},

	readyResolve: function ( keypath ) {
		var viewmodel = this.parameters.component.instance.viewmodel;

		if ( this.isSpecial( keypath ) ) {
			viewmodel.set( this.key, decodeKeypath( keypath ) );
		}
		else {
			viewmodel.mappings[ this.key ].resolve( keypath );
		}
	}
};
