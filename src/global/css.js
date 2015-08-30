import { doc } from '../config/environment';
import noop from '../utils/noop';

var css,
	update,
	styleElement,
	head,
	styleSheet,
	inDom,
	prefix = '/* Ractive.js component styles */\n',
	styles = [],
	dirty = false;

if ( !doc ) {
	// TODO handle encapsulated CSS in server-rendered HTML!
	css = {
		add: noop,
		apply: noop
	};
} else {
	styleElement = doc.createElement( 'style' );
	styleElement.type = 'text/css';

	head = doc.getElementsByTagName( 'head' )[0];

	inDom = false;

	// Internet Exploder won't let you use styleSheet.innerHTML - we have to
	// use styleSheet.cssText instead
	styleSheet = styleElement.styleSheet;

	update = function () {
		let css = prefix + styles.map( s => `\n/* {${s.id}} */\n${s.styles}` ).join( '\n' );

		if ( styleSheet ) {
			styleSheet.cssText = css;
		} else {
			styleElement.innerHTML = css;
		}

		if ( !inDom ) {
			head.appendChild( styleElement );
			inDom = true;
		}
	};

	css = {
		add ( s ) {
			styles.push( s );
			dirty = true;
		},

		apply () {
			if ( dirty ) {
				update();
				dirty = false;
			}
		}
	};
}

export default css;
