import transformCss from './transform';

var cssConfig = {
	name: 'css',
	extend: extend,
	init: () => {}
};

function extend ( Parent, proto, options ) {

	var guid = proto.constructor._guid, css;

	if ( css = getCss( options.css, options, guid ) || getCss( Parent.css, Parent, guid ) ) {

		proto.constructor.css = css;
	}
}

function getCss ( css, target, guid ) {

	if ( !css ) { return; }

	return target.noCssTransform
		? css
		: transformCss( css, guid );

}

export default cssConfig;
