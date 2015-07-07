import Model from 'model/Model';
import { unbind } from 'shared/methodCallers';
import createFunction from 'shared/createFunction';
import resolveReference from './resolveReference';
import { removeFromArray } from 'utils/array';
import { defineProperty } from 'utils/object';

function wrapFunction ( fn, ractive, uid ) {
	if ( fn.__ractive_nowrap ) return fn;

	const prop = `__ractive_${uid}`;

	if ( fn[ prop ] ) return fn[ prop ];

	if ( !/\bthis\b/.test( fn ) ) {
		defineProperty( fn, '__ractive_nowrap', {
			value: true
		});
		return fn;
	}

	defineProperty( fn, prop, {
		value: fn.bind( ractive ),
		configurable: true
	});

	// Add properties/methods to wrapped function
	for ( let key in fn ) {
		if ( fn.hasOwnProperty( key ) ) {
			fn[ prop ][ key ] = fn[ key ];
		}
	}

	ractive._boundFunctions.push({ fn, prop });
	return fn[ prop ];
}

export default class ExpressionProxy extends Model {
	constructor ( fragment, template ) {
		super( fragment.ractive.viewmodel, null );

		this.fragment = fragment;
		this.template = template;

		this.isReadonly = true;

		this.fn = createFunction( template.s, template.r.length );
		this.computation = null;

		this.resolvers = [];
		this.models = template.r.map( ( ref, index ) => {
			const model = resolveReference( fragment, ref );

			if ( !model ) {
				const resolver = fragment.resolve( ref, model => {
					removeFromArray( this.resolvers, resolver );
					this.models[ index ] = model;
					this.bubble();
				});

				this.resolvers.push( resolver );
			}

			return model;
		});

		this.bubble();
	}

	bubble () {
		const ractive = this.fragment.ractive;

		// TODO the @ prevents computed props from shadowing keypaths, but the real
		// question is why it's a computed prop in the first place... (hint, it's
		// to do with {{else}} blocks)
		const key = '@' + this.template.s.replace( /_(\d+)/g, ( match, i ) => {
			if ( i >= this.models.length ) return match;

			const model = this.models[i];
			return model ? model.getKeypath() : '@undefined';
		});

		let computation = ractive.viewmodel.computations[ key ];

		// TODO this (using existing computations) appears to break some
		// tests... leaving it in this broken state pending diagnosis
		if ( !computation ) {
			const signature = {
				getter: () => {
					const values = this.models.map( model => {
						const value = model.get();

						if ( typeof value === 'function' ) {
							return wrapFunction( value, ractive, ractive._guid );
						} else {
							return value;
						}
					});

					return this.fn.apply( ractive, values );
				},
				getterString: key
			};

			computation = ractive.viewmodel.compute( key, signature );
			computation.init();
		}

		this.value = computation.value;

		if ( this.computation ) {
			this.computation.unregister( this );
			// notify children...
		}

		this.computation = computation;
		computation.register( this );
	}

	get () {
		return this.computation.value;
	}

	getKeypath () {
		return this.computation ? this.computation.getKeypath() : '@undefined';
	}

	handleChange () {
		this.mark();
	}

	unbind () {
		this.resolvers.forEach( unbind );
	}
}
