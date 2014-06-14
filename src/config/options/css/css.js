import transformCss from 'config/options/css/transform';
import defineProperty from 'utils/defineProperty';
import defaults from 'config/defaults/options';

var cssConfig = {
	name: 'css',
	extend: extend,
	init: () => {},
	useDefaults: defaults.hasOwnProperty('css')
};

function extend ( Parent, properties, options ) {

	var css;

	if ( css = getCss( options.css, options ) || getCss( Parent.css, Parent ) ) {

		properties.css = { value: css, writable: true, enumerable: true };
	}
}

function getCss ( css, target ) {

	if ( !css ) { return; }

	return target.noCssTransform
		? css
		: transformCss( css, target._guid );

}

export default cssConfig;
