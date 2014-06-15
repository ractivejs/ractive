define([
	'config/options/template/template',
	'utils/isArray',
	'utils/create'
],
function (
	config,
	isArray,
	create
 ) {

	'use strict';

	return function () {

		var Ractive, Component, ractive,
			templateOpt1 = { template: '{{foo}}' },
			templateOpt2 = { template: '{{bar}}' },
			templateOpt1fn = { template: () => {
				return templateOpt1.template;
			}},
			moduleSetup = {
				setup: function(){
					//Ractive = { defaults: {}, parseOptions: {} };
					ractive = { _config: {} };

					// bootstrap mock Ractive
					Ractive = function () {};
					Ractive.prototype = { template: [] };
					Ractive.defaults = Ractive.prototype;

					Component = function() {};
					Component.prototype = create( Ractive.prototype );
					Component.defaults = Component.prototype;
				},
				teardown: function(){

				}
			};

		function mockExtend( template ){

			config.extend( Ractive, Component.prototype, template);
		}

		module( 'Template Configuration', moduleSetup);

		function testDefault( template ) {

			ok( template, 'on defaults' );
			ok( isArray(template), 'isArray' );
			equal( template.length, 0, 'no items' );
			ok( !Object.keys( template ).length, 'no keys' );
		}

		function testTemplate1( template ) {
			deepEqual( template, [ { r: 'foo', t: 2 } ] );
		}

		function testTemplate2( template ) {
			deepEqual( template, [ { r: 'bar', t: 2 } ] );
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
			testTemplate1( Component.defaults.template );
		});


		test( 'Extend twice with different templates', t => {
			config.extend( Ractive, Component.prototype, templateOpt1 );
			var Child = create( Component );
			config.extend( Component, Child.prototype, templateOpt2 );

			testTemplate2( Child.prototype.template );
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
			config.init( Component, ractive );

			testTemplate1( ractive.template );
		});

		test( 'Extend uses child parse options', t => {
			Component.defaults.delimiters = [ '[[', ']]' ];

			config.extend( Ractive, Component.prototype, { template: '[[foo]]' } );
			config.init( Component, ractive );

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

			config.init( Component, ractive );
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

			config.init( Ractive, ractive, {
				template: '{{foo}}<!-- {{>bar}} -->{{bar}}<!-- {{/bar}} -->'
			});

			testTemplate1( ractive.template );
			t.ok( ractive.partials.bar );
			testTemplate2( ractive.partials.bar)

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
			testTemplate2( ractive.partials.bar, 'has correct bar partial')

			delete ractive.partials;

		});

	}


});
