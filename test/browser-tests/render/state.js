import { test } from 'qunit';

/* globals Ractive, fixture */

test( 'Non-keywords @state as alias for @ractive.state in template mustaches', t => {
	new Ractive({
		el: fixture,
		template: `{{@ractive.foo}}-{{@ractive['foo']}}-{{@ractive.bar()}}|{{@foo}}-{{@['foo']}}-{{@bar()}}`,
		foo: 'foo',
        bar () { return 'bar'; }
	});

	t.equal( fixture.innerHTML, 'foo-foo-bar|foo-foo-bar' );
});

test( 'Global @ractive.root state in template', t => {
	new Ractive({
		el: fixture,
        template: '<child/>',
		foo: 'foo',
        bar () { return 'bar'; },
        components: {
            child: Ractive.extend({
                // template: `{{@@foo}}-{{@@['foo']}}-{{@@bar()}}|{{@foo}}-{{@['foo']}}-{{@bar()}}`,
               	template: `{{@@foo}}-{{@@bar()}}|{{@foo}}-{{@['foo']}}-{{@bar()}}`,
                foo: 'f',
                bar () { return 'b'; }
            })
        }
	});

	t.equal( fixture.innerHTML, 'foo-bar|f-f-b' /*'foo-foo-bar|f-f-b'*/ );
});

test( 'Basic @state via api', t => {
	const ractive = new Ractive({
		foo: 'foo'
	});

	t.equal( ractive.get( '@ractive.foo' ), 'foo' );
	t.equal( ractive.get( '@foo' ), 'foo' );
});


test( 'Global @@state via api', t => {
	const ractive = new Ractive({
		el: fixture,
        template: '<child/>',
		foo: 'foo',
        qux: 'qux',
        components: {
            child: Ractive.extend({
                foo: 'f',
            })
        }
	});

    const child = ractive.findComponent( 'child' );
    
	t.equal( child.get( '@@foo' ), 'foo' );
	t.equal( child.get( '@foo' ), 'f' );
    
    // no parent lookup for state
    t.equal( child.get( '@qux' ), undefined );
});

test( 'Component @state mappings', t => {
	const ractive = new Ractive({
		el: fixture,
        template: `<child @foo='{{@foo}}' @bar='{{bar}}' qux='{{@bizz}}'/>`,
        data: { bar: 'bar' },
		foo: 'foo',
        bizz: 'bizz',
        components: {
            child: Ractive.extend({ isolated: true })
        }
	});

    const child = ractive.findComponent( 'child' );
    
	t.equal( child.get( '@foo' ), 'foo' );
	t.equal( child.foo, 'foo' );
    
	t.equal( child.get( '@bar' ), 'bar' );
	t.equal( child.bar, 'bar' );
    
	t.equal( child.get( 'qux' ), 'bizz' );
	t.equal( child.qux, undefined );
	
	// state parameters are "copied", so these should not update:
	ractive.set( '@foo', 'f' );
	ractive.set( 'bar', 'b' );
	t.equal( child.get( '@foo' ), 'foo' );
	t.equal( child.foo, 'foo' );
	t.equal( child.get( '@bar' ), 'bar' );
	t.equal( child.bar, 'bar' );
	
	// but data parameters "should" update when they're based on state
	ractive.set( '@bizz', 'b' );
	t.equal( child.get( 'qux' ), 'b' );
	
	// like-wise, state updates should not propagate upwards:
	child.set( '@foo', 'oof' );
	t.equal( ractive.foo, 'f' );
	child.set( '@bar', 'rab' );
	t.equal( ractive.get( 'bar' ), 'b' );
	
	// but data parameters mapped to parent state do update:
	child.set( 'qux', 'xuq' );
	t.equal( ractive.bizz, 'xuq' );
	 
});


