define([ 
	'render/DomFragment/Section/reassignFragment',
	'config/types'
], function ( 
	reassignFragment,
	types
) {

	'use strict';

	return function () {

		module( 'DomFragment' );
		
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
									keypath: opt.target /*,
									//not tested as does a full replace
									binding: {
										keypath: opt.target
									}
									*/
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
				t.equal( resolved, opt.expected );
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

		/* the root keypath '' does not currently update, but maybe that's not a valid case? */
		/*
		contextUpdate({
			test: 'root context',
			target: '',
			oldKeypath: '',
			newKeypath: 'items.11',
			expected: 'items.11'
		});
		*/
	}
});

