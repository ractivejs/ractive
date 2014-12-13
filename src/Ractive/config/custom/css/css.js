import transformCss from './transform';

var cssConfigurator = {
	name: 'css',

	extend: ( Parent, proto, options ) => {
		var guid = proto.constructor._guid, css;

		if ( css = getCss( options.css, options, guid ) || getCss( Parent.css, Parent, guid ) ) {
			proto.constructor.css = css;
		}
	},

	init: () => {}
};

function getCss ( css, target, guid ) {
	if ( !css ) { return; }

	return target.noCssTransform
		? css
		: transformCss( css, guid );
}

export default cssConfigurator;
