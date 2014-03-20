define([ 
	'Ractive',
	'render/DomFragment/Section/reassignFragment',
	'config/types'
], function ( 
	Ractive,
	reassignFragment,
	types
) {

	'use strict';

	return function () {

		var fixture;

		module( 'ReassignFragments' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		function contextUpdate(opt){
			test( 'update context path: ' + opt.test, function ( t ) {
				var resolved,
					fragment = { 
						context: opt.target,
						items: [{ 
							type: types.ELEMENT,
							attributes: [],
							node: { 
								_ractive: {
									keypath: opt.target
								}
							}
						},{
							type: types.TRIPLE,
							descriptor: {},
							keypath: opt.target,
							indexRef: 1,
							resolve: function(keypath){
								resolved = keypath
							}
						}] 
					};

				reassignFragment(fragment, undefined, undefined, opt.oldKeypath, opt.newKeypath);
				
				t.equal( fragment.context, opt.expected );
				t.equal( fragment.items[0].node._ractive.keypath, opt.expected );
				if(opt.target!==opt.newKeypath){
					t.equal( resolved, opt.expected );
				}

				t.htmlEqual( fixture.innerHTML, '' );
			});
		}

		contextUpdate({
			test: 'exact match replace',
			target: 'items.11',
			oldKeypath: 'items.11',
			newKeypath: 'items.21',
			expected: 'items.21'
		});

		contextUpdate({
			test: 'partial replace',
			target: 'items.1.foo',
			oldKeypath: 'items.1',
			newKeypath: 'items.11',
			expected: 'items.11.foo'
		});

		contextUpdate({
			test: 'overlapping replace',
			target: 'items.11',
			oldKeypath: 'items.1',
			newKeypath: 'items.11',
			expected: 'items.11'
		});

		test('Section with item that has expression only called once when created', function(t){
			var called = 0,
				ractive = new Ractive({
					el: fixture,
					template: '{{#items}}{{format(.)}}{{/items}}',
					data: {
						items: [],
						format: function(){
							called++;
						}
					}
				});

			ractive.get('items').push('item');
			t.equal( called, 1 );
		})

		test('Section with item indexRef expression changes correctly', function(t){
			var called = 0,
				ractive = new Ractive({
					el: fixture,
					template: '{{#items:i}}{{format(.,i)}},{{/items}}',
					data: {
						items: [1,2,3,4,5],
						format: function(x,i){
							return x+i;
						}
					}
				});

			t.htmlEqual( fixture.innerHTML, '1,3,5,7,9,');

			var items = ractive.get('items');
			items.splice(1,2,10);
			t.deepEqual(items, [1,10,4,5]);
			t.htmlEqual( fixture.innerHTML, '1,11,6,8,');
		})

	};

});
