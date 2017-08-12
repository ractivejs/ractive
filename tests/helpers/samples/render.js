/* global navigator */
const phantom = typeof navigator !== 'undefined' ? /phantom/i.test( navigator.userAgent ) : false;
const ie = typeof navigator !== 'undefined' ? /msie/i.test( navigator.userAgent ) : false;

const renderTests = [
	{
		name: 'Empty model',
		template: '',
		result: ''
	},
	{
		name: 'Plain text',
		template: `a string`,
		result: `a string`
	},
	{
		name: 'Single interpolator',
		template: `{{mustache}}`,
		data: { mustache: 'hello world' },
		result: `hello world`
	},
	{
		name: 'Element containing single interpolator',
		template: `<p>{{mustache}}</p>`,
		data: { mustache: 'hello world' },
		result: `<p>hello world</p>`
	},
	{
		name: 'Element containing interpolator surrounded by text',
		template: `<p>Hello {{mustache}}!</p>`,
		data: { mustache: 'world' },
		result: `<p>Hello world!</p>`
	},
	{
		name: 'Single keypath expression',
		template: `{{foo[bar]}}`,
		data: { foo: { a: 'hello', b: 'goodbye' }, bar: 'a' },
		result: 'hello',
		new_data: { bar: 'b' },
		new_result: 'goodbye'
	},
	{
		name: 'Double keypath expression',
		template: `{{foo[bar][qux]}}`,
		data: { foo: { a: { b: 'hello world' } }, bar: 'a', qux: 'b' },
		result: `hello world`
	},
	{
		name: 'Child reference updates with change of parent object',
		template: `{{#with foo}}{{bar}}{{/with}}`,
		data: { foo: { bar: 'qux' } },
		result: 'qux',
		new_data: { foo: { bar: 'updated' } },
		new_result: 'updated'
	},
	{
		name: 'Section with index refs',
		template: `<ul>{{#items:i}}<li>{{i}}: {{name}}</li>{{/items}}</ul>`,
		data: {
			items: [{ name: 'zero' }, { name: 'one' }, { name: 'two' }]
		},
		result: `<ul><li>0: zero</li><li>1: one</li><li>2: two</li></ul>`
	},
	{
		name: 'Section with index refs in attributes',
		template: `<ul>{{#items:i}}<li data-id='{{i}}'>{{name}}</li>{{/items}}</ul>`,
		data: {
			items: [{ name: 'zero' }, { name: 'one' }, { name: 'two' }]
		},
		result: `<ul><li data-id='0'>zero</li><li data-id='1'>one</li><li data-id='2'>two</li></ul>`
	},
	{
		name: 'Element with attributes',
		template: `<p class='{{class_name}}'>text</p>`,
		data: {
			class_name: 'it_works'
		},
		result: `<p class='it_works'>text</p>`
	},
	{
		name: 'Section with descendant attributes',
		template: `{{#todos}}<li><label>{{todo}}</label><span class='{{status}}'>{{todo}}</span></li>{{/todos}}`,
		data: {
			todos: [{todo:'debug Ractive',status:'complete'},{todo:'release Ractive',status:'incomplete'}]
		},
		result: `<li><label>debug Ractive</label><span class='complete'>debug Ractive</span></li><li><label>release Ractive</label><span class='incomplete'>release Ractive</span></li>`
	},
	{
		name: 'Partials',
		template: `{{#items}}{{>item}}{{/items}}`,
		data: {
			items: [{description:'Item the first'},{description:'Item the second'},{description:'Item the third'}]
		},
		partials: {
			item: '<p>{{description}}</p>'
		},
		result: `<p>Item the first</p><p>Item the second</p><p>Item the third</p>`
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
		name: 'Static string attributes',
		template: `<p class='myclass'>test</p>`,
		result: `<p class='myclass'>test</p>`
	},
	{
		name: 'Empty string attributes',
		template: `<p class=''>test</p>`,
		result: `<p class=''>test</p>`
	},
	{
		name: 'Empty string boolean attributes',
		template: `<input type='checkbox' checked='' />`,
		result: `<input type='checkbox' checked />`
	},
	{
		name: 'Contenteditale without a value binding works with toHTML',
		template: `<div contenteditable=''>edit me</div>`,
		result: `<div contenteditable=''>edit me</div>`
	},
	{
		name: 'Attribute with sections',
		template: '<ul>{{#todos:i}}<li data-index="{{i}}" class="{{#completed}}completed{{/completed}}{{^completed}}view{{/completed}}">{{desc}}</li>{{/todos}}</ul>',
		data: { todos: [{ desc: 'debug Ractive', completed: false }, { desc: 'release Ractive', completed: false }, { desc: 'make cup of tea', completed: true }]},
		result: '<ul><li class="view" data-index="0">debug Ractive</li><li class="view" data-index="1">release Ractive</li><li class="completed" data-index="2">make cup of tea</li></ul>'
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
		name: 'Static',
		template: '<div>[[color]]</div>',
		data: { color: 'purple' },
		result: '<div>purple</div>',
		new_data: { color: 'orange' },
		new_result: '<div>purple</div>'
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
		name: 'Arithmetic expression',
		template: '{{ number * 2 }}',
		data: { number: 10 },
		result: '20'
	},
	{
		name: 'Arithmetic expression with update',
		template: '{{ number * 2 }}',
		data: { number: 10 },
		new_data: { number: 20 },
		result: '20',
		new_result: '40'
	},
	{
		name: 'Arithmetic expression with missing data',
		template: '{{ number * 2 }}',
		result: 'NaN'
	},
	{
		name: 'Arithmetic expression with missing data and update',
		template: '{{ number * 2 }}',
		new_data: { number: 20 },
		result: 'NaN',
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
			format ( num ) {
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
			total ( numbers ) {
				return numbers.reduce( ( prev, curr ) => {
					return prev + curr;
				}, 0 );
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
		name: 'Element without close tag inside if-elseif-else section',
		template: '{{#if who == 1}}<div>1{{elseif who === 2}}<div>2{{else}}<div>else{{/if}}',
		data:  { who: 1 },
		result: '<div>1</div>',
		steps: [
			{
				data:  { who: 2 },
				result: '<div>2</div>'
			},
			{
				data: { who: 3 },
				result: '<div>else</div>'
			}
		]
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
		data: { items: [ 'a', 'b', 'c' ], uppercase ( str ) { return str.toUpperCase(); } },
		result: '<ul><li>A</li><li>B</li><li>C</li></ul>',
		new_data: { items: [ 'd', 'e', 'f' ]},
		new_result: '<ul><li>D</li><li>E</li><li>F</li></ul>'
	},
	{
		name: 'Input with dynamic (but not two-way) name attribute',
		template: '{{#list:i}}<input name="test{{i}}">{{/list}}',
		data: { list: [ 'a', 'b', 'c' ] },
		result: '<input name="test0"><input name="test1"><input name="test2">'
	},
	{
		name: 'Ancestor references',
		template: '{{#foo}}{{#bar}}{{#baz}}<p>{{value}}</p><p>{{../value}}</p><p>{{../../value}}</p>{{/baz}}{{/bar}}{{/foo}}',
		data: { foo: { value: 'foo', bar: { value: 'bar', baz: { value: 'baz' } } } },
		result: '<p>baz</p><p>bar</p><p>foo</p>'
	},
	{
		name: 'Restricted references',
		template: '<pre>{{#foo}}{{bar}} {{.bar}} {{./bar}} {{baz}} {{.baz}} {{./baz}}{{/foo}}</pre>',
		data: { bar: 'bartop', baz: 'baztop', foo: { bar: 'barfoo' } },
		result: '<pre>barfoo barfoo barfoo baztop  </pre>'
	},
	{
		name: 'Conditional expression with unresolved condition',
		template: '{{ foobar ? "YES" : "NO"}}',
		data: {},
		result: 'NO'
	},
	{
		name: 'Conditional section with unresolved reference in expression',
		template: '{{#( ! foobar )}}NO{{/()}}',
		data: {},
		result: 'NO'
	},
	{
		name: 'Conditional section with references to undefined',
		template: '{{#( foobar === undefined )}}undefined{{/()}}',
		data: { foobar: undefined },
		result: 'undefined'
	},
	{
		name: 'Dependencies can be declared with this.get() inside expression functions',
		template: '{{ area() }}',
		data: { width: 50, height: 50, area () { return this.get( 'width' ) * this.get( 'height' ); } },
		result: '2500',
		new_data: { width: 100 },
		new_result: '5000'
	},
	{
		name: 'Triples work correctly inside table elements',
		template: `
			<table>{{{row}}}</table>
			<table><thead>{{{headerRow}}}</thead></table>
			<table><tbody>{{{row}}}</tbody></table>
			<table><tr>{{{cell}}}</tr></table>
			<table><tr><td>{{{cellContents}}}</td></tr></table>
			<table><tr><th>{{{cellContents}}}</th></tr></table>`,
		data: {
			row: '<tr><td>works</td></tr>',
			headerRow: '<tr><th>works</th></tr>',
			cell: '<td>works</td>',
			cellContents: 'works'
		},
		result: `
			<table><tr><td>works</td></tr></table>
			<table><thead><tr><th>works</th></tr></thead></table>
			<table><tbody><tr><td>works</td></tr></tbody></table>
			<table><tr><td>works</td></tr></table>
			<table><tr><td>works</td></tr></table>
			<table><tr><th>works</th></tr></table>`,
		new_data: {
			row: '<tr><td>still works</td></tr>',
			headerRow: '<tr><th>still works</th></tr>',
			cell: '<td>still works</td>',
			cellContents: 'still works'
		},
		new_result: `
			<table><tr><td>still works</td></tr></table>
			<table><thead><tr><th>still works</th></tr></thead></table>
			<table><tbody><tr><td>still works</td></tr></tbody></table>
			<table><tr><td>still works</td></tr></table>
			<table><tr><td>still works</td></tr></table>
			<table><tr><th>still works</th></tr></table>`
	},
	{
		name: 'Triples work correctly inside select elements',
		template: '<select>{{{options}}}</select>',
		data: { options: '<option value="1">one</option><option value="2">two</option><option value="3">three</option>' },
		result: '<select><option value="1">one</option><option value="2">two</option><option value="3">three</option></select>',
		new_data: { options: '<option value="4">four</option><option value="5">five</option><option value="6">six</option>' },
		new_result: '<select><option value="4">four</option><option value="5">five</option><option value="6">six</option></select>'
	},
	{
		name: 'Class name on an SVG element',
		template: '<svg><text class="label">foo</text></svg>',
		result: '<svg><text class=label>foo</text></svg>',
		svg: true
	},
	{
		name: 'Multiple angle brackets are correctly escaped, both with render() and renderHTML()',
		template: '{{foo}}',
		data: { foo: '<p>test</p>' },
		result: '&lt;p&gt;test&lt;/p&gt;'
	},
	{
		name: 'Angle brackets should not be escaped inside script tags',
		template: '<script>(function () { var html="<p>{{html}}</p>";var foo = 4 < 3; }());</script>',
		data: { html: 'some <strong>html</strong>' },
		result: '<script>(function () { var html="<p>some <strong>html</strong></p>";var foo = 4 < 3; }());</script>'
	},
	{
		name: 'Section iterating over a hash',
		template: '<ul>{{#items:key}}<li>{{key}}: {{this}}</li>{{/items}}</ul>',
		data: { items: { a: 1, b: 2, c: 3 } },
		result: '<ul><li>a: 1</li><li>b: 2</li><li>c: 3</li></ul>',
		new_data: { items: { c: 3, d: 4, e: 5 } },
		new_result: '<ul><li>c: 3</li><li>d: 4</li><li>e: 5</li></ul>'
	},
	{
		name: 'Null values in the viewmodel',
		template: '<p>{{foo}}</p>',
		data: { foo: null },
		result: '<p></p>'
	},
	{
		name: 'Null values in the viewmodel, with a triple',
		template: '<p>{{{foo}}}</p>',
		data: { foo: null },
		result: '<p></p>'
	},
	{
		name: 'Null values in the viewmodel, with an attribute',
		template: '<p class="foo-{{bar}}">test</p>',
		data: { bar: null },
		result: '<p class="foo-">test</p>'
	},
	{
		name: 'Inverted section with restricted reference',
		template: '<p>{{^.foo}}this should appear{{/.foo}}</p>',
		result: '<p>this should appear</p>'
	},
	{
		name: 'Setting child properties of null values creates object',
		template: '{{foo.bar}}',
		data: { foo: null },
		result: '',
		new_data: { 'foo.bar': 'works' },
		new_result: 'works'
	},
	{
		name: 'Children of sections with partially resolved evaluator',
		template: '{{# foo || {} }}{{bar}}{{/ foo || {} }}',
		data: {},
		result: '',
		new_data: { foo: { bar: 'works' } },
		new_result: 'works'
	},
	{
		name: 'Different expressions that share a keypath in unresolved state',
		template: '{{identity(foo)}} / {{identity(bar)}}',
		data: { identity ( val ) { return val; } },
		result: ' / ',
		new_data: { foo: 'one', bar: 'two', identity ( val ) { return val; } },
		new_result: 'one / two'
	},
	{
		name: 'Properties of functions render correctly (#451)',
		template: '{{foo.prop}}-{{#foo}}{{prop}}{{/foo}}',
		data () {
			function foo () {}
			foo.prop = 'works';
			return { foo };
		},
		result: 'works-works',
		new_data: { 'foo.prop': 'still works' },
		new_result: 'still works-still works'
	},
	{
		name: 'style tags in svg',
		template: '<svg><style>text { font-size: 40px }</style></svg>',
		result: '<svg><style>text { font-size: 40px }</style></svg>',
		svg: true
	},

	// Elements with two-way bindings should render correctly with .toHTML() - #446
	{
		nodeOnly: true,
		name: 'Two-way select bindings',
		template: '<select value="{{foo}}"><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>',
		data: {},
		result: '<select><option value="a" selected>a</option><option value="b">b</option><option value="c">c</option></select>',
		new_data: { foo: 'c' },
		new_result: '<select><option value="a">a</option><option value="b">b</option><option value="c" selected>c</option></select>'
	},
	{
		nodeOnly: true,
		name: 'Two-way select bindings inside list',
		template: '<select value="{{selected}}">{{#items}}<option value="{{.}}">{{.}}</option>{{/items}}</select>',
		data: { selected: 2, items: [1,2,3] },
		result: '<select><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option></select>',
		new_data: { selected: 3 },
		new_result: '<select><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option></select>'
	},
	{
		nodeOnly: true,
		name: 'Two-way multiple select bindings',
		template: '<select multiple value="{{foo}}"><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>',
		data: {},
		result: '<select multiple><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>',
		new_data: { foo: [ 'b', 'c' ] },
		new_result: '<select multiple><option value="a">a</option><option value="b" selected>b</option><option value="c" selected>c</option></select>'
	},
	{
		nodeOnly: true,
		name: 'Two-way radio buttons',
		template: '<input type="radio" name="{{foo}}" value="one"><input type="radio" name="{{foo}}" value="two">',
		data: { foo: 'one' },
		result: '<input type="radio" name="{{foo}}" value="one" checked><input type="radio" name="{{foo}}" value="two">',
		new_data: { foo: 'two' },
		new_result: '<input type="radio" name="{{foo}}" value="one"><input type="radio" name="{{foo}}" value="two" checked>'
	},

	//unresolved expressions
	{
		name: 'Keypath expression with unresolved member resolves',
		template: '{{foo[bar]}}',
		data: { foo: { boo: 'bizz' } },
		result: '',
		new_data: { bar: 'boo' },
		new_result: 'bizz'
	},
	{
		name: 'Keypath expression with top level unresolved',
		template: '{{foo[bar]}}',
		data: { bar: 'boo' },
		result: '',
		new_data: { foo: { boo: 'bizz' } },
		new_result: 'bizz'
	},
	{
		name: 'Nested keypath expression with top level unresolved',
		template: '{{#item}}{{foo[bar]}}{{/}}',
		data: { bar: 'boo' },
		result: '',
		new_data: { item: { foo: { boo: 'bizz' } } },
		new_result: 'bizz'
	},
	{
		name: 'Keypath expression with array index member',
		template: '{{foo[bar]}}',
		data: { foo: ['fizz', 'bizz'], bar: 0 },
		result: 'fizz',
		new_data: { bar: 1 },
		new_result: 'bizz'
	},
	{
		name: 'Keypath expression with unrooted references and array index member',
		template: '{{#item}}{{foo[bar]}}{{/}}',
		data: { item: { foo: ['fizz', 'bizz'], bar: 0 } },
		result: 'fizz',
		new_data: { item: { foo: ['fizz', 'bizz'], bar: 1 } },
		new_result: 'bizz'
	},
	{
		name: 'Attribute value with characters that need to be escaped',
		template: '<div class="{{className}}"></div>',
		data: { className: '"find & \'replace\'"' },
		result: '<div class="&quot;find &amp; &#39;replace&#39;&quot;"></div>'
	},
	{
		nodeOnly: true, // fixture.innerHTML doesn't work in our favour
		name: 'Boolean attributes',
		template: '<input type="checkbox" checked="{{isChecked}}">',
		data: { isChecked: true },
		result: '<input type=checkbox checked>',
		new_data: { isChecked: false },
		new_result: '<input type=checkbox>'
	},
	{
		name: 'References resolve on the basis of the first key (#522)',
		template: '{{#foo}}{{bar.baz}}{{/foo}}',
		data: { foo: { bar: {} }, bar: { baz: 'hello' } },
		result: '',
		new_data: { foo: { bar: { baz: 'goodbye' } }, bar: { baz: 'hello' } },
		new_result: 'goodbye'
	},
	{
		name: '{{#each object}}...{{/each}} works',
		template: '{{#each object}}<p>{{this}}</p>{{/each}}',
		data: { object: { foo: 1, bar: 2, baz: 3 } },
		result: '<p>1</p><p>2</p><p>3</p>',
		new_data: { object: { bar: 2, baz: 4, qux: 5 } },
		new_result: '<p>2</p><p>4</p><p>5</p>'
	},
	{
		name: 'two indices in an #each with object give access to the key and index',
		template: '{{#object:k,i}}<p>{{k}} {{i}} {{.}}</p>{{/}}',
		data: { object: { foo: 1, bar: 2, baz: 3 } },
		result: '<p>foo 0 1</p><p>bar 1 2</p><p>baz 2 3</p>'
	},
	// Commenting out - this seems like an necessary thing to support
	// {
	// 	name: 'the key ref in an #each switches to index if the value turns into an array',
	// 	template: '{{#object:k,i}}<p>{{k}} {{i}} {{.}}</p>{{/each}}',
	// 	data: { object: { foo: 1, bar: 2, baz: 3 } },
	// 	result: '<p>foo 0 1</p><p>bar 1 2</p><p>baz 2 3</p>',
	// 	new_data: { object: [ 1, 2, 3 ] },
	// 	new_result: '<p>0 0 1</p><p>1 1 2</p><p>2 2 3</p>'
	// },
	// {
	// 	name: 'the key ref in an #each switches to key if the value turns into an object',
	// 	template: '{{#object:k,i}}<p>{{k}} {{i}} {{.}}</p>{{/each}}',
	// 	data: { object: [ 1, 2, 3 ] },
	// 	result: '<p>0 0 1</p><p>1 1 2</p><p>2 2 3</p>',
	// 	new_data: { object: { foo: 1, bar: 2, baz: 3 } },
	// 	new_result: '<p>foo 0 1</p><p>bar 1 2</p><p>baz 2 3</p>'
	// },
	{
		name: '@index can be used as an index reference',
		template: '{{#each items}}<p>{{@index}}: {{this}}</p>{{/each}}',
		data: { items: [ 'a', 'b', 'c' ] },
		result: '<p>0: a</p><p>1: b</p><p>2: c</p>'
	},
	{
		name: '@key can be used as a key reference',
		template: '{{#each object}}<p>{{@key}}: {{this}}</p>{{/each}}',
		data: { object: { foo: 1, bar: 2, baz: 3 } },
		result: '<p>foo: 1</p><p>bar: 2</p><p>baz: 3</p>'
	},
	{
		name: '@key can be used as an index reference for arrays',
		template: '{{#each array}}<p>{{@key}}: {{this}}</p>{{/each}}',
		data: { array: [ 'foo', 'bar', 'baz' ] },
		result: '<p>0: foo</p><p>1: bar</p><p>2: baz</p>'
	},
	{
		name: '@index can be used as an index reference with object sections',
		template: '{{#each object}}<p>{{@key}} {{@index}} {{.}}</p>{{/each}}',
		data: { object: { foo: 1, bar: 2, baz: 3 } },
		result: '<p>foo 0 1</p><p>bar 1 2</p><p>baz 2 3</p>'
	},
	{
		name: '@key and @index can be used in an expression with object sections',
		template: '{{#each object}}<p>{{@key + "!"}} {{@index + 1}} {{.}}</p>{{/each}}',
		data: { object: { foo: 1, bar: 2, baz: 3 } },
		result: '<p>foo! 1 1</p><p>bar! 2 2</p><p>baz! 3 3</p>'
	},
	{
		name: 'key and index refs can be used in an expression with object sections',
		template: '{{#each object: k, i }}<p>{{k + "!"}} {{i + 1}} {{.}}</p>{{/each}}',
		data: { object: { foo: 1, bar: 2, baz: 3 } },
		result: '<p>foo! 1 1</p><p>bar! 2 2</p><p>baz! 3 3</p>'
	},
	{
		name: '@index can be used in an expression',
		template: '{{#each items}}<p>{{@index + 1}}: {{this}}</p>{{/each}}',
		data: { items: [ 'a', 'b', 'c' ] },
		result: '<p>1: a</p><p>2: b</p><p>3: c</p>'
	},
	{
		name: '@index can be used in a reference expression',
		template: '{{#each items}}<p>{{items[@index]}} - {{items[@index+1]}}</p>{{/each}}',
		data: { items: [ 'a', 'b', 'c' ] },
		result: '<p>a - b</p><p>b - c</p><p>c - </p>'
	},
	{
		name: '@index can be used within an each in an if',
		template: '{{#each items}}{{#if . === \'a\' }}{{.}}-{{@index}}{{/if}}{{/each}}',
		data: { items: [ 'a', 'b', 'c' ] },
		result: 'a-0'
	},
	{
		name: '@index can be used within an attribute',
		template: '{{#each items}}<p id="p{{@index}}">{{.}}</p>{{/each}}',
		data: { items: [ 'a', 'b', 'c' ] },
		result: '<p id="p0">a</p><p id="p1">b</p><p id="p2">c</p>'
	},
	{
		name: '{{#each items}}...{{else}}...{{/each}}',
		template: '{{#each items}}<p>{{this}}</p>{{else}}<p>no items!</p>{{/each}}',
		data: { items: [ 'a', 'b', 'c' ] },
		result: '<p>a</p><p>b</p><p>c</p>',
		new_data: { items: null },
		new_result: '<p>no items!</p>'
	},
	{
		name: '{{#with foo}}...{{else}}...{{/with}}',
		template: '{{#with foo}}<p>{{this}}</p>{{else}}<p>no foo!</p>{{/with}}',
		data: { foo: 'bar' },
		result: '<p>bar</p>',
		new_data: { foo: null },
		new_result: '<p>no foo!</p>'
	},
	{
		name: '{{#each foo}}...{{else}}...{{/each}}',
		template: '{{#each foo}}<p>{{@key}}:{{.}}</p>{{else}}<p>empty foo!</p>{{/each}}',
		data: { foo: {bar : 'qux'} },
		result: '<p>bar:qux</p>',
		new_data: { foo: {} },
		new_result: '<p>empty foo!</p>'
	},
	{
		name: '#if/else with true static expression',
		template: '{{#if true}}yes{{else}}no{{/if}}',
		result: 'yes'
	},
	{
		name: '#if/else with false static expression',
		template: '{{#if false}}yes{{else}}no{{/if}}',
		result: 'no'
	},
	{
		name: '#if/else with true keypath expression',
		template: '{{#if foo[bar]}}yes{{else}}no{{/if}}',
		data: { foo: { a: true, b: false }, bar: 'a' },
		result: 'yes'
	},
	{
		name: '#if/else with false keypath expression',
		template: '{{#if foo[bar]}}yes{{else}}no{{/if}}',
		data: { foo: { a: true, b: false }, bar: 'b' },
		result: 'no'
	},
	{
		name: '#if/else with true reference expression',
		template: '{{#if (foo+1<12)}}yes{{else}}no{{/if}}',
		data: { foo: 6 },
		result: 'yes'
	},
	{
		name: '#if/else with false reference expression',
		template: '{{#if (foo+1<12)}}yes{{else}}no{{/if}}',
		data: { foo: 16 },
		result: 'no'
	},
	{
		name: '#if/else for a class attribute inside an array',
		template: '{{#items}}<div class="{{#if value}}truthy{{else}}falsey{{/if}}"></div>{{/items}}',
		data: {items: [1]},
		result: '<div class="falsey"></div>'
	},
	{
		name: '#if/else (multiple) for a class attribute inside an array',
		template: '{{#items}}<div class="{{#if value}}value{{elseif value2}}value2{{else}}falsey{{/if}}"></div>{{/items}}',
		data: {items: [1]},
		result: '<div class="falsey"></div>'
	},
	{
		name: '#if/else with empty array',
		template: '{{#if list}}yep{{else}}nope{{/if}}',
		data: { list: [] },
		result: 'nope',
		new_data: { list: [ 1 ] },
		new_result: 'yep'
	},
	{
		name: '#if/else with empty object',
		template: '{{#if obj}}yep{{else}}nope{{/if}}',
		data: { obj: {} },
		result: 'nope',
		new_data: { obj: { yep: true } },
		new_result: 'yep'
	},
	{
		name: 'Restricting references with `this`',
		template: '{{#foo}}{{this.bar}}{{/foo}}',
		data: { foo: {}, bar: 'fail' },
		result: '',
		new_data: { foo: { bar: 'success' }, bar: 'fail' },
		new_result: 'success'
	},
	{
		name: 'Triple inside an unrendering section (#726)',
		template: '{{#condition}}{{{getTriple(condition)}}}{{/condition}}',
		data: { condition: true, getTriple: ( condition ) => condition ? 'yes' : 'no' },
		result: 'yes',
		new_data: { condition: false },
		new_result: ''
	},
	{
		name: 'Reference expression with sub-expression',
		template: '{{ foo[ "ba" + letter ].prop}}',
		data: { foo: { bar: { prop: 'one' }, baz: { prop: 'two' } }, letter: 'r' },
		result: 'one',
		new_data: { foo: { bar: { prop: 'one' }, baz: { prop: 'two' } }, letter: 'z' },
		new_result: 'two'
	},
	{
		name: 'Empty non-boolean attributes (#878)',
		template: '<div data-attr></div>',
		result: '<div data-attr></div>'
	},
	{
		name: 'Falsy boolean attributes',
		template: '<video autoplay="{{foo}}"></video>',
		result: '<video></video>'
	},
	{
		name: 'Truthy aria attributes (#1011)',
		template: '<span aria-haspopup="{{#yes}}true{{/yes}}">...</span>',
		data: { yes: true },
		result: '<span aria-haspopup="true">...</span>'
	},
	{
		name: 'Falsy aria attributes (#1011)',
		template: '<span aria-haspopup="{{^yes}}false{{/yes}}">...</span>',
		data: { yes: false },
		result: '<span aria-haspopup="false">...</span>'
	},
	{
		name: 'Root-level reference',
		template: '{{#a}}{{#b}}{{#c}}{{~/foo}}{{/c}}{{/b}}{{/a}}',
		data: { foo: 'top', a: { b: { c: { foo: 'c' }, foo: 'b' }, foo: 'a' } },
		result: 'top'
	},
	{
		name: 'else in non-Handlebars blocks',
		template: '{{#foo}}yes{{else}}no{{/foo}}',
		data: { foo: true },
		result: 'yes',
		new_data: { foo: false },
		new_result: 'no'
	},
	{
		name: 'Double-rendering bug (#748) is prevented',
		template: '{{#foo}}{{#f(this)}}{{this}}{{/f}}{{/foo}}',
		data: {
			foo: [
				[ 2, 1, 4, 3 ]
			],
			f ( x ) {
				return x.sort( ( a, b ) => b - a );
			}
		},
		result: '4321'
	},
	{
		name: 'Attribute values are passed through as strings, not parsed (#1007)',
		template: `<p data-foo="{foo:'{{foo}}'}"></p>`,
		data: { foo: 'bar' },
		result: `<p data-foo="{foo:'bar'}"></p>`
	},
	{
		name: '<datalist> is supported (#1033)',
		template: '<datalist id="test">{{#list}}<option value="{{this}}"></option>{{/list}}</datalist>',
		data: { list: [ 'a', 'b', 'c' ] },
		result: '<datalist id="test"><option value="a"></option><option value="b"></option><option value="c"></option></datalist>'
	},
	{
		name: 'Expressions are transported safely',
		template: '{{foo+_0+"_0"+"${0}"}}',
		data: { foo: 'bar', _0: 'baz' },
		result: 'barbaz_0${0}'
	},
	{
		name: '@index in attributes (#1035)',
		template: '{{#each foo}}<p data-index="{{@index}}"></p>{{/each}}',
		data: { foo: [ 'a', 'b', 'c' ] },
		result: '<p data-index="0"></p><p data-index="1"></p><p data-index="2"></p>'
	},
	{
		name: 'Boolean attributes work correctly (#1078)',
		template: '<input type="text" readOnly value="{{value}}"><input type="text" readonly value="anything">',
		data: { value: '' },
		result: '<input type="text" readOnly value=""><input type="text" readonly value="anything">'
	},
	{
		name: 'ContentEditable works correctly (#1078)',
		template: '<span contenteditable value="abc<div></div>"></span>',
		result: '<span contenteditable>abc<div></div></span>'
	},
	{
		name: 'Partial at end of attribute (#1082)',
		template: '<div class="box {{>color}}"/>',
		partials: { color: 'red' },
		result: '<div class="box red"/>'
	},
	{
		name: 'Triples with falsy values',
		template: '{{#each values}}{{{this}}}{{/each}}',
		data: { values: [ 0, false, undefined, '', null ] },
		result: '0false'
	},

	// https://github.com/ractivejs/ractive/issues/1221
	{
		name: 'HTML entities in static attributes',
		template: '<span data-foo="&#x2713;"></span>',
		result: '<span data-foo="&#x2713;"></span>'
	},
	{
		name: 'HTML entities in dynamic attributes',
		template: '<span data-foo="{{foo}}"></span>',
		data: { foo: '&#x2713;' },
		result: '<span data-foo="&amp;#x2713;"></span>'
	},
	{
		name: 'HTML entities in triples in attributes',
		template: '<span data-foo="{{{foo}}}"></span>',
		data: { foo: '&#x2713;' },
		result: '<span data-foo="&#x2713;"></span>'
	},
	{
		name: '&amp; stays as &amp;',
		template: '<span>&amp;#x2713;</span>',
		result: '<span>&amp;#x2713;</span>'
	},
	{
		name: 'Hexadecimal entities',
		template: '<span>&#x3F;</span>',
		result: '<span>&#x3F;</span>'
	},
	{
		name: 'HTML entities are treated correctly in pure string templates',
		template: 'Non&nbsp;breaking&nbsp;spaces&nbsp;',
		result: 'Non\u00A0breaking\u00A0spaces\u00A0'
	},
	{
		name: 'HTML entities are treated correctly in regular templates',
		template: 'Non&nbsp;breaking&nbsp;spaces&nbsp;<div id="foo"></div>',
		result: 'Non\u00A0breaking\u00A0spaces\u00A0<div id="foo"></div>'
	},
	{
		name: 'HTML entities are treated correctly in pure string templates if semi-colon is omitted',
		template: 'Non&nbspbreaking&nbspspaces&nbsp',
		result: 'Non\u00A0breaking\u00A0spaces\u00A0'
	},
	{
		name: 'HTML entities are treated correctly in regular templates if semi-colon is omitted',
		template: 'Non&nbspbreaking&nbspspaces&nbsp<div id="foo"></div>',
		result: 'Non\u00A0breaking\u00A0spaces\u00A0<div id="foo"></div>'
	},
	{
		name: 'Illegal code points between 128 and 159 are dealt with',
		template: 'Euro sign: &#128; &#8364;',
		result: 'Euro sign: &#128; &#8364;'
	},

	// CONDITIONAL ATTRIBUTES
	{
		name: 'Basic mustache attribute',
		template: '<div {{foo}}></div>',
		data: { foo: 'class="foo"' },
		result: '<div class="foo"></div>'
	},
	{
		name: 'Conditional mustache attribute',
		template: '<div {{#if foo}}class="bar"{{/if}}></div>',
		data: { foo: true },
		result: '<div class="bar"></div>',
		new_data: { foo: false },
		new_result: '<div></div>'
	},
	{
		name: 'Partial mustache attribute',
		template: '<div {{>style}}></div>',
		partials: { style: 'style="background-color: black; color: white"' },
		result: '<div style="background-color: black; color: white"></div>'
	},
	{
		name: '<option> with empty value attribute (docs #138)',
		template: '<select><option value="">Option 0</option><option value="1">Option 1</option></select>',
		result: '<select><option value="">Option 0</option><option value="1">Option 1</option></select>'
	},
	{
		name: '@keypath may be used to refer to the current context',
		template: `<ul>{{#items}}{{#some}}<li>{{@keypath}} - {{path}}</li>{{/}}{{/}}</ul>`,
		data: { items: [ { some: { path: 'a' } }, { notsome: { path: 'b' } }, { some: { path: 'c' } } ] },
		result: `<ul><li>items.0.some - a</li><li>items.2.some - c</li></ul>`
	},
	{
		name: '@keypath ref followed by something with parens reads correctly',
		template: `<ul>{{#items}}{{#some}}<li>{{@keypath}} - {{path.toLowerCase()}}</li>{{/}}{{/}}</ul>`,
		data: { items: [ { some: { path: 'a' } }, { notsome: { path: 'b' } }, { some: { path: 'c' } } ] },
		result: `<ul><li>items.0.some - a</li><li>items.2.some - c</li></ul>`
	},
	{
		name: '@key references can be strings that look like numbers',
		template: '{{#each object:k}}{{@key}} {{k}}{{/each}}',
		data: { object: { '0001': 1 } },
		result: '0001 0001'
	},
	{
		name: 'if...else in conditional attribute',
		template: '<p {{#if foo}}data-foo="yes"{{else}}data-bar="nope"{{/if}}></p>',
		data: { foo: true },
		result: '<p data-foo="yes"></p>',
		new_data: { foo: false },
		new_result: '<p data-bar="nope"></p>'
	},
	{
		name: 'conditional boolean attribute',
		template: '<input type="checkbox" {{#if foo}}checked{{/if}} />',
		data: { foo: true },
		result: '<input type="checkbox" checked />',
		new_data: { foo: false },
		new_result: '<input type="checkbox" />'
	},

	// elseif
	{
		name: 'elseif can be used within if',
		template: '{{#if foo}}foo{{elseif bar}}bar{{else}}other{{/if}}',
		data: { bar: true },
		result: 'bar',
		new_data: { bar: false },
		new_result: 'other'
	},
	{
		name: 'multiple elseif can be used within if',
		template: '{{#if foo}}foo{{elseif bar}}bar{{elseif baz}}baz{{else}}other{{/if}}',
		data: { foo: true, baz: true },
		result: 'foo',
		new_data: { foo: false },
		new_result: 'baz'
	},
	{
		name: 'elseif can be used within each',
		template: '{{#each foo}}foo{{elseif bar}}bar{{else}}other{{/each}}',
		data: { foo: [], bar: true },
		result: 'bar',
		new_data: { bar: false },
		new_result: 'other'
	},
	{
		name: 'elseif can be used within a populated each',
		template: '{{#each foo}}foo{{elseif bar}}bar{{else}}other{{/each}}',
		data: { foo: [ 1, 2, 3 ], bar: true },
		result: 'foofoofoo',
		new_data: { foo: null },
		new_result: 'bar'
	},
	{
		name: 'elseif can be used within with',
		template: '{{#with foo}}foo{{elseif bar}}bar{{else}}other{{/with}}',
		data: { bar: true },
		result: 'bar',
		new_data: { foo: { x: 1 } },
		new_result: 'foo'
	},
	{
		name: 'nested elseif',
		template: '{{#foo}}foo{{#bar}}foobar{{elseif foo}}foofoo{{/}}{{elseif baz}}baz{{#bar}}bazbar{{else}}fin{{/}}{{/}}',
		data: { foo: true, bar: true, baz: true },
		result: 'foofoobar',
		new_data: { foo: false },
		new_result: 'bazbazbar'
	},
	{
		name: 'nested elseif - part 2',
		template: '{{#foo}}foo{{#bar}}foobar{{elseif foo}}foofoo{{/}}{{elseif baz}}baz{{#bar}}bazbar{{else}}fin{{/}}{{/}}',
		data: { foo: true, bar: false, baz: false },
		result: 'foofoofoo',
		new_data: { foo: false },
		new_result: ''
	},
	{
		name: 'nested elseif - part 3',
		template: '{{#foo}}foo{{#bar}}foobar{{elseif foo}}foofoo{{/}}{{elseif baz}}baz{{#bar}}bazbar{{else}}fin{{/}}{{/}}',
		data: { foo: false, baz: true },
		result: 'bazfin'
	},
	{
		name: 'elseif in attribute',
		template: '<p class="{{#if foo}}foo{{elseif bar}}bar{{else}}other{{/if}}">result</p>',
		data: { bar: true },
		result: '<p class="bar">result</p>',
		new_data: { bar: null },
		new_result: '<p class="other">result</p>'
	},
	{
		name: 'elseif in conditional attribute',
		template: '<p {{#if foo}}data-foo="foo"{{elseif bar}}data-foo="bar"{{else}}data-foo="other"{{/if}}>result</p>',
		data: { bar: true },
		result: '<p data-foo="bar">result</p>',
		new_data: { bar: null },
		new_result: '<p data-foo="other">result</p>'
	},
	{
		name: 'complex elseif',
		template: '{{#foo < 21 && bar < 12}}first{{elseif max(4, 5, x, 7) < y * 2}}second{{else}}third{{/}}',
		data: { max, foo: 22, bar: 13 },
		result: 'third',
		steps: [
			{
				data: { foo: 20, bar: 11 },
				result: 'first'
			},
			{
				data: { foo: 30, x: 10, y: 200 },
				result: 'second'
			}
		]
	},
	{
		name: 'regexp expression',
		template: '{{#/abc/.test(foo)}}regexp matched{{else}}{{"rOplacod".replace(/o/ig, "e")}}{{/}}',
		data: {},
		result: 'replaced',
		new_data: { foo: '12abc34' },
		new_result: 'regexp matched'
	},
	{
		name: 'undefined/null attributes',
		template: `<div data-foo='{{foo}}' data-bar='{{bar}}' data-baz='{{baz}}'></div>`,
		data: { foo: 'a', bar: 'b' },
		result: `<div data-foo='a' data-bar='b'></div>`,
		new_data: { foo: null, bar: undefined, baz: 'c' },
		new_result: `<div data-baz='c'></div>`
	},
	{
		name: 'Section with empty object (implicit with)',
		template: '{{#with foo}}{{/with}}',
		data: { foo: {} },
		result: ''
	},
	{
		name: 'Section with empty object (implicit with)',
		template: '{{#foo}}{{/}}',
		data: { foo: {} },
		result: ''
	},
	{
		name: 'Leading/trailing line break inside elements is stripped (#1851)',
		template: '<pre>\rfoo\n</pre><textarea>\r\nfoo\r</textarea>',
		result: '<pre>foo</pre><textarea>foo</textarea>'
	},
	{
		name: 'No whitespace other than leading/trailing line break is stripped (#1851)',
		template: '<pre>\r\tfoo\n\t</pre><textarea>\r\n\tfoo\r\t</textarea>',
		result: '<pre>\tfoo\n\t</pre><textarea>\tfoo\r\t</textarea>'
	},
	{
		name: 'An array ref can go from null to set in a generic section and still work (#2178)',
		template: '{{#foo}}{{.}}{{/foo}}',
		data: { foo: null },
		result: '',
		steps: [
			{
				data: { foo: [ 1, 2, 3 ] },
				result: '123'
			}
		]
	},
	{
		name: 'Model should be able to properly resolve class instances as context',
		template: '<div class="{{prototypeProperty}}"></div>{{#items}}<div class="{{prototypeProperty}}"></div>{{/items}}',
		data () {
			function parent () {}
			parent.prototype.prototypeProperty = 'hello';

			function child () {}
			child.prototype = new parent();

			const data = new child();
			data.items = [data];

			return data;
		},
		result: '<div class="hello"></div><div class="hello"></div>'
	},
	{
		name: `Escaped '.'s in keypaths`,
		template: `{{foo\\.bar\\.baz}}{{foo.bar\\.baz}}{{foo.bar.baz}}`,
		data: { 'foo.bar.baz': 1, foo: { 'bar.baz': 2, bar: { baz: 3 } } },
		result: '123',
		new_data: { 'foo\\.bar\\.baz': 3 },
		new_result: '323'
	},
	{
		name: `Escaped '.'s in refined keypaths`,
		template: `{{.['foo.bar']}}{{foo['bar.baz']}}{{foo['bar']['baz']}}`,
		data: { 'foo.bar': 1, foo: { 'bar.baz': 2, bar: { baz: 3 } } },
		result: '123',
		new_data: { 'foo\\.bar': 3 },
		new_result: '323'
	},
	{
		name: `Escaped '.'s in reference expressions`,
		template: `{{foo[key]}}`,
		data: { foo: { 'bar.baz': 'yep' }, key: 'bar.baz' },
		result: 'yep',
		new_data: { 'foo.bar\\.baz': 'nope' },
		new_result: 'nope'
	},
	{
		name: 'Rendering order of repeated section with complex condition (#2204)',
		template: `
			<div>
				{{#each fields :n}}
					{{#if n === 0 && foo }}
						{{this}}
					{{else}}
						{{this}}
					{{/if}}
				{{/each}}
			</div>
		`,
		data: {
			fields: [ 'x', 'y' ],
			foo: true
		},
		result: '<div>xy</div>',
		new_data: {
			fields: [ 'x', 'y' ],
			foo: false
		},
		new_result: '<div>xy</div>'
	},
	{
		name: 'Boolean attributes are set using setAttribute() if needed (#2201)',
		template: `<div itemscope="{{foo}}"></div>`,
		data: { foo: true },
		result: '<div itemscope=""></div>',
		new_data: { foo: false },
		new_result: '<div></div>'
	},
	{
		name: 'Boolean attributes that have a string value, render the string value (#3023)',
		template: `<div itemscope="{{foo}}"></div>`,
		data: { foo: 'sure?' },
		result: '<div itemscope="sure?"></div>',
		new_data: { foo: false },
		new_result: '<div></div>'
	},
	{
		name: '`undefined` and `null` can be used as object keys (#1878)',
		template: `{{dict[null]}}, {{dict[undefined]}}`,
		data: {
			dict: {
				null: 'null value',
				undefined: 'undefined value'
			}
		},
		result: 'null value, undefined value'
	},
	{
		name: 'HTML entities inside <textarea> are decoded (#2218)',
		template: '<textarea>&acute;&eacute;</textarea>',
		result: '<textarea>´é</textarea>'
	},
	{
		name: '`name` attribute is interpolated if input isn\'t a radio button (#2230)',
		template: '<input name="{{name}}">',
		data: { name: 'foo' },
		result: '<input name="foo">'
	},
	{
		name: 'Object, Boolean, String, Number are available in templates',
		template: '{{Object.keys(foo)}} {{Boolean(1)}} {{String(42)[0]}} {{Number("42").toFixed(1)}}',
		data: { foo: { a: 1, b: 2 } },
		result: 'a,b true 4 42.0'
	},
	{
		name: 'keyword reference',
		template: '{{new}}',
		data: { new: 'old' },
		result: 'old'
	},
	{
		name: 'int lit in an interpolator is a number, not a reference (#2397)',
		template: '{{123}}',
		result: '123'
	},
	{
		name: 'integers can be aliased (#2397)',
		template: '{{#with 1 as num, 42 as answer}}{{num}} {{answer}}{{/with}}',
		result: '1 42'
	},
	{
		name: '{{#with obj}} doesn\'t render if obj is false/null/undefined',
		template: '{{#with obj}}foo{{/with}}',
		result: ''
	},
	{
		name: '{{@key}} references aren\'t escaped',
		template: '{{#each obj}}{{@key}}{{/each}}',
		data: { obj: { 'foo.bar': 1 } },
		result: 'foo.bar'
	},
	{
		name: '{{#obj}} doesn\'t render if obj is empty',
		template: '{{#obj}}foo{{/obj}}',
		data: { obj: {} },
		result: ''
	},
	{
		name: '{{#obj}} renders if obj is truthy',
		template: '{{#obj}}foo{{/obj}}',
		data: { obj: { x: 1 } },
		result: 'foo'
	},
	{
		name: 'regression test for #2490',
		template: '{{#obj:key}}{{key}},{{@key}},{{@index}}{{/obj}}',
		data: {},
		result: '',
		new_data: { obj: { key1: true, key2: true, key3: true } },
		new_result: 'key1,key1,0key2,key2,1key3,key3,2'
	},
	{
		name: 'class directives',
		template: '<span class-foo-bar="foo" class-otherBaz="bat === 0"></span>',
		result: '<span></span>',
		new_data: { foo: true, bat: 0 },
		new_result: '<span class="foo-bar otherBaz"></span>'
	},
	{
		name: 'style directives',
		template: `<span style-display="{{ foo ? 'block' : 'inline-block' }}"></span>`,
		result: '<span style="display: inline-block;"></span>',
		new_data: { foo: true },
		new_result: '<span style="display: block;"></span>'
	},
	{
		name: `{{#with foo}} renders if foo is {} or [], but not any other form of falsey`,
		template: '{{#with foo}}yep{{else}}nope{{/with}}',
		result: 'nope',
		steps: [
			{
				data: { foo: {} },
				result: 'yep'
			},
			{
				data: { foo: [] },
				result: 'yep'
			},
			{
				data: { foo: undefined },
				result: 'nope'
			}
		]
	},
	{
		name: `{{#foo}} doesn't render if foo is empty or falsey`,
		template: '{{#foo}}yep{{else}}nope{{/}}',
		result: 'nope',
		steps: [
			{
				data: { foo: {} },
				result: 'nope'
			},
			{
				data: { foo: [] },
				result: 'nope'
			},
			{
				data: { foo: undefined },
				result: 'nope'
			}
		]
	}
];

function max() { return Math.max.apply(Math, Array.prototype.slice.call(arguments, 0)); }

if ( !phantom ) {
	// ugh, this fails in PhantomJS, which doesn't return namespaced attributes from
	// innerHTML correctly. Skipping. See https://github.com/ractivejs/ractive/pull/1184
	// adding the xmlns fails the test in chrome, and leaving it off also fails the test in chrome... meh
	/*renderTests.push({
		name: 'Element with namespaced attributes',
		template: `<svg viewBox='0 0 10 10'><use xlink:href='/vector.svg#{{href}}'></use></svg>`,
		data: {
			href: 'check'
		},
		result: `<svg viewBox='0 0 10 10'><use xlink:href='/vector.svg#check'></use></svg>`
	});*/

	renderTests.push(
		{
			name: 'Static mustaches in attributes (#1147)',
			template: '<img style="width: [[width]]px;">',
			data: { width: 100 },
			result: `<img style="width: 100px;${ phantom ? ' ' : '' }">`,
			new_data: { width: 200 },
			new_result: `<img style="width: 100px;${ phantom ? ' ' : '' }">`
		},
		{
			name: 'Section in attribute',
			template: '<div style="{{#red}}color: red;{{/}}">{{#red}}is red{{/red}}</div>',
			data: { red: true },
			result: `<div style="color: red;${ phantom ? ' ' : '' }">is red</div>`,
			new_data: { red: false },
			new_result: '<div style=""></div>'
		}
	);
}

if ( ie ) {
	// argh, fails in IE because of how it does innerHTML (i.e. wrongly). Skipping
	renderTests.push({
		name: 'Section with descendant value attributes',
		template: `{{#todos}}<li><label>{{todo}}</label><input value='{{todo}}'></li>{{/todos}}`,
		data: {
			todos: [{todo:'debug Ractive'},{todo:'release Ractive'}]
		},
		result: `<li><label>debug Ractive</label><input></li><li><label>release Ractive</label><input></li>`
	});
}

export default renderTests;
