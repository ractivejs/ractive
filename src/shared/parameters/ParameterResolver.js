import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';
import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';

function ParameterResolver ( parameters, key, template ) {
	var component, resolve;

	this.parameters = parameters;
	this.key = key;
	this.resolved = this.ready = false;

	component = parameters.component;
	resolve = this.resolve.bind( this );

	if ( template.r ) {
		this.resolver = createReferenceResolver( component, template.r, resolve );
	} else if ( template.x ) {
		this.resolver = new ExpressionResolver( component, component.parentFragment, template.x, resolve );
	} else if ( template.rx ) {
		this.resolver = new ReferenceExpressionResolver( component, template.rx, resolve );
	}

	if ( !this.resolved ) {
		// note the mapping anyway, for the benefit of child components
		parameters.addMapping( key );
	}

	this.ready = true;
}

export default ParameterResolver;

ParameterResolver.prototype = {
	resolve: function ( keypath ) {
		this.resolved = true;

		if ( this.ready ) {
			this.readyResolve( keypath );
		}
		else {
			this.notReadyResolve( keypath );
		}
	},

	notReadyResolve: function ( keypath ) {

		if ( keypath.isSpecial ) {
			this.parameters.addData( this.key.str, keypath.value );
		}
		else {
			let mapping = this.parameters.addMapping( this.key, keypath );

			if( mapping.getValue() === undefined ){
				mapping.updatable = true;
			}
		}
	},

	readyResolve: function ( keypath ) {
		var viewmodel = this.parameters.component.instance.viewmodel;

		if ( keypath.isSpecial ) {
			this.parameters.addData( this.key.str, keypath.value );
			viewmodel.mark( this.key );
		}
		else if ( viewmodel.reversedMappings && viewmodel.reversedMappings[ this.key.str ] ) {
			viewmodel.reversedMappings[ this.key.str ].rebind( keypath );
		}
		else {
			viewmodel.mappings[ this.key.str ].resolve( keypath );
		}

	}
};
