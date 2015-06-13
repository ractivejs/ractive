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

		const viewmodel = instance.viewmodel;

		// determine mappings
		if ( options.template.a ) {
			Object.keys( options.template.a ).forEach( localKey => {
				const template = options.template.a[ localKey ];

				if ( typeof template === 'string' ) {
					viewmodel.join([ localKey ]).set( template ); // TODO parse numbers etc
				}

				else if ( isArray( template ) ) {
					if ( template.length === 1 ) {
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
	}

	bind () {
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
		if ( this.name === name ) return this;

		if ( this.instance.fragment ) {
			return this.instance.fragment.findComponent( name );
		}
	}

	findAllComponents ( name, queryResult ) {
		queryResult._test( this, true );
		this.instance.fragment.findAllComponents( name, queryResult );
	}

	render () {
		return this.instance.fragment.render();
	}

	unbind () {
		this.resolvers.forEach( unbind );
		this.instance.fragment.unbind();
	}

	unrender () {
		// TODO
	}

	update () {
		this.instance.fragment.update();
		this.dirty = false;
	}
}
