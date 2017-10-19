import { ELEMENT, PARTIAL, SECTION, SECTION_WITH, YIELDER } from 'config/types';
import { assign, create, hasOwn, keys } from 'utils/object';
import { isArray } from 'utils/is';
import noop from 'utils/noop';
import { MustacheContainer } from './shared/Mustache';
import Fragment from '../Fragment';
import getPartialTemplate from './partial/getPartialTemplate';
import { resolveAliases } from './Alias';
import { warnOnceIfDebug, warnIfDebug } from 'utils/log';
import parser from 'src/Ractive/config/runtime-parser';
import runloop from 'src/global/runloop';
import { applyCSS } from 'src/global/css';

export default function Partial ( options ) {
	MustacheContainer.call( this, options );

	const tpl = options.template;

	// yielder is a special form of partial that will later require special handling
	if ( tpl.t === YIELDER ) {
		this.yielder = 1;
	}

	// this is a macro partial, complete with macro constructor
	else if ( tpl.t === ELEMENT ) {
		// leaving this as an element will confuse up-template searches
		this.type = PARTIAL;
		this.macro = options.macro;
	}
}

const proto = Partial.prototype = create( MustacheContainer.prototype );
proto.constuctor = Partial;

assign( proto, {
	bind () {
		const template = this.template;

		if ( this.yielder ) {
			// the container is the instance that owns this node
			this.container = this.up.ractive;
			this.component = this.container.component;
			this.containerFragment = this.up;

			// normal component
			if ( this.component ) {
				// yields skip the owning instance and go straight to the surrounding context
				this.up = this.component.up;

				// {{yield}} is equivalent to {{yield content}}
				if ( !template.r && !template.x && !template.tx ) this.refName = 'content';
			}

			// plain-ish instance that may be attached to a parent later
			else {
				this.fragment = new Fragment({
					owner: this,
					template: []
				});
				this.fragment.bind();
				return;
			}
		}

		// this is a macro/super partial
		if ( this.macro ) {
			this.fn = this.macro;
		}

		// this is a plain partial or yielder
		else {
			if ( !this.refName ) this.refName = template.r;

			// if the refName exists as a partial, this is a plain old partial reference where no model binding will happen
			if ( this.refName ) {
				this.name = this.refName;
				const partial = getPartialTemplate( this.ractive, this.refName, this.containerFragment || this.up );

				if ( partial ) {
					createFragment( this, partial );
					this.fragment.bind();
					return;
				}
			}

			// this is a dynamic/inline partial
			MustacheContainer.prototype.bind.call( this );
			if ( this.model ) partialFromValue( this, this.model.get() );
		}

		// macro/super partial
		if ( this.fn ) initMacro( this );

		if ( !this.partial && !this.fn ) {
			warnOnceIfDebug( `Could not find template for partial '${this.name}'` );
		}

		createFragment( this, this.partial );
		this.fragment.bind();
	},

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;

			if ( this.yielder ) {
				this.containerFragment.bubble();
			} else {
				this.up.bubble();
			}
		}
	},

	forceResetTemplate () {
		this.dirtyTemplate = true;
		this.bubble();
	},

	handleChange () {
		this.dirtyTemplate = true;
		this.bubble();
	},

	refreshAttrs () {
		keys( this._attrs ).forEach( k => {
			this.handle.attributes[k] = this._attrs[k].valueOf();
		});
	},

	resetTemplate () {
		if ( this.fn && this.proxy ) {
			if ( typeof this.proxy.reset === 'function' ) this.proxy.reset();
			this.partial = this.proxy.template;
			return;
		}

		this.partial = null;

		if ( this.refName ) {
			this.partial = getPartialTemplate( this.ractive, this.refName, this.up );
		}

		if ( !this.partial && this.model ) {
			partialFromValue( this, this.model.get() );
		}

		this.unbindAttrs();

		if ( this.fn ) initMacro( this );
		else if ( !this.partial ) {
			warnOnceIfDebug( `Could not find template for partial '${this.name}'` );
		}
	},

	render ( target, occupants ) {
		if ( this.fn && this.fn._cssDef && !this.fn._cssDef.applied ) applyCSS();

		this.fragment.render( target, occupants );
	},

	unbind () {
		this.fragment.unbind();

		this.fragment.aliases = null;

		this.unbindAttrs();

		MustacheContainer.prototype.unbind.call( this );
	},

	unbindAttrs () {
		if ( this._attrs ) {
			keys( this._attrs ).forEach( k => {
				this._attrs[k].unbind();
			});
		}
	},

	unrender ( shouldDestroy ) {
		if ( this.proxy && typeof this.proxy.teardown === 'function' ) this.proxy.teardown();
		this.fragment.unrender( shouldDestroy );
	},

	update () {
		if ( this.dirtyAttrs ) {
			this.dirtyAttrs = false;
			this.refreshAttrs();
			if ( typeof this.proxy.update === 'function' ) this.proxy.update( this.handle.attributes );
		}

		if ( this.dirtyTemplate ) {
			this.resetTemplate();
			this.fragment.resetTemplate( this.partial );
		}

		if ( this.dirty ) {
			this.dirty = false;
			if ( this.proxy && typeof this.proxy.invalidate === 'function' ) this.proxy.invalidate();
			this.fragment.update();
		}
	}
});

function createFragment ( self, partial ) {
	self.partial = partial;
	contextifyTemplate( self );

	const options = {
		owner: self,
		template: self.partial
	};

	if ( self.yielder ) options.ractive = self.container.parent;

	if ( self.fn ) options.cssIds = self.fn._cssIds;

	const fragment = self.fragment = new Fragment( options );

	// partials may have aliases that need to be in place before binding
	if ( self.template.z ) {
		fragment.aliases = resolveAliases( self.template.z, self.containerFragment || self.up );
	}
}

function contextifyTemplate ( self ) {
	if ( self.template.c ) {
		self.partial = [{ t: SECTION, n: SECTION_WITH, f: self.partial }];
		assign( self.partial[0], self.template.c );
	}
}

function partialFromValue ( self, value, okToParse ) {
	let tpl = value;

	if ( isArray( tpl ) ) {
		self.partial = tpl;
	} else if ( typeof tpl === 'object' ) {
		if ( isArray( tpl.t ) ) self.partial = tpl.t;
		else if ( typeof tpl.template === 'string' ) self.partial = parsePartial( tpl.template, tpl.template, self.ractive ).t;
	} else if ( typeof tpl === 'function' && tpl.styleSet ) {
		self.fn = tpl;
		if ( self.fragment ) self.fragment.cssIds = tpl._cssIds;
	} else if ( tpl != null ) {
		tpl = getPartialTemplate( self.ractive, '' + tpl, self.up );
		if ( tpl ) {
			self.name = value;
			if ( tpl.styleSet ) {
				self.fn = tpl;
				if ( self.fragment ) self.fragment.cssIds = tpl._cssIds;
			} else self.partial = tpl;
		} else if ( okToParse ) {
			self.partial = parsePartial( '' + value, '' + value, self.ractive ).t;
		} else {
			self.name = value;
		}
	}
}

function setTemplate ( template ) {
	partialFromValue( this, template, true );
	this.dirtyTemplate = true;

	if ( !this.initing ) {
		this.proxy.template = this.partial;

		if ( this.updating ) {
			this.bubble();
			runloop.promise();
		} else {
			const promise = runloop.start();

			this.bubble();
			runloop.end();

			return promise;
		}
	}
}

function initMacro ( self ) {
	const fn = self.fn;
	// defensively copy the template in case it changes
	const template = self.template = assign( {}, self.template );
	const handle = self.handle = self.up.getContext({
		proxy: self,
		name: self.template.e || self.name,
		attributes: {},
		setTemplate: setTemplate.bind( self ),
		template
	});

	if ( !template.p ) template.p = {};
	handle.partials = assign( {}, template.p );
	if ( !hasOwn( template.p, 'content' ) ) template.p.content = template.f || [];

	if ( isArray( fn.attributes ) ) {
		self._attrs = {};

		const invalidate = function () {
			this.dirty = true;
			self.dirtyAttrs = true;
			self.bubble();
		};

		if ( isArray( template.m ) ) {
			const attrs = template.m;
			template.p[ 'extra-attributes' ] = template.m = attrs.filter( a => !~fn.attributes.indexOf( a.n ) );
			attrs.filter( a => ~fn.attributes.indexOf( a.n ) ).forEach( a => {
				const fragment = new Fragment({
					template: a.f,
					owner: self
				});
				fragment.bubble = invalidate;
				fragment.findFirstNode = noop;
				self._attrs[ a.n ] = fragment;
			});
		}
	} else {
		template.p[ 'extra-attributes' ] = template.m;
	}

	if ( self._attrs ) {
		keys( self._attrs ).forEach( k => {
			self._attrs[k].bind();
		});
		self.refreshAttrs();
	}

	self.initing = 1;
	self.proxy = fn( handle, handle.attributes ) || {};
	if ( !self.partial ) self.partial = [];
	self.proxy.template = self.partial;
	self.initing = 0;
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
