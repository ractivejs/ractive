import { ContainerItem }  from './shared/Item';
import Fragment from '../Fragment';
import { attach } from './Section';
import getPartialTemplate from './partial/getPartialTemplate';
import { parsePartial } from './Partial';
import runloop from 'src/global/runloop';
import { PROXY } from 'config/types';
import { applyCSS } from 'src/global/css';
import { isArray } from 'utils/is';
import { assign, create, hasOwn, keys } from 'utils/object';
import noop from 'utils/noop';

// thingy that can supply css and template
export default function Proxy ( options, fn ) {
	ContainerItem.call( this, options );

	// make a defensive shallow copy of the template
	const template = this.template = assign( {}, this.template );

	this.fn = fn;
	this.type = PROXY;
	this.name = template.e;

	const handle = this.handle = this.up.getContext();
	handle.template = template;
	handle.proxy = this;
	handle.refresh = refresh;
	handle.name = template.e;
	handle.attrs = {};
	this.dirtyAttrs = false;

	if ( !template.p ) template.p = {};
	handle.partials = assign( {}, template.p );
	if ( !hasOwn( template.p, 'content' ) ) template.p.content = template.f || [];

	if ( isArray( fn.attributes ) ) {
		this._attrs = {};

		const me = this;
		const invalidate = function () {
			this.dirty = true;
			me.dirtyAttrs = true;
			me.bubble();
		};

		if ( isArray( template.m ) ) {
			const attrs = template.m;
			template.m = attrs.filter( a => !~fn.attributes.indexOf( a.n ) );
			template.p['extra-attributes'] = template.m;
			attrs.filter( a => ~fn.attributes.indexOf( a.n ) ).forEach( a => {
				const fragment = new Fragment({
					template: a.f,
					owner: this
				});
				fragment.bubble = invalidate;
				fragment.findFirstNode = noop;
				this._attrs[ a.n ] = fragment;
			});
		}
	} else {
		template.p['extra-attributes'] = template.m;
	}
}

const proto = Proxy.prototype = create( ContainerItem.prototype );

assign( proto, {
	constructor: Proxy,

	bind () {
		if ( !this.bound ) {
			this.bound = true;

			// bind attributes
			if ( this._attrs ) {
				keys( this._attrs ).forEach( k => {
					this._attrs[k].bind();
				});
				this.refreshAttrs();
			}

			this.proxy = this.fn( this.handle, this.handle.attrs );

			this.redo();

			if ( this.fragment ) this.fragment.bind();
		}
	},

	redo () {
		let fragment = this.fragment;
		const wasBound = fragment && fragment.bound;
		const wasRendered = fragment && fragment.rendered;

		if ( wasBound ) fragment.unbind();
		if ( wasRendered ) fragment.unrender( true );

		let tpl = this.proxy.template;
		if ( !isArray( tpl ) ) {
			if ( typeof tpl === 'string' ) {
				tpl = getPartialTemplate( this.ractive, tpl, this.up );
				if ( !tpl ) {
					tpl = this.proxy.template;
					tpl = parsePartial( tpl, tpl, this.ractive ).t;
				}
			} else if ( tpl && ( typeof tpl.template === 'string' || typeof isArray( tpl.t ) ) ) {
				if ( typeof tpl.template === 'string' ) {
					tpl = parsePartial( tpl.template, tpl.template, this.ractive ).t;
				} else {
					tpl = tpl.t;
				}
			} else if ( !isArray( tpl ) ) {
				tpl = [];
			}
		}

		this.fragment = fragment = new Fragment({
			owner: this,
			template: tpl,
			cssIds: this.fn._cssIds
		});

		if ( wasBound ) fragment.bind();
		if ( wasRendered ) attach( this, fragment );
	},

	refreshAttrs () {
		keys( this._attrs ).forEach( k => {
			this._attrs[k].update();
			this.handle.attrs[k] = this._attrs[k].valueOf();
		});
	},

	render ( target, occupants ) {
		if ( this.fn._cssDef && !this.fn._cssDef.applied ) applyCSS();

		this.rendered = true;
		this.fragment.render ( target, occupants );
	},

	unbind () {
		if ( !this.bound ) return;

		this.bound = false;
		if ( this.fragment ) this.fragment.unbind();

		if ( this._attrs ) {
			keys( this._attrs ).forEach( k => {
				this._attrs[k].unbind();
			});
		}
	},

	unrender ( shouldDestroy ) {
		if ( !this.rendered ) return;

		if ( shouldDestroy && typeof this.proxy.teardown === 'function' ) this.proxy.teardown();

		this.rendered = false;
		this.fragment.unrender( shouldDestroy );
	},

	update () {
		if ( this.dirty ) {
			this.dirty = false;

			if ( this.dirtyAttrs ) {
				this.refreshAttrs();
				if ( typeof this.proxy.update === 'function' ) this.proxy.update( this.handle.attrs );
			}
			if ( typeof this.proxy.invalidate === 'function' ) this.proxy.invalidate();
			if ( this.fragment ) this.fragment.update();
		}
	}
});

function refresh () {
	if ( this.updating ) {
		this.proxy.redo();
		return Promise.resolve();
	} else {
		const promise = runloop.start();

		this.proxy.redo();

		runloop.end();

		return promise;
	}
}
