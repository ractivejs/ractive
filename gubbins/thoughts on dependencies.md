data: {
	foo: {
		bar: 1,
		baz: 2,
		bop: { fop: 3 }
	}
}

<!-- 1 -->
{{#foo}}
	{{bar}} / {{baz}}
	{{bop.fop}}
{{/foo}}

* foo has no dependencies
* foo.bar and foo.baz depend on foo
* foo.bop depends on foo, foo.bop.fop depends on foo.bop


<!-- 2 -->
{{#( double(foo) )}}
	{{bar}} / {{baz}}
	{{bop.fop}}
{{/()}}

* double(foo) depends on double and foo, and the *contents of foo*
* double(foo).bar depends on double(foo)
* double(foo).bop.fop depends on double(foo).bop, depends on double(foo)


<!-- 3 -->
{{( triple( bar ) )}}

{{#foo}}
	{{( triple( bar ) )}} / {{(triple( baz ) )}}

	{{#irrelevant}}
		{{( triple( bop.fop ) )}}
	{{/irrelevant}}
{{/foo}}

* triple(bar) depends on triple and (non-existent) bar
* foo.triple(bar) depends on foo, triple and bar
* foo.triple(baz) depends on foo, triple and baz
* triple(bop.fop) depends on foo, triple, bop, fop


<!-- 4 -->
<ul>
	{{#items}}
		<li>{{( uppercase( name ) )}}</li>
	{{/items}}
</ul>

* uppercase(name) depends on uppercase and name
* name depends on items[x]
* items[x] depends on items

'uppercase(name)' cannot be said to have a dependency on 'name', because it is actually 'name' that has the dependency (on 'items.x') - in fact more correctly 'uppercase(name)' resolves to 'uppercase(items.x.name)' which has dependencies on 'uppercase' and 'items.x.name'.

SO we need to be able to resolve all the references and create a unique signature at runtime. One option is runtime evaluation, but that's awkward. Instead maybe we serve the following to Ractive:

{
	t: 7,
	e: 'li',
	f: [
		t: 2,
		m: {
			s: 'uppercase(name)',
			z: 'uppercase(❖0)',
			r: ['name']
		}
	]
}

http://www.fileformat.info/info/unicode/char/2756/index.htm



<!-- 5 -->
<ul>
	{{#( uppercaseAll( items ) )}}
		<li>{{name}}</li>
	<{{/()}}
</ul>

* uppercaseAll(items) depends on uppercaseAll and items
* name depends on uppercaseAll(items)[x]

'name' is resolved, given a context stack of [ 'uppercaseAll(items)', 'uppercaseAll(items).x' ], to 'uppercaseAll(items).x.name'. Its only direct dependency is 'uppercaseAll(items).x', which has a single direct dependency of 'uppercaseAll(items)', which has a direct dependency on 'uppercaseAll' and 'items', but also all the *downstream keypaths* of 'items'.

