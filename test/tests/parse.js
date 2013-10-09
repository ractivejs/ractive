// PARSING TESTS
// =============
//
// TODO: add moar samples

(function () {

	module( 'Parse' );

	tests = [
		{
			name: "Empty string",
			template: "",
			parsed: [""]
		},
		{
			name: "Mustache-less text",
			template: "a string",
			parsed: ["a string"]
		},
		{
			name: "Interpolator",
			template: "{{mustache}}",
			parsed: [{t:2,r:"mustache"}]
		},
		{
			name: "Triple",
			template: "{{{mustache}}}",
			parsed: [{t:3,r:"mustache"}]
		},
		{
			name: "Empty section",
			template: "{{#mustache}}{{/mustache}}",
			parsed: [{t:4,r:"mustache"}]
		},
		{
			name: "Section",
			template: "{{#mustache}}contents{{/mustache}}",
			parsed: [{"f":"contents",t:4,r:"mustache"}]
		},
		{
			name: "Interpolator with preceding text",
			template: "preceding text {{mustache}}",
			parsed: ["preceding text ",{t:2,r:"mustache"}]
		},
		{
			name: "Interpolator with following text",
			template: "{{mustache}} following text",
			parsed: [{t:2,r:"mustache"}," following text"]
		},
		{
			name: "Delimiter change",
			template: "{{=<% %>=}} <% mustache %>",
			parsed: [{t:2,r:"mustache"}]
		},
		{
			name: "Named index",
			template: "{{#items:i}}{{i}}: {{name}}{{/items}}",
			parsed: [{"f":[{r:"i",t:2},": ",{r:"name",t:2}],"i":"i",r:"items",t:4}]
		},
		{
			name: "Element with unquoted attributes",
			template: "<div class=test></div>",
			parsed: ["<div class=test></div>"]
		},
		{
			name: "Element with unquoted attributes and a mustache",
			template: "<div class=test>{{mustache}}</div>",
			parsed: [{t:7,e:"div",a:{"class":"test"},"f":[{t:2,r:"mustache"}]}]
		},
		{
			name: "Element with unquoted mustache attributes",
			template: "<div class={{myClass}}>contents</div>",
			parsed: [{a:{"class":[{r:"myClass",t:2}]},"f":"contents",e:"div",t:7}]
		},
		{
			name: "Template with blacklisted elements (sanitize)",
			template: "<style type='text/css'>body { font-family: 'Comic Sans MS'; }</style>",
			parsed: [""],
			options: {
				sanitize: true
			}
		},
		{
			name: "Template with blacklisted elements and mustaches (sanitize)",
			template: "<link rel='{{rel}}'>",
			parsed: [""],
			options: {
				sanitize: true
			}
		},
		{
			name: "Template with blacklisted elements (don't sanitize)",
			template: "<style type='text/css'>body { font-family: 'Comic Sans MS'; }</style>",
			parsed: ["<style type=text/css>body { font-family: 'Comic Sans MS'; }</style>"],
			options: {
				sanitize: false
			}
		},
		{
			name: "Template with blacklisted elements and mustaches (don't sanitize)",
			template: "<link rel='{{rel}}'>",
			parsed: [{a:{"rel":[{r:"rel",t:2}]},e:"link",t:7}],
			options: {
				sanitize: false
			}
		},
		{
			name: "Element with an event attribute (sanitize)",
			template: "<p onclick='doSomething();'>{{text}}</p>",
			parsed: [{"f":[{r:"text",t:2}],e:"p",t:7}],
			options: {
				sanitize: true
			}
		},
		{
			name: "Element with an event attribute (don't sanitize)",
			template: "<p onclick='doSomething();'>{{text}}</p>",
			parsed: [{a:{"onclick":"doSomething();"},"f":[{r:"text",t:2}],e:"p",t:7}],
			options: {
				sanitize: false
			}
		},
		{
			name: "SVG",
			template: "<svg xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"{{x}}\" cy=\"{{y}}\" r=\"{{r}}\"/></svg>",
			parsed: [{a:{"xmlns":"http://www.w3.org/2000/svg"},"f":[{a:{"cx":[{r:"x",t:2}],"cy":[{r:"y",t:2}],r:[{r:"r",t:2}]},e:"circle",t:7}],e:"svg",t:7}]
		},
		{
			name: "SVG with non-mustache text",
			template: "<svg xmlns=\"http://www.w3.org/2000/svg\"><text>some text</text></svg>",
			parsed: [{a:{"xmlns":"http://www.w3.org/2000/svg"},"f":[{"f":"some text",e:"text",t:7}],e:"svg",t:7}]
		},
		{
			name: "SVG with interpolator",
			template: "<svg xmlns=\"http://www.w3.org/2000/svg\"><text>{{hello}}</text></svg>",
			parsed: [{a:{"xmlns":"http://www.w3.org/2000/svg"},"f":[{"f":[{r:"hello",t:2}],e:"text",t:7}],e:"svg",t:7}]
		},
		{
			name: "SVG with interpolator and static text",
			template: "<svg xmlns=\"http://www.w3.org/2000/svg\"><text>Hello {{thing}}!</text></svg>",
			parsed: [{a:{"xmlns":"http://www.w3.org/2000/svg"},"f":[{"f":["Hello ",{r:"thing",t:2},"!"],e:"text",t:7}],e:"svg",t:7}]
		},
		{
			name: "Mixture of HTML-able and non-HTML-able elements in template",
			template: "<div><p>HTML</p><p>{{mustache}}</p></div>",
			parsed: [{t:7,e:"div","f":[{t:7,e:"p","f":"HTML"},{t:7,e:"p","f":[{t:2,r:"mustache"}]}]}]
		},
		{
			name: "Expression mustache",
			template: "{{( i + 1 )}}",
			parsed: [{t:2,"x":{r:["i"],"s":"${0}+1"}}]
		},
		{
			name: "Expression mustache with brackets",
			template: "{{( (i) + 1 )}}",
			parsed: [{t:2,"x":{r:["i"],"s":"(${0})+1"}}]
		},
		{
			name: "Nodes with id attributes and no mustaches don't get stringified",
			template: "<div id=test>plain old text</div>",
			parsed: [{t:7,e:"div",a:{"id":"test"},"f":"plain old text"}]
		},
		{
			name: "Mustache references can have numeric keys",
			template: "{{todos.0.content}}",
			parsed: [{r:"todos.0.content",t:2}]
		},
		{
			name: "Expression with keypath like foo.0.bar",
			template: "{{( process( foo.0.bar ) )}}",
			parsed: [{t:2,"x":{r:["process","foo.0.bar"],"s":"${0}(${1})"}}]
		},
		{
			name: "Expression with method",
			template: "{{( one.two.three() )}}",
			parsed: [{t:2,"x":{r:["one.two"],"s":"${0}.three()"}}]
		},
		{
			name: "Expression with indirectly-identified method",
			template: "{{( one.two[ three ]() )}}",
			parsed: [{t:2,"x":{r:["three","one.two"],"s":"${1}[${0}]()"}}]
		},
		{
			name: "Void tag with spaces",
			template: "<hr />{{foo}}",
			parsed: [{e:"hr",t:7},{r:"foo",t:2}]
		},
		{
			name: "Expression with JSON object",
			template: "{{( fn({ foo: 1, 'bar': 2, '0foo': 3, '0bar': { baz: 'test', arr: [ 1, 2, 3 ] } }) )}}",
			parsed: [{t:2,"x":{r:["fn"],"s":"${0}({foo:1,bar:2,\"0foo\":3,\"0bar\":{baz:\"test\",arr:[1,2,3]}})"}}]
		},
		{
			name: 'Invocation refinements',
			template: '{{ array.filter( someFilter ).length }}',
			parsed: [{t:2,"x":{r:["array","someFilter"],"s":"${0}.filter(${1}).length"}}]
		},
		{
			name: 'Boolean attributes',
			template: '<input value="{{value}}" autofocus>',
			parsed: [{t:7,e:"input",a:{"autofocus":null,"value":[{t:2,r:"value"}]}}]
		},
		{
			name: 'Methods on `this`',
			template: '{{ this.getId() }}',
			parsed: [{t:2,x:{r:['.'],s:'${0}.getId()'}}]
		},
		{
			name: 'Sloppy whitespace in tags',
			template: '<div class = "foo"></div>',
			parsed: ['<div class=foo></div>']
		},
		{
			name: 'HTML entities are treated correctly in pure string templates',
			template: 'Non&nbsp;breaking&nbsp;spaces&nbsp;',
			parsed: ['Non&nbsp;breaking&nbsp;spaces&nbsp;']
		},
		{
			name: 'HTML entities are treated correctly in regular templates',
			template: 'Non&nbsp;breaking&nbsp;spaces&nbsp;<div id="foo"></div>',
			parsed: ['Non\u00A0breaking\u00A0spaces\u00A0',{t:7,e:'div',a:{id:'foo'}}]
		},
		{
			name: 'HTML entities are treated correctly in pure string templates if semi-colon is omitted',
			template: 'Non&nbspbreaking&nbspspaces&nbsp',
			parsed: ['Non&nbspbreaking&nbspspaces&nbsp']
		},
		{
			name: 'HTML entities are treated correctly in regular templates if semi-colon is omitted',
			template: 'Non&nbspbreaking&nbspspaces&nbsp<div id="foo"></div>',
			parsed: ['Non\u00A0breaking\u00A0spaces\u00A0',{t:7,e:'div',a:{id:'foo'}}]
		},
		{
			name: 'Illegal code points between 128 and 159 are dealt with',
			template: 'Euro sign: &#128; &#8364; {{foo}}',
			parsed: ['Euro sign: \u20AC \u20AC ',{t:2,r:'foo'}]
		},
		{
			name: 'References can begin with browser globals',
			template: '{{ DateRange }}',
			parsed: [{t:2,r:'DateRange'}]
		},
		{
			name: 'Multiple method invocations',
			template: '{{ a.foo().bar() }}',
			parsed: [{t:2,x:{s:'${0}.foo().bar()',r:['a']}}]
		},
		{
			name: 'Backslash escapes in strings',
			template: '{{ ["\\\\ \\" \\\\", \'\\\\ \\\' \\\\\'] }}',
			parsed: [{t:2,x:{r:[],s:'["\\\\ \\" \\\\","\\\\ \' \\\\"]'}}]
		},
		{
			name: 'Unicode escapes in strings',
			template: '{{ "A\\u0042C" }}',
			parsed: [{t:2,x:{r:[],s:'"ABC"'}}]
		}

	];

	runTest = function ( theTest ) {
		test( theTest.name, function ( t ) {
			var parsed = Ractive.parse( theTest.template, theTest.options );

			t.deepEqual( parsed, theTest.parsed );
		});
	};

	for ( i=0; i<tests.length; i+=1 ) {
		runTest( tests[i] );
	}

}());