import css from '../../../../global/css';
import transformCss from './transform';
import { uuid } from '../../../../utils/id';

export default {
	name: 'css',

	extend: ( Parent, proto, options ) => {
		if ( !options.css ) return;

		let id = uuid();
		let styles = options.noCssTransform ? options.css : transformCss( options.css, id );

		proto.cssId = id;
		css.add({ id, styles });

	},

	init: () => {}
};
