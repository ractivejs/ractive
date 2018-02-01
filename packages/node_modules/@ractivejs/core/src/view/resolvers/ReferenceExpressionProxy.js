import Model from '../../model/Model';
import { findBoundValue } from '../../model/ModelBase';
import { REFERENCE } from '../../config/types';
import ExpressionProxy from './ExpressionProxy';
import resolveReference from './resolveReference';
import resolve from './resolve';
import { rebindMatch } from '../../shared/rebind';
import { handleChange, mark, marked } from '../../shared/methodCallers';
import { isEqual } from '../../utils/is';
import { escapeKey } from '../../shared/keypaths';

class ReferenceExpressionChild extends Model {
	constructor ( parent, key ) {
		super ( parent, key );
		this.dirty = true;
	}

	applyValue ( value ) {
		if ( isEqual( value, this.value ) ) return;

		let parent = this.parent;
		const keys = [ this.key ];
		while ( parent ) {
			if ( parent.base ) {
				const target = parent.model.joinAll( keys );
				target.applyValue( value );
				break;
			}

			keys.unshift( parent.key );

			parent = parent.parent;
		}
	}

	get ( shouldCapture, opts ) {
		this.retrieve();
		return super.get( shouldCapture, opts );
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new ReferenceExpressionChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	mark () {
		this.dirty = true;
		super.mark();
	}

	retrieve () {
		if ( this.dirty ) {
			this.dirty = false;
			const parent = this.parent.get();
			this.value = parent && parent[ this.key ];
		}

		return this.value;
	}
}

const missing = { get() {} };

export default class ReferenceExpressionProxy extends Model {
	constructor ( fragment, template ) {
		super( null, null );
		this.dirty = true;
		this.root = fragment.ractive.viewmodel;
		this.template = template;

		this.base = resolve( fragment, template );

		const intermediary = this.intermediary = {
			handleChange: () => this.handleChange(),
			rebind: ( next, previous ) => {
				if ( previous === this.base ) {
					next = rebindMatch( template, next, previous );
					if ( next !== this.base ) {
						this.base.unregister( intermediary );
						this.base = next;
					}
				} else {
					const idx = this.members.indexOf( previous );
					if ( ~idx ) {
						// only direct references will rebind... expressions handle themselves
						next = rebindMatch( template.m[idx].n, next, previous );
						if ( next !== this.members[idx] ) {
							this.members.splice( idx, 1, next || missing );
						}
					}
				}

				if ( next !== previous ) previous.unregister( intermediary );
				if ( next ) next.addShuffleTask( () => next.register( intermediary ) );

				this.bubble();
			}
		};

		this.members = template.m.map( ( template ) => {
			if ( typeof template === 'string' ) {
				return { get: () => template };
			}

			let model;

			if ( template.t === REFERENCE ) {
				model = resolveReference( fragment, template.n );
				model.register( intermediary );

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
		if ( !this.dirty ) this.handleChange();
	}

	get ( shouldCapture ) {
		if ( this.dirty ) {
			this.bubble();

			const keys = this.members.map( m => escapeKey( String( m.get() ) ) );
			const model = this.base.joinAll( keys );

			if ( model !== this.model ) {
				if ( this.model ) {
					this.model.unregister( this );
					this.model.unregisterTwowayBinding( this );
				}

				this.model = model;
				this.parent = model.parent;
				this.model.register( this );
				this.model.registerTwowayBinding( this );

				if ( this.keypathModel ) this.keypathModel.handleChange();
			}

			this.value = this.model.get( shouldCapture );
			this.dirty = false;
			this.mark();
			return this.value;
		} else {
			return this.model ? this.model.get( shouldCapture ) : undefined;
		}
	}

	// indirect two-way bindings
	getValue () {
		this.value = this.model ? this.model.get() : undefined;

		let i = this.bindings.length;
		while ( i-- ) {
			const value = this.bindings[i].getValue();
			if ( value !== this.value ) return value;
		}

		// check one-way bindings
		const oneway = findBoundValue( this.deps );
		if ( oneway ) return oneway.value;

		return this.value;
	}

	getKeypath () {
		return this.model ? this.model.getKeypath() : '@undefined';
	}

	handleChange () {
		this.dirty = true;
		this.mark();
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
			const child = new ReferenceExpressionChild( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	mark () {
		if ( this.dirty ) {
			this.deps.forEach( handleChange );
		}

		this.links.forEach( marked );
		this.children.forEach( mark );
	}

	rebind () { this.handleChange(); }

	retrieve () {
		return this.value;
	}

	set ( value ) {
		this.model.set( value );
	}

	teardown () {
		if ( this.model ) {
			this.model.unregister( this );
			this.model.unregisterTwowayBinding( this );
		}
		if ( this.members ) {
			this.members.forEach( m => m && m.unregister && m.unregister( this ) );
		}
	}

	unreference () {
		super.unreference();
		if ( !this.deps.length && !this.refs ) this.teardown();
	}

	unregister( dep ) {
		super.unregister( dep );
		if ( !this.deps.length && !this.refs ) this.teardown();
	}
}
