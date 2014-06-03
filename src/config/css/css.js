import transformCss from 'config/css/transform';
import defineProperty from 'utils/defineProperty';

var cssConfig = {
	extend: extend
};

function extend ( Parent, Child, options ) {

	var css;

	if ( css = getCss( options.css, Child ) || getCss( Parent.css, Parent ) ) {

		defineProperty( Child, 'css', { value: css } );
	}
}

function getCss ( css, target ) {

	if ( !css ) { return; }

	return target.defaults.noCssTransform
		? css
		: transformCss( css, target._guid );

}

export default cssConfig;
