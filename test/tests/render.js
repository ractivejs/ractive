// RENDERING TESTS
// ===============
//
// TODO: add moar tests

(function () {

	var fixture = document.getElementById( 'qunit-fixture' ), tests, runTest, theTest, hasSvg, testDiv, testDiv2, getElements, compareContents, compareNode;

	testDiv = document.createElement( 'div' );
	testDiv2 = document.createElement( 'div' );

	module ( 'Render' );

	hasSvg = document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );

	// argh IE
	if ( ![].reduce ) {
		Array.prototype.reduce = function ( reducer, start ) {
			var i, len, reduced;

			reduced = start || 0;

			len = this.length;
			for ( i=0; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) ) {
					reduced = reducer( reduced, this[i] );
				}
			}

			return reduced;
		};
	}

	tests = [
		{
			name: "Empty model",
			template: "",
			result: ""
		},
		{
			name: "Plain text",
			template: "a string",
			result: "a string"
		},
		{
			name: "Single interpolator",
			template: "{{mustache}}",
			data: { mustache: "hello world" },
			result: "hello world"
		},
		{
			name: "Element containing single interpolator",
			template: "<p>{{mustache}}</p>",
			data: { mustache: "hello world" },
			result: "<p>hello world</p>"
		},
		{
			name: "Element containing interpolator surrounded by text",
			template: "<p>Hello {{mustache}}!</p>",
			data: { mustache: "world" },
			result: "<p>Hello world!</p>"
		},
		{
			name: "Section with index refs",
			template: "<ul>{{#items:i}}<li>{{i}}: {{name}}</li>{{/items}}</ul>",
			data: {
				items: [{name:"zero"},{name:"one"},{name:"two"}]
			},
			result: "<ul><li>0: zero</li><li>1: one</li><li>2: two</li></ul>"
		},
		{
			name: "Section with index refs in attributes",
			template: "<ul>{{#items:i}}<li data-id=\"{{i}}\">{{name}}</li>{{/items}}</ul>",
			data: {
				items: [{name:"zero"},{name:"one"},{name:"two"}]
			},
			result: "<ul><li data-id=\"0\">zero</li><li data-id=\"1\">one</li><li data-id=\"2\">two</li></ul>"
		},
		{
			name: "Element with attributes",
			template: "<p class='{{class_name}}'>text</p>",
			data: {
				"class_name": "it_works"
			},
			result: "<p class=\"it_works\">text</p>"
		},
		{
			name: "Section with descendant attributes",
			template: "{{#todos}}<li><label>{{todo}}</label><span class='{{status}}'>{{todo}}</span></li>{{/todos}}",
			data: {
				todos: [{todo:"debug Ractive",status:"complete"},{todo:"release Ractive",status:"incomplete"}]
			},
			result: "<li><label>debug Ractive</label><span class=\"complete\">debug Ractive</span></li><li><label>release Ractive</label><span class=\"incomplete\">release Ractive</span></li>"
		},
		
		// argh, fails in IE because of how it does innerHTML (i.e. wrongly). Skipping
		/*{
			name: "Section with descendant value attributes",
			template: "{{#todos}}<li><label>{{todo}}</label><input value='{{todo}}'></li>{{/todos}}",
			data: {
				todos: [{todo:"debug Ractive"},{todo:"release Ractive"}]
			},
			result: "<li><label>debug Ractive</label><input></li><li><label>release Ractive</label><input></li>"
		},*/

		{
			name: "Partials",
			template: "{{#items}}{{>item}}{{/items}}",
			data: {
				items: [{description:"Item the first"},{description:"Item the second"},{description:"Item the third"}]
			},
			partials: {
				item: "<p>{{description}}</p>"
			},
			result: "<p>Item the first</p><p>Item the second</p><p>Item the third</p>"
		},
		{
			name: 'Partials that compile as HTML',
			template: '<div>{{>partial}}</div>',
			data: { content: 'some text' },
			partials: { partial: '<p>{{content}}</p>' },
			result: '<div><p>some text</p></div>'
		},
		{
			name: 'Partials inherit index references',
			template: '<ul>{{#items:i}}{{>item}}{{/items}}</ul>',
			data: { items: [ 'zero', 'one', 'two', 'three' ] },
			partials: { item: '<li data-index="{{i}}">{{i}}: {{.}}</li>' },
			result: '<ul><li data-index="0">0: zero</li><li data-index="1">1: one</li><li data-index="2">2: two</li><li data-index="3">3: three</li></ul>'
		},
		{
			name: "Empty string attributes",
			template: "<p class=\"\">test</p>",
			result: "<p class=\"\">test</p>"
		},
		{
			name: 'Attribute with sections',
			template: '<ul>{{#todos:i}}<li data-index="{{i}}" class="{{#completed}}completed{{/completed}}{{^completed}}view{{/completed}}">{{desc}}</li>{{/todos}}</ul>',
			data: { todos: [{ desc: 'debug Ractive', completed: false }, { desc: 'release Ractive', completed: false }, { desc: 'make cup of tea', completed: true }]},
			result: '<ul><li data-index="0" class="view">debug Ractive</li><li data-index="1" class="view">release Ractive</li><li data-index="2" class="completed">make cup of tea</li></ul>'
		},
		{
			name: 'Conditional section with true condition',
			template: '{{#condition}}The condition is truthy{{/condition}}',
			data: { condition: true },
			result: 'The condition is truthy'
		},
		{
			name: 'Conditional section with false condition',
			template: '{{#condition}}The condition is truthy{{/condition}}',
			data: { condition: false },
			result: ''
		},
		{
			name: 'Inverted section with true condition',
			template: '{{^condition}}The condition is falsy{{/condition}}',
			data: { condition: true },
			result: ''
		},
		{
			name: 'Inverted section with false condition',
			template: '{{^condition}}The condition is falsy{{/condition}}',
			data: { condition: false },
			result: 'The condition is falsy'
		},
		{
			name: 'Triple',
			template: '<div>before {{{triple}}} after</div>',
			data: { triple: '<strong>bold</strong> <em>italic</em>' },
			result: '<div>before <strong>bold</strong> <em>italic</em> after</div>',
			new_data: { triple: '<em>italic</em> <strong>bold</strong>' },
			new_result: '<div>before <em>italic</em> <strong>bold</strong> after</div>'
		},
		{
			name: 'SVG',
			template: '<svg><circle cx="{{x}}" cy="{{y}}" r="{{r}}"/></svg>',
			data: { x: 50, y: 50, r: 50 },
			result: '<svg><circle cx="50" cy="50" r="50"></circle></svg>',
			svg: true
		},
		{
			name: 'SVG with non-mustache text',
			template: '<svg><text>some text</text></svg>',
			data: {},
			result: '<svg><text>some text</text></svg>',
			svg: true
		},
		{
			name: 'SVG with interpolator',
			template: '<svg><text>{{hello}}</text></svg>',
			data: { hello: 'Hello world!' },
			result: '<svg><text>Hello world!</text></svg>',
			svg: true
		},
		{
			name: 'SVG with interpolator and static text',
			template: '<svg><text>Hello {{thing}}!</text></svg>',
			data: { thing: 'world' },
			result: '<svg><text>Hello world!</text></svg>',
			svg: true
		},
		{
			name: 'Basic expression',
			template: '{{( "test".toUpperCase() )}}',
			result: 'TEST'
		},
		{
			name: 'Expression with a single reference',
			template: '{{( ref )}}',
			data: { ref: 'success' },
			result: 'success'
		},
		{
			name: 'Arithmetic expression',
			template: '{{( number * 2 )}}',
			data: { number: 10 },
			result: '20'
		},
		{
			name: 'Arithmetic expression with update',
			template: '{{( number * 2 )}}',
			data: { number: 10 },
			new_data: { number: 20 },
			result: '20',
			new_result: '40'
		},
		{
			name: 'Arithmetic expression with missing data',
			template: '{{( number * 2 )}}',
			result: ''
		},
		{
			name: 'Arithmetic expression with missing data and update',
			template: '{{( number * 2 )}}',
			new_data: { number: 20 },
			result: '',
			new_result: '40'
		},
		{
			name: 'Arithmetic expression with index reference',
			template: '<ul>{{#items:i}}<li>{{( i + 1 )}}: {{.}}</li>{{/items}}</ul>',
			data: { items: [ 'a', 'b', 'c' ] },
			result: '<ul><li>1: a</li><li>2: b</li><li>3: c</li></ul>'
		},
		{
			name: 'Conditional expression',
			template: '<p class="{{( done ? \"complete\" : \"incomplete\" )}}">{{desc}}{{( done ? "" : " (pending)" )}}</p>',
			data: { desc: 'Write more tests', done: true },
			result: '<p class="complete">Write more tests</p>',
			new_data: { done: false },
			new_result: '<p class="incomplete">Write more tests (pending)</p>'
		},
		{
			name: 'Invocation expression',
			template: '<p>The population of {{country}} is {{( format(population) )}}.</p>',
			data: {
				country: 'the UK',
				population: 62641000,
				format: function ( num ) {
					if ( num > 1000000000 ) return ( num / 1000000000 ).toFixed( 1 ) + ' billion';
					if ( num > 1000000 ) return ( num / 1000000 ).toFixed( 1 ) + ' million';
					if ( num > 1000 ) return ( Math.floor( num / 1000 ) ) + ',' + ( num % 1000 );
					return num;
				}
			},
			result: '<p>The population of the UK is 62.6 million.</p>'
		},
		{
			name: 'Responding to downstream changes',
			template: '<p>Total: {{( total( numbers ) )}}</p>',
			data: {
				numbers: [ 1, 2, 3, 4 ],
				total: function ( numbers ) {
					return numbers.reduce( function ( prev, curr ) {
						return prev + curr;
					});
				}
			},
			result: '<p>Total: 10</p>',
			new_data: {
				'numbers[4]': 5
			},
			new_result: '<p>Total: 15</p>'
		},
		{
			name: 'Attribute with nested mustaches',
			template: '<svg viewBox="{{#viewBox}}{{x}} {{y}} {{width}} {{height}}{{/viewBox}}">{{#rect}}<rect x="{{x}}" y="{{y}}" width="{{width}}" height="{{height}}"/>{{/rect}}</svg>',
			data: {
				viewBox: { x: 0,  y: 0,  width: 100, height: 100 },
				rect:    { x: 10, y: 10, width: 80,  height: 80  }
			},
			result: '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80"></rect></svg>',
			new_data: {
				viewBox: { x: 50,  y: 50,  width: 350, height: 350 },
				rect:    { x: 20,  y: 20,  width: 200, height: 100 }
			},
			new_result: '<svg viewBox="50 50 350 350"><rect x="20" y="20" width="200" height="100"></rect></svg>',
			svg: true
		},
		{
			name: 'List section with non-self-updating attributes',
			template: '<ul>{{#items}}<li data-info="{{#info}}{{a}} {{b}} {{c}}{{/info}}"></li>{{/items}}</ul>',
			data: {
				items: [{ info: { a: 1, b: 2, c: 3 } }]
			},
			result: '<ul><li data-info="1 2 3"></li></ul>',
			new_data: {
				items: [{ info: { a: 1, b: 2, c: 3 } }, { info: { a: 4, b: 5, c: 6 } }]
			},
			new_result: '<ul><li data-info="1 2 3"></li><li data-info="4 5 6"></li></ul>'
		},
		{
			name: 'Section with non-explicitly-closed element',
			template: '<ul>{{#items}}<li>{{.}}{{/items}}</ul>',
			data: { items: [ 'a', 'b', 'c' ]},
			result: '<ul><li>a</li><li>b</li><li>c</li></ul>',
			new_data: { items: [ 'd', 'e', 'f' ]},
			new_result: '<ul><li>d</li><li>e</li><li>f</li></ul>'
		},
		{
			name: 'Whitespace is stripped from start and end of templates',
			template: '     <p>{{content}}</p>      ',
			data: { content: 'test' },
			result: '<p>test</p>'
		},
		{
			name: 'Whitespace is stripped from start and end of templates without mustaches',
			template: '     <p>test</p>      ',
			result: '<p>test</p>'
		},
		{
			name: 'Expression with implicit iterator',
			template: '<ul>{{#items}}<li>{{( uppercase( . ) )}}</li>{{/items}}</ul>',
			data: { items: [ 'a', 'b', 'c' ], uppercase: function ( str ) { return str.toUpperCase(); } },
			result: '<ul><li>A</li><li>B</li><li>C</li></ul>',
			new_data: { items: [ 'd', 'e', 'f' ]},
			new_result: '<ul><li>D</li><li>E</li><li>F</li></ul>'
		},
		{
			name: 'Element with transitions',
			template: '<div intro="slideIn" outro="slideOut">{{content}}</div>',
			data: { content: 'test' },
			result: '<div>test</div>'
		},
		{
			name: 'Input with dynamic (but not two-way) name attribute',
			template: '{{#list:i}}<input name="test{{i}}">{{/list}}',
			data: { list: [ 'a', 'b', 'c' ] },
			result: '<input name="test0"><input name="test1"><input name="test2">'
		}
	];


	getElements = function ( nodeList ) {
		var elements = [], i = nodeList.length;

		while ( i-- ) {
			if ( nodeList[i].nodeType === 1 ) {
				elements[ elements.length ] = nodeList[i];
			}
		}

		return elements;
	};

	compareContents = function ( a, b ) {
		var i, aChildren, bChildren;

		if ( a.textContent !== b.textContent ) {
			return false;
		}

		aChildren = ( a.children ? a.children : getElements( a.childNodes ) );
		bChildren = ( b.children ? b.children : getElements( b.childNodes ) );

		if ( aChildren.length !== bChildren.length ) {
			return false;
		}

		i = aChildren.length;
		while ( i-- ) {
			if ( !compareNode( aChildren[i], bChildren[i] ) ) {
				return false;
			}
		}

		return true;
	};

	compareNode = function ( a, b ) {
		var i, attrName;

		if ( a.nodeType !== b.nodeType ) {
			return false;
		}

		if ( a.nodeType === 3 ) {
			if ( a.data !== b.data ) {
				return false;
			}

			return true;
		}

		if ( a.tagName.toLowerCase() !== b.tagName.toLowerCase() ) {
			return false;
		}

		// compare attributes
		if ( a.attributes.length !== b.attributes.length ) {
			return false;
		}

		i = a.attributes.length;
		while ( i-- ) {
			attrName = a.attributes[i].name;

			if ( !b.hasAttribute( attrName ) || b.getAttribute( attrName ) !== a.getAttribute( attrName ) ) {
				return false;
			}
		}

		return compareContents( a, b );
	};


	runTest = function ( theTest ) {
		test( theTest.name, function ( t ) {
			var view, expected, result, same;

			// necessary for IE
			testDiv.innerHTML = theTest.result;
			//expected = fixture.innerHTML;

			window.view = view = new Ractive({
				el: fixture,
				data: theTest.data,
				template: theTest.template,
				partials: theTest.partials
			});

			testDiv2.innerHTML = view.renderHTML();

			same = compareContents( fixture, testDiv );
			t.ok( same );

			same = compareContents( testDiv2, testDiv );
			t.ok( same );

			if ( theTest.new_data ) {
				view.set( theTest.new_data );
				testDiv.innerHTML = theTest.new_result;
				testDiv2.innerHTML = view.renderHTML();

				same = compareContents( fixture, testDiv );
				t.ok( same );

				same = compareContents( testDiv2, testDiv );
				t.ok( same );
			}
		});
	};

	for ( i=0; i<tests.length; i+=1 ) {
		theTest = tests[i];

		if ( !hasSvg && theTest.svg ) {
			continue;
		}

		runTest( tests[i] );
	}

}());