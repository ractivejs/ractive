module( 'ractive.updateModel()' );

test( 'Works across component boundary', t => {
	const widget = Ractive.extend({
	    template: '{{bar}}'
	});

	const ractive = new Ractive({
	    el: fixture,
	    template: `<input value='{{foo.bar}}'/><widget bar='{{foo.bar}}'/>`,
	    twoway: false,
	    data: {
	        foo: {
	            bar: 'change me'
	        }
	    },
	    components: {
	    	widget
	    }
	});

	ractive.find( 'input' ).value = 'changed';
	ractive.updateModel( 'foo' );
	t.equal( ractive.get( 'foo.bar' ), 'changed' );

	t.equal( fixture.innerHTML, '<input value="change me">changed' );
	t.equal( ractive.findComponent( 'widget' ).get( 'bar' ), 'changed' );
});
