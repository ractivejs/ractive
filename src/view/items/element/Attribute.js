import { INTERPOLATOR, COMPONENT, ELEMENT } from '../../../config/types';
import { warnOnceIfDebug } from '../../../utils/log';
import namespaces from '../../../config/namespaces';
import Fragment from '../../Fragment';
import Item from '../shared/Item';
import findElement from '../shared/findElement';
import getUpdateDelegate from './attribute/getUpdateDelegate';
import propertyNames from './attribute/propertyNames';
import resolve from '../../resolvers/resolve';
import { isArray } from '../../../utils/is';
import { safeToStringValue } from '../../../utils/dom';
import { booleanAttributes } from '../../../utils/html';
import parseJSON from '../../../utils/parseJSON';
import runloop from '../../../global/runloop';

function lookupNamespace ( node, prefix ) {
	const qualified = `xmlns:${prefix}`;

	while ( node ) {
		if ( node.hasAttribute( qualified ) ) return node.getAttribute( qualified );
		node = node.parentNode;
	}

	return namespaces[ prefix ];
}

export default class Attribute extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.template.n;
		this.namespace = null;

		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.parentFragment = this.element.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		this.rendered = false;
		this.updateDelegate = null;
		this.fragment = null;

		this.element.attributeByName[ this.name ] = this;

		if ( this.element.type === ELEMENT ) {
			if ( !isArray( options.template.f ) ) {
				this.value = options.template.f;
				if ( this.value === 0 ) {
					this.value = '';
				}
			} else {
				this.fragment = new Fragment({
					owner: this,
					template: options.template.f
				});
			}

			this.interpolator = this.fragment &&
								this.fragment.items.length === 1 &&
								this.fragment.items[0].type === INTERPOLATOR &&
								this.fragment.items[0];
		} else {
			this.value = options.template.f;
		}
	}

	bind () {
		if ( this.fragment ) {
			this.fragment.bind();
		}

		if ( this.element.type === COMPONENT ) {
			let template = this.template.f;
			let viewmodel = this.element.instance.viewmodel;
			let childData = viewmodel.value;

			if ( template === 0 ) {
				// empty attributes are `true`
				viewmodel.joinKey( this.name ).set( true );
			}

			else if ( typeof template === 'string' ) {
				const parsed = parseJSON( template );
				viewmodel.joinKey( this.name ).set( parsed ? parsed.value : template );
			}

			else if ( isArray( template ) ) {
				if ( template.length === 1 && template[0].t === INTERPOLATOR ) {
					this.model = resolve( this.parentFragment, template[0] );

					if ( !this.model ) {
						warnOnceIfDebug( `The ${this.name}='{{${template[0].r}}}' mapping is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity`, { ractive: this.element.instance }); // TODO add docs page explaining this
						this.parentFragment.ractive.get( this.name ); // side-effect: create mappings as necessary
						this.model = this.parentFragment.findContext().joinKey( this.name );
					}

					// map the model and check for remap
					const remapped = viewmodel.map( this.name, this.model );
					if ( remapped !== this.model && this.element.bound && !this.element.rebinding ) {
						this.element.rebinding = true;
						runloop.scheduleTask( () => {
							this.element.rebind();
							this.element.rebinding = false;
						});
					}

					if ( this.model.get() === undefined && this.name in childData ) {
						this.model.set( childData[ this.name ] );
					}
				}

				else {
					this.boundFragment = new Fragment({
						owner: this,
						template
					}).bind();

					this.model = viewmodel.joinKey( this.name );
					this.model.set( this.boundFragment.valueOf() );

					// this is a *bit* of a hack
					this.boundFragment.bubble = () => {
						Fragment.prototype.bubble.call( this.boundFragment );
						this.boundFragment.update();
						this.model.set( this.boundFragment.valueOf() );
					};
				}
			}
		}
	}

	bubble () {
		if ( !this.dirty ) {
			this.element.bubble();
			this.dirty = true;
		}
	}

	getString () {
		return this.fragment ?
			this.fragment.toString() :
			this.value != null ? '' + this.value : '';
	}

	// TODO could getValue ever be called for a static attribute,
	// or can we assume that this.fragment exists?
	getValue () {
		return this.fragment ? this.fragment.valueOf() : booleanAttributes.test( this.name ) ? true : this.value;
	}

	rebind () {
		if ( this.fragment ) this.fragment.rebind();

		// handle remapping
		// TODO: DRY this up
		if ( this.element.type === COMPONENT ) {
			const template = this.template.f;
			const viewmodel = this.element.instance.viewmodel;
			const childData = viewmodel.value;

			if ( this.boundFragment ) this.boundFragment.unbind();

			if ( isArray( template ) ) {
				if ( template.length === 1 && template[0].t === INTERPOLATOR ) {
					this.model = resolve( this.parentFragment, template[0] );

					if ( !this.model ) {
						warnOnceIfDebug( `The ${this.name}='{{${template[0].r}}}' mapping is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity`, { ractive: this.element.instance }); // TODO add docs page explaining this
						this.parentFragment.ractive.get( this.name ); // side-effect: create mappings as necessary
						this.model = this.parentFragment.findContext().joinKey( this.name );
					}

					// map the model and check for remap
					viewmodel.map( this.name, this.model );

					if ( this.model.get() === undefined && this.name in childData ) {
						this.model.set( childData[ this.name ] );
					}
				}

				else {
					this.boundFragment = new Fragment({
						owner: this,
						template
					}).bind();

					this.model = viewmodel.joinKey( this.name );
					this.model.set( this.boundFragment.valueOf() );

					// this is a *bit* of a hack
					this.boundFragment.bubble = () => {
						Fragment.prototype.bubble.call( this.boundFragment );
						this.model.set( this.boundFragment.valueOf() );
					};
				}
			}
		}
	}

	render () {
		if ( this.element.type === COMPONENT ) return;

		const node = this.element.node;
		this.node = node;

		// should we use direct property access, or setAttribute?
		if ( !node.namespaceURI || node.namespaceURI === namespaces.html ) {
			this.propertyName = propertyNames[ this.name ] || this.name;

			if ( node[ this.propertyName ] !== undefined ) {
				this.useProperty = true;
			}

			// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
			// node.selected = true rather than node.setAttribute( 'selected', '' )
			if ( booleanAttributes.test( this.name ) || this.isTwoway ) {
				this.isBoolean = true;
			}

			if ( this.propertyName === 'value' ) {
				node._ractive.value = this.value;
			}
		}

		if ( node.namespaceURI ) {
			const index = this.name.indexOf( ':' );
			if ( index !== -1 ) {
				this.namespace = lookupNamespace( node, this.name.slice( 0, index ) );
			} else {
				this.namespace = node.namespaceURI;
			}
		}

		this.rendered = true;
		this.updateDelegate = getUpdateDelegate( this );
		this.updateDelegate();
	}

	toString () {
		const value = this.getValue();

		// Special case - select and textarea values (should not be stringified)
		if ( this.name === 'value' && ( this.element.getAttribute( 'contenteditable' ) !== undefined || ( this.element.name === 'select' || this.element.name === 'textarea' ) ) ) {
			return;
		}

		// Special case – bound radio `name` attributes
		if ( this.name === 'name' && this.element.name === 'input' && this.interpolator && this.element.getAttribute( 'type' ) === 'radio' ) {
			return `name="{{${this.interpolator.model.getKeypath()}}}"`;
		}

		if ( booleanAttributes.test( this.name ) ) return value ? this.name : '';
		if ( value == null ) return '';

		const str = safeToStringValue( this.getString() )
			.replace( /&/g, '&amp;' )
			.replace( /"/g, '&quot;' )
			.replace( /'/g, '&#39;' );

		return str ?
			`${this.name}="${str}"` :
			this.name;
	}

	unbind () {
		if ( this.fragment ) this.fragment.unbind();
		if ( this.boundFragment ) this.boundFragment.unbind();

		if ( this.element.type === COMPONENT && this.element.bound ) {
			const viewmodel = this.element.instance.viewmodel;
			if ( viewmodel.unmap( this.name ) ) {
				if ( !this.element.rebinding ) {
					this.element.rebinding = true;
					runloop.scheduleTask( () => {
						this.element.rebind();
						this.element.rebinding = false;
					});
				}
			}
		}
	}

	unrender () {
		if ( this.element.type === COMPONENT ) return;
		this.updateDelegate( true );

		this.rendered = false;
	}

	update () {
		if ( this.dirty ) {
			this.dirty = false;
			if ( this.fragment ) this.fragment.update();
			if ( this.boundFragment ) this.boundFragment.update();
			if ( this.rendered ) this.updateDelegate();
		}
	}
}
