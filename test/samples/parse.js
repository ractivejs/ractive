var parseTests = [
	{
		name: "Empty string",
		template: "",
		parsed: []
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
		parsed: [{"f":["contents"],t:4,r:"mustache"}]
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
		parsed: [{"a":{"class":"test"},"e":"div","t":7}]
	},
	{
		name: "Element with unquoted attributes and a mustache",
		template: "<div class=test>{{mustache}}</div>",
		parsed: [{t:7,e:"div",a:{"class":"test"},"f":[{t:2,r:"mustache"}]}]
	},
	{
		name: "Element with unquoted mustache attributes",
		template: "<div class={{myClass}}>contents</div>",
		parsed: [{a:{"class":[{r:"myClass",t:2}]},"f":["contents"],e:"div",t:7}]
	},
	{
		name: "Plain HTML",
		template: '<div><span>ok</span><span>ok2</span>contents</div>',
		parsed:
			[ { t: 7,
			    e: 'div',
			    f:
			     [ { t: 7, e: 'span', f: ['ok'] },
			       { t: 7, e: 'span', f: ['ok2'] },
			       'contents' ] } ]
	},
	{
		name: "Template with blacklisted elements (sanitize)",
		template: "<style type='text/css'>body { font-family: 'Comic Sans MS'; }</style>",
		parsed: [],
		options: {
			sanitize: true
		}
	},
	{
		name: "Template with blacklisted elements and mustaches (sanitize)",
		template: "<link rel='{{rel}}'>",
		parsed: [],
		options: {
			sanitize: true
		}
	},
	{
		name: "Template with blacklisted elements (don't sanitize)",
		template: "<style type='text/css'>body { font-family: 'Comic Sans MS'; }</style>",
		parsed: [{"a":{"type":"text/css"},"e":"style","f":["body { font-family: 'Comic Sans MS'; }"],"t":7}],
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
		parsed: [{a:{"xmlns":"http://www.w3.org/2000/svg"},"f":[{"f":["some text"],e:"text",t:7}],e:"svg",t:7}]
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
		parsed: [{t:7,e:"div","f":[{t:7,e:"p","f":["HTML"]},{t:7,e:"p","f":[{t:2,r:"mustache"}]}]}]
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
		parsed: [{t:7,e:"div",a:{"id":"test"},"f":["plain old text"]}]
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
		parsed: [{t:7,e:"input",a:{"autofocus":0,"value":[{t:2,r:"value"}]}}]
	},
	{
		name: 'Methods on `this`',
		template: '{{ this.getId() }}',
		parsed: [{t:2,x:{r:['.'],s:'${0}.getId()'}}]
	},
	{
		name: 'Sloppy whitespace in tags',
		template: '<div class = "foo"></div>',
		parsed: [{"a":{"class":"foo"},"e":"div","t":7}]
	},
	{
		name: 'HTML entities are treated correctly in pure string templates',
		template: 'Non&nbsp;breaking&nbsp;spaces&nbsp;',
		parsed: ['Non\u00A0breaking\u00A0spaces\u00A0']
	},
	{
		name: 'HTML entities are treated correctly in regular templates',
		template: 'Non&nbsp;breaking&nbsp;spaces&nbsp;<div id="foo"></div>',
		parsed: ['Non\u00A0breaking\u00A0spaces\u00A0',{t:7,e:'div',a:{id:'foo'}}]
	},
	{
		name: 'HTML entities are treated correctly in pure string templates if semi-colon is omitted',
		template: 'Non&nbspbreaking&nbspspaces&nbsp',
		parsed: ['Non\u00A0breaking\u00A0spaces\u00A0']
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
		name: 'Whitespace before mustache type character',
		template: '{{ # foo }}blah{{ / foo }}',
		parsed: [{t:4,r:'foo',f:['blah']}]
	},
	{
		name: 'Intro and outro with no parameters',
		template: '<div intro="fade" outro="fade"></div>',
		parsed: [{t:7,e:'div',t1:'fade',t2:'fade'}]
	},
	{
		name: 'Intro and outro with simple parameters',
		template: '<div intro="fade:400" outro="fade:fast"></div>',
		parsed: [{t:7,e:'div',t1:{a:[400],n:'fade'},t2:{a:'fast',n:'fade'}}]
	},
	{
		name: 'Intro and outro with JSON parameters',
		template: "<div intro='fade:{\"delay\":50}' outro='fade:{\"duration\":500}'></div>",
		parsed: [{t:7,e:'div',t1:{a:[{delay:50}],n:'fade'},t2:{a:[{duration:500}],n:'fade'}}]
	},
	{
		name: 'Intro and outro with JSON-like parameters',
		template: "<div intro='fade:{delay:50}' outro='fade:{duration:500}'></div>",
		parsed: [{t:7,e:'div',t1:{a:[{delay:50}],n:'fade'},t2:{a:[{duration:500}],n:'fade'}}]
	},
	{
		name: 'Intro and outro with dynamic parameters',
		template: "<div intro='fade:{\"delay\":{{i*50}}}' outro='fade:{\"delay\":{{i*50}}}'></div>",
		parsed: [{t:7,e:'div',t1:{d:['{"delay":',{t:2,x:{r:['i'],s:'${0}*50'}},'}'],n:'fade'},t2:{d:['{"delay":',{t:2,x:{r:['i'],s:'${0}*50'}},'}'],n:'fade'}}]
	},
	{
		name: 'Doctype declarations are handled',
		template: '<!doctype html><html><head></head><body></body></html>',
		parsed: [{t:7,e:'doctype',y:1,a:{html:0}},{t:7,e:'html',f:[{t:7,e:'head'},{t:7,e:'body'}]}]
	},
	{
		name: 'Comments are stripped by default',
		template: '<!-- this will disappear --><p>foo <!-- so will this --></p>',
		parsed: [{"e":"p","f":["foo"],"t":7}]
	},
	{
		name: 'Comments are left if required',
		template: '<!-- this will not disappear --><p>{{foo}} <!-- nor will this --></p>',
		parsed: [{t:9,c:' this will not disappear '},{t:7,e:'p',f:[{t:2,r:'foo'},' ',{t:9,c:' nor will this '}]}],
		options: { stripComments: false }
	},
	{
		name: 'XML namespaces are handled',
		template: '<fb:like href="{{href}}" send="true" show_faces="false"></fb:like>',
		parsed: [{t:7,e:'fb:like',a:{href:[{t:2,r:'href'}],send:'true',show_faces:'false'}}]
	},
	{
		name: 'Basic decorator',
		template: '<div decorator="foo">{{bar}}</div>',
		parsed: [{t:7,e:'div',o:'foo',f:[{t:2,r:'bar'}]}]
	},
	{
		name: 'Decorator with arguments',
		template: '<div decorator="foo:1,2,3">{{bar}}</div>',
		parsed: [{t:7,e:'div',o:{n:'foo',a:[1,2,3]},f:[{t:2,r:'bar'}]}]
	},
	{
		name: 'Decorator with dynamic arguments',
		template: '<div decorator="foo:{{baz}}">{{bar}}</div>',
		parsed: [{t:7,e:'div',o:{n:'foo',d:[{t:2,r:'baz'}]},f:[{t:2,r:'bar'}]}]
	},
	{
		name: 'Script tag with tags e.g. <p> buried inside',
		template: '<script>var html="<p>{{html}}</p>";</script>',
		parsed: [{t:7,e:'script',f:['var html="<p>',{t:2,r:'html'},'</p>";']}]
	},
	{
		name: 'Ampersand mustaches are treated the same as triples',
		template: '{{&foo}}',
		parsed: [{t:3,r:'foo'}]
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
	},
	{
		name: 'Array members in section tags',
		template: '{{#foo[0]}}bar{{/foo[0]}}',
		parsed: [{t:4,r:'foo.0',f:['bar']}]
	},
	{
		name: 'Reference that is an invalid expression',
		template: '{{0.foo}}',
		parsed: [{t:2,r:'0.foo'}]
	},
	{
		name: 'Tag with newline before attributes',
		template: '<img\nsrc="{{foo}}">',
		parsed: [{t:7,e:'img',a:{src:[{t:2,r:'foo'}]}}]
	},
	{
		name: 'Expression section',
		template: '{{#[1,2,3]}}{{.}}{{/}}',
		parsed: [{"t":4,"x":{"r":[],"s":"[1,2,3]"},"f":[{"t":2,"r":"."}]}]
	},
	{
		name: 'Keypath expression section',
		template: '{{#foo[bar]}}{{.}}{{/}}',
		parsed: [{"t":4,"kx":{"r":"foo","m":[{"t":30,"n":"bar"}]},"f":[{"t":2,"r":"."}]}]
	},
	{
		name: 'List section with index ref and full closing',
		template: '{{#foo:i}}{{.}}{{/foo:i}}',
		parsed: [{"t":4,"r":"foo","i":"i","f":[{"t":2,"r":"."}]}]
	},
	{
		name: 'List section with index ref and ref only closing',
		template: '{{#foo:i}}{{.}}{{/foo}}',
		parsed: [{"t":4,"r":"foo","i":"i","f":[{"t":2,"r":"."}]}]
	},
	{
		name: 'List section with index ref and empty closing',
		template: '{{#foo:i}}{{.}}{{/}}',
		parsed: [{"t":4,"r":"foo","i":"i","f":[{"t":2,"r":"."}]}]
	},
	//From GH#541:
	{
		name: 'Inverted list section closing',
		template: '{{#steps:stepIndex}}{{^ hiddenSteps[stepIndex]}}<p>{{hiddenSteps[stepIndex]}}</p>{{/ hiddenSteps[stepIndex]}}{{/steps}}',
		parsed: [{"t":4,"r":"steps","i":"stepIndex","f":[{"t":4,"n":51,"kx":{"r":"hiddenSteps","m":[{"t":30,"n":"stepIndex"}]},"f":[{"t":7,"e":"p","f":[{"t":2,"kx":{"r":"hiddenSteps","m":[{"t":30,"n":"stepIndex"}]}}]}]}]}]
	},
	{
		name: 'Illegal closing tag 1',
		template: '<div> </div',
		error:
			'Illegal closing tag at line 1 character 7:\n' +
			'<div> </div\n' +
			'      ^----'
	},
	{
		name: 'Illegal closing tag 2',
		template: '<div> </!!div>',
		error:
			'Illegal closing tag at line 1 character 7:\n' +
			'<div> </!!div>\n' +
			'      ^----'
	},
	{
		name: 'Illegal closing tag 3',
		template: '<div> </div !!>',
		error:
			'Illegal closing tag at line 1 character 7:\n' +
			'<div> </div !!>\n' +
			'      ^----'
	},
	{
		name: 'Unclosed mustache',
		template: '{{foo}',
		error:
			'Expected closing delimiter \'}}\' after reference at line 1 character 6:\n' +
			'{{foo}\n' +
			'     ^----'
	},
	{
		name: 'Unclosed comment',
		template: 'ok <!--',
		error:
			'Illegal HTML - expected closing comment sequence (\'-->\') at line 1 character 8:\n' +
			'ok <!--\n' +
			'       ^----'
	},

	// Commented out as I don't think this is illegal...?

	// {
	// 	name: 'Illegal closing comment',
	// 	template: 'ok -->',
	// 	error:
	// 		'Illegal HTML - unexpected closing comment sequence (\'-->\')'
	// },
	{
		name: 'Expected property name',
		template: '{{property.}}',
		error:
			'Expected a property name at line 1 character 12:\n' +
			'{{property.}}\n' +
			'           ^----'
	},
	{
		name: 'Expected ]',
		template: '{{foo[234}}',
		error:
			'Expected \']\' at line 1 character 10:\n' +
			'{{foo[234}}\n' +
			'         ^----'
	},
//	{
//		name: 'Illegal closing section for {{#foo}}',
//		template: '{{#foo}}wew{{/wee}}',
//		options: { strict:true },
//		error:
//			'Could not parse template: Illegal closing section for {{#foo}}: {{/wee}}. Expected {{/foo}} on line 1:12:\n' +
//			'{{#foo}}wew{{/wee}}\n' +
//			'           ^----'
//	},
//	{
//		name: 'Multiline illegal closing section for {{#foo}}',
//		template: 'hi{{name}}\nblah\n     {{#foo}}wew{{/wee}}',
//		options: { strict:true },
//		error:
//			'Could not parse template: Illegal closing section for {{#foo}}: {{/wee}}. Expected {{/foo}} on line 3:17:\n' +
//			'     {{#foo}}wew{{/wee}}\n' +
//			'                ^----'
//	},
//	{
//		name: 'Multiline illegal closing section for {{#foo}} #2',
//		template:
//			'hi{{name}}\n' +
//			'blah\n' +
//			'     {{#foo}}wew{{/wee}}\n' +
//			'foo',
//		options: { strict:true },
//		error:
//			'Could not parse template: Illegal closing section for {{#foo}}: {{/wee}}. Expected {{/foo}} on line 3:17:\n' +
//			'     {{#foo}}wew{{/wee}}\n' +
//			'                ^----'
//	},
//	{
//		name: 'Illegal closing section for {{##(foo*5)}}',
//		template: '{{#(foo*5)}}foo{{/garbage}}',
//		options: { strict:true },
//		error:
//			'Could not parse template: Illegal closing section for {{#(foo*5)}}: {{/garbage}}. Expected {{/()}} on line 1:16:\n' +
//			'{{#(foo*5)}}foo{{/garbage}}\n' +
//			'               ^----'
//	},
	{
		name: 'If syntax',
		template: '{{#if foo}}foo{{/if}}',
		options: {handlebars:true},
		parsed: [
			{ t: 4, n: 50, r: 'foo', f: ['foo'] }
		]
	},
	{
		name: 'If syntax',
		template: '{{#if (foo*5 < 20)}}foo{{/if}}',
		options: {handlebars:true},
		parsed: [
			{ t: 4, n: 50,
				x: { r: [ 'foo' ], s: '${0}*5<20' },
				f: ['foo'] }
		]
	},
	{
		name: 'Illegal closing section for {{#if}}',
		template: '{{#if (foo*5 < 20)}}foo{{/wrong}}',
		options: {handlebars:true},
		error:
			'Expected {{/if}} at line 1 character 34:\n{{#if (foo*5 < 20)}}foo{{/wrong}}\n                                 ^----'
	},
	{
		name: 'Unless syntax',
		template: '{{#unless foo}}foo{{/unless}}',
		options: {handlebars:true},
		parsed: [
			{ t: 4, n: 51,
				r: 'foo',
				f: ['foo'] }
		]
	},
	{
		name: 'Unless syntax',
		template: '{{#unless (foo*5 < 20)}}foo{{/unless}}',
		options: {handlebars:true},
		parsed: [
			{ t: 4, n: 51,
				x: { r: [ 'foo' ], s: '${0}*5<20' },
				f: ['foo'] }
		]

	},
	{
		name: 'If else syntax',
		template: '{{#if foo}}foo{{else}}not foo{{/if}}',
		options: {handlebars:true},
		parsed:
			[ { t: 4, n: 50,
			    r: 'foo',
			    f: ['foo']
			}, { t: 4, n: 51,
			    r: 'foo',
			    f: ['not foo']
			} ]
	},
	{
		name: 'Nested If else syntax',
		template:
			'{{#if foo}}' +
			'	foo' +
			'	{{#if foo2}}' +
			'		foo2' +
			'		{{else}}' +
			'		not foo2' +
			'	{{/if}}'+
			'{{else}}' +
			'	bar' +
			'{{/if}}',
		options: {handlebars:true},
		parsed: [
			{
				t: 4,
				n: 50,
				r: 'foo',
				f: [ ' foo ',
					{ t: 4, n: 50, r: 'foo2', f: [' foo2 '] },
					{ t: 4, n: 51, r: 'foo2', f: [' not foo2 '] }
				],
			},
			{
				t: 4,
				n: 51,
				r: 'foo',
				f: [' bar']
			}
		]
	},
	{
		name: 'Each else syntax',
		template: '{{#each foo:i}}foo #{{i+1}}{{else}}no foos{{/each}}',
		options: {handlebars:true},
		parsed: [
			{
				t: 4,
				n: 52,
				r: 'foo',
				i: 'i',
				f: [
					'foo #',
					{ t: 2, x: { r: [ 'i' ], s: '${0}+1' } }
				]
			},
			{
				t: 4,
				n: 51,
				r: 'foo',
				f: ['no foos']
			}
		]
	},
	{
		name: 'Else not allowed in #unless',
		template: '{{#unless foo}}not foo {{else}}foo?{{/unless}}',
		options: {handlebars:true},
		error:
			'{{else}} not allowed in {{#unless}} at line 1 character 32:\n{{#unless foo}}not foo {{else}}foo?{{/unless}}\n                               ^----'
	},
	{
		name: 'Else not allowed in #with',
		template: '{{#with foo}}with foo {{else}}no foo?{{/with}}',
		options: {handlebars:true},
		error:
			'{{else}} not allowed in {{#with}} at line 1 character 31:\n{{#with foo}}with foo {{else}}no foo?{{/with}}\n                              ^----'
	},
	{
		name: 'Else is just a regular interpolator in {{#}}',
		template: '{{#foo}}with foo {{else}}no foo?{{/foo}}',
		parsed:
			[ { t: 4,
			    r: 'foo',
			    f:
			     [ 'with foo ',
			       { t: 2, r: 'else' },
			       'no foo?' ] } ]

	},
	{
		name: 'Else is just a regular interpolator in {{^}}',
		template: '{{^foo}}not foo {{else}}no foo?{{/foo}}',
		parsed:
			[ { t: 4,
				r: 'foo',
				n: 51,
				f:
				 [ 'not foo ',
				   { t: 2, r: 'else' },
				   'no foo?' ] } ]
	},
	{
		name: 'Expression close syntax',
		template: '{{#(foo*5 < 20)}}foo{{/()}}',
		parsed: [
			{ t: 4,
				x: { r: [ 'foo' ], s: '${0}*5<20' },
				f: ['foo'] }
		]
	},
	{
		name: "SVG trace",
		template:
			"<svg xmlns=\"http://www.w3.org/2000/svg\">\n" +
			"  <circle cx=\"{{x}}\" cy=\"{{y}}\" r=\"{{r}}\"/>\n" +
			"</svg>",
		options: {includeLinePositions:true},
		parsed:
			[ { t: 7,
			    e: 'svg',
			    a: { xmlns: 'http://www.w3.org/2000/svg' },
			    f:
			     [ { t: 7,
			         e: 'circle',
			         a:
			          { cx:
			             [ { t: 2,
			                 r: 'x',
			                 p: [ 2, 15 ] } ],
			            cy:
			             [ { t: 2,
			                 r: 'y',
			                 p: [ 2, 26 ] } ],
			            r:
			             [ { t: 2,
			                 r: 'r',
			                 p: [ 2, 36 ] } ] },
			         p: [ 2, 3 ] } ],
			    p: [ 1, 1 ] } ]
	},
	{
		name: 'Multiline trace',
		options: {includeLinePositions:true},
		template: 'hi{{name}}\n' +
			'<div>blah\n' +
			'     {{#foo}}wew<span>Ain\'t \n' +
			'       that {{grand}}?\n' +
			'       </span>\n' +
			'     {{/foo}}\n' +
			'</div>',
		parsed:
			[ 'hi',
			  { t: 2,
				p: [ 1, 3 ],
				r: 'name' },
			  ' ',
			  { t: 7,
				e: 'div',
				p: [ 2, 1 ],
				f:
				 [ 'blah ',
				   { t: 4,
					 p: [ 3, 6 ],
					 r: 'foo',
					 f:
					  [ 'wew',
						{ t: 7,
						  e: 'span',
						  p: [ 3, 17 ],
						  f:
						   [ 'Ain\'t that ',
							 { t: 2,
							   p: [ 4, 13 ],
							   r: 'grand' },
							 '?' ] },
						' ' ] } ] } ]
	},
	{
		name: "Mixture of HTML-able and non-HTML-able elements in template with Traces",
		template: "<div><p>HTML</p><p>{{mustache}}</p></div>",
		options: {includeLinePositions:true},
		parsed:
			[ { t: 7,
			    e: 'div',
			    p: [ 1, 1 ],
			    f:
			     [ { t: 7,
			         e: 'p',
			         p: [ 1, 6 ],
			         f: ['HTML'] },
			       { t: 7,
			         e: 'p',
			         p: [ 1, 17 ],
			         f:
			          [ { t: 2,
			              p: [ 1, 20 ],
			              r: 'mustache' } ] } ] } ]
	},
	{
		name: 'Reserved event names cannot be used for proxy events',
		template: '<div on-foo="change"></div>',
		error: 'Cannot use reserved event names (change, reset, teardown, update) at line 1 character 15:\n' +
			'<div on-foo=\"change\"></div>\n              ^----'
	}
];

// this needs to work with AMD (for qunit) and node (for nodeunit)...
if ( typeof define === 'function' && define.amd ) {
	define( function () {
		return parseTests;
	});
}

else if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = parseTests;
}
