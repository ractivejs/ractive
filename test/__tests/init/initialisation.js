var defaultTemplate, defaultData, cleanupDefaults;

defaultTemplate = Ractive.defaults.template;
defaultData = Ractive.defaults.data;
// make sure defaults get put back,
// or will break other test modules!
cleanupDefaults = {
	teardown: () => {
		Ractive.defaults.template = defaultTemplate;
		Ractive.defaults.data = defaultData;
	}
};

module( 'Initialisation' );

test( 'initialize with no options ok', t => {
	var ractive = new Ractive();
	t.ok( ractive );
});

module( 'ractive.extend()' );

test( 'multiple options arguments applied left to right', t => {
	var View, ractive;

	View = Ractive.extend({
		template: 'ignore',
		data: { foo: 'foo' }
	}, {
		template: 'ignore',
		data: { bar: 'bar' }
	}, {
		template: 'good',
		data: { qux: 'qux' }
	});

	ractive = new View();

	t.equal( ractive.get('foo'), 'foo' );
	t.equal( ractive.get('bar'), 'bar' );
	t.equal( ractive.get('qux'), 'qux' );

	t.equal( ractive.template, 'good' );
});

module( 'Data Initialisation', cleanupDefaults );

test( 'default data function called on initialize', t => {
	var ractive, data = { foo: 'bar' } ;

	Ractive.defaults.data = function () { return data; };
	ractive = new Ractive();
	t.equal( ractive.viewmodel.data, data );
});

test( 'instance data function called on initialize', t => {
	var ractive, data = { foo: 'bar' } ;

	ractive = new Ractive({
		data () { return data; }
	});
	t.equal( ractive.viewmodel.data, data );
});

test( 'data is inherited from grand parent extend (#923)', t => {
	var Child, Grandchild;

	Child = Ractive.extend({
		append: true,
	    template: 'title:{{format(title)}}',
	    data: {
	        format: function ( title ) {
	            return title.toUpperCase();
	        }
	    }
	});

	Grandchild = Child.extend();

	new Child({
	    el: fixture,
	    data: { title: 'child' }
	});

	new Grandchild({
		el: fixture,
	    data: { title: 'grandchild' }
	});

	t.equal( fixture.innerHTML, 'title:CHILDtitle:GRANDCHILD' );
})

// For removal? (#1594)
/*test( 'instance data is used as data object', t => {

	var ractive, data = { foo: 'bar' };

	Ractive.defaults.data = { bar: 'bizz' };
	ractive = new Ractive( { data: data } );

	t.equal( ractive.data, data );
});*/

// For removal (#1594)
/*test( 'default data function with no return uses existing data instance', t => {
	var ractive;

	Ractive.defaults.data = function ( d ) { d.bizz = 'bop' };

	ractive = new Ractive( { data: { foo: 'bar' } } );

	t.ok( ractive.data.foo );
	t.ok( ractive.data.bizz );
});*/

test( 'instance data function takes precedence over default data function', t => {
	var ractive;

	Ractive.defaults.data = function () {
		return { foo: 'fizz' };
	};

	ractive = new Ractive({
		data () {
			return { bar: 'bizz' };
		}
	});

	t.ok( ractive.get( 'bar' ) );
	t.equal( ractive.get( 'bar' ), 'bizz' );
});

test( 'instance data takes precedence over default data but includes unique properties', t => {
	var ractive;

	Ractive.defaults.data = {
		unique: function () { return; },
		format: function () { return 'not me'; }
	};

	ractive = new Ractive( {
		data: {
			foo: 'bar',
			format: function () { return 'foo'; }
		}
	});

	t.ok( ractive.get( 'foo' ), 'has instance data' );
	t.ok( ractive.get( 'format' ), 'has default data' );
	t.ok( ractive.get( 'unique' ), 'has default data' );
	t.equal( ractive.get( 'format' )(), 'foo' );
});

test( 'instantiated .extend() component with data function called on initialize', t => {
	var Component, ractive, data = { foo: 'bar' };

	Component = Ractive.extend({
		data: function(){ return data; }
	});

	ractive = new Component();
	t.equal( ractive.viewmodel.data, data );
});

test( 'extend data option includes Ractive defaults.data', t => {
	var Component, ractive;

	Ractive.defaults.data = {
		format () { return 'default'; },
		defaultOnly: {}
	};

	Component = Ractive.extend({
		data: {
			format () { return 'component'; },
			componentOnly: {}
		}
	});

	ractive = new Component( {
		el: fixture,
		template: '{{format()}}',
		data: { foo: 'bar' }
	});

	t.ok( ractive.get( 'foo' ), 'has instance data' );
	t.ok( ractive.get( 'componentOnly' ), 'has Component data' );
	t.ok( ractive.get( 'defaultOnly' ), 'has Ractive.default data' );
	t.equal( fixture.innerHTML, 'component' );

});

// Removed for #1594 - it doesn't really make sense to have a Model constructor
// as your default data, since no data object is passed to it
/*test( 'return from data function replaces data instance', t => {

	var Component, ractive;

	function Model ( data ) {
		if ( !( this instanceof Model ) ) { return new Model( this.get() ); }
		this.foo = ( data ? data.foo : 'bar' ) || 'bar';
	}

	// This would be an odd thing to do, unless you
	// were returning a model instance...
	Component = Ractive.extend({
		data: Model
	});

	ractive = new Component( {
		el: fixture,
		template: '{{foo}}'
	});

	t.ok( ractive.viewmodel.data instanceof Model );
	t.equal( fixture.innerHTML, 'bar' );

	ractive = new Component( {
		el: fixture,
		template: '{{foo}}',
		data: { foo: 'fizz' }
	});

	t.equal( fixture.innerHTML, 'fizz' );

	ractive = new Component( {
		el: fixture,
		template: '{{foo}}{{bar}}',
		data: function ( data ) {
			data = this._super( data );
			data.bar = 'bizz';
			return data;
		}
	});

	t.ok( ractive.data instanceof Model );
	t.equal( fixture.innerHTML, 'barbizz' );
});*/

test( 'initing data with a primitive results in an error', t => {
	expect( 1 );

	try {
		var ractive = new Ractive({
			el: fixture,
			template: '{{ test }}',
			data: 1
		});
	} catch ( ex ) {
		t.equal( ex.message, 'data option must be an object or a function, "1" is not valid' );
	}
});

// For removal (#1594)
/*test( 'instantiated extend with data uses existing data instance', t => {
	var Component, ractive, data = { foo: 'bar' } ;

	Component = Ractive.extend({
		data: function (d) { d.bizz = 'bop' }
	});

	ractive = new Component( { data: data } );
	t.equal( ractive.data, data );
	t.ok( ractive.data.bizz );
});*/

module( 'Computed Properties and Data in config' )

test( 'data and computed properties available in onconfig and later', t => {
	var ractive;

	expect(3);

	ractive = new Ractive({
		data: { foo: 'bar' },
		computed: {
			bizz: '${foo} + "ftw"'
		},
		onconfig: function () {
			t.equal( this.get('foo'), 'bar' );
			t.equal( this.get('bizz'), 'barftw' );
			this.set( 'qux', 'config' );
		}
	});

	t.equal( ractive.get('qux'), 'config' );
});

module( 'Template Initialisation', cleanupDefaults );


function createScriptTemplate ( template ) {
	var script;
	fixture.appendChild( script = document.createElement( 'SCRIPT' ) );
	script.id = 'template';
	script.setAttribute( 'type', 'text/ractive' );
	script.innerHTML = template;
}

test( 'hash is retrieved from element Id', t => {
	var script, ractive;

	createScriptTemplate( '{{foo}}' );

	ractive = new Ractive({
		el: fixture,
		template: '#template',
		data: { foo: 'bar' }
	});

	t.equal( fixture.innerHTML, 'bar' );
});

test( 'non-existant element id throws', t => {
	var ractive;

	throws(function(){
		new Ractive({
			el: fixture,
			template: '#nonexistant'
		});
	})
});

test( 'Ractive.defaults.template used on initialize', t => {
	var ractive;

	Ractive.defaults.template = '{{foo}}';

	ractive = new Ractive({
		el: fixture,
		data: { foo: 'bar' }
	});

	t.equal( fixture.innerHTML, 'bar' );

});

test( 'Ractive.defaults.template function called on initialize', t => {
	var ractive;

	Ractive.defaults.template = function () {
		return '{{foo}}';
	};

	ractive = new Ractive( {
		el: fixture,
		data: { foo: 'bar' }
	});

	t.equal( fixture.innerHTML, 'bar' );

});

test( 'template function has helper object', t => {
	var ractive, assert = t;

	createScriptTemplate( '{{foo}}' );

	Ractive.defaults.template = function ( t ) {
		var template = t.fromId( 'template' );
		template += '{{bar}}';
		assert.ok( !t.isParsed(template) );
		template = t.parse( template );
		assert.ok( t.isParsed( template ) );
		return template;
	};

	ractive = new Ractive( {
		el: fixture,
		data: { foo: 'fizz', bar: 'bizz' }
	});

	t.equal( fixture.innerHTML, 'fizzbizz' );

});

test( 'instantiated .extend() with template function called on initialize', t => {
	var Component, ractive;

	Component = Ractive.extend({
		template: function () { return '{{foo}}'; }
	});

	ractive = new Component({
		el: fixture,
		data: { foo: 'bar' }
	});

	t.equal( fixture.innerHTML, 'bar' );
});

test( 'extend template replaces Ractive defaults.template', t => {
	var Component, ractive;

	Ractive.defaults.template = function () { return '{{fizz}}'; };

	Component = Ractive.extend({
		template: function() { return '{{foo}}'; }
	});

	ractive = new Component( {
		el: fixture,
		data: { foo: 'bar', fizz: 'bizz' }
	});

	t.equal( fixture.innerHTML, 'bar' )


});

test( '"this" refers to ractive instance in init method with _super (gh-840)', t => {
	var C, D, cThis, dThis, ractive;

	expect(4);

	C = Ractive.extend({
	    oninit: function () {
	        t.ok( this instanceof Ractive );
	        cThis = this;
	    }
	})

	D = C.extend({
	    oninit: function () {
	        t.ok( this instanceof Ractive );
	        dThis = this;
	        this._super();
	    }
	})

	ractive = new D({
	    el: fixture
	})

	t.equal( cThis, ractive );
	t.equal( dThis, ractive );


});


test( 'non-script tag for template throws error', t => {
	var div, ractive;

	fixture.appendChild( div = document.createElement('DIV') );
	div.id = 'template';

	t.throws( function () {
		new Ractive({
			el: fixture,
			template: '#template'
		})
	},
	/script/ );


});


test( '"parent" and "root" properties are correctly set', t => {
	var ViewChild, ViewGrandChild, ractive, child, grandchild;


	ViewGrandChild = Ractive.extend({
		template: 'this space for rent'
	});

	ViewChild = Ractive.extend({
		template: '<grandchild/>',
		components: { grandchild: ViewGrandChild }
	});

	ractive = new Ractive( {
		el: fixture,
		template: '<child/>',
		components: { child: ViewChild }
	});

	child = ractive.findComponent( 'child' );
	grandchild = ractive.findComponent( 'grandchild' );

	t.equal( ractive.root, ractive );
	t.ok( !ractive.parent );

	t.equal( child.root, ractive );
	t.equal( child.parent, ractive );

	t.equal( grandchild.root, ractive );
	t.equal( grandchild.parent, child );
});

test( '.findParent() finds parent', t => {
	var C1, C2, C3, C4, ractive, c1, c2, c3, c4;


	C4 = Ractive.extend({
		template: 'this space for rent'
	});

	C3 = Ractive.extend({
		template: '<c4/>',
		components: { c4: C4 }
	});

	C2 = Ractive.extend({
		template: '<c3/>',
		components: { c3: C3 }
	});

	C1 = Ractive.extend({
		template: '<c2/>',
		components: { c2: C2 }
	});

	ractive = new Ractive( {
		el: fixture,
		template: '<c1/>',
		components: { c1: C1 }
	});

	c1 = ractive.findComponent( 'c1' );
	c2 = ractive.findComponent( 'c2' );
	c3 = ractive.findComponent( 'c3' );
	c4 = ractive.findComponent( 'c4' );

	t.equal( c4.findParent( 'foo' ), null );
	t.equal( c4.findParent( 'c3' ), c3 );
	t.equal( c4.findParent( 'c2' ), c2 );
	t.equal( c4.findParent( 'c1' ), c1 );

	t.equal( c3.findParent( 'c4' ), null );
	t.equal( c3.findParent( 'c3' ), null );
	t.equal( c3.findParent( 'c2' ), c2 );
	t.equal( c3.findParent( 'c1' ), c1 );

	t.equal( c2.findParent( 'c1' ), c1 );
});

test( 'Inline components have a `container` property', function ( t ) {
	var ractive = new Ractive({
		template: '<outer><inner/></outer>',
		components: {
			outer: Ractive.extend({ template: '{{yield}}' }),
			inner: Ractive.extend()
		}
	});

	t.strictEqual( ractive.findComponent( 'inner' ).container, ractive.findComponent( 'outer' ) );
	t.strictEqual( ractive.container, null );
});

test( '.findContainer() finds container component', function ( t ) {
	var ractive = new Ractive({
		template: '<outer><mid><inner/></mid></outer>',
		components: {
			outer: Ractive.extend({ template: '{{yield}}' }),
			inner: Ractive.extend()
		}
	});

	t.strictEqual( ractive.findComponent( 'inner' ).findContainer( 'mid' ), ractive.findComponent( 'mid' ) );
	t.strictEqual( ractive.findComponent( 'inner' ).findContainer( 'outer' ), ractive.findComponent( 'outer' ) );
	t.strictEqual( ractive.findComponent( 'inner' ).findContainer( 'nope' ), null );
});

test( 'Bindings, mappings, and upstream computations should not cause infinite mark recursion (#1526)', t => {
	var ractive = new Ractive({
		el: fixture,
		template: '{{JSON.stringify(.)}}<widget foo="{{bar}}" /><input value="{{bar}}" />',
		components: { widget: Ractive.extend({ template: '{{foo}}' }) }
	});

	t.htmlEqual( fixture.innerHTML, '{"bar":""}<input />' );
});

/* Not supported, do we need it?
test( 'Instantiated component with template function plus instantiation template', t => {
	var Component, ractive;

	Component = Ractive.extend({
		template: function( d,p ){ return o.template + '{{fizz}}'; }
	});

	ractive = new Component({
		el: fixture,
		template: '{{foo}}',
		data: { foo: 'bar', fizz: 'bizz' }
	});

	t.equal( fixture.innerHTML, 'barbizz' );
});


test( 'Instantiated component with no-return template function with instantiation options', t => {
	var Component, ractive;

	Component = Ractive.extend({
		template: function(d,o){ o.template += '{{fizz}}'; }
	});

	ractive = new Component({
		el: fixture,
		template: '{{foo}}',
		data: { foo: 'bar', fizz: 'bizz' }
	});

	t.equal( fixture.innerHTML, 'barbizz' );
});


test( 'Instantiated component with data-based template selection function', t => {
	var Component, ractive;

	Component = Ractive.extend({
		template: function(t, options){
			if(options.data.fizz) { return '{{fizz}}'; }
		}
	});

	ractive = new Component({
		el: fixture,
		template: '{{foo}}',
		data: { foo: 'bar', fizz: 'bizz' }
	});

	t.equal( fixture.innerHTML, 'bizz' );

	ractive = new Component({
		el: fixture,
		template: '{{foo}}',
		data: { foo: 'bar' }
	});

	t.equal( fixture.innerHTML, 'bar' );

});
*/
