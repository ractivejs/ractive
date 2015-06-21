import DataNode from 'viewmodel/nodes/DataNode';
import { REFERENCE } from 'config/types';
import noop from 'utils/noop';
import ExpressionProxy from './ExpressionProxy';
import ReferenceResolver from './ReferenceResolver';
import resolveReference from './resolveReference';
import resolve from './resolve';
import { unbind } from 'shared/methodCallers';

export default class ReferenceExpressionProxy extends DataNode {
	constructor ( fragment, template ) {
		super( fragment.ractive.viewmodel, null );

		this.resolvers = [];

		this.base = resolve( fragment, template );

		if ( !this.base ) {
			const resolver = new ReferenceResolver( fragment, template.r, model => {
				this.base = model;
				this.bubble();
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
					// this should not be able to resolve immediately...
					const resolver = new ReferenceResolver( fragment, template.n, model => {
						this.members[i] = model;

						model.register( intermediary );
						this.bubble();
					});

					this.resolvers.push( resolver );
				}

				return model;
			}

			return new ExpressionProxy( fragment, template );
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

		this.value = model.value; // TODO is this necessary, or would this.get() suffice?

		if ( this.model ) {
			this.model.unregister( this );
		}

		this.model = model;
		model.register( this );
	}

	forceResolution () {
		this.resolvers.forEach( resolver => resolver.forceResolution() );
		this.bubble();
	}

	get () {
		return this.model ? this.model.value : undefined;
	}

	handleChange () {
		this.mark();
	}

	unbind () {
		this.resolvers.forEach( unbind );
	}
}
