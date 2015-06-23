import Model from 'model/Model';
import { REFERENCE } from 'config/types';
import noop from 'utils/noop';
import ExpressionProxy from './ExpressionProxy';
import resolveReference from './resolveReference';
import resolve from './resolve';
import { unbind } from 'shared/methodCallers';
import { removeFromArray } from 'utils/array';

export default class ReferenceExpressionProxy extends Model {
	constructor ( fragment, template ) {
		super( fragment.ractive.viewmodel, null );

		this.resolvers = [];

		this.base = resolve( fragment, template );

		if ( !this.base ) {
			const resolver = fragment.resolve( template.r, model => {
				this.base = model;
				this.bubble();

				removeFromArray( this.resolvers, resolver );
			});

			this.resolvers.push( resolver );
		}

		const intermediary = {
			handleChange: () => this.bubble()
		};

		this.members = template.m.map( ( template, i ) => {
			if ( typeof template === 'string' ) {
				return { value: template };
			}

			// TODO this is temporary...
			let immediate = true;
			let model;

			if ( template.t === REFERENCE ) {
				model = resolveReference( fragment, template.n );

				if ( model ) {
					model.register( intermediary );
				} else {
					const resolver = fragment.resolve( template.n, model => {
						this.members[i] = model;

						model.register( intermediary );
						this.bubble();

						removeFromArray( this.resolvers, resolver );
					});

					this.resolvers.push( resolver );
				}

				return model;
			}

			model = new ExpressionProxy( fragment, template );
			model.register( intermediary );
			return model;
		});

		this.bubble();
	}

	bubble () {
		if ( !this.base ) return;

		// if some members are not resolved, abort
		let i = this.members.length;
		while ( i-- ) {
			if ( !this.members[i] || this.members[i].value === undefined ) return;
		}

		const keys = this.members.map( model => model.value );
		const model = this.base.joinAll( keys );

		if ( this.model ) {
			this.model.unregister( this );
			this.model.unregisterTwowayBinding( this );
		}

		this.model = model;
		model.register( this );
		model.registerTwowayBinding( this );

		this.mark();
	}

	forceResolution () {
		this.resolvers.forEach( resolver => resolver.forceResolution() );
		this.bubble();
	}

	get () {
		return this.model ? this.model.value : undefined;
	}

	// indirect two-way bindings
	getValue () {
		let i = this.bindings.length;
		while ( i-- ) {
			const value = this.bindings[i].getValue();
			if ( value !== this.value ) return value;
		}

		return this.value;
	}

	getKeypath () {
		return this.model ? this.model.getKeypath() : '@undefined';
	}

	handleChange () {
		this.mark();
	}

	unbind () {
		this.resolvers.forEach( unbind );
	}
}
