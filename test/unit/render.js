// RENDERING TESTS
// ===============
//
// This loads in the render.json sample file and checks that each compiled
// template, in combination with the sample data, produces the expected
// HTML.
//
// TODO: add moar samples

QUnit.config.reorder = false;

var fixture = document.getElementById( 'qunit-fixture' ), tests;

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
	{
		name: "Section with descendant value attributes",
		template: "{{#todos}}<li><label>{{todo}}</label><input value='{{todo}}'></li>{{/todos}}",
		data: {
			todos: [{todo:"debug Ractive"},{todo:"release Ractive"}]
		},
		result: "<li><label>debug Ractive</label><input></li><li><label>release Ractive</label><input></li>"
	},
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
		template: '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="{{x}}" cy="{{y}}" r="{{r}}"/></svg>',
		data: { x: 50, y: 50, r: 50 },
		result: '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50"></circle></svg>'
	},
	{
		name: 'SVG with non-mustache text',
		template: '<svg xmlns="http://www.w3.org/2000/svg"><text>some text</text></svg>',
		data: {},
		result: '<svg xmlns="http://www.w3.org/2000/svg"><text>some text</text></svg>'
	},
	{
		name: 'SVG with interpolator',
		template: '<svg xmlns="http://www.w3.org/2000/svg"><text>{{hello}}</text></svg>',
		data: { hello: 'Hello world!' },
		result: '<svg xmlns="http://www.w3.org/2000/svg"><text>Hello world!</text></svg>'
	},
	{
		name: 'SVG with interpolator and static text',
		template: '<svg xmlns="http://www.w3.org/2000/svg"><text>Hello {{thing}}!</text></svg>',
		data: { thing: 'world' },
		result: '<svg xmlns="http://www.w3.org/2000/svg"><text>Hello world!</text></svg>'
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
	}
];


_.each( tests, function ( t, i ) {
	test( t.name, function () {
		console.group(i+1);

		var view;

		window.view = view = new Ractive({
			el: fixture,
			data: t.data,
			template: t.template,
			partials: t.partials
		});

		equal( fixture.innerHTML, t.result );

		if ( t.new_data ) {
			view.set( t.new_data );
			equal( fixture.innerHTML, t.new_result );
		}

		console.groupEnd();
	});
});