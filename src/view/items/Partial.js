import { warnOnceIfDebug, warnIfDebug } from '../../utils/log';
import Mustache from './shared/Mustache';
import Fragment from '../Fragment';
import getPartialTemplate from './partial/getPartialTemplate';
import { isArray } from '../../utils/is';
import parser from '../../Ractive/config/runtime-parser';
import { doInAttributes } from './element/ConditionalAttribute';

export default class Partial extends Mustache {
	bind () {
		// keep track of the reference name for future resets
		this.refName = this.template.r;

		// name matches take priority over expressions
		let template = this.refName ? getPartialTemplate( this.ractive, this.refName, this.parentFragment ) || null : null;
		let templateObj;

		if ( template ) {
			this.named = true;
			this.setTemplate( this.template.r, template );
		}

		if ( !template ) {
			super.bind();
			if ( this.model && ( templateObj = this.model.get() ) && typeof templateObj === 'object' && ( typeof templateObj.template === 'string' || isArray( templateObj.t ) ) ) {
				if ( templateObj.template ) {
					templateObj = parsePartial( this.template.r, templateObj.template, this.ractive );
				}
				this.setTemplate( this.template.r, templateObj.t );
			} else if ( ( !this.model || typeof this.model.get() !== 'string' ) && this.refName ) {
				this.setTemplate( this.refName, template );
			} else {
				this.setTemplate( this.model.get() );
			}
		}

		this.fragment = new Fragment({
			owner: this,
			template: this.partialTemplate
		}).bind();
	}

	detach () {
		return this.fragment.detach();
	}

	find ( selector ) {
		return this.fragment.find( selector );
	}

	findAll ( selector, query ) {
		this.fragment.findAll( selector, query );
	}

	findComponent ( name ) {
		return this.fragment.findComponent( name );
	}

	findAllComponents ( name, query ) {
		this.fragment.findAllComponents( name, query );
	}

	firstNode ( skipParent ) {
		return this.fragment.firstNode( skipParent );
	}

	forceResetTemplate () {
		this.partialTemplate = undefined;

		// on reset, check for the reference name first
		if ( this.refName ) {
			this.partialTemplate = getPartialTemplate( this.ractive, this.refName, this.parentFragment );
		}

		// then look for the resolved name
		if ( !this.partialTemplate ) {
			this.partialTemplate = getPartialTemplate( this.ractive, this.name, this.parentFragment );
		}

		if ( !this.partialTemplate ) {
			warnOnceIfDebug( `Could not find template for partial '${this.name}'` );
			this.partialTemplate = [];
		}

		if ( this.inAttribute ) {
			doInAttributes( () => this.fragment.resetTemplate( this.partialTemplate ) );
		} else {
			this.fragment.resetTemplate( this.partialTemplate );
		}

		this.bubble();
	}

	rebind () {
		super.unbind();
		super.bind();
		this.fragment.rebind();
	}

	render ( target, occupants ) {
		this.fragment.render( target, occupants );
	}

	setTemplate ( name, template ) {
		this.name = name;

		if ( !template && template !== null ) template = getPartialTemplate( this.ractive, name, this.parentFragment );

		if ( !template ) {
			warnOnceIfDebug( `Could not find template for partial '${name}'` );
		}

		this.partialTemplate = template || [];
	}

	toString ( escape ) {
		return this.fragment.toString( escape );
	}

	unbind () {
		super.unbind();
		this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
	}

	update () {
		let template;

		if ( this.dirty ) {
			this.dirty = false;

			if ( !this.named ) {
				if ( this.model ) {
					template = this.model.get();
				}

				if ( template && typeof template === 'string' && template !== this.name ) {
					this.setTemplate( template );
					this.fragment.resetTemplate( this.partialTemplate );
				} else if ( template && typeof template === 'object' && ( typeof template.template === 'string' || isArray( template.t ) ) ) {
					if ( template.template ) {
						template = parsePartial( this.name, template.template, this.ractive );
					}
					this.setTemplate( this.name, template.t );
					this.fragment.resetTemplate( this.partialTemplate );
				}
			}

			this.fragment.update();
		}
	}
}

function parsePartial( name, partial, ractive ) {
	let parsed;

	try {
		parsed = parser.parse( partial, parser.getParseOptions( ractive ) );
	} catch (e) {
		warnIfDebug( `Could not parse partial from expression '${name}'\n${e.message}` );
	}

	return parsed || { t: [] };
}
