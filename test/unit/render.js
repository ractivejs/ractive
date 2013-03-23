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
		template: "{{#todos}}<li><label>{{todo}}</label><input value='{{todo}}'></li>{{/todos}}",
		data: {
			todos: [{todo:"debug Ractive"},{todo:"release Ractive"}]
		},
		result: "<li><label>debug Ractive</label><input value=\"debug Ractive\"></li><li><label>release Ractive</label><input value=\"release Ractive\"></li>"
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
		name: "Empty string attributes",
		template: "<p class=\"\">test</p>",
		result: "<p class=\"\">test</p>"
	},
	{
		name: 'Function values',
		template: '<p>{{message}}</p>',
		data: { message: function () { return 'functions work'; } },
		result: '<p>functions work</p>'
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
	}
];


_.each( tests, function ( t, i ) {
	test( t.name, function () {
		console.group(i+2);

		var ractive = new Ractive({
			el: fixture,
			data: t.data,
			template: t.template,
			partials: t.partials
		});

		equal( fixture.innerHTML, t.result );

		console.groupEnd();
	});
});