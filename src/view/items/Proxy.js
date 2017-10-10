import { ContainerItem }  from './shared/Item';
import Fragment from '../Fragment';
import { attach } from './Section';
import getPartialTemplate from './partial/getPartialTemplate';
import { parsePartial } from './Partial';
import runloop from 'src/global/runloop';
import { PROXY } from 'config/types';
import { applyCSS } from 'src/global/css';
import { isArray } from 'utils/is';
import { assign, create, hasOwn } from 'utils/object';

// thingy that can supply css and template
export default function Proxy ( options, fn ) {
	ContainerItem.call( this, options );

	const template = this.template;

	this.fn = fn;
	this.type = PROXY;
	this.name = template.e;

	const handle = this.handle = this.up.getContext();
	handle.template = options.template;
	handle.proxy = this;
	handle.refresh = refresh;
	handle.name = template.e;

	if ( !template.p ) template.p = {};
	if ( !hasOwn( template.p, 'content' ) ) template.p.content = template.f || [];

	this.proxy = fn( handle );

	this.redo();
}

const proto = Proxy.prototype = create( ContainerItem.prototype );

assign( proto, {
	constructor: Proxy,

	bind () {
		this.bound = true;
		if ( this.fragment ) this.fragment.bind();
	},

	redo () {
		const wasBound = this.bound;
		const wasRendered = this.rendered;

		this.unbind();
		this.unrender( true );

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

		this.fragment = new Fragment({
			owner: this,
			template: tpl,
			cssIds: this.fn._cssIds
		});

		if ( wasBound ) this.bind();
		if ( wasRendered ) attach( this, this.fragment );
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
	},

	unrender ( shouldDestroy ) {
		if ( !this.rendered ) return;

		this.rendered = false;
		this.fragment.unrender( shouldDestroy );
	},

	update () {
		if ( typeof this.proxy.invalidate === 'function' ) this.proxy.invalidate();
		if ( this.fragment ) this.fragment.update();
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
