define([
	'ractive',
	'render/shared/reassignFragment',
	'render/DomFragment/Element/_Element',
	'render/DomFragment/Triple',
	'config/types'
], function (
	Ractive,
	reassignFragment,
	DomElement,
	Triple,
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
						items: [],
						pNode: {},
						root: { 
							'_liveQueries': [],
							'_deps': [] ,
							'_depsMap': [],
							'_cache': [],
							'_computations': [],
							'_wrapped': [],
							'_evaluators': [],
							adapt: []
						},
						indexRefs: { i: opt.oldKeypath.replace('items.','')}
					},
					el = new DomElement({
						parentFragment: fragment,
						descriptor: { e: 'div' }
					}),
					triple = new Triple({
						parentFragment: fragment,
						descriptor: { 
							t: types.TRIPLE,
							r: '.'
						}
					});

				triple.resolve = function(keypath){
				 	resolved = keypath
				};

				fragment.items.push(el, triple);

				fragment.reassign = reassignFragment;
				fragment.reassign( 'i', opt.newKeypath.replace('items.',''), opt.oldKeypath, opt.newKeypath);

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
			var ractive = new Ractive({
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

		test('Section with nested sections and inner context does splice()', function(t){
			var template = '{{#model:i}}{{#thing}}' +
								'{{# .inner.length > 1}}' +
        							'<p>{{{format(inner)}}}</p>' +
        						'{{/ inner}}' +
    						'{{/thing}}{{/model}}'
    		var called = 0

			var ractive = new Ractive({
					el: fixture,
					template: template,
					data: {
						model: [ { thing: { inner: [3,4] } } ],
						format: function(a){
							called++;
							return a;
						}
					}
				});

			t.htmlEqual( fixture.innerHTML, '<p>3,4</p>');
			ractive.get('model').splice(0, 0, {thing: {inner: [1,2]}});
			t.htmlEqual( fixture.innerHTML, '<p>1,2</p><p>3,4</p>');
		})

		test( 'Components in a list can be reassigned', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#items}}<widget letter="{{.}}"/>{{/items}}',
				data: { items: [ 'a', 'b', 'c' ] },
				components: {
					widget: Ractive.extend({
						template: '<p>{{letter}}</p>'
					})
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>a</p><p>b</p><p>c</p>' );

			ractive.get( 'items' ).splice( 1, 1 );
			t.htmlEqual( fixture.innerHTML, '<p>a</p><p>c</p>' );

			ractive.set( 'items[0]', 'd' );
			ractive.set( 'items[1]', 'e' );
			t.htmlEqual( fixture.innerHTML, '<p>d</p><p>e</p>' );
		});

		test( 'Index references can be used as key attributes on components, and reassignment works', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#items:i}}<widget index="{{i}}" letter="{{.}}"/>{{/items}}',
				data: { items: [ 'a', 'b', 'c' ] },
				components: {
					widget: Ractive.extend({
						template: '<p>{{index}}: {{letter}}</p>'
					})
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: b</p><p>2: c</p>' );

			ractive.get( 'items' ).splice( 1, 1 );
			t.htmlEqual( fixture.innerHTML, '<p>0: a</p><p>1: c</p>' );
		});

	};

});
