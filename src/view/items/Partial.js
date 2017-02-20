import { SECTION, SECTION_WITH, YIELDER } from '../../config/types';
import { warnOnceIfDebug, warnIfDebug } from '../../utils/log';
import { MustacheContainer } from './shared/Mustache';
import Fragment from '../Fragment';
import getPartialTemplate from './partial/getPartialTemplate';
import parser from '../../Ractive/config/runtime-parser';
import { doInAttributes } from './element/ConditionalAttribute';
import { resolveAliases } from './Alias';

export default class Partial extends MustacheContainer {
	constructor ( options ) {
		super( options );

		this.yielder = options.template.t === YIELDER;

		if ( this.yielder ) {
			this.container = options.parentFragment.ractive;
			this.component = this.container.component;

			this.containerFragment = options.parentFragment;
			this.parentFragment = this.component.parentFragment;

			// {{yield}} is equivalent to {{yield content}}
			if ( !options.template.r && !options.template.rx && !options.template.x ) options.template.r = 'content';
		}
	}

	bind () {
		// keep track of the reference name for future resets
		this.refName = this.template.r;

		// name matches take priority over expressions
		const template = this.refName ? getPartialTemplate( this.ractive, this.refName, this.parentFragment ) || null : null;
		let templateObj;

		if ( template ) {
			this.named = true;
			this.setTemplate( this.template.r, template );
		}

		if ( !template ) {
			super.bind();
			if ( ( templateObj = this.model.get() ) && typeof templateObj === 'object' && ( typeof templateObj.template === 'string' || Array.isArray( templateObj.t ) ) ) {
				if ( templateObj.template ) {
					this.source = templateObj.template;
					templateObj = parsePartial( this.template.r, templateObj.template, this.ractive );
				} else {
					this.source = templateObj.t;
				}
				this.setTemplate( this.template.r, templateObj.t );
			} else if ( typeof this.model.get() !== 'string' && this.refName ) {
				this.setTemplate( this.refName, template );
			} else {
				this.setTemplate( this.model.get() );
			}
		}

		const options = {
			owner: this,
			template: this.partialTemplate
		};

		if ( this.template.c ) {
			options.template = [{ t: SECTION, n: SECTION_WITH, f: options.template }];
			for ( const k in this.template.c ) {
				options.template[0][k] = this.template.c[k];
			}
		}

		if ( this.yielder ) {
			options.ractive = this.container.parent;
		}

		this.fragment = new Fragment(options);
		if ( this.template.z ) {
			this.fragment.aliases = resolveAliases( this.template.z, this.yielder ? this.containerFragment : this.parentFragment );
		}
		this.fragment.bind();
	}

	bubble () {
		if ( this.yielder && !this.dirty ) {
			this.containerFragment.bubble();
			this.dirty = true;
		} else {
			super.bubble();
		}
	}

	findNextNode() {
		return this.yielder ? this.containerFragment.findNextNode( this ) : super.findNextNode();
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

	render ( target, occupants ) {
		return this.fragment.render( target, occupants );
	}

	setTemplate ( name, template ) {
		this.name = name;

		if ( !template && template !== null ) template = getPartialTemplate( this.ractive, name, this.parentFragment );

		if ( !template ) {
			warnOnceIfDebug( `Could not find template for partial '${name}'` );
		}

		this.partialTemplate = template || [];
	}

	unbind () {
		super.unbind();
		this.fragment.aliases = {};
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
				} else if ( template && typeof template === 'object' && ( typeof template.template === 'string' || Array.isArray( template.t ) ) ) {
					if ( template.t !== this.source && template.template !== this.source ) {
						if ( template.template ) {
							this.source = template.template;
							template = parsePartial( this.name, template.template, this.ractive );
						} else {
							this.source = template.t;
						}
						this.setTemplate( this.name, template.t );
						this.fragment.resetTemplate( this.partialTemplate );
					}
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
