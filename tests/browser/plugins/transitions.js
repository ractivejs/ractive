import { afterEach, beforeEach, hasUsableConsole, onWarn, initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	let Ractive_original;

	beforeEach( () => {
		// augment base Ractive object slightly
		Ractive_original = Ractive;
		Ractive = Ractive.extend({
			onconstruct ( options ) {
				// if a beforeComplete method is given as an initialisation option,
				// add it to the instance (unless it already exists on a component prototype)
				!this.beforeComplete && ( this.beforeComplete = options.beforeComplete );
			}
		});

		Ractive.transitions.test = function ( t, params ) {
			const delay = ( params && params.delay ) || 10;

			setTimeout( () => {
				if ( t.ractive.beforeComplete ) {
					t.ractive.beforeComplete( t, params );
				}

				t.complete();
			}, delay );
		};
	});

	afterEach( () => {
		Ractive = Ractive_original;
	});

	initModule( 'plugins/transitions.js' );

	test( 'Animated style', t => {
		t.expect( 2 );

		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#if show}}
					<div test-in>content...</div>
				{{/if show}}`,
			transitions: {
				test: function ( transition ) { // eslint-disable-line object-shorthand
					transition.setStyle( 'height', '100px' );

					transition.animateStyle( 'height', '200px', {
						duration: 50
					}).then( transition.complete );

					// should not have changed yet
					t.equal( transition.getStyle( [ 'height' ] ).height, '100px' );
				}
			}
		});

		ractive.set( 'show', true ).then( () => {
			const div = ractive.find( 'div' );
			t.equal( div.style.height, '' );
			done();
		});
	});

	test( 'Elements containing components with outroing elements do not detach until transitions are complete', t => {
		const done = t.async();

		let shouldHaveCompleted;

		const Widget = Ractive.extend({
			template: '<p test-out>foo</p>',
			beforeComplete () {
				shouldHaveCompleted = true;
				t.ok( fixture.contains( p ), '<p> element has already been removed from the DOM' );
			}
		});

		const ractive = new Ractive({
			el: fixture,
			template: '{{#foo}}<div><widget/></div>{{/foo}}',
			components: {
				widget: Widget
			},
			data: { foo: true }
		});

		const p = ractive.find( 'p' );

		ractive.set( 'foo', false ).then( () => {
			t.ok( shouldHaveCompleted, 'promise was fulfilled before transition had completed' );
			t.ok( !fixture.contains( p ), '<p> element should have been removed from the DOM' );
			done();
		});
	});

	test( 'noIntro option prevents intro transition', t => {
		const done = t.async();

		t.expect( 1 );

		let transitioned;

		new Ractive({
			el: fixture,
			template: '<div test-in></div>',
			noIntro: true,
			beforeComplete(){
				transitioned = true;
			},
			oncomplete(){
				t.ok( !transitioned, 'transition happened');
				done();
			}
		});
	});

	test( 'noOutro option prevents outro transition', t => {
		const done = t.async();

		t.expect( 1 );

		let transitioned;

		const r = new Ractive({
			el: fixture,
			template: '<div test-out></div>',
			noIntro: true,
			beforeComplete(){
				transitioned = true;
			},
			onteardown(){
				t.ok( !transitioned, 'transition happened');
				done();
			}
		});
		r.teardown();
	});

	test( 'noIntro option prevents intro transition when el is initially undefined', t => {
		t.expect( 1 );

		const done = t.async();

		let transitioned;

		const ractive = new Ractive({
			template: '<div test-in></div>',
			noIntro: true,
			beforeComplete () {
				transitioned = true;
			},
			oncomplete () {
				t.ok( !transitioned, 'transition happened');
				done();
			}
		});

		ractive.render( fixture );
	});

	test( 'noIntro on a rendering parent instance prevents intro transition on component', t => {
		t.expect( 1 );
		const done = t.async();

		const cmp = Ractive.extend({
			template: '<div check-in />',
			transitions: {
				check ( trans ) {
					t.ok( false, 'transition should not run' );
					trans.complete();
				}
			}
		});

		const r = new Ractive({
			noIntro: true,
			template: '<cmp />',
			components: { cmp }
		});

		r.render( fixture ).then( () => {
			t.htmlEqual( fixture.innerHTML, '<div></div>' );
			done();
		});
	});

	test( `noIntro on already rendered parent instance doesn't affect components`, t => {
		t.expect( 2 );
		const done = t.async();

		const cmp = Ractive.extend({
			template: '<div check-in />',
			transitions: {
				check ( trans ) {
					t.ok( true, 'transition should run' );
					trans.complete();
				}
			}
		});

		const r = new Ractive({
			noIntro: true,
			target: fixture,
			template: '{{#if show}}<cmp />{{/if}}',
			components: { cmp }
		});

		r.toggle( 'show' ).then( () => {
			t.htmlEqual( fixture.innerHTML, '<div></div>' );
			done();
		});
	});

	test( `noOutro on still rendered parent instance doesn't affect components`, t => {
		t.expect( 2 );
		const done = t.async();

		const cmp = Ractive.extend({
			template: '<div check-out />',
			transitions: {
				check ( trans ) {
					t.ok( true, 'transition should run' );
					trans.complete();
				}
			}
		});

		const r = new Ractive({
			noOutro: true,
			target: fixture,
			template: '{{#unless hide}}<cmp />{{/unless}}',
			components: { cmp }
		});

		r.toggle( 'hide' ).then( () => {
			t.htmlEqual( fixture.innerHTML, '' );
			done();
		});
	});

	test( 'ractive.transitionsEnabled false prevents all transitions', t => {
		t.expect( 1 );

		const done = t.async();

		let transitioned;

		const Component = Ractive.extend({
			template: '{{#foo}}<div test-in-out></div>{{/foo}}',
			onconstruct ( options ) {
				this._super( options );
				this.transitionsEnabled = false;
			},
			beforeComplete () {
				transitioned = true;
			}
		});

		new Component({
			el: fixture,
			data: { foo: true },
			oncomplete () {
				this.set( 'foo', false ).then( () => {
					t.ok( !transitioned, 'outro transition happened');
					done();
				});
			}
		});
	});

	if ( hasUsableConsole ) {
		test( 'Missing transition functions do not cause errors, but do console.warn', t => {
			t.expect( 1 );

			const done = t.async();

			onWarn( msg => {
				t.ok( msg );
			});

			new Ractive({
				el: fixture,
				template: '<div foo-in></div>',
				oncomplete () {
					done();
				}
			});
		});
	}

	test( 'Transitions work the first time (#916)', t => {
		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			template: '<div changeHeight-in></div>',
			oncomplete () {
				t.equal( div.style.height, '' );
				done();
			},
			transitions: {
				changeHeight ( t ) {
					let targetHeight;

					if ( t.isIntro ) {
						targetHeight = t.getStyle( 'height' );
						t.setStyle( 'height', 0 );
					} else {
						targetHeight = 0;
					}

					t.animateStyle( 'height', targetHeight, { duration: 50 } ).then( t.complete );
				}
			}
		});

		const div = ractive.find( 'div' );
		t.equal( div.style.height, '0px' );
	});

	test( 'Nodes are detached synchronously if there are no outro transitions (#856)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#if foo}}<div test-in>intro</div>{{else}}<div class="target">no outro</div>{{/if}}'
		});

		const target = ractive.find( '.target' );
		t.ok( fixture.contains( target ) );

		ractive.set( 'foo', true );
		t.ok( !fixture.contains( target ) );
	});

	test( 'Regression test for #1157', t => {
		const done = t.async();

		new Ractive({
			el: fixture,
			template: '<div test-in="{ duration: foo ? 1000 : 0 }"></div>',
			transitions: {
				test: function ( transition, params ) { // eslint-disable-line object-shorthand
					t.deepEqual( params, { duration: 0 });
					done();
				}
			}
		});
	});

	test( 'Parameter objects are not polluted (#1239)', t => {
		const done = t.async();

		t.expect(3);

		let uid = 0;
		const objects = [];

		new Ractive({
			el: fixture,
			template: '{{#each list}}<p foo-in="{}"></p>{{/each}}',
			transitions: {
				foo ( t, params ) {
					params = t.processParams( params, {
						uid: uid++
					});
					objects.push( params );
					t.complete();
				}
			},
			data: { list: [ 0, 0 ] },
			oncomplete () {
				t.ok( true );
				done();
			},
		});

		t.equal( objects.length, 2 );
		t.notEqual( objects[0], objects[1] );
	});

	test( 'processParams extends correctly if no default provided (#2446)', t => {
		new Ractive({
			el: fixture,
			template: '<p foo-in="{ duration: 1000 }"></p>',
			transitions: {
				foo ( transition, params ) {
					params = transition.processParams( params );

					// Test that the duration param is present
					t.equal( params.duration, 1000 );
				}
			}
		});
	});

	test( 'An intro will be aborted if a corresponding outro begins before it completes', t => {
		let tooLate;

		const done = t.async();
		t.expect( 0 );

		const ractive = new Ractive({
			el: fixture,
			template: '{{#showBox}}<div wait-in="2000" wait-out="1"></div>{{/showBox}}',
			transitions: {
				wait ( t, ms ) {
					setTimeout( t.complete, ms );
				}
			}
		});

		ractive.set( 'showBox', true ).then( () => {
			if ( !tooLate ) {
				done();
			}
		});

		setTimeout( () => {
			ractive.set( 'showBox', false );
		}, 0 );

		setTimeout( () => {
			tooLate = true;
		}, 200 );
	});

	test( 'processParams extends correctly if no default provided (#2446)', t => {
		new Ractive({
			el: fixture,
			template: '<p foo-in="{ duration: 1000 }"></p>',
			transitions: {
				foo ( transition, params ) {
					params = transition.processParams( params );

					// Test that the duration param is present
					t.equal( params.duration, 1000 );
				}
			}
		});
	});

	test( 'Conditional sections that become truthy are not rendered if a parent simultaneously becomes falsy (#1483)', t => {
		let transitionRan = false;
		const done = t.async();
		t.expect(1);

		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#if foo.length || bar.length}}
					{{#if foo === bar}}
						<span x-in-out></span>
					{{/if}}
				{{/if}}`,
			transitions: {
				x ( t ) {
					transitionRan = true;
					setTimeout( t.complete, 0 );
				}
			},
			data: {
				foo: '',
				bar: ''
			},
			oncomplete () { done(); }
		});

		ractive.set( 'foo', 'x' );
		ractive.set( 'foo', '' );

		t.ok( !transitionRan );
	});

	test( 'Nodes that are affected by deferred observers should actually get dettached (#2310)', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#if bar}}<span>baz</span>{{/if}}`,
			data: { foo: true, bar: true }
		});

		r.observe( 'foo', v => r.set( 'bar', v ), { defer: true } );

		t.htmlEqual( fixture.innerHTML, '<span>baz</span>' );
		r.set( 'foo', false );
		t.htmlEqual( fixture.innerHTML, '' );
		r.set( 'foo', true );
		t.htmlEqual( fixture.innerHTML, '<span>baz</span>' );
	});

	if ( !/phantom/i.test( navigator.userAgent ) ) {
		test( 'Nodes not affected by a transition should be immediately handled (#2027)', t => {
			const done = t.async();
			t.expect( 3 );

			function trans( tr ) {
				t.ok( true, 'transition actually ran' );
				setTimeout( () => tr.complete(), 400 );
			}
			const r = new Ractive({
				el: fixture,
				template: `{{#if foo}}<span trans-out id="span1" /><span id="span2" />{{/if}}`,
				data: { foo: true },
				transitions: { trans }
			});

			r.set( 'foo', false ).then( done, done );
			t.ok( !/span2/.test( fixture.innerHTML ), 'span2 is gone immediately' );
			t.ok( /span1/.test( fixture.innerHTML ), 'span1 hangs around until the transition is done' );
		});
	}

	test( 'Context of transition function is current instance', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: `{{#if visible}}<div test-in></div>{{/if}}`,
			data: { visible: false },
			transitions: {
				test: function ( transition ) { // eslint-disable-line object-shorthand
					t.ok( this === ractive );
					transition.complete();
				}
			}
		});

		ractive.set( 'visible', true );
	});

	test( `transitions don't wipe out inline styles set during run when completing (#2986)`, t => {
		const done = t.async();

		const r = new Ractive({
			template: '<div go-in {{#if yep}}style-height="50px"{{/if}} />',
			transitions: {
				go ( trans ) {
					trans.setStyle( 'height', '0px' );
					trans.animateStyle( 'height', '100px', { duration: 50 } ).then( trans.complete );
				}
			}
		});

		r.render( fixture ).then( () => {
			t.equal( r.find( 'div' ).style.height, '50px' );
		}).then( done, done );

		t.equal( r.find( 'div' ).style.height, '0px' );

		setTimeout( () => r.set( 'yep', true ), 30 );
	});

	test( 'intro transitions can be conditional', t => {
		let count = 0;
		const r = new Ractive({
			el: fixture,
			template: `{{#if foo}}<div {{#if bar}}go-in{{/if}}></div>{{/if}}`,
			data: { foo: true, bar: true },
			transitions: {
				go ( t ) {
					count++;
					t.complete();
				}
			}
		});

		t.equal( count, 1 );
		r.set({ foo: false, bar: false });
		r.set( 'foo', true );
		t.equal( count, 1 );
		r.set({ foo: false, bar: true });
		r.set( 'foo', true );
		t.equal( count, 2 );
	});

	test( 'outro transitions can be conditional', t => {
		let count = 0;
		const r = new Ractive({
			el: fixture,
			template: `{{#if foo}}<div {{#if bar}}go-out{{/if}}></div>{{/if}}`,
			data: { foo: true, bar: true },
			transitions: {
				go ( t ) {
					count++;
					t.complete();
				}
			}
		});

		t.equal( count, 0 );
		r.set({ foo: false, bar: false });
		t.equal( count, 1 );
		r.set( 'foo', true );
		r.set( 'foo', false );
		t.equal( count, 1 );
		r.set( 'bar', true );
		r.set( 'foo', true );
		r.set( 'foo', false );
		t.equal( count, 2 );
	});

	test( 'intro-outro transitions can be conditional', t => {
		let count = 0;
		const r = new Ractive({
			el: fixture,
			template: `{{#if foo}}<div {{#if bar}}go-in-out{{/if}}></div>{{/if}}`,
			data: { foo: true, bar: true },
			transitions: {
				go ( t ) {
					count++;
					t.complete();
				}
			}
		});

		t.equal( count, 1 );
		r.set({ foo: false, bar: false });
		t.equal( count, 2 );
		r.set( 'foo', true );
		r.set( 'foo', false );
		t.equal( count, 2 );
		r.set( 'bar', true );
		r.set( 'foo', true );
		r.set( 'foo', false );
		t.equal( count, 4 );
	});

	test( 'intros can be named attributes', t => {
		let count = 0;
		const r = new Ractive({
			el: fixture,
			template: '{{#if foo}}<div go-in></div>{{/if}}',
			data: { foo: true },
			transitions: {
				go ( t ) {
					count++;
					t.complete();
				}
			}
		});

		t.equal( count, 1 );
		r.set( 'foo', false );
		r.set( 'foo', true );
		t.equal( count, 2 );
	});

	test( 'outros can be named attributes', t => {
		let count = 0;
		const r = new Ractive({
			el: fixture,
			template: '{{#if foo}}<div go-out></div>{{/if}}',
			data: { foo: true },
			transitions: {
				go ( t ) {
					count++;
					t.complete();
				}
			}
		});

		r.set( 'foo', false );
		t.equal( count, 1 );
		r.set( 'foo', true );
		r.set( 'foo', false );
		t.equal( count, 2 );
	});

	test( 'intro-outros can be named attributes', t => {
		let count = 0;
		const r = new Ractive({
			el: fixture,
			template: '{{#if foo}}<div go-in-out></div>{{/if}}',
			data: { foo: true },
			transitions: {
				go ( t ) {
					count++;
					t.complete();
				}
			}
		});

		t.equal( count, 1 );
		r.set( 'foo', false );
		t.equal( count, 2 );
		r.set( 'foo', true );
		t.equal( count, 3 );
		r.set( 'foo', false );
		t.equal( count, 4 );
	});


	test( 'named attribute transitions can have normal expression args', t => {
		let count = 0;
		new Ractive({
			el: fixture,
			template: `{{#if foo}}<div go-in="bar, 'bat'"></div>{{/if}}`,
			data: { foo: true, bar: 'foo' },
			transitions: {
				go ( trans, bar, str ) {
					count++;
					t.equal( bar, 'foo' );
					t.equal( str, 'bat' );
					trans.complete();
				}
			}
		});

		t.equal( count, 1 );
	});

	test( `transitions have a timeout safety net (#2463)`, t => {
		const done = t.async();
		t.expect( 1 );

		const r = new Ractive({
			el: fixture,
			template: `{{#if show}}<div go-out>foo</div>{{/if}}`,
			data: {
				show: true
			},
			transitions: {
				go ( trans ) {
					if ( trans.isIntro ) {
						trans.setStyle( 'opacity', 1 );
						trans.complete();
					} else {
						trans.animateStyle( 'opacity', 0, { duration: 100 } ).then( () => {
							trans.complete();
						});
						setTimeout( () => {
							trans.node.style.transition = '';
							trans.node.style.transitionDelay = '';
							trans.node.style.transitionFunction = '';
						}, 20 );
					}
				}
			}
		});

		r.set( 'show', false ).then( () => {
			t.ok( !r.find( 'div' ), 'node has been removed' );
			done();
		});
	});

	test( `transition safety net doesn't break with manual render/unrender`, t => {
		const done = t.async();
		let count = 0;
		let r;

		function go ( trans ) {
			if ( trans.isIntro ) {
				trans.setStyle( { opacity: 0 } );
				trans.animateStyle( 'opacity', 1, { duration: 100 } ).then( () => {
					trans.complete();
				});
			} else {
				trans.animateStyle( 'opacity', 0, { duration: 300 } ).then( () => {
					trans.complete();
				});
			}
		}

		function next () {
			count++;
			const rep = new Ractive({
				template: `<div go-in-out>foo {{count}}</div>`,
				transitions: { go },
				data: { count }
			});
			if ( r ) {
				r.teardown().then( () => {
					rep.render( fixture );
				});
				r = rep;
			} else {
				rep.render( fixture );
				r = rep;
			}
		}

		next();

		setTimeout( next, 50 );
		setTimeout( next, 50 );
		setTimeout( next, 50 );

		setTimeout( () => {
			t.htmlEqual( fixture.innerHTML, '<div>foo 4</div>' );
			done();
		}, 400);
	});

	test( `transition args can change (#2818)`, t => {
		let count = 0;
		function go ( trans ) {
			count++;
			trans.complete();
		}

		const r = new Ractive({
			el: fixture,
			template: `{{#if foo}}<div go-in-out="someRef" />{{/if}}`,
			data: { foo: true, someRef: 'yep' },
			transitions: { go }
		});

		t.equal( count, 1 );
		r.set( 'someRef', 'ok' );
		t.equal( count, 1 );
		r.toggle( 'foo' );
		t.equal( count, 2 );
	});

	test( `intro transitions don't leave styles hanging around`, t => {
		const done = t.async();

		function go ( trans ) {
			const height = trans.getStyle( 'height' );
			if ( trans.isIntro ) {
				trans.setStyle( 'height', 0 );
				trans.animateStyle( 'height', height, { duration: 100 } ).then( () => trans.complete() );
			} else {
				trans.setStyle( 'height', height );
				trans.animateStyle( 'height', 0, { duration: 100 } ).then( () => trans.complete() );
			}
		}

		const r = new Ractive({
			template: '<style>div#def-nerp { height: 300px }</style><div id="def-nerp" go-in-out />',
			transitions: { go }
		});

		r.render( fixture ).then( () => {
			const div = r.find( 'div' );
			t.equal( div.style.height, '' );
			t.ok( !( 'style' in div.attributes ) || ( div.getAttribute( 'style' ) === '' ) );
			r.unrender().then( () => {
				done();
			});
		});
	});

	test( `transitions that are nested: false and at root fire`, t => {
		const done = t.async();
		let count = 0;

		function go ( trans ) {
			count++;
			trans.complete();
		}

		const r = new Ractive({
			template: '<div><div go-in="{ nested: false }" /></div>',
			transitions: { go }
		});

		r.render( fixture ).then( () => {
			t.equal( count, 1 );
			done();
		});
	});

	test( `transitions that are nested: false don't fire when they aren't the root`, t => {
		const done = t.async();
		let count = 0;

		function go ( trans ) {
			count++;
			trans.complete();
		}

		const r = new Ractive({
			template: '<div go-in><div go-in="{ nested: false }" /></div>',
			transitions: { go }
		});

		r.render( fixture ).then( () => {
			t.equal( count, 1 );
			done();
		});
	});

	test( `transitions can be defaulted to nested: false at the instance level with nestedTransitions`, t => {
		const done = t.async();
		let count = 0;

		function go ( trans ) {
			count++;
			trans.complete();
		}

		const r = new Ractive({
			template: '<div go-in><div go-in /></div>',
			transitions: { go },
			nestedTransitions: false
		});

		r.render( fixture ).then( () => {
			t.equal( count, 1 );
			done();
		});
	});

	test( `transitions that are nested: true override their instance nestedTransitions setting`, t => {
		const done = t.async();
		let count = 0;

		function go ( trans ) {
			count++;
			trans.complete();
		}

		const r = new Ractive({
			template: '<div go-in><div go-in={ nested: true } /></div>',
			transitions: { go },
			nestedTransitions: false
		});

		r.render( fixture ).then( () => {
			t.equal( count, 2 );
			done();
		});
	});

	test( `transitions look to the nearest set nested setting if neither they nor their instance have an explicit setting`, t => {
		const done = t.async();
		let count = 0;

		const cmp = Ractive.extend({
			template: '<div go-in />'
		});

		function go ( trans ) {
			count++;
			trans.complete();
		}

		const r = new Ractive({
			template: '<div go-in><cmp /></div>',
			transitions: { go },
			components: { cmp },
			nestedTransitions: false
		});

		r.render( fixture ).then( () => {
			t.equal( count, 1 );
			done();
		});
	});

	test( `transition params normalization`, t => {
		const done = t.async();
		const r = new Ractive({
			template: '<div go-in />',
			transitions: {
				go ( trans ) {
					let p = trans.processParams( 'slow' );
					t.equal( p.duration, 600 );
					p = trans.processParams( 'fast' );
					t.equal( p.duration, 200 );
					p = trans.processParams( 'wat' );
					t.equal( p.duration, 400 );
					p = trans.processParams();
					t.ok( typeof p === 'object' );
					p = trans.processParams( 300 );
					t.equal( p.duration, 300 );

					trans.complete();
				}
			}
		});

		r.render( fixture ).then( done );
	});

	test( `outro transitions isOutro === false (#2852)`, t => {
		const done = t.async();
		t.expect( 2 );

		const r = new Ractive({
			target: fixture,
			template: `{{#if !foo}}<div foo-out />{{/if}}`,
			transitions: {
				foo( trans ) {
					t.ok( trans.isOutro );
					t.ok( !trans.isIntro );
					trans.complete();
				}
			}
		});

		r.toggle( 'foo' ).then( done );
	});

	test( `conditional transitions find their parent element (#2815)`, t => {
		const done = t.async();

		let count = 0;
		function go ( trans ) {
			count++;
			let start, end;
			if ( trans.isIntro ) {
				start = 0;
				end = trans.getStyle( 'opacity' );
			} else {
				end = 0;
				start = trans.getStyle( 'opacity' );
			}

			trans.setStyle( 'opacity', start );

			trans.animateStyle( 'opacity', end, { duration: 20 } ).then( trans.complete );
		}

		const r = new Ractive({
			el: fixture,
			template: `{{#if foo}}<div class="transitioned" {{#if bar}}go-in-out{{/if}}>content</div>{{/if}}`,
			transitions: { go },
			data: { bar: true }
		});

		r.toggle( 'foo' ).then( () => {
			t.equal( count, 1 );
			t.ok( fixture.querySelector( 'div.transitioned' ) );
			r.toggle( 'foo' ).then( () => {
				t.equal( count, 2 );
				t.ok( !fixture.querySelector( 'div.transitioned' ) );
				r.toggle( 'foo' ).then( () => {
					r.toggle( 'bar' );
					r.toggle( 'foo' ).then( () => {
						t.equal( count, 3 );
						r.toggle( 'foo' ).then( () => {
							r.toggle( 'bar' );
							r.toggle( 'foo' ).then( () => {
								t.equal( count, 4 );
								done();
							});
						});
					});
				});
			});
		});
	});

	test( `js timing functions can be used with css transitionable properties (#2152)`, t => {
		const done = t.async();

		let called = false;
		const r = new Ractive({
			target: fixture,
			template: '{{#if show}}<div go-in />{{/if}}',
			transitions: {
				go ( trans ) {
					trans.setStyle( 'height', 0 );
					trans.animateStyle( 'height', 20, { duration: 20, easing: 'go' } ).then( trans.complete );
				}
			},
			easing: {
				go ( x ) {
					called = true;
					return x;
				}
			}
		});

		r.toggle( 'show' ).then( () => {
			t.ok( called );
			done();
		});
	});

	test(`nested transitions don't require object params (#3029)`, t => {
		let count = 0;
		const done = t.async();

		function go(t) {
			count++;
			t.complete();
		}

		const r = new Ractive({
			transitions: { go },
			template: '<div go-in><div go-in=300 /></div>'
		});

		r.render(fixture).then(() => {
			t.equal(count, 2);
			done();
		}, done);
	});


	test( `triples wait on outros to detach`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: '{{#unless hide}}<div go-out>{{{nodes}}}</div>{{/unless}}',
			transitions: {
				go ( trans ) {
					t.htmlEqual( fixture.innerHTML, '<div><i>one</i><b>two</b></div>' );
					trans.complete();
				}
			},
			data: { nodes: '<i>one</i><b>two</b>' }
		});

		r.toggle( 'hide' );
	});
}
