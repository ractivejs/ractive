define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, Model, adaptor;

		module( 'Adaptors' );

		// setup
		fixture = document.getElementById( 'qunit-fixture' );

		Model = function ( attributes ) {
			this.attributes = attributes;
			this.callbacks = {};
			this.transformers = {};
		};

		Model.prototype = {
			set: function ( attr, newValue ) {
				var transformer, oldValue = this.attributes[ attr ];

				if ( transformer = this.transformers[ attr ] ) {
					newValue = transformer.call( this, newValue, oldValue );
				}

				if ( oldValue !== newValue ) {
					this.attributes[ attr ] = newValue;
					this.fire( 'change', attr, newValue );
				}
			},

			get: function ( attr ) {
				return this.attributes[ attr ];
			},

			reset: function ( newData ) {
				var attr;

				this.attributes = {};

				for ( attr in newData ) {
					if ( newData.hasOwnProperty( attr ) ) {
						this.set( attr, newData[ attr ] );
					}
				}
			},

			transform: function ( attr, transformer ) {
				this.transformers[ attr ] = transformer;
				if ( this.attributes.hasOwnProperty( attr ) ) {
					this.set( attr, this.get( attr ) );
				}
			},

			on: function ( eventName, callback ) {
				var self = this;

				if ( !this.callbacks[ eventName ] ) {
					this.callbacks[ eventName ] = [];
				}

				this.callbacks[ eventName ].push( callback );

				return {
					cancel: function () {
						self.off( eventName, callback );
					}
				}
			},

			off: function ( eventName, callback ) {
				var callbacks, index;

				callbacks = this.callbacks[ eventName ];

				if ( !callbacks ) {
					return;
				}

				index = callbacks.indexOf( callback );
				if ( index !== -1 ) {
					callbacks.splice( index, 1 );
				}
			},

			fire: function ( eventName ) {
				var args, callbacks, i;

				callbacks = this.callbacks[ eventName ];

				if ( !callbacks ) {
					return;
				}

				args = Array.prototype.slice.call( arguments, 1 );
				i = callbacks.length;
				while ( i-- ) {
					callbacks[i].apply( null, args );
				}
			}
		};

		adaptor = {
			filter: function ( object ) {
				return object instanceof Model;
			},
			wrap: function ( ractive, object, keypath, prefix ) {
				var listener, setting;

				listener = object.on( 'change', function ( attr, value ) {
					if ( setting ) {
						return;
					}

					setting = true;
					ractive.set( prefix( attr, value ) );
					setting = false;
				});

				return {
					get: function () {
						return object.attributes;
					},
					teardown: function () {
						listener.cancel();
					},
					set: function ( attr, value ) {
						if ( setting ) {
							return;
						}

						setting = true;
						object.set( attr, value );
						setting = false;
					},
					reset: function ( newData ) {
						var attr;

						if ( newData instanceof Model ) {
							return false; // teardown
						}

						if ( !newData || typeof newData !== 'object' ) {
							return false;
						}

						object.reset( newData );
						ractive.update( keypath );
					}
				};
			}
		};

		test( 'Adaptors can change data as it is .set() (#442)', function ( t ) {
			var model, ractive;

			model = new Model({
				foo: 'BAR',
				percent: 150
			});

			model.transform( 'foo', function ( newValue, oldValue ) {
				return newValue.toLowerCase();
			});

			model.transform( 'percent', function ( newValue, oldValue ) {
				return Math.min( 100, Math.max( 0, newValue ) );
			});

			ractive = new Ractive({
				el: fixture,
				template: '<p>{{model.foo}}</p><p>{{model.percent}}</p>',
				data: {
					model: model
				},
				adapt: [ adaptor ]
			});

			t.htmlEqual( fixture.innerHTML, '<p>bar</p><p>100</p>' );

			ractive.set( 'model.foo', 'BAZ' );
			ractive.set( 'model.percent', -20 );
			t.htmlEqual( fixture.innerHTML, '<p>baz</p><p>0</p>' );

			ractive.set( 'model', {
				foo: 'QUX',
				percent: 50
			});
			t.htmlEqual( fixture.innerHTML, '<p>qux</p><p>50</p>' );
		});

		test( 'ractive.reset() calls are forwarded to wrappers if the root data object is wrapped', function ( t ) {
			var model, ractive;

			model = new Model({
				foo: 'BAR',
				unwanted: 'here'
			});

			model.transform( 'foo', function ( newValue, oldValue ) {
				return newValue.toLowerCase();
			});

			ractive = new Ractive({
				el: fixture,
				template: '<p>{{foo}}</p>{{unwanted}}',
				data: model,
				adapt: [ adaptor ]
			});

			ractive.reset({ foo: 'BAZ' });
			t.htmlEqual( fixture.innerHTML, '<p>baz</p>' );

			model = new Model({ foo: 'QUX' });

			model.transform( 'foo', function ( newValue, oldValue ) {
				return newValue.toLowerCase();
			});

			ractive.reset( model );
			t.htmlEqual( fixture.innerHTML, '<p>qux</p>' );
		});

		test( 'If a wrapper\'s reset() method returns false, it should be torn down (#467)', function ( t ) {
			var model1, model2, ractive;

			model1 = new Model({
				foo: 'bar'
			});

			model2 = new Model({
				foo: 'baz'
			});

			ractive = new Ractive({
				el: fixture,
				template: '<p>{{model.foo}}</p>',
				data: { model: model1 },
				adapt: [ adaptor ]
			});

			t.htmlEqual( fixture.innerHTML, '<p>bar</p>' );

			ractive.set( 'model', model2 );
			t.htmlEqual( fixture.innerHTML, '<p>baz</p>' );
		});

	};

});
