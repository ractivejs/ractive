import { REFERENCE } from 'config/types';
import ExpressionResolver from './ExpressionResolver';
import IndexReferenceResolver from './IndexReferenceResolver';
import KeyReferenceResolver from './KeyReferenceResolver';
import ReferenceResolver from './ReferenceResolver';
import ShadowResolver from './ShadowResolver';

export default class ReferenceExpressionResolver {
	constructor ( fragment, template, callback ) {
		this.callback = callback;

		this.baseResolver = new ReferenceResolver( fragment, template.r, model => {
			this.base = model;
		});

		this.members = new Array( template.m.length );
		this.memberResolvers = template.m.map( ( template, i ) => {
			const callback = model => this.resolve( i, model );

			if ( typeof template === 'string' ) {
				this.members[i] = { value: template };
			}

			else if ( template.t === REFERENCE ) {
				const ref = template.n;

				// TODO handle fragment context changes (e.g. `{{#with foo[bar]}}...`)
				if ( ref === '.' || ref === 'this' ) {
					return new ShadowResolver( fragment, callback );
				}

				if ( ref === '@index' || ref in fragment.indexRefs ) {
					return new IndexReferenceResolver( fragment, ref, callback );
				}

				if ( ref === '@key' || ref in fragment.keyRefs ) {
					return new KeyReferenceResolver( fragment, ref, callback );
				}

				if ( ref[0] === '@' ) throw new Error( 'TODO' );

				return new ReferenceResolver( fragment, template.n, callback );
			}

			else {
				return new ExpressionResolver( fragment, template, callback );
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
