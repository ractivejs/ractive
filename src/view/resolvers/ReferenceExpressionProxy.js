import Model from '../../model/Model';
import { findBoundValue } from '../../model/ModelBase';
import { REFERENCE } from '../../config/types';
import ExpressionProxy from './ExpressionProxy';
import resolveReference from './resolveReference';
import resolve from './resolve';
import { rebindMatch } from '../../shared/rebind';
import { handleChange, mark, marked, unbind } from '../../shared/methodCallers';
import { removeFromArray } from '../../utils/array';
import { isEqual } from '../../utils/is';
import { escapeKey } from '../../shared/keypaths';

class ReferenceExpressionChild extends Model {
	constructor ( parent, key ) {
		super ( parent, key );
	}

	applyValue ( value ) {
		if ( isEqual( value, this.value ) ) return;

		let parent = this.parent, keys = [ this.key ];
		while ( parent ) {
			if ( parent.base ) {
				let target = parent.model.joinAll( keys );
				target.applyValue( value );
				break;
			}

			keys.unshift( parent.key );

			parent = parent.parent;
		}
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

	retrieve () {
		const parent = this.parent.get();
		return parent && parent[ this.key ];
	}
}

export default class ReferenceExpressionProxy extends Model {
	constructor ( fragment, template ) {
		super( null, null );
		this.dirty = true;
		this.root = fragment.ractive.viewmodel;
		this.template = template;

		this.resolvers = [];

		this.base = resolve( fragment, template );
		let baseResolver;

		if ( !this.base ) {
			baseResolver = fragment.resolve( template.r, model => {
				this.base = model;
				this.bubble();

				removeFromArray( this.resolvers, baseResolver );
			});

			this.resolvers.push( baseResolver );
		}

		const intermediary = this.intermediary = {
			handleChange: () => this.handleChange(),
			rebinding: ( next, previous ) => {
				if ( previous === this.base ) {
					next = rebindMatch( template, next, previous );
					if ( next !== this.base ) {
						this.base.unregister( intermediary );
						this.base = next;
						// TODO: if there is no next, set up a resolver?
					}
				} else {
					const idx = this.members.indexOf( previous );
					if ( ~idx ) {
						// only direct references will rebind... expressions handle themselves
						next = rebindMatch( template.m[idx].n, next, previous );
						if ( next !== this.members[idx] ) {
							this.members.splice( idx, 1, next );
							// TODO: if there is no next, set up a resolver?
						}
					}
				}

				if ( next !== previous ) previous.unregister( intermediary );
				if ( next ) next.addShuffleTask( () => next.register( intermediary ) );

				this.bubble();
			}
		};

		this.members = template.m.map( ( template, i ) => {
			if ( typeof template === 'string' ) {
				return { get: () => template };
			}

			let model;
			let resolver;

			if ( template.t === REFERENCE ) {
				model = resolveReference( fragment, template.n );

				if ( model ) {
					model.register( intermediary );
				} else {
					resolver = fragment.resolve( template.n, model => {
						this.members[i] = model;

						model.register( intermediary );
						this.handleChange();

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

		this.isUnresolved = true;
		this.bubble();
	}

	bubble () {
		if ( !this.base ) return;
		if ( !this.dirty ) this.handleChange();
	}

	forceResolution () {
		this.resolvers.forEach( resolver => resolver.forceResolution() );
		this.dirty = true;
		this.bubble();
	}

	get ( shouldCapture ) {
		if ( this.dirty ) {
			this.bubble();

			let i = this.members.length, resolved = true;
			while ( resolved && i-- ) {
				if ( !this.members[i] ) resolved = false;
			}

			if ( this.base && resolved ) {
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
			}

			this.value = this.model ? this.model.get( shouldCapture ) : undefined;
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
		this.clearUnresolveds();
	}

	retrieve () {
		return this.value;
	}

	rebinding () { } // NOOP

	set ( value ) {
		if ( !this.model ) throw new Error( 'Unresolved reference expression. This should not happen!' );
		this.model.set( value );
	}

	teardown () {
		this.resolvers.forEach( unbind );

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
