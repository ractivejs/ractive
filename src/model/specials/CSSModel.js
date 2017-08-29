import { SharedModel } from './SharedModel';
import { applyChanges } from '../../Ractive/static/styleSet';

export default class CSSModel extends SharedModel {
	constructor ( component ) {
		super( component.cssData, '@style' );
		this.component = component;
	}

	downstreamChanged ( path, depth ) {
		if ( this.locked ) return;

		const component = this.component;

		component.extensions.forEach( e => {
			const model = e._cssModel;
			model.mark();
			model.downstreamChanged( path, depth || 1 );
		});

		if ( !depth ) {
			applyChanges( component, true );
		}
	}
}
