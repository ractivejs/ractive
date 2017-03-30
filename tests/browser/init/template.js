import { beforeEach, initModule } from '../../helpers/test-config';
import { TEMPLATE_VERSION } from '../../../src/config/template';
import config from '../../../src/Ractive/config/custom/template';
import { test } from 'qunit';

export default function() {
	let MockRactive;
	let Component;
	let ractive;
	const templateOpt1 = { template: '{{foo}}' };
	const templateOpt2 = { template: '{{bar}}' };
	const templateOpt1fn = { template: () => templateOpt1.template };

	beforeEach( () => {
		//Ractive = { defaults: {}, parseOptions: {} };
		ractive = { _config: {} };

		// bootstrap mock Ractive
		MockRactive = function () {};
		MockRactive.prototype = { template: { v: TEMPLATE_VERSION, t: [] } };
		MockRactive.defaults = MockRactive.prototype;

		Component = function() {};
		Component.prototype = Object.create( MockRactive.prototype );
		Component.prototype.constructor = Component;
		Component.defaults = Component.prototype;
	});

	initModule( 'init/template.js' );

	function mockExtend ( template ) {
		config.extend( MockRactive, Component.prototype, template || {} );
	}

	test( 'Default create', t => {
		const template = MockRactive.defaults.template;

		t.ok( template, 'on defaults' );
		t.ok( Object.prototype.toString.call( template ), 'isObject' );
		t.ok( template.v, 'has version' );
		t.ok( template.t, 'has main template' );
		t.equal( template.t.length, 0, 'main template has no items' );
	});

	test( 'Empty extend inherits parent', t => {
		mockExtend();
		const template = Component.defaults.template;

		t.ok( template, 'on defaults' );
		t.ok( Object.prototype.toString.call( template ), 'isObject' );
		t.ok( template.v, 'has version' );
		t.ok( template.t, 'has main template' );
		t.equal( template.t.length, 0, 'main template has no items' );
	});

	test( 'Extend with template', t => {
		mockExtend( templateOpt1 );
		t.deepEqual( Component.defaults.template, { v: TEMPLATE_VERSION, t: [{ r: 'foo', t: 2 }] } );
	});

	test( 'Extend twice with different templates', t => {
		config.extend( MockRactive, Component.prototype, templateOpt1 );
		const Child = Object.create( Component );
		config.extend( Component, Child.prototype, templateOpt2 );

		t.deepEqual( Child.prototype.template, { v: TEMPLATE_VERSION, t: [{ r: 'bar', t: 2 }] } );
	});

	test( 'Init template', t => {
		config.init( MockRactive, ractive, templateOpt1 );

		t.ok( !ractive.defaults );
		t.deepEqual( ractive.template, [{ r: 'foo', t: 2 }] );
	});

	test( 'Init with pure string template', t => {
		config.init( MockRactive, ractive, { template: 'foo' } );
		t.equal( ractive.template, 'foo' );
	});

	test( 'Init take precedence over default', t => {
		config.extend( MockRactive, Component.prototype, templateOpt1 );
		config.init( Component, ractive, templateOpt2 );

		t.deepEqual( ractive.template, [{ r: 'bar', t: 2 }] );
	});

	test( 'Extend with template function', t => {
		config.extend( MockRactive, Component.prototype, templateOpt1fn );
		config.init( Component, ractive, {} );

		t.deepEqual( ractive.template, [{ r: 'foo', t: 2 }] );
	});

	test( 'Extend uses child parse options', t => {
		Component.defaults.delimiters = [ '<#', '#>' ];

		config.extend( MockRactive, Component.prototype, { template: '<#foo#>' } );
		config.init( Component, ractive, {} );

		t.deepEqual( ractive.template, [{ r: 'foo', t: 2 }] );
	});

	test( 'Init with template function', t => {
		config.init( MockRactive, ractive, templateOpt1fn );
		t.deepEqual( ractive.template, [{ r: 'foo', t: 2 }] );
	});

	test( 'Overwrite after extend before init', t => {
		config.extend( MockRactive, Component.prototype, templateOpt1 );
		Component.defaults.template = templateOpt2.template;

		config.init( Component, ractive, {} );
		t.deepEqual( ractive.template, [{ r: 'bar', t: 2 }] );
	});

	test( 'Template with partial', t => {
		ractive.partials = {};

		config.init( MockRactive, ractive, {
			template: '{{foo}}{{#partial bar}}{{bar}}{{/partial}}'
		});

		t.deepEqual( ractive.template, [{ r: 'foo', t: 2 }] );
		t.ok( ractive.partials.bar );
		t.deepEqual( ractive.partials.bar, [{ r: 'bar', t: 2 }] );
	});

	test( 'Template with partial extended', t => {
		const options = { template: '{{foo}}{{#partial bar}}{{bar}}{{/partial}}' };

		Component.partials = {};
		config.extend( MockRactive, Component.prototype, options );

		t.deepEqual( Component.defaults.template, { v: TEMPLATE_VERSION, t: [{r: 'foo', t: 2 } ], p: {bar: [{r: 'bar', t: 2 } ] } });
	});

	test( 'Template with partial added and takes precedence over option partials', t => {
		ractive.partials = {
			bar: '{{bop}}',
			bizz: '{{buzz}}'
		};

		config.init( MockRactive, ractive, {
			template: '{{foo}}{{#partial bar}}{{bar}}{{/partial}}'
		});

		t.ok( ractive.partials.bar, 'has bar partial' );
		t.ok( ractive.partials.bizz, 'has bizz partial' );

		delete ractive.partials;
	});
}
