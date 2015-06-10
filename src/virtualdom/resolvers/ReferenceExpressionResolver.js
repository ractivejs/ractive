import { REFERENCE } from 'config/types';
import ReferenceResolver from './ReferenceResolver';

export default class ReferenceExpressionResolver {
	constructor ( fragment, template, callback ) {
		this.callback = callback;

		this.baseResolver = new ReferenceResolver( fragment, template.r, model => {
			this.base = model;
		});

		this.members = new Array( template.m.length );
		this.memberResolvers = template.m.map( ( template, i ) => {
			const callback = model => this.resolve( i, model );

			if ( template.t === REFERENCE ) {
				return new ReferenceResolver( fragment, template.n, callback );
			}

			else {
				throw new Error( 'TODO' );
			}
		});

		this.ready = true;
		this.bubble();
	}

	bubble () {
		if ( !this.ready ) return;

		// TODO if some members are not resolved, abort
		const keys = this.members.map( model => model.value );
		const model = this.base.join( keys );

		this.callback( model );
	}

	handleChange () {
		this.bubble();
	}

	resolve ( i, model ) {
		this.members[i] = model;

		model.register( this );
		this.bubble();
	}
}
