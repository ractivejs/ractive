import { INTERPOLATOR } from 'config/types';
import Item from './shared/Item';
import initialiseRactiveInstance from 'Ractive/initialise';
import { create } from 'utils/object';
import { isArray } from 'utils/is';
import createResolver from '../resolvers/createResolver';
import { unbind } from 'shared/methodCallers';

export default class Component extends Item {
	constructor ( options, ComponentConstructor ) {
		super( options );

		const instance = create( ComponentConstructor.prototype );

		this.instance = instance;
		this.name = options.template.e;
		this.parentFragment = options.parentFragment;
		this.resolvers = [];

		// initialise
		initialiseRactiveInstance( this.instance, {

		}, {
			parent: this.parentFragment.ractive,
			component: this,
			autobind: false
		});
	}

	bind () {
		const viewmodel = this.instance.viewmodel;

		// determine mappings
		if ( this.template.a ) {
			Object.keys( this.template.a ).forEach( localKey => {
				const template = this.template.a[ localKey ];

				if ( typeof template === 'string' ) {
					viewmodel.join([ localKey ]).set( template ); // TODO parse numbers etc
				}

				else if ( isArray( template ) ) {
					if ( template.length === 1 && template[0].t === INTERPOLATOR ) {
						const resolver = createResolver( this.parentFragment, template[0], model => {
							viewmodel.map( localKey, model );
						});

						this.resolvers.push( resolver );
					}

					else {
						throw new Error( 'TODO complex component mappings' );
					}
				}
			});
		}

		this.instance.fragment.bind( this.instance.viewmodel );
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parentFragment.bubble();
		}
	}

	find ( selector ) {
		return this.instance.fragment.find( selector );
	}

	findAll ( selector, queryResult ) {
		this.instance.fragment.findAll( selector, queryResult );
	}

	findComponent ( name ) {
		if ( this.name === name ) return this.instance;

		if ( this.instance.fragment ) {
			return this.instance.fragment.findComponent( name );
		}
	}

	findAllComponents ( name, queryResult ) {
		queryResult._test( this, true );
		this.instance.fragment.findAllComponents( name, queryResult );
	}

	firstNode () {
		return this.instance.fragment.firstNode();
	}

	// TODO can this be done in a less roundabout way?
	render () {
		var instance = this.instance;

		instance.render( this.parentFragment.findParentNode().cloneNode() );

		this.rendered = true;
		const docFrag = instance.fragment.detach();
		return docFrag;
	}

	unbind () {
		this.resolvers.forEach( unbind );
		this.instance.viewmodel.teardown();
		this.instance.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		this.shouldDestroy = shouldDestroy;
		this.instance.unrender();
	}

	update () {
		this.instance.fragment.update();
		this.dirty = false;
	}
}
