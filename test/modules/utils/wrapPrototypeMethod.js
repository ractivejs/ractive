define([
	'utils/wrapPrototypeMethod',
	'utils/create'
], function (
	wrap,
	create
) {

	'use strict';

	wrap = wrap.default || wrap;
	create = create.default || create;

	return function () {

		module( 'Wrap Method', {

		});

		var callSuper = function () { this._super() };

		test( 'can call _super on parent', function ( t ) {

			expect(1);

			var parent = { talk: () => t.ok( true ) },
				instance = create( parent );

			instance.talk = wrap( parent, 'talk', callSuper );

			instance.talk();
		});

		test( '"this" in methods refers to correct instance', function ( t ) {

			expect(2);

			// no fat arrows! that would bind "this" to test method or module!

			var parent = {
					talk: function () {
						t.equal( this, instance, '_super method has correct "this"' );
					}
				},
				instance = create( parent );

			instance.talk = wrap( parent, 'talk', function () {
				t.equal( this, instance, 'instance method has correct "this"' );
				this._super();
			});

			instance.talk();
		});

		test( 'can find _super in prototype chain', function ( t ) {

			expect(1);

			var grandparent = { talk: () => t.ok( true ) },
				parent = create( grandparent ),
				instance = create( parent );

			instance.talk = wrap( parent, 'talk', callSuper );

			instance.talk();
		});

		test( 'safe to use _super with no parent', function ( t ) {

			expect(1);

			var parent = {}, instance = create( parent );

			instance.talk = wrap( parent, 'talk', function () {
				this._super()
				t.ok( true )
			} );

			instance.talk();
		});

		test( 'parent _super can be added later', function ( t ) {

			expect(1);

			var parent = {},
				instance = create( parent );

			instance.talk = wrap( parent, 'talk', callSuper );

			parent.talk = () => t.ok( true );

			instance.talk();
		});

		test( 'only wraps when this._super used in method', function ( t ) {

			expect(1);

			var parent = { talk: () => t.ok( true ) },
				instance = create( parent ),
				method = function () {};

			t.equal( wrap( parent, 'talk', method), method );

		});

		test( 'if this._super is non-function, returns as value', function ( t ) {

			expect(1);

			var data = { foo: 'bar' },
				parent = { talk: data },
				instance = create( parent ),
				method = function () { return this._super(); };

			instance.talk = wrap( parent, 'talk', method );

			t.equal( instance.talk() , data );

		});

		test( 'parent instance can be changed', function ( t ) {

			expect(2);

			var parent = { talk: () => false },
				newParent = { talk: () => t.ok( true ) },
				instance = create( parent );

			instance.talk = wrap( parent, 'talk', callSuper );
			t.equal( instance.talk._parent, parent );
			instance.talk._parent = newParent;

			instance.talk();
		});


		test( 'can access original via _method', function ( t ) {

			var instance = {},
				method = wrap( parent, 'talk', callSuper );

			t.equal( method._method, callSuper );

		});

	};

});
