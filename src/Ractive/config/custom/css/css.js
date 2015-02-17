import css from 'global/css';
import transformCss from './transform';

let uid = 1;

var cssConfigurator = {
	name: 'css',

	extend: ( Parent, proto, options ) => {
		if ( options.css ) {
			let id = uid++;
			let styles = options.noCssTransform ? options.css : transformCss( options.css, id );

			proto.cssId = id;
			css.add({ id, styles });
		}
	},

	init: () => {}
};

export default cssConfigurator;
