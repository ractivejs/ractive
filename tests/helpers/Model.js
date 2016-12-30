class Model {
	constructor ( attributes ) {
		this.attributes = attributes;
		this.callbacks = {};
		this.transformers = {};
	}

	set ( attr, newValue ) {
		const transformer = this.transformers[ attr ];
		const oldValue = this.attributes[ attr ];

		if ( transformer ) {
			newValue = transformer.call( this, newValue, oldValue );
		}

		if ( oldValue !== newValue ) {
			this.attributes[ attr ] = newValue;
			this.fire( 'change', attr, newValue );
		}
	}

	get ( attr ) {
		return this.attributes[ attr ];
	}

	reset ( newData ) {
		this.attributes = {};

		for ( let attr in newData ) {
			if ( newData.hasOwnProperty( attr ) ) {
				this.set( attr, newData[ attr ] );
			}
		}
	}

	transform ( attr, transformer ) {
		this.transformers[ attr ] = transformer;
		if ( this.attributes.hasOwnProperty( attr ) ) {
			this.set( attr, this.get( attr ) );
		}
	}

	on ( eventName, callback ) {
		if ( !this.callbacks[ eventName ] ) {
			this.callbacks[ eventName ] = [];
		}

		this.callbacks[ eventName ].push( callback );

		return {
			cancel: () => {
				this.off( eventName, callback );
			}
		};
	}

	off ( eventName, callback ) {
		let callbacks = this.callbacks[ eventName ];

		if ( !callbacks ) {
			return;
		}

		const index = callbacks.indexOf( callback );
		if ( index !== -1 ) {
			callbacks.splice( index, 1 );
		}
	}

	fire ( eventName ) {
		let callbacks = this.callbacks[ eventName ];

		if ( !callbacks ) {
			return;
		}

		const args = Array.prototype.slice.call( arguments, 1 );
		let i = callbacks.length;
		while ( i-- ) {
			callbacks[i].apply( null, args );
		}
	}
}

Model.adaptor = {
	filter ( object ) {
		return object instanceof Model;
	},
	wrap ( ractive, object, keypath, prefix ) {
		let setting;

		const listener = object.on( 'change', function ( attr, value ) {
			if ( setting ) {
				return;
			}

			setting = true;
			ractive.set( prefix( attr ), value );
			setting = false;
		});

		return {
			get () {
				return object.attributes;
			},
			teardown () {
				listener.cancel();
			},
			set ( attr, value ) {
				if ( setting ) {
					return;
				}

				setting = true;
				object.set( attr, value );
				setting = false;
			},
			reset ( newData ) {
				if ( setting ) {
					return;
				}

				if ( newData instanceof Model ) {
					return false; // teardown
				}

				if ( !newData || typeof newData !== 'object' ) {
					return false;
				}

				setting = true;
				object.reset( newData );
				ractive.update( keypath );
				setting = false;
			}
		};
	}
};

export default Model;
