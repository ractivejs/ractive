import { test } from 'qunit';
import { fire } from 'simulant';
import Model from 'helpers/Model';
import { onWarn } from 'test-config';

const adaptor = Model.adaptor;

function Foo ( content ) {
	this.content = content;
}

const fooAdaptor = {
	filter ( object ) {
		return object instanceof Foo;
	},
	wrap ( ractive, foo ) {
		return {
			get () {
				return foo.content;
			},
			teardown () {

			}
		};
	}
};

test( 'Adaptors can change data as it is .set() (#442)', t => {
	const model = new Model({
		foo: 'BAR',
		percent: 150
	});

	model.transform( 'foo', function ( newValue ) {
		return newValue.toLowerCase();
	});

	model.transform( 'percent', function ( newValue ) {
		return Math.min( 100, Math.max( 0, newValue ) );
	});

	const ractive = new Ractive({
		el: fixture,
		template: '<p>{{model.foo}}</p><p>{{model.percent}}</p>',
		data: { model },
		adapt: [ adaptor ]
	});

	t.htmlEqual( fixture.innerHTML, '<p>bar</p><p>100</p>' );

	ractive.set( 'model.foo', 'BAZ' );
	ractive.set( 'model.percent', -20 );
	t.htmlEqual( fixture.innerHTML, '<p>baz</p><p>0</p>' );

	ractive.set( 'model', {
		foo: 'QUX',
		percent: 50
	});
	t.htmlEqual( fixture.innerHTML, '<p>qux</p><p>50</p>' );
});

test( 'ractive.reset() calls are forwarded to wrappers if the root data object is wrapped', t => {
	onWarn( msg => t.ok( /plain JavaScript object/.test( msg ) ) );

	let model = new Model({
		foo: 'BAR',
		unwanted: 'here'
	});

	model.transform( 'foo', function ( newValue ) {
		return newValue.toLowerCase();
	});

	const ractive = new Ractive({
		el: fixture,
		template: '<p>{{foo}}</p>{{unwanted}}',
		data: model,
		adapt: [ adaptor ]
	});

	ractive.reset({ foo: 'BAZ' });
	t.htmlEqual( fixture.innerHTML, '<p>baz</p>' );

	model = new Model({ foo: 'QUX' });

	model.transform( 'foo', function ( newValue ) {
		return newValue.toLowerCase();
	});

	ractive.reset( model );
	t.htmlEqual( fixture.innerHTML, '<p>qux</p>' );
});

test( 'If a wrapper\'s reset() method returns false, it should be torn down (#467)', t => {
	const model1 = new Model({
		foo: 'bar'
	});

	const model2 = new Model({
		foo: 'baz'
	});

	const ractive = new Ractive({
		el: fixture,
		template: '<p>{{model.foo}}</p>',
		data: { model: model1 },
		adapt: [ adaptor ]
	});

	t.htmlEqual( fixture.innerHTML, '<p>bar</p>' );

	ractive.set( 'model', model2 );
	t.htmlEqual( fixture.innerHTML, '<p>baz</p>' );
});

test( 'A string can be supplied instead of an array for the `adapt` option (if there\'s only one adaptor listed', t => {
	const FooAdaptor = {
		filter () {},
		wrap () {}
	};

	const Subclass = Ractive.extend({ adapt: 'Foo', adaptors: { Foo: FooAdaptor }, modifyArrays: false });
	const instance = new Subclass();

	t.deepEqual( instance.viewmodel.adaptors, [FooAdaptor] );
});

test( 'Original values are passed to event handlers (#945)', t => {
	t.expect( 2 );

	const ractive = new Ractive({
		el: fixture,
		template: '{{#with model}}<button on-click="select:{{this}}">{{foo}}</button>{{/with}}',
		data: {
			model: new Model({ foo: 'bar' })
		},
		adapt: [ adaptor ]
	});

	t.htmlEqual( fixture.innerHTML, '<button>bar</button>' );

	ractive.on( 'select', function ( event, model ) {
		t.ok( model instanceof Model );
	});

	fire( ractive.find( 'button' ), 'click' );
});

test( 'Adaptor teardown is called when used in a component (#1190)', t => {
	function Wrapped () {}

	let torndown = 0;

	const adaptor = {
		filter: obj => obj instanceof Wrapped,
		wrap: () => {
			return {
				get: () => ({ foo: 'bar' }),
				reset: () => false,
				teardown: () => torndown++
			};
		}
	};

	const ractive = new Ractive({
		el: fixture,
		template: '<Component/>',
		components: {
			Component: Ractive.extend({
				template: '{{wrapped.foo}}',
				data: () => ({
					wrapped: new Wrapped()
				}),
				adapt: [ adaptor ]
			})
		}

	});

	t.htmlEqual( fixture.innerHTML, 'bar' );
	ractive.teardown();
	t.equal( torndown, 1 );
});


test( 'Adaptor called on data provided in initial options when no template (#1285)', t => {
	function Wrapped () {}

	const obj = new Wrapped();

	const adaptor = {
		filter: obj => obj instanceof Wrapped,
		wrap: () => {
			return {
				get: () => obj,
				reset: () => false,
				set: (property, value) => obj.sekrit = value,
				teardown: () => true
			};
		}
	};

	const ractive = new Ractive({
		el: fixture,
		data: { wrapped: obj },
		adapt: [ adaptor ]
	});

	t.ok( !obj.sekrit );
	t.ok( !obj.enabled );
	ractive.set( 'wrapped.enabled', true );
	t.ok( obj.sekrit, 'adaptor set should have been used to set sekrit property' );
	t.ok( !obj.enabled, 'object property should not have been set, adaptor should have been used'	);
});

test( 'Components inherit modifyArrays option from environment (#1297)', t => {
	const Widget = Ractive.extend({
		template: '{{#each items}}{{this}}{{/each}}'
	});

	// YOUR CODE GOES HERE
	const ractive = new Ractive({
		el: fixture,
		template: '<Widget/>',
		data: {
			items: [ 'a', 'b', 'c' ]
		},
		modifyArrays: false,
		components: { Widget }
	});

	ractive.findComponent( 'Widget' ).get( 'items' ).push( 'd' );
	t.htmlEqual( fixture.innerHTML, 'abc' );
});

test( 'Computed properties are adapted', t => {
	function Value ( value ) {
		this._ = value;
	}

	const adaptor = {
		filter: obj => obj instanceof Value,
		wrap: ( ractive, obj ) => ({
			get: () => obj._,
			set: () => null,
			reset: () => false,
			teardown: () => true
		})
	};

	const ractive = new Ractive({
		el: fixture,
		template: `{{foo}}`,
		data: { bar: 1 },
		adapt: [ adaptor ],
		computed: {
			foo () {
				return new Value( 2 * this.get( 'bar' ) );
			}
		}
	});

	t.htmlEqual( fixture.innerHTML, '2' );
	ractive.set( 'bar', 2 );
	t.htmlEqual( fixture.innerHTML, '4' );
});

test( 'display a collection from a model', t => {
	function extend ( parent, child ) {
		function Surrogate () {
			this.constructor = child;
		}
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate();
	}

	function Model ( attrs ) {
		this.attrs = attrs || {};
	}

	function Collection ( arr ) {
		this.arr = arr || [];
	}

	function Items ( arr ) {
		Collection.call(this, arr);
		return this;
	}

	extend( Collection, Items );

	function Store ( attrs ) {
		Model.call( this, attrs );
	}

	extend( Model, Store );

	Ractive.adaptors.ModelAdaptor = {
		filter: obj => obj instanceof Model,
		wrap: ( ractive, obj ) => {
			return {
				get: () => obj.attrs,
				set: ( prop, val ) => obj.attrs[ prop ] = val,
				reset: () => false,
				teardown: () => true
			};
		}
	};

	Ractive.adaptors.CollectionAdaptor = {
		filter: obj => obj instanceof Collection,
		wrap: ( ractive, obj ) => {
			return {
				get: () => obj.arr,
				reset: () => false,
				teardown: () => true
			};
		}
	};

	const store = new Store({
		items: new Items([
			{ name: 'duck' },
			{ name: 'chicken' }
		])
	});

	new Ractive({
		el: fixture,
		template: `{{#each store.items }}-{{ this.name }}{{/each}}`,
		data: { store },
		adapt: [ 'ModelAdaptor', 'CollectionAdaptor' ]
	});
	t.htmlEqual( fixture.innerHTML, '-duck-chicken' );
});

test( 'A component inherits adaptor config from its parent class', t => {
	function Wrapped () {}

	const adaptor = {
		filter: obj => obj instanceof Wrapped,
		wrap: () => {
			return {
				get: () => ({ foo: 'bar' }),
				teardown: () => null
			};
		}
	};

	const Sub = Ractive.extend({
		adapt: [ adaptor ]
	});

	const SubSub = Sub.extend({
		template: '{{wrapped.foo}}'
	});

	new SubSub({
		el: fixture,
		data: { wrapped: new Wrapped() }
	});

	t.htmlEqual( fixture.innerHTML, 'bar' );
});

test( 'Components inherit adaptors from their parent', t => {
	Ractive.adaptors.foo = fooAdaptor;

	Ractive.components.Widget = Ractive.extend({
		template: '<p>{{wrappedThing}}</p>'
	});

	new Ractive({
		el: fixture,
		template: '<Widget wrappedThing="{{thing}}"/>',
		adapt: [ 'foo' ],
		data: {
			thing: new Foo( 'whee!' )
		}
	});

	t.htmlEqual( fixture.innerHTML, '<p>whee!</p>' );

	delete Ractive.adaptors.foo;
});

test( 'Components made with Ractive.extend() can include adaptors', t => {
	Ractive.adaptors.foo = fooAdaptor;

	const Widget = Ractive.extend({
		adapt: [ 'foo' ],
		modifyArrays: false
	});

	const ractive = new Widget({
		el: fixture,
		template: '<p>{{thing}}</p>',
		data: {
			thing: new Foo( 'whee!' )
		}
	});

	t.deepEqual( ractive.viewmodel.adaptors, [ Ractive.adaptors.foo ] );
	t.htmlEqual( fixture.innerHTML, '<p>whee!</p>' );

	delete Ractive.adaptors.foo;
});
