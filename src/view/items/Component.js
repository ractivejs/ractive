import { fatal, warnIfDebug, warnOnceIfDebug } from 'utils/log';
import { COMPONENT, INTERPOLATOR, YIELDER } from 'config/types';
import Item from './shared/Item';
import construct from 'Ractive/construct';
import initialise from 'Ractive/initialise';
import render from 'Ractive/render';
import { create } from 'utils/object';
import { removeFromArray } from 'utils/array';
import { isArray } from 'utils/is';
import resolve from '../resolvers/resolve';
import { cancel, rebind, unbind } from 'shared/methodCallers';
import Hook from 'events/Hook';
import Fragment from '../Fragment';
import parseJSON from 'utils/parseJSON';
import fireEvent from 'events/fireEvent';
import updateLiveQueries from './component/updateLiveQueries';

function removeFromLiveComponentQueries ( component ) {
	let instance = component.ractive;

	while ( instance ) {
		const query = instance._liveComponentQueries[ `_${component.name}` ];
		if ( query ) query.remove( component );

		instance = instance.parent;
	}
}

function makeDirty ( query ) {
	query.makeDirty();
}

const teardownHook = new Hook( 'teardown' );

export default class Component extends Item {
	constructor ( options, ComponentConstructor ) {
		super( options );
		this.type = COMPONENT; // override ELEMENT from super

		const instance = create( ComponentConstructor.prototype );

		this.instance = instance;
		this.name = options.template.e;
		this.parentFragment = options.parentFragment;
		this.complexMappings = [];

		this.liveQueries = [];

		if ( instance.el ) {
			warnIfDebug( `The <${this.name}> component has a default 'el' property; it has been disregarded` );
		}

		let partials = options.template.p || {};
		if ( !( 'content' in partials ) ) partials.content = options.template.f || [];
		this._partials = partials; // TEMP

		this.yielders = {};

		construct( this.instance, { partials });

		// find container
		let fragment = options.parentFragment;
		let container;
		while ( fragment ) {
			if ( fragment.owner.type === YIELDER ) {
				container = fragment.owner.container;
				break;
			}

			fragment = fragment.parent;
		}

		// add component-instance-specific properties
		instance.parent = this.parentFragment.ractive;
		instance.container = container || null;
		instance.root = instance.parent.root;
		instance.component = this;

		// for hackability, this could be an open option
		// for any ractive instance, but for now, just
		// for components and just for ractive...
		instance._inlinePartials = partials;

		if ( this.template.v ) this.setupEvents();
	}

	bind () {
		const viewmodel = this.instance.viewmodel;
		const childData = viewmodel.value;

		// determine mappings
		if ( this.template.a ) {
			Object.keys( this.template.a ).forEach( localKey => {
				const template = this.template.a[ localKey ];

				if ( template === 0 ) {
					// empty attributes are `true`
					viewmodel.joinKey( localKey ).set( true );
				}

				else if ( typeof template === 'string' ) {
					const parsed = parseJSON( template );
					viewmodel.joinKey( localKey ).set( parsed ? parsed.value : template );
				}

				else if ( isArray( template ) ) {
					if ( template.length === 1 && template[0].t === INTERPOLATOR ) {
						let model = resolve( this.parentFragment, template[0] );

						if ( !model ) {
							warnOnceIfDebug( `The ${localKey}='{{${template[0].r}}}' mapping is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity`, { ractive: this.instance }); // TODO add docs page explaining this
							this.parentFragment.ractive.get( localKey ); // side-effect: create mappings as necessary
							model = this.parentFragment.findContext().joinKey( localKey );
						}

						viewmodel.map( localKey, model );

						if ( model.get() === undefined && localKey in childData ) {
							model.set( childData[ localKey ] );
						}
					}

					else {
						const fragment = new Fragment({
							owner: this,
							template
						}).bind();

						const model = viewmodel.joinKey( localKey );
						model.set( fragment.valueOf() );

						// this is a *bit* of a hack
						fragment.bubble = () => {
							Fragment.prototype.bubble.call( fragment );
							model.set( fragment.valueOf() );
						};

						this.complexMappings.push( fragment );
					}
				}
			});
		}

		initialise( this.instance, {
			partials: this._partials
		}, {
			indexRefs: this.instance.isolated ? {} : this.parentFragment.indexRefs,
			keyRefs: this.instance.isolated ? {} : this.parentFragment.keyRefs,
			cssIds: this.parentFragment.cssIds
		});
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parentFragment.bubble();
		}
	}

	checkYielders () {
		Object.keys( this.yielders ).forEach( name => {
			if ( this.yielders[ name ].length > 1 ) {
				throw new Error( `A component template can only have one {{yield${name ? ' ' + name : ''}}} declaration at a time` );
			}
		});
	}

	detach () {
		return this.instance.fragment.detach();
	}

	find ( selector ) {
		return this.instance.fragment.find( selector );
	}

	findAll ( selector, query ) {
		this.instance.fragment.findAll( selector, query );
	}

	findComponent ( name ) {
		if ( !name || this.name === name ) return this.instance;

		if ( this.instance.fragment ) {
			return this.instance.fragment.findComponent( name );
		}
	}

	findAllComponents ( name, query ) {
		if ( query.test( this ) ) {
			query.add( this.instance );

			if ( query.live ) {
				this.liveQueries.push( query );
			}
		}

		this.instance.fragment.findAllComponents( name, query );
	}

	firstNode () {
		return this.instance.fragment.firstNode();
	}

	rebind () {
		this.complexMappings.forEach( rebind );

		this.liveQueries.forEach( makeDirty );

		// update relevant mappings
		if ( this.template.a ) {
			const viewmodel = this.instance.viewmodel;

			Object.keys( this.template.a ).forEach( localKey => {
				const template = this.template.a[ localKey ];

				if ( isArray( template ) && template.length === 1 && template[0].t === INTERPOLATOR ) {
					let model = resolve( this.parentFragment, template[0] );

					if ( !model ) {
						// TODO is this even possible?
						warnOnceIfDebug( `The ${localKey}='{{${template[0].r}}}' mapping is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity`, { ractive: this.instance });
						this.parentFragment.ractive.get( localKey ); // side-effect: create mappings as necessary
						model = this.parentFragment.findContext().joinKey( localKey );
					}

					viewmodel.map( localKey, model );
				}
			});
		}

		this.instance.fragment.rebind( this.instance.viewmodel );
	}

	render ( target ) {
		render( this.instance, target, null );

		this.checkYielders();
		updateLiveQueries( this );

		this.rendered = true;
	}

	setupEvents () {
		Object.keys( this.template.v ).forEach( name => {
			const template = this.template.v[ name ];

			if ( typeof template !== 'string' ) {
				fatal( 'Components currently only support simple events - you cannot include arguments. Sorry!' );
			}

			const ractive = this.ractive;

			this.instance.on( name, function () {
				let event;

				// semi-weak test, but what else? tag the event obj ._isEvent ?
				if ( arguments.length && arguments[0] && arguments[0].node ) {
					event = Array.prototype.shift.call( arguments );
				}

				const args = Array.prototype.slice.call( arguments );

				fireEvent( ractive, template, { event, args });

				// cancel bubbling
				return false;
			});
		});
	}

	toString () {
		return this.instance.toHTML();
	}

	unbind () {
		this.complexMappings.forEach( unbind );

		const instance = this.instance;
		instance.viewmodel.teardown();
		instance.fragment.unbind();
		instance._observers.forEach( cancel );

		removeFromLiveComponentQueries( this );

		if ( instance.fragment.rendered && instance.el.__ractive_instances__ ) {
			removeFromArray( instance.el.__ractive_instances__, instance );
		}

		teardownHook.fire( instance );
	}

	unrender ( shouldDestroy ) {
		this.shouldDestroy = shouldDestroy;
		this.instance.unrender();

		this.liveQueries.forEach( query => query.remove( this.instance ) );
	}

	update () {
		this.instance.fragment.update();
		this.checkYielders();

		this.dirty = false;
	}
}
