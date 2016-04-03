import Model from '../../model/Model';
import ComputationChild from '../../model/ComputationChild';
import { handleChange, unbind } from '../../shared/methodCallers';
import getFunction from '../../shared/getFunction';
import resolveReference from './resolveReference';
import { removeFromArray } from '../../utils/array';

function getValue ( model ) {
	return model ? model.get( true ) : undefined;
}

export default class ExpressionProxy extends Model {
	constructor ( fragment, template ) {
		super( fragment.ractive.viewmodel, null );

		this.fragment = fragment;
		this.template = template;

		this.isReadonly = true;

		this.fn = getFunction( template.s, template.r.length );
		this.computation = null;

		this.resolvers = [];
		this.models = this.template.r.map( ( ref, index ) => {
			const model = resolveReference( this.fragment, ref );
			let resolver;

			if ( !model ) {
				resolver = this.fragment.resolve( ref, model => {
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

		// TODO the # prevents computed props from shadowing keypaths, but the real
		// question is why it's a computed prop in the first place... (hint, it's
		// to do with {{else}} blocks)
		const key = '#' + this.template.s.replace( /_(\d+)/g, ( match, i ) => {
			if ( i >= this.models.length ) return match;

			const model = this.models[i];
			return model ? model.getKeypath() : '#undefined';
		});

		// TODO can/should we reuse computations?
		const signature = {
			getter: () => {
				const values = this.models.map( getValue );
				return this.fn.apply( ractive, values );
			},
			getterString: key
		};

		const computation = ractive.viewmodel.compute( key, signature );

		this.value = computation.get(); // TODO should not need this, eventually

		if ( this.computation ) {
			this.computation.unregister( this );
			// notify children...
		}

		this.computation = computation;
		computation.register( this );

		this.handleChange();
	}

	get ( shouldCapture ) {
		return this.computation.get( shouldCapture );
	}

	getKeypath () {
		return this.computation ? this.computation.getKeypath() : '#undefined';
	}

	handleChange () {
		this.deps.forEach( handleChange );
		this.children.forEach( handleChange );

		this.clearUnresolveds();
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new ComputationChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	mark () {
		this.handleChange();
	}

	retrieve () {
		return this.get();
	}

	teardown () {
		this.unbind();
		this.fragment = undefined;
		if ( this.computation ) {
			this.computation.teardown();
		}
		this.computation = undefined;
		super.teardown();
	}

	unregister( dep ) {
		super.unregister( dep );
		if ( !this.deps.length ) this.teardown();
	}

	unbind () {
		this.resolvers.forEach( unbind );

		let i = this.models.length;
		while ( i-- ) {
			if ( this.models[i] ) this.models[i].unregister( this );
		}
	}
}
