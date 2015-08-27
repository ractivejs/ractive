import cleanup from 'helpers/cleanup';

module( 'ractive.updateModel()', { afterEach: cleanup });

test( 'Works across component boundary', t => {
	const widget = Ractive.extend({
	    template: '{{bar}}'
	});

	const ractive = new Ractive({
	    el: fixture,
	    template: `<input value='{{foo.bar}}'/><widget bar='{{foo.bar}}'/>`,
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

	t.equal( fixture.innerHTML, '<input value="changed">changed' );
	t.equal( ractive.findComponent( 'widget' ).get( 'bar' ), 'changed' );
});
