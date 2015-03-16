var parseTests = [
	{
		name: "Empty string",
		template: "",
		parsed: {v:3,t:[]}
	},
	{
		name: "Mustache-less text",
		template: "a string",
		parsed: {v:3,t:["a string"]}
	},
	{
		name: "Interpolator",
		template: "{{mustache}}",
		parsed: {v:3,t:[{t:2,r:"mustache"}]}
	},
	{
		name: "Triple",
		template: "{{{mustache}}}",
		parsed: {v:3,t:[{t:3,r:"mustache"}]}
	},
	{
		name: "Static Interpolator",
		template: "[[mustache]]",
		parsed: {v:3,t:[{t:2,r:"mustache",s:true}]}
	},
	{
		name: "Static Triple",
		template: "[[[mustache]]]",
		parsed: {v:3,t:[{t:3,r:"mustache",s:true}]}
	},
	{
		name: "Static Section",
		template: "[[#foo]]yes[[/foo]]",
		parsed: {v:3,t:[{t:4,r:"foo",s:true,f:["yes"]}]}
	},
	{
		name: "Empty section",
		template: "{{#mustache}}{{/mustache}}",
		parsed: {v:3,t:[{t:4,r:"mustache"}]}
	},
	{
		name: "Section",
		template: "{{#mustache}}contents{{/mustache}}",
		parsed: {v:3,t:[{"f":["contents"],t:4,r:"mustache"}]}
	},
	{
		name: "Interpolator with preceding text",
		template: "preceding text {{mustache}}",
		parsed: {v:3,t:["preceding text ",{t:2,r:"mustache"}]}
	},
	{
		name: "Interpolator with following text",
		template: "{{mustache}} following text",
		parsed: {v:3,t:[{t:2,r:"mustache"}," following text"]}
	},
	{
		name: "Delimiter change",
		template: "{{=<% %>=}} <% mustache %>",
		parsed: {v:3,t:[{t:2,r:"mustache"}]}
	},
	{
		name: "Named index",
		template: "{{#items:i}}{{i}}: {{name}}{{/items}}",
		parsed: {v:3,t:[{"f":[{r:"i",t:2},": ",{r:"name",t:2}],"i":"i",r:"items",t:4}]}
	},
	{
		name: "Named key and index",
		template: "{{#items:k,i}}{{i}}: {{name}}{{/items}}",
		parsed: {v:3,t:[{"f":[{r:"i",t:2},": ",{r:"name",t:2}],"i":"k,i",r:"items",t:4}]}
	},
	{
		name: "Element with unquoted attributes",
		template: "<div class=test></div>",
		parsed: {v:3,t:[{"a":{"class":"test"},"e":"div","t":7}]}
	},
	{
		name: "Element with unquoted attributes and a mustache",
		template: "<div class=test>{{mustache}}</div>",
		parsed: {v:3,t:[{t:7,e:"div",a:{"class":"test"},"f":[{t:2,r:"mustache"}]}]}
	},
	{
		name: "Element with unquoted mustache attributes",
		template: "<div class={{myClass}}>contents</div>",
		parsed: {v:3,t:[{a:{"class":[{r:"myClass",t:2}]},"f":["contents"],e:"div",t:7}]}
	},
	{
		name: "Plain HTML",
		template: '<div><span>ok</span><span>ok2</span>contents</div>',
		parsed: {v:3,t:[{t:7,e:'div',f:[{t:7,e:'span',f:['ok']},{t:7,e:'span',f:['ok2']},'contents']}]}
	},
	{
		name: "Template with blacklisted elements (sanitize)",
		template: "<style type='text/css'>body { font-family: 'Comic Sans MS'; }</style>",
		parsed: {v:3,t:[]},
		options: {
			sanitize: true
		}
	},
	{
		name: "Template with blacklisted elements and mustaches (sanitize)",
		template: "<link rel='{{rel}}'>",
		parsed: {v:3,t:[]},
		options: {
			sanitize: true
		}
	},
	{
		name: "Template with blacklisted elements (don't sanitize)",
		template: "<style type='text/css'>body { font-family: 'Comic Sans MS'; }</style>",
		parsed: {v:3,t:[{"a":{"type":"text/css"},"e":"style","f":["body { font-family: 'Comic Sans MS'; }"],"t":7}]},
		options: {
			sanitize: false
		}
	},
	{
		name: "Template with blacklisted elements and mustaches (don't sanitize)",
		template: "<link rel='{{rel}}'>",
		parsed: {v:3,t:[{a:{"rel":[{r:"rel",t:2}]},e:"link",t:7}]},
		options: {
			sanitize: false
		}
	},
	{
		name: "Element with an event attribute (sanitize)",
		template: "<p onclick='doSomething();'>{{text}}</p>",
		parsed: {v:3,t:[{"f":[{r:"text",t:2}],e:"p",t:7}]},
		options: {
			sanitize: true
		}
	},
	{
		name: "Element with an event attribute (don't sanitize)",
		template: "<p onclick='doSomething();'>{{text}}</p>",
		parsed: {v:3,t:[{a:{"onclick":"doSomething();"},"f":[{r:"text",t:2}],e:"p",t:7}]},
		options: {
			sanitize: false
		}
	},
	{
		name: "SVG",
		template: "<svg xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"{{x}}\" cy=\"{{y}}\" r=\"{{r}}\"/></svg>",
		parsed: {v:3,t:[{a:{"xmlns":"http://www.w3.org/2000/svg"},"f":[{a:{"cx":[{r:"x",t:2}],"cy":[{r:"y",t:2}],r:[{r:"r",t:2}]},e:"circle",t:7}],e:"svg",t:7}]}
	},
	{
		name: "SVG with non-mustache text",
		template: "<svg xmlns=\"http://www.w3.org/2000/svg\"><text>some text</text></svg>",
		parsed: {v:3,t:[{a:{"xmlns":"http://www.w3.org/2000/svg"},"f":[{"f":["some text"],e:"text",t:7}],e:"svg",t:7}]}
	},
	{
		name: "SVG with interpolator",
		template: "<svg xmlns=\"http://www.w3.org/2000/svg\"><text>{{hello}}</text></svg>",
		parsed: {v:3,t:[{a:{"xmlns":"http://www.w3.org/2000/svg"},"f":[{"f":[{r:"hello",t:2}],e:"text",t:7}],e:"svg",t:7}]}
	},
	{
		name: "SVG with interpolator and static text",
		template: "<svg xmlns=\"http://www.w3.org/2000/svg\"><text>Hello {{thing}}!</text></svg>",
		parsed: {v:3,t:[{a:{"xmlns":"http://www.w3.org/2000/svg"},"f":[{"f":["Hello ",{r:"thing",t:2},"!"],e:"text",t:7}],e:"svg",t:7}]}
	},
	{
		name: "Mixture of HTML-able and non-HTML-able elements in template",
		template: "<div><p>HTML</p><p>{{mustache}}</p></div>",
		parsed: {v:3,t:[{t:7,e:"div","f":[{t:7,e:"p","f":["HTML"]},{t:7,e:"p","f":[{t:2,r:"mustache"}]}]}]}
	},
	{
		name: "Expression mustache",
		template: "{{( i + 1 )}}",
		parsed: {v:3,t:[{t:2,"x":{r:["i"],"s":"_0+1"}}]}
	},
	{
		name: "Expression mustache with brackets",
		template: "{{( (i) + 1 )}}",
		parsed: {v:3,t:[{t:2,"x":{r:["i"],"s":"(_0)+1"}}]}
	},
	{
		name: "Nodes with id attributes and no mustaches don't get stringified",
		template: "<div id=test>plain old text</div>",
		parsed: {v:3,t:[{t:7,e:"div",a:{"id":"test"},"f":["plain old text"]}]}
	},
	{
		name: "Mustache references can have numeric keys",
		template: "{{todos.0.content}}",
		parsed: {v:3,t:[{r:"todos.0.content",t:2}]}
	},
	{
		name: "Mustache references that aren't valid expressions can have uppercase",
		template: "{{00.Content}}",
		parsed: {v:3,t:[{r:"00.Content",t:2}]}
	},
	{
		name: "Expression with keypath like foo.0.bar",
		template: "{{( process( foo.0.bar ) )}}",
		parsed: {v:3,t:[{t:2,"x":{r:["process","foo.0.bar"],"s":"_0(_1)"}}]}
	},
	{
		name: "Expression with method",
		template: "{{( one.two.three() )}}",
		parsed: {v:3,t:[{t:2,"x":{r:["one.two"],"s":"_0.three()"}}]}
	},
	{
		name: "Expression with indirectly-identified method",
		template: "{{( one.two[ three ]() )}}",
		parsed: {v:3,t:[{t:2,"x":{r:["three","one.two"],"s":"_1[_0]()"}}]}
	},
	{
		name: "Void tag with spaces",
		template: "<hr />{{foo}}",
		parsed: {v:3,t:[{e:"hr",t:7},{r:"foo",t:2}]}
	},
	{
		name: "Expression with JSON object",
		template: "{{( fn({ foo: 1, 'bar': 2, '0foo': 3, '0bar': { baz: 'test', arr: [ 1, 2, 3 ] } }) )}}",
		parsed: {v:3,t:[{t:2,"x":{r:["fn"],"s":"_0({foo:1,bar:2,\"0foo\":3,\"0bar\":{baz:\"test\",arr:[1,2,3]}})"}}]}
	},
	{
		name: 'Invocation refinements',
		template: '{{ array.filter( someFilter ).length }}',
		parsed: {v:3,t:[{t:2,"x":{r:["array","someFilter"],"s":"_0.filter(_1).length"}}]}
	},
	{
		name: 'Boolean attributes',
		template: '<input value="{{value}}" autofocus>',
		parsed: {v:3,t:[{t:7,e:"input",a:{"autofocus":0,"value":[{t:2,r:"value"}]}}]}
	},
	{
		name: 'Methods on `this`',
		template: '{{ this.getId() }}',
		parsed: {v:3,t:[{t:2,x:{r:['.'],s:'_0.getId()'}}]}
	},
	{
		name: 'Sloppy whitespace in tags',
		template: '<div class = "foo"></div>',
		parsed: {v:3,t:[{"a":{"class":"foo"},"e":"div","t":7}]}
	},
	{
		name: 'References can begin with browser globals',
		template: '{{ DateRange }}',
		parsed: {v:3,t:[{t:2,r:'DateRange'}]}
	},
	{
		name: 'Multiple method invocations',
		template: '{{ a.foo().bar() }}',
		parsed: {v:3,t:[{t:2,x:{s:'_0.foo().bar()',r:['a']}}]}
	},
	{
		name: 'Expression with RegExp',
		template: '{{ /abc/.test(foo) }}',
		parsed: {v:3,t:[{t:2,x:{s:'/abc/.test(_0)',r:['foo']}}]}
	},
	{
		name: 'Expression with root reference',
		template: '{{~/foo.indexOf("a")}}',
		parsed: {v:3,t:[{t:2,x:{s:'_0.indexOf("a")',r:['~/foo']}}]}
	},
	{
		name: 'Whitespace before mustache type character',
		template: '{{ # foo }}blah{{ / foo }}',
		parsed: {v:3,t:[{t:4,r:'foo',f:['blah']}]}
	},
	{
		name: 'Intro and outro with no parameters',
		template: '<div intro="fade" outro="fade"></div>',
		parsed: {v:3,t:[{t:7,e:'div',t1:'fade',t2:'fade'}]}
	},
	{
		name: 'Intro and outro with simple parameters',
		template: '<div intro="fade:400" outro="fade:fast"></div>',
		parsed: {v:3,t:[{t:7,e:'div',t1:{a:[400],n:'fade'},t2:{a:'fast',n:'fade'}}]}
	},
	{
		name: 'Intro and outro with JSON parameters',
		template: "<div intro='fade:{\"delay\":50}' outro='fade:{\"duration\":500}'></div>",
		parsed: {v:3,t:[{t:7,e:'div',t1:{a:[{delay:50}],n:'fade'},t2:{a:[{duration:500}],n:'fade'}}]}
	},
	{
		name: 'Intro and outro with JSON-like parameters',
		template: "<div intro='fade:{delay:50}' outro='fade:{duration:500}'></div>",
		parsed: {v:3,t:[{t:7,e:'div',t1:{a:[{delay:50}],n:'fade'},t2:{a:[{duration:500}],n:'fade'}}]}
	},
	{
		name: 'Intro and outro with dynamic parameters',
		template: "<div intro='fade:{\"delay\":{{i*50}}}' outro='fade:{\"delay\":{{i*50}}}'></div>",
		parsed: {v:3,t:[{t:7,e:'div',t1:{d:['{"delay":',{t:2,x:{r:['i'],s:'_0*50'}},'}'],n:'fade'},t2:{d:['{"delay":',{t:2,x:{r:['i'],s:'_0*50'}},'}'],n:'fade'}}]}
	},
	{
		name: 'Doctype declarations are handled',
		template: '<!doctype html><html><head></head><body></body></html>',
		parsed: {v:3,t:[{t:18,a:' html'},{t:7,e:'html',f:[{t:7,e:'head'},{t:7,e:'body'}]}]}
	},
	{
		name: 'Comments are stripped by default',
		template: '<!-- this will disappear --><p>foo <!-- so will this --></p>',
		parsed: {v:3,t:[{"e":"p","f":["foo"],"t":7}]}
	},
	{
		name: 'Comments are left if required',
		template: '<!-- this will not disappear --><p>{{foo}} <!-- nor will this --></p>',
		parsed: {v:3,t:[{t:9,c:' this will not disappear '},{t:7,e:'p',f:[{t:2,r:'foo'},' ',{t:9,c:' nor will this '}]}]},
		options: { stripComments: false }
	},
	{
		name: 'XML namespaces are handled',
		template: '<fb:like href="{{href}}" send="true" show_faces="false"></fb:like>',
		parsed: {v:3,t:[{t:7,e:'fb:like',a:{href:[{t:2,r:'href'}],send:'true',show_faces:'false'}}]}
	},
	{
		name: 'Basic decorator',
		template: '<div decorator="foo">{{bar}}</div>',
		parsed: {v:3,t:[{t:7,e:'div',o:'foo',f:[{t:2,r:'bar'}]}]}
	},
	{
		name: 'Decorator with arguments',
		template: '<div decorator="foo:1,2,3">{{bar}}</div>',
		parsed: {v:3,t:[{t:7,e:'div',o:{n:'foo',a:[1,2,3]},f:[{t:2,r:'bar'}]}]}
	},
	{
		name: 'Decorator with dynamic arguments',
		template: '<div decorator="foo:{{baz}}">{{bar}}</div>',
		parsed: {v:3,t:[{t:7,e:'div',o:{n:'foo',d:[{t:2,r:'baz'}]},f:[{t:2,r:'bar'}]}]}
	},
	{
		name: 'Script tag with tags e.g. <p> buried inside',
		template: '<script>var html="<p>{{html}}</p>";</script>',
		parsed: {v:3,t:[{t:7,e:'script',f:['var html="<p>',{t:2,r:'html'},'</p>";']}]}
	},
	{
		name: 'Ampersand mustaches are treated the same as triples',
		template: '{{&foo}}',
		parsed: {v:3,t:[{t:3,r:'foo'}]}
	},
	{
		name: 'Backslash escapes in strings',
		template: '{{ ["\\\\ \\" \\\\", \'\\\\ \\\' \\\\\'] }}',
		parsed: {v:3,t:[{t:2,x:{r:[],s:'["\\\\ \\" \\\\","\\\\ \' \\\\"]'}}]}
	},
	{
		name: 'Unicode escapes in strings',
		template: '{{ "A\\u0042C" }}',
		parsed: {v:3,t:[{t:2,x:{r:[],s:'"ABC"'}}]}
	},
	{
		name: 'Array members in section tags',
		template: '{{#foo[0]}}bar{{/foo[0]}}',
		parsed: {v:3,t:[{t:4,r:'foo.0',f:['bar']}]}
	},
	{
		name: 'Reference that is an invalid expression',
		template: '{{0.foo}}',
		parsed: {v:3,t:[{t:2,r:'0.foo'}]}
	},
	{
		name: 'Tag with newline before attributes',
		template: '<img\nsrc="{{foo}}">',
		parsed: {v:3,t:[{t:7,e:'img',a:{src:[{t:2,r:'foo'}]}}]}
	},
	{
		name: 'Expression section',
		template: '{{#[1,2,3]}}{{.}}{{/}}',
		parsed: {v:3,t:[{"t":4,"x":{"r":[],"s":"[1,2,3]"},"f":[{"t":2,"r":"."}]}]}
	},
	{
		name: 'Keypath expression section',
		template: '{{#foo[bar]}}{{.}}{{/}}',
		parsed: {v:3,t:[{"t":4,"rx":{"r":"foo","m":[{"t":30,"n":"bar"}]},"f":[{"t":2,"r":"."}]}]}
	},
	{
		name: 'List section with index ref and full closing',
		template: '{{#foo:i}}{{.}}{{/foo:i}}',
		parsed: {v:3,t:[{"t":4,"r":"foo","i":"i","f":[{"t":2,"r":"."}]}]}
	},
	{
		name: 'List section with index ref and ref only closing',
		template: '{{#foo:i}}{{.}}{{/foo}}',
		parsed: {v:3,t:[{"t":4,"r":"foo","i":"i","f":[{"t":2,"r":"."}]}]}
	},
	{
		name: 'List section with index ref and empty closing',
		template: '{{#foo:i}}{{.}}{{/}}',
		parsed: {v:3,t:[{"t":4,"r":"foo","i":"i","f":[{"t":2,"r":"."}]}]}
	},
	//From GH#541:
	{
		name: 'Inverted list section closing',
		template: '{{#steps:stepIndex}}{{^ hiddenSteps[stepIndex]}}<p>{{hiddenSteps[stepIndex]}}</p>{{/ hiddenSteps[stepIndex]}}{{/steps}}',
		parsed: {v:3,t:[{"t":4,"r":"steps","i":"stepIndex","f":[{"t":4,"n":51,"rx":{"r":"hiddenSteps","m":[{"t":30,"n":"stepIndex"}]},"f":[{"t":7,"e":"p","f":[{"t":2,"rx":{"r":"hiddenSteps","m":[{"t":30,"n":"stepIndex"}]}}]}]}]}]}
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
	{
		name: 'If syntax',
		template: '{{#if foo}}foo{{/if}}',
		parsed: {v:3,t:[{t:4,n:50,r:'foo',f:['foo']}]}
	},
	{
		name: 'If syntax',
		template: '{{#if (foo*5 < 20)}}foo{{/if}}',
		parsed: {v:3,t:[{t:4,n:50,x:{r:['foo'],s:'_0*5<20'},f:['foo']}]}
	},
	{
		name: 'Illegal closing section for {{#if}}',
		template: '{{#if (foo*5 < 20)}}foo{{/wrong}}',
		error:
			'Expected {{/if}} at line 1 character 34:\n{{#if (foo*5 < 20)}}foo{{/wrong}}\n                                 ^----'
	},
	{
		name: 'Unless syntax',
		template: '{{#unless foo}}foo{{/unless}}',
		parsed: {v:3,t:[{t:4,n:51,r:'foo',f:['foo']}]}
	},
	{
		name: 'Unless syntax',
		template: '{{#unless (foo*5 < 20)}}foo{{/unless}}',
		parsed: {v:3,t:[{t:4,n:51,x:{r:['foo'],s:'_0*5<20'},f:['foo']}]}
	},
	{
		name: 'If else syntax',
		template: '{{#if foo}}foo{{else}}not foo{{/if}}',
		parsed: {v:3,t:[{t:4,n:50,r:'foo',f:['foo']},{t:4,n:51,r:'foo',f:['not foo']}]}
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
		parsed: {v:3,t:[{t:4,n:50,r:'foo',f:['foo ',{t:4,n:50,r:'foo2',f:['foo2']},{t:4,n:51,r:'foo2',f:['not foo2']}]},{t:4,n:51,r:'foo',f:['bar']}]}
	},
	{
		name: 'Each else syntax',
		template: '{{#each foo:i}}foo #{{i+1}}{{else}}no foos{{/each}}',
		parsed: {v:3,t:[{t:4,n:52,r:'foo',i:'i',f:['foo #',{ t:2,x:{r:['i'],s:'_0+1'}}]},{t:4,n:51,r:'foo',f:['no foos']}]}
	},
	{
		name: 'Else not allowed in #unless',
		template: '{{#unless foo}}not foo {{else}}foo?{{/unless}}',
		error:
			'{{else}} not allowed in {{#unless}} at line 1 character 32:\n{{#unless foo}}not foo {{else}}foo?{{/unless}}\n                               ^----'
	},
	{
		name: 'Mixed Handlebars-style and regular syntax',
		template: '{{#foo}}normal{{/foo}}{{#if foo}}handlebars{{/if}}',
		parsed: {v:3,t:[{t:4,r:'foo',f:['normal']},{t:4,r:'foo',n:50,f:['handlebars']}]}
	},
	{
		name: 'Expression close syntax',
		template: '{{#(foo*5 < 20)}}foo{{/()}}',
		parsed: {v:3,t:[{t:4,x:{r:['foo'],s:'_0*5<20'},f:['foo']}]}
	},
	{
		name: "SVG trace",
		template:
			"<svg xmlns=\"http://www.w3.org/2000/svg\">\n" +
			"  <circle cx=\"{{x}}\" cy=\"{{y}}\" r=\"{{r}}\"/>\n" +
			"</svg>",
		options: {includeLinePositions:true},
		parsed: {v:3,t:[{t:7,e:'svg',a:{xmlns:'http://www.w3.org/2000/svg'},f:[{t:7,e:'circle',a:{cx:[{t:2,r:'x',p:[2,15,55]}],cy:[{t:2,r:'y',p:[2,26,66]}],r:[{t:2,r:'r',p:[2,36,76]}]},p:[2,3,43]}],p:[1,1,0]}]}
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
		parsed: {v:3,t:['hi',{t:2,p:[1,3,2],r:'name'},' ',{t:7,e:'div',p:[2,1,11],f:['blah ',{t:4,p:[3,6,26],r:'foo',f:['wew',{t:7,e:'span',p:[3,17,37],f:['Ain\'t that ',{t:2,p:[4,13,62],r:'grand'},'?']}]}]}]}
	},
	{
		name: "Mixture of HTML-able and non-HTML-able elements in template with Traces",
		template: "<div><p>HTML</p><p>{{mustache}}</p></div>",
		options: {includeLinePositions:true},
		parsed: {v:3,t:[{t:7,e:'div',p:[1,1,0],f:[{t:7,e:'p',p:[1,6,5],f:['HTML']},{t:7,e:'p',p:[1,17,16],f:[{t:2,p:[1,20,19],r:'mustache'}]}]}]}
	},
	{
		name: "Empty event attribute",
		template: "<p on-click=''></p>",
		parsed: {v:3,t:[{t:7,e:'p',v:{click:''}}]}
	},
	{
		name: 'Reserved event names cannot be used for proxy events',
		template: '<div on-foo="change"></div>',
		error: 'Cannot use reserved event names (change, reset, teardown, update, construct, config, init, render, unrender, detach, insert) at line 1 character 15:\n' +
			'<div on-foo=\"change\"></div>\n              ^----'
	},
	{
		name: 'Reserved event names can be part of proxy event names',
		template: '<div on-foo="thiswillchange"></div>',
		parsed: {v:3,t:[{t:7,e:'div',v:{foo:'thiswillchange'}}]}
	},
	{
		name: 'Multiple proxy event names joined by "-"',
		template: '<div on-foo-bar="baz"></div>',
		parsed: {v:3,t:[{t:7,e:'div',v:{'foo-bar':'baz'}}]}
	},

	// Illegal expressions
	{
		name: 'Illegal ternary expression',
		template: '{{a?}}',
		error: 'Expected a JavaScript expression at line 1 character 5:\n{{a?}}\n    ^----'
	},
	{
		name: 'Illegal ternary expression',
		template: '{{a?b}}',
		error: 'Expected \":\" at line 1 character 6:\n{{a?b}}\n     ^----'
	},
	{
		name: 'Illegal ternary expression',
		template: '{{a?b:}}',
		error: 'Expected a JavaScript expression at line 1 character 7:\n{{a?b:}}\n      ^----'
	},
	{
		name: 'Illegal postfix operator',
		template: '{{typeof}}',
		error: 'Expected a JavaScript expression at line 1 character 9:\n{{typeof}}\n        ^----'
	},
	{
		name: 'Illegal infix sequence',
		template: '{{a+}}',
		error: 'Expected closing delimiter \'}}\' after reference at line 1 character 4:\n{{a+}}\n   ^----'
	},
	{
		name: 'Illegal invocation',
		template: '{{foo(}}',
		error: 'Expected closing paren at line 1 character 7:\n{{foo(}}\n      ^----'
	},
	{
		name: 'Illegal expression list',
		template: '{{foo(a,)}}',
		error: 'Expected a JavaScript expression at line 1 character 9:\n{{foo(a,)}}\n        ^----'
	},
	{
		name: 'Illegal refinement',
		template: '{{foo[]}}',
		error: 'Expected a JavaScript expression at line 1 character 7:\n{{foo[]}}\n      ^----'
	},
	{
		name: 'Illegal refinement',
		template: '{{foo.-}}',
		error: 'Expected a property name at line 1 character 7:\n{{foo.-}}\n      ^----'
	},
	{
		name: 'Illegal bracketed expression',
		template: '{{()}}',
		error: 'Expected a JavaScript expression at line 1 character 4:\n{{()}}\n   ^----'
	},
	{
		name: 'Illegal bracketed expression (missing closing paren)',
		template: '{{(foo}}',
		error: 'Expected closing paren at line 1 character 7:\n{{(foo}}\n      ^----'
	},

	// `this`
	{
		name: '`this` becomes `.`',
		template: '{{this}}',
		parsed: {v:3,t:[{t:2,r:'.'}]}
	},
	{
		name: '`this.foo` becomes `./foo`',
		template: '{{this.foo}}',
		parsed: {v:3,t:[{t:2,r:'./foo'}]}
	},
	{
		name: 'Closing an unopened section',
		template: '{{foo}}{{/foo}}',
		error: 'Attempted to close a section that wasn\'t open at line 1 character 8:\n{{foo}}{{/foo}}\n       ^----'
	},
	{
		name: 'Unclosed section in attribute',
		template: '<p class="{{#foo}}yo{{#foo}}"></p>',
		error: 'An attribute value must contain as many opening section tags as closing section tags at line 1 character 10:\n<p class=\"{{#foo}}yo{{#foo}}\"></p>\n         ^----'
	},

	// #983
	{
		name: 'Handlebars closing sections can contain whitespace',
		template: '{{ #each a }}{{ /each a }}',
		parsed: {v:3,'t':[{'t':4,'n':52,'r':'a'}]}
	},

	// #1024
	{
		name: 'Content after inline partials is not ignored (#1024)',
		template: 'testing <!-- {{>a}} -->a<!-- {{/a}} --><script>alert()</script>',
		parsed: {v:3,p:{a:['a']},t:['testing ',{t:7,e:'script',f:['alert()']}]}
	},

	// #1050
	{
		name: 'Characters inside script and style tags are not decoded.',
		template: '<script> var a = \'&amp;\'; </script>',
		parsed: {v:3,t:[{t:7,e:'script',f:[" var a = '&amp;'; "]}]}
	},
	{
		name: 'Interpolation can be disabled inside script tags (#1050)',
		template: '<script>{{foo}}</script>',
		parsed: {v:3,t:[{t:7,e:'script',f:['{{foo}}']}]},
		options: {
			interpolate: { script: false }
		}
	},
	{
		name: 'Partial with context',
		template: '{{>item foo}}',
		parsed: {v:3,t:[{t:4,n:53,r:'foo',f:[{t:8,r:'item'}]}]}
	},

	// #1094
	{
		name: 'Mustache comment 1',
		template: '{{! ignore me }}',
		parsed: {v:3,t:[]}
	},
	{
		name: 'Mustache comment 2',
		template: '{{! }}',
		parsed: {v:3,t:[]}
	},
	{
		name: 'Mustache comment 3',
		template: '{{! <p>commented out HTML</p> }}',
		parsed: {v:3,t:[]}
	},
	{
		name: 'Mustache comment 4',
		template: '{{! ... }}',
		parsed: {v:3,t:[]}
	},
	{
		name: 'Non-comment 1',
		template: '{{!foo}}',
		parsed: {v:3,t:[{t:2,x:{r:['foo'],s:'!_0'}}]}
	},
	{
		name: 'Non-comment 2',
		template: '{{!foo.bar}}',
		parsed: {v:3,t:[{t:2,x:{r:['foo.bar'],s:'!_0'}}]}
	},
	{
		name: 'Non-comment 3',
		template: '{{!foo()}}',
		parsed: {v:3,t:[{t:2,x:{r:['foo'],s:'!_0()'}}]}
	},
	{
		name: 'Empty attribute',
		template: '<div contenteditable=""></div>',
		parsed: {v:3,t:[{t:7,e:'div',a:{contenteditable:''}}]}
	},
	{
		name: '{{else}} block in attribute',
		template: '<img src="{{#if mobile}}small{{else}}big{{/if}}.png">',
		parsed: {v:3,t:[{t:7,e:'img',a:{src:[{t:4,r:'mobile',n:50,f:['small']},{t:4,r:'mobile',n:51,f:['big']},'.png']}}]}
	},
	{
		name: 'Attributes can contain HTML (#1322)',
		template: '<div data-attr="{{#each array}}<div>{{this}}</div>{{/each}}"></div>',
		parsed: {v:3,t:[{t:7,e:'div',a:{'data-attr':[{t:4,n:52,r:'array',f:['<div>',{t:2,r:'.'},'</div>']}]}}]}
	},
	{
		name: 'Attributes can contain HTML (#1322)',
		template: '<div data-attr=\'{{#each array}}<div>{{this}}</div>{{/each}}\'></div>',
		parsed: {v:3,t:[{t:7,e:'div',a:{'data-attr':[{t:4,n:52,r:'array',f:['<div>',{t:2,r:'.'},'</div>']}]}}]}
	},
	{
		name: 'DOCTYPE declarations are handled correctly',
		template: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html></html>',
		parsed: {v:3,t:[{t:18,a:' html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\"'},{t:7,e:'html'}]}
	},
	{
		name: 'Keywords work as restricted references',
		template: '{{.if}}',
		parsed: {v:3,t:[{t:2,r:'.if'}]}
	},
	{
		name: 'An unexpected closing tag is an error',
		template: '<div></div></div>',
		error: `Unexpected template content at line 1 character 12:\n<div></div></div>\n           ^----`
	},
	{
		name: 'Escaped mustaches',
		template: '\\[[static]] \\[[[tripleStatic]]] \\{{normal}} \\{{{triple}}}',
		parsed: {v:3,t:['[[static]] [[[tripleStatic]]] {{normal}} {{{triple}}}']}
	},
	{
		name: 'Not-really-escaped mustaches',
		template: '\\\\[[static]] \\\\[[[tripleStatic]]] \\\\{{normal}} \\\\{{{triple}}}}',
		parsed: {v:3,t:["\\",{"r":"static","s":true,"t":2}," \\",{"r":"tripleStatic","s":true,"t":3}," \\",{"r":"normal","t":2}," \\",{"r":"triple","t":3},"}"]}
	},
	{
		name: 'Attribute/directive without =',
		template: '<button on-click-"select">fire</button>',
		error: `Expected \`=\`, \`/\`, \`>\` or whitespace at line 1 character 18:
<button on-click-"select">fire</button>
                 ^----`
	},
	{
		name: 'Attribute/directive with fat-fingered ==',
		template: `<div class=='wut'></div>`,
		error: `Expected valid attribute value at line 1 character 12:
<div class=='wut'></div>
           ^----`
	},
	{
		name: 'Double zero literal (#1819)',
		template: `{{foo?11:00}}`,
		parsed: {v:3,t:[{t:2,x:{r:['foo'],s:'_0?11:00'}}]}
	},
	{
		name: 'inline partial at top level',
		template: '{{#partial foo}}this is foo{{/partial}}',
		parsed: {v:3,t:[],p:{foo:['this is foo']}}
	},
	{
		name: 'duplicate inline partials at top level',
		template: '{{#partial foo}}this is foo{{/partial}}{{#partial foo}}dupe{{/partial}}',
		error: `Duplicated partial definition at line 1 character 40:
{{#partial foo}}this is foo{{/partial}}{{#partial foo}}dupe{{/partial}}
                                       ^----`
	},
	{
		name: 'inline partial inside component',
		template: '<x>{{#partial foo}}this is foo{{/partial}}</x>',
		parsed: {v:3,t:[{t:7,e:'x',p:{foo:['this is foo']}}]}
	},
	{
		name: 'duplicate inline partials inside component',
		template: '<x>{{#partial foo}}this is foo{{/partial}}{{#partial foo}}dupe{{/partial}}</x>',
		error: `Duplicate partial definition at line 1 character 43:
<x>{{#partial foo}}this is foo{{/partial}}{{#partial foo}}dupe{{/partial}}</x>
                                          ^----`
	},
	{
		name: 'illegal partial definition',
		template: '{{#if whatever}}{{#partial nope}}...{{/partial}}{{/if}}',
		error: `Partial definitions can only be at the top level of the template, or immediately inside components at line 1 character 17:
{{#if whatever}}{{#partial nope}}...{{/partial}}{{/if}}
                ^----`
	}
];

export default parseTests;
