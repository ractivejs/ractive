import { doc } from '../config/environment';

let borderSizes = {};

function getPixelSize ( element, style, property, fontSize ) {
	const sizeWithSuffix = style[property];
	let size = parseFloat(sizeWithSuffix);
	let suffix = sizeWithSuffix.split(/\d/)[0];

	if ( isNaN( size ) ) {
		if ( /^thin|medium|thick$/.test( sizeWithSuffix ) ) {
			size = getBorderPixelSize( sizeWithSuffix );
			suffix = '';
		}

		else {
			throw new Error( `Unknown size '${sizeWithSuffix}'` );
		}
	}

	fontSize = fontSize != null ? fontSize : /%|em/.test(suffix) && element.parentElement ? getPixelSize(element.parentElement, element.parentElement.currentStyle, 'fontSize', null) : 16;
	const rootSize = property == 'fontSize' ? fontSize : /width/i.test(property) ? element.clientWidth : element.clientHeight;

	return (suffix == 'em') ? size * fontSize : (suffix == 'in') ? size * 96 : (suffix == 'pt') ? size * 96 / 72 : (suffix == '%') ? size / 100 * rootSize : size;
}

function getBorderPixelSize ( size ) {
	// `thin`, `medium` and `thick` vary between browsers. (Don't ever use them.)
	if ( !borderSizes[ size ] ) {
		const div = doc.createElement( 'div' );

		div.style.display = 'block';
		div.style.position = 'fixed';
		div.style.width = div.style.height = '0';
		div.style.borderRight = size + ' solid black';

		doc.getElementsByTagName( 'body' )[0].appendChild( div );

		const bcr = div.getBoundingClientRect();
		borderSizes[ size ] = bcr.right - bcr.left;
	}

	return borderSizes[ size ];
}

function setShortStyleProperty ( style, property ) {
	const borderSuffix = property == 'border' ? 'Width' : '';
	const t = `${property}Top${borderSuffix}`;
	const r = `${property}Right${borderSuffix}`;
	const b = `${property}Bottom${borderSuffix}`;
	const l = `${property}Left${borderSuffix}`;

	style[property] = (style[t] == style[r] == style[b] == style[l] ? [style[t]]
	: style[t] == style[b] && style[l] == style[r] ? [style[t], style[r]]
	: style[l] == style[r] ? [style[t], style[r], style[b]]
	: [style[t], style[r], style[b], style[l]]).join(' ');
}

const normalProps = {
	fontWeight: 400,
	lineHeight: 1.2, // actually varies depending on font-family, but is generally close enough...
	letterSpacing: 0
};

export default function getComputedStyle ( element ) {
	let style = {};

	const currentStyle = element.currentStyle;
	const fontSize = getPixelSize( element, currentStyle, 'fontSize', null );

	// TODO tidy this up, test it, send PR to jonathantneal!
	for ( let property in currentStyle ) {
		if ( currentStyle[ property ] === 'normal' && normalProps.hasOwnProperty( property ) ) {
			style[ property ] = normalProps[ property ];
		} else if ( /width|height|margin.|padding.|border.+W/.test( property ) ) {
			if ( currentStyle[ property ] === 'auto' ) {
				if ( /^width|height/.test( property ) ) {
					// just use clientWidth/clientHeight...
					style[ property ] = ( property === 'width' ? element.clientWidth : element.clientHeight ) + 'px';
				}

				else if ( /(?:padding)?Top|Bottom$/.test( property ) ) {
					style[ property ] = '0px';
				}
			}

			else {
				style[ property ] = getPixelSize( element, currentStyle, property, fontSize ) + 'px';
			}
		} else if ( property === 'styleFloat' ) {
			style.float = currentStyle[ property ];
		} else {
			style[ property ] = currentStyle[ property ];
		}
	}

	setShortStyleProperty( style, 'margin' );
	setShortStyleProperty( style, 'padding' );
	setShortStyleProperty( style, 'border' );

	style.fontSize = fontSize + 'px';

	return style;
}
