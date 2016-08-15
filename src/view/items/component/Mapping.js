import { INTERPOLATOR } from '../../../config/types';
import Item from '../shared/Item';
import { warnOnceIfDebug } from '../../../utils/log';
import Fragment from '../../Fragment';
import findElement from '../shared/findElement';
import parseJSON from '../../../utils/parseJSON';
import resolve from '../../resolvers/resolve';
import { isArray } from '../../../utils/is';
//import runloop from '../../../global/runloop';

export default class Mapping extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.template.n;

		this.owner = options.owner || options.parentFragment.owner || options.element || findElement( options.parentFragment );
		this.element = options.element || (this.owner.attributeByName ? this.owner : findElement( options.parentFragment ) );
		this.parentFragment = this.element.parentFragment; // shared
		this.ractive = this.parentFragment.ractive;

		this.fragment = null;

		this.element.attributeByName[ this.name ] = this;

		this.value = options.template.f;
	}

	bind () {
		if ( this.fragment ) {
			this.fragment.bind();
		}

		let template = this.template.f;
		let viewmodel = this.element.instance.viewmodel;

		if ( template === 0 ) {
			// empty attributes are `true`
			viewmodel.joinKey( this.name ).set( true );
		}

		else if ( typeof template === 'string' ) {
			const parsed = parseJSON( template );
			viewmodel.joinKey( this.name ).set( parsed ? parsed.value : template );
		}

		else if ( isArray( template ) ) {
			createMapping( this, true );
		}
	}

	render () {}

	unbind () {
		if ( this.fragment ) this.fragment.unbind();
		if ( this.boundFragment ) this.boundFragment.unbind();

		if ( this.element.bound ) {
			if ( this.link.target === this.model ) this.link.owner.unlink();
		}
	}

	unrender () {}

	update () {
		if ( this.dirty ) {
			this.dirty = false;
			if ( this.fragment ) this.fragment.update();
			if ( this.boundFragment ) this.boundFragment.update();
			if ( this.rendered ) this.updateDelegate();
		}
	}
}

function createMapping ( item ) {
	const template = item.template.f;
	const viewmodel = item.element.instance.viewmodel;
	const childData = viewmodel.value;

	if ( template.length === 1 && template[0].t === INTERPOLATOR ) {
		item.model = resolve( item.parentFragment, template[0] );

		if ( !item.model ) {
			warnOnceIfDebug( `The ${item.name}='{{${template[0].r}}}' mapping is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity`, { ractive: item.element.instance }); // TODO add docs page explaining item
			item.parentFragment.ractive.get( item.name ); // side-effect: create mappings as necessary
			item.model = item.parentFragment.findContext().joinKey( item.name );
		}

		item.link = viewmodel.createLink( item.name, item.model );

		if ( item.model.get() === undefined && item.name in childData ) {
			item.model.set( childData[ item.name ] );
		}
	}

	else {
		item.boundFragment = new Fragment({
			owner: item,
			template
		}).bind();

		item.model = viewmodel.joinKey( item.name );
		item.model.set( item.boundFragment.valueOf() );

		// item is a *bit* of a hack
		item.boundFragment.bubble = () => {
			Fragment.prototype.bubble.call( item.boundFragment );
			item.boundFragment.update();
			item.model.set( item.boundFragment.valueOf() );
		};
	}
}
