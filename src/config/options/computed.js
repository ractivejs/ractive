import create from 'utils/create';

var computed = {
	name: 'computed',
	extend: function ( Parent, child, options ) {

		this.configure( Parent, child, options );

	},
	init: function ( Parent, ractive, options ) {

		this.configure( Parent, ractive, options );
	},

	configure: function  ( Parent, instance, options ) {

		var name = this.name, registry, option = options[ name ];

		Parent = Parent.defaults;

		registry = create( Parent[name] );


		for( let key in option ) {
			registry[ key ] = option[ key ];
		}

		instance[ name ] = registry;
	}

};


export default computed;
