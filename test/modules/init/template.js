define([
	'config/options/template/template',
	'utils/is',
	'utils/object'
],
function (
	config,
	is,
	object
 ) {

 	var isObject = is.isObject,
 		create = object.create;

 	config = config.default || config;

	'use strict';

	return function () {

		var Ractive, Component, ractive,
			templateOpt1 = { template: '{{foo}}' },
			templateOpt2 = { template: '{{bar}}' },
			templateOpt1fn = { template: () => templateOpt1.template },

			moduleSetup = {
				setup: function(){
					//Ractive = { defaults: {}, parseOptions: {} };
					ractive = { _config: {} };

					// bootstrap mock Ractive
					Ractive = function () {};
					Ractive.prototype = { template: {v:2,t:[]} };
					Ractive.defaults = Ractive.prototype;

					Component = function() {};
					Component.prototype = create( Ractive.prototype );
					Component.prototype.constructor = Component;
					Component.defaults = Component.prototype;
				},
				teardown: function(){

				}
			};

		function mockExtend( template ){

			config.extend( Ractive, Component.prototype, template || {} );
		}

		module( 'Template Configuration', moduleSetup);

		function testDefault( template ) {

			ok( template, 'on defaults' );
			ok( isObject(template), 'isObject' );
			ok( template.v, 'has version' );
			ok( template.t, 'has main template' );
			equal( template.t.length, 0, 'main template has no items' );
		}

		function testTemplate1( template ) {
			deepEqual( template, [ { r: 'foo', t: 2 } ] );
		}

		function testTemplate2( template ) {
			deepEqual( template, [ { r: 'bar', t: 2 } ] );
		}

		function testComponentTemplate1( template ) {
			deepEqual( template, {v:2,t:[ { r: 'foo', t: 2 } ]} );
		}

		function testComponentTemplate2( template ) {
			deepEqual( template, {v:2,t:[ { r: 'bar', t: 2 } ]} );
		}

		test( 'Default create', t => {
			testDefault( Ractive.defaults.template );
		});


		test( 'Empty extend inherits parent', t => {
			mockExtend();
			testDefault( Component.defaults.template )
		});


		test( 'Extend with template', t => {
			mockExtend( templateOpt1 );
			testComponentTemplate1( Component.defaults.template );
		});


		test( 'Extend twice with different templates', t => {
			config.extend( Ractive, Component.prototype, templateOpt1 );
			var Child = create( Component );
			config.extend( Component, Child.prototype, templateOpt2 );

			testComponentTemplate2( Child.prototype.template );
		});

		test( 'Init template', t => {
			config.init( Ractive, ractive, templateOpt1 );

			t.ok( !ractive.defaults );
			testTemplate1( ractive.template );
		});

		test( 'Init with pure string template', t => {
			config.init( Ractive, ractive, { template: 'foo' } );
			t.equal( ractive.template, 'foo' );
		});

		test( 'Init take precedence over default', t => {
			config.extend( Ractive, Component.prototype, templateOpt1 );
			config.init( Component, ractive, templateOpt2 );

			testTemplate2( ractive.template );
		});

		test( 'Extend with template function', t => {
			config.extend( Ractive, Component.prototype, templateOpt1fn );
			config.init( Component, ractive, {} );

			testTemplate1( ractive.template );
		});

		test( 'Extend uses child parse options', t => {
			Component.defaults.delimiters = [ '<#', '#>' ];

			config.extend( Ractive, Component.prototype, { template: '<#foo#>' } );
			config.init( Component, ractive, {} );

			testTemplate1( ractive.template );
		});

		test( 'Init with template function', t => {
			config.init( Ractive, ractive, templateOpt1fn );
			testTemplate1( ractive.template );
		});

		// test( 'Overwrite before init', t => {

		// 	Ractive.defaults.template = templateOpt1.template;
		// 	config.init( Ractive, ractive );

		// 	testTemplate1( ractive.template );
		// });

		test( 'Overwrite after extend before init', t => {

			config.extend( Ractive, Component.prototype, templateOpt1 );
			Component.defaults.template = templateOpt2.template;

			config.init( Component, ractive, {} );
			testTemplate2( ractive.template );
		});


		test( 'Template function arguments and this', t => {

			ractive.data = { good: true };

			config.init( Ractive, ractive, {
				template: function( data, parser ){
					t.equal( this, ractive );
					t.ok( parser.parse );
					return ( data.good ? templateOpt1 : templateOpt2).template;
				}
			});

			testTemplate1( ractive.template );

		});

		module( 'Template Configuration', moduleSetup);

		test( 'Template with partial', t => {

			ractive.partials = {};

			config.init( Ractive, ractive, {
				template: '{{foo}}<!-- {{>bar}} -->{{bar}}<!-- {{/bar}} -->'
			});

			testTemplate1( ractive.template );
			t.ok( ractive.partials.bar );
			testTemplate2( ractive.partials.bar)

		});

		test( 'Template with partial extended', t => {

			var options = { template: '{{foo}}<!-- {{>bar}} -->{{bar}}<!-- {{/bar}} -->' };

			Component.partials = {};
			config.extend( Ractive, Component.prototype, options );

			deepEqual( Component.defaults.template, { v: 2, t: [{r: "foo", t: 2 } ], p: {bar: [{r: "bar", t: 2 } ] } });

		});

		test( 'Template with partial added and takes precedence over option partials', t => {

			ractive.partials = {
				bar: '{{bop}}',
				bizz: '{{buzz}}'
			};

			config.init( Ractive, ractive, {
				template: '{{foo}}<!-- {{>bar}} -->{{bar}}<!-- {{/bar}} -->'
			});

			t.ok( ractive.partials.bar, 'has bar partial' );
			t.ok( ractive.partials.bizz, 'has bizz partial' );
			// Commenting out - surely {{bop}} doesn't need to be parsed yet?
			// testTemplate2( ractive.partials.bar, 'has correct bar partial')

			delete ractive.partials;

		});

	}


});
