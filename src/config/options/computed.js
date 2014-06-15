import create from 'utils/create';

var computed = {
	name: 'computed',
	extend: function ( Parent, child, options ) {

		var name = this.name, registry, option = options[ name ];

		Parent = Parent.defaults;

		registry = create( Parent[name] );


		for( let key in option ) {
			registry[ key ] = option[ key ];
		}

		child[ name ] = registry;

	},
	init: function ( Parent, ractive, options ) {

		var name = this.name, registry, option = options[ name ];

		Parent = Parent.defaults;

		registry = create( Parent[name] );


		for( let key in option ) {
			registry[ key ] = option[ key ];
		}

		ractive[ name ] = registry;
	}
};

export default computed;
