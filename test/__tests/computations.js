module( 'Computations' );

test( 'Computed value declared as a function', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<p>area: {{area}}</p>',
		data: {
			width: 10,
			height: 10
		},
		computed: {
			area: function () {
				return this.get( 'width' ) * this.get( 'height' );
			}
		}
	});

	t.htmlEqual( fixture.innerHTML, '<p>area: 100</p>' );

	ractive.set( 'width', 15 );
	t.htmlEqual( fixture.innerHTML, '<p>area: 150</p>' );

	ractive.set( 'height', 15 );
	t.htmlEqual( fixture.innerHTML, '<p>area: 225</p>' );
});

test( 'Computed value declared as a string', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<p>area: {{area}}</p>',
		data: {
			width: 10,
			height: 10
		},
		computed: {
			area: '${width} * ${height}'
		}
	});

	t.htmlEqual( fixture.innerHTML, '<p>area: 100</p>' );

	ractive.set( 'width', 15 );
	t.htmlEqual( fixture.innerHTML, '<p>area: 150</p>' );

	ractive.set( 'height', 15 );
	t.htmlEqual( fixture.innerHTML, '<p>area: 225</p>' );
});

test( 'Computed value with a set() method', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '<p>First name: {{first}}</p><p>Last name: {{last}}</p><p>Full name: {{full}}</p>',
		data: {
			first: 'Jim',
			last: 'Beam'
		},
		computed: {
			full: {
				get: '${first} + " " + ${last}',
				set: function ( fullname ) {
					var parts = fullname.split( ' ' );

					this.set({
						first: parts[0] || '',
						last: parts[1] || ''
					});
				}
			}
		}
	});

	t.equal( ractive.get( 'full' ), 'Jim Beam' );
	t.htmlEqual( fixture.innerHTML, '<p>First name: Jim</p><p>Last name: Beam</p><p>Full name: Jim Beam</p>' );

	ractive.set( 'last', 'Belushi' );
	t.equal( ractive.get( 'full' ), 'Jim Belushi' );
	t.htmlEqual( fixture.innerHTML, '<p>First name: Jim</p><p>Last name: Belushi</p><p>Full name: Jim Belushi</p>' );

	ractive.set( 'full', 'John Belushi' );
	t.equal( ractive.get( 'first' ), 'John' );
	t.htmlEqual( fixture.innerHTML, '<p>First name: John</p><p>Last name: Belushi</p><p>Full name: John Belushi</p>' );
});

test( 'Components can have default computed properties', function ( t ) {
	var Box, ractive;

	Box = Ractive.extend({
		template: '<div style="width: {{width}}px; height: {{height}}px;">{{area}}px squared</div>',
		computed: {
			area: '${width} * ${height}'
		}
	});

	ractive = new Ractive({
		el: fixture,
		template: '<box width="{{width}}" height="{{height}}"/>',
		data: {
			width: 100,
			height: 100
		},
		components: { box: Box }
	});

	t.htmlEqual( fixture.innerHTML, '<div style="width: 100px; height: 100px;">10000px squared</div>' );

	ractive.set( 'width', 200 );
	t.htmlEqual( fixture.innerHTML, '<div style="width: 200px; height: 100px;">20000px squared</div>' );
});

test( 'Instances can augment default computed properties of components', function ( t ) {
	var Box, ractive;

	Box = Ractive.extend({
		template: '<div style="width: {{width}}px; height: {{height}}px;">{{area}}px squared</div>',
		computed: {
			area: '${width} * ${height}'
		}
	});

	ractive = new Box({
		el: fixture,
		data: {
			width: 100,
			height: 100
		},
		computed: { irrelevant: '"foo"' }
	});

	t.htmlEqual( fixture.innerHTML, '<div style="width: 100px; height: 100px;">10000px squared</div>' );

	ractive.set( 'width', 200 );
	t.htmlEqual( fixture.innerHTML, '<div style="width: 200px; height: 100px;">20000px squared</div>' );
});

test( 'Computed values can depend on other computed values', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{number}} - {{squared}} - {{cubed}}',
		data: { number: 5 },
		computed: {
			squared: '${number} * ${number}',
			cubed: '${squared} * ${number}'
		}
	});

	t.htmlEqual( fixture.innerHTML, '5 - 25 - 125' );

	ractive.add( 'number', 1 );
	t.htmlEqual( fixture.innerHTML, '6 - 36 - 216' );
});

test( 'Computations that cause errors are considered undefined', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{uppercaseBar}}',
		computed: {
			uppercaseBar: '${foo}.bar.toUpperCase()'
		}
	});

	t.htmlEqual( fixture.innerHTML, '' );

	ractive.set( 'foo.bar', 'works' );
	t.htmlEqual( fixture.innerHTML, 'WORKS' );
});

test( 'Computations can be updated with ractive.update() (#651)', function ( t ) {
	var ractive, bar;

	ractive = new Ractive({
		computed: {
			foo: function () {
				return bar;
			}
		}
	});

	t.equal( ractive.get( 'foo' ), undefined );

	bar = 1;
	ractive.update( 'foo' );
	t.equal( ractive.get( 'foo' ), 1 );
});

test( 'Regression test for #836', function ( t ) {
	var Widget, ractive;

	Widget = Ractive.extend({
		template: '{{# foo <= bar }}yes{{/}}',
		computed: { foo: '[]' },
		oninit: function () {
			this.set({ bar: 10 });
		}
	});

	ractive = new Ractive({
		el: fixture,
		template: '<widget>',
		components: { widget: Widget }
	});

	t.htmlEqual( fixture.innerHTML, 'yes' );
});

test( 'Setters are called on init with supplied data (#837)', function ( t ) {
	new Ractive({
		el: fixture,
		template: '{{firstname}}',
		computed: {
			fullname: {
				set: function ( fullname ) {
					var split = fullname.split( ' ' );
					this.set({
						firstname: split[0],
						lastname: split[1]
					});
				},
				get: function () {
					return this.get( 'firstname' ) + ' ' + this.get( 'lastname' );
				}
			}
		},
		data: {
			fullname: 'Colonel Sanders'
		}
	});

	t.htmlEqual( fixture.innerHTML, 'Colonel' );
});

test( 'Set operations are not short-circuited when the set value is identical to the current get value (#837)', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: '{{bar}}',
		data: {
			bar: 1
		},
		computed: {
			foo: {
				get: function () {
					return this.get( 'bar' );
				},
				set: function ( value ) {
					this.set( 'bar', value + 1 );
				}
			}
		}
	});

	ractive.set( 'foo', 1 );
	t.htmlEqual( fixture.innerHTML, '2' );
});

test( 'Computations on unresolved refs don\'t error on initial component bindings', function ( t ) {
	/* global console */
	var warn = console.warn;

	console.warn = function () {
		throw new Error('Console should not warn');
	};

	try {
		new Ractive({
			template: '<component/>',
			components: {
				component: Ractive.extend({
					debug: true,
					computed: {
						foo: '${bar}'
					}
				})
			}
		});
	}
	catch(err){
		t.ok( false, err.message );
	}
	finally {
		console.warn = warn;
		t.ok( true );
	}

});

test( 'Unresolved computations resolve when parent component data exists', function ( t ) {
	var ractive, Component;

	Component = Ractive.extend({
	    template: '{{FOO}} {{BAR}}',
	    computed: {
	        FOO: '${foo}.toUpperCase()',
	        BAR: function () {
	            return this.get( 'bar' ).toUpperCase();
	        }
	    }
	});

	ractive = new Ractive({
	    el: fixture,
	    template: '<component/>',
	    data: {
	        foo: 'fee fi',
	        bar: 'fo fum'
	    },
	    components: {
	    	component: Component
	    }
	});

	t.equal( fixture.innerHTML, 'FEE FI FO FUM' );

});

test( 'Computations are not order dependent', function ( t ) {

	var ractive, Component;

	Component = Ractive.extend({
	    template: '{{foo}}',
	    data: {
	        count: 1
	    },
	    computed: {
	        foo: '${bar} + 1',
	        bar: '${count} + 1'
	    }
	});

	ractive = new Ractive({
        el: fixture,
        template: '<component/>',
        data: {
            bar: 20
        },
        components: {
            component: Component
        }
    });
	t.equal( fixture.innerHTML, '3' );

});

test( 'Parent extend instance computations are resolved before child computations', function ( t ) {

	var ractive, Base, Component;

	Base = Ractive.extend({
	    computed: {
	        base: () => 1
	    }
	});

	Component = Base.extend({
		template: '{{foo}}',
	    computed: {
	        foo: '${base} + 1'
	    }
	});

	ractive = new Ractive({
	    el: fixture,
	    template: '<component/>',
	    components: {
	    	component: Component
	    }
	});

	t.equal( fixture.innerHTML, '2' );

});

test( 'Computed values are only computed as necessary', function ( t ) {
	var ractive, count = { foo: 0, bar: 0, baz: 0, qux: 0 };

	ractive = new Ractive({
		el: fixture,
		template: '{{bar}}',
		data: {
			str: 'this is a string'
		},
		computed: {
			foo: function () {
				count.foo += 1;
				return this.get( 'baz' ).toUpperCase();
			},
			baz: function () {
				count.baz += 1;
				return this.get( 'str' ).replace( /string/i, 'computation' );
			},
			bar: function () {
				count.bar += 1;
				return this.get( 'foo' ) + '//' + this.get( 'foo' );
			},
			qux: function () {
				count.qux += 1;
				return 'whatever';
			}
		}
	});

	t.deepEqual( count, { foo: 1, bar: 1, baz: 1, qux: 0 });

	ractive.get( 'qux' );
	t.deepEqual( count, { foo: 1, bar: 1, baz: 1, qux: 1 });

	ractive.set( 'str', 'how long is a piece of string' );
	t.equal( fixture.innerHTML, 'HOW LONG IS A PIECE OF COMPUTATION//HOW LONG IS A PIECE OF COMPUTATION' );
	t.deepEqual( count, { foo: 2, bar: 2, baz: 2, qux: 1 });

	ractive.set( 'str', 'How Long Is A Piece Of String' );
	t.deepEqual( count, { foo: 3, bar: 2, baz: 3, qux: 1 });
});

test( 'Computations matching _[0-9]+ that are not references should not be mangled incorrectly for caching', t => {
	let ractive = new Ractive({
		el: fixture,
		template: '{{ foo["_1bar"] }} {{ foo["_2bar"] }}',
		data: { foo: { _1bar: 1, _2bar: 2 } }
	});

	t.htmlEqual( fixture.innerHTML, '1 2' );

	ractive = new Ractive({
		el: fixture,
		template: `{{ foo(bar, '_0') }} {{ foo(bar, '_1') }}`,
		data: { foo( a, b ) { return b; }, bar: 'ignored' }
	});

	t.htmlEqual( fixture.innerHTML, '_0 _1' );
});

test( 'Computations can depend on array values (#1747)', t => {
	let ractive = new Ractive({
		el: fixture,
		template: '{{count}} {{count === 4}}',
		data: {
			items: [ 1, 2, 3 ]
		},
		computed: {
			count: '${items}.length'
		}
	});

	t.htmlEqual( fixture.innerHTML, '3 false' );
	ractive.push( 'items', 4 );
	t.htmlEqual( fixture.innerHTML, '4 true' );
});

test( 'Computed value that calls itself (#1359)', t => {
	let messages = 0;

	let warn = console.warn;
	console.warn = msg => {
		if ( /computation indirectly called itself/.test( msg ) ) {
			messages += 1;
		}
	};

	let Widget = Ractive.extend({
		template: `
			{{sort(headers)}}

			{{#sort(rows)}}
				<p>{{id}} - {{name}}</p>
			{{/rows}}`,
		data: {
			headers: [],
			rows: [
				{ id : 1, name: 'a' },
				{}
			],
			sort ( arr ) {
				return arr.sort( ( a, b ) => a.id - b.id );
			}
		}
	});

	let ractive = new Widget({ el: fixture });

	ractive.reset();
	ractive.update();

	t.equal( messages, 2 );
	t.htmlEqual( fixture.innerHTML, '<p>1 - a</p><p> - </p>' );

	console.warn = warn;
});

// Commented out temporarily, see #1381
/*test( 'Computations don\'t mistakenly set when used in components (#1357)', function ( t ) {
	var ractive, Component;

	Component = Ractive.extend({
		template: "{{ a }}:{{ b }}",
	    computed: {
	        b: function() {
	            var a = this.get("a");
	            return a + "bar";
	        }
	    }
	});

	ractive = new Ractive({
	    el: fixture,
	    template: '{{ a }}:{{ b }}-<component a="{{ a }}" b="{{ b }}" />',
		components: {
	        component: Component
	    },
	    data: {
	        a: "foo"
	    }
	});

	t.equal( fixture.innerHTML, 'foo:foobar-foo:foobar' );
})

test( 'Computations depending up computed values cascade while updating (#1383)', ( t ) => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{#if a < 10}}less{{else}}more{{/if}}',
		data: {
			b: { c: 0 }
		},
		computed: {
			a: function() { return this.get('b').c; }
		}
	});

	t.equal( fixture.innerHTML, 'less' );
	ractive.set( 'b.c', 100 );
	t.equal( fixture.innerHTML, 'more' );
});*/
