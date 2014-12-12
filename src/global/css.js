import runloop from 'global/runloop';
import { isClient } from 'config/environment';
import { removeFromArray } from 'utils/array';

var css,
	update,
	styleElement,
	head,
	styleSheet,
	inDom,
	prefix = '/* Ractive.js component styles */\n',
	componentsInPage = {},
	styles = [];

if ( !isClient ) {
	css = null;
} else {
	styleElement = document.createElement( 'style' );
	styleElement.type = 'text/css';

	head = document.getElementsByTagName( 'head' )[0];

	inDom = false;

	// Internet Exploder won't let you use styleSheet.innerHTML - we have to
	// use styleSheet.cssText instead
	styleSheet = styleElement.styleSheet;

	update = function () {
		var css;

		if ( styles.length ) {
			css = prefix + styles.join( ' ' );

			if ( styleSheet ) {
				styleSheet.cssText = css;
			} else {
				styleElement.innerHTML = css;
			}

			if ( !inDom ) {
				head.appendChild( styleElement );
				inDom = true;
			}
		}

		else if ( inDom ) {
			head.removeChild( styleElement );
			inDom = false;
		}
	};

	css = {
		add: function ( Component ) {
			if ( !Component.css ) {
				return;
			}

			if ( !componentsInPage[ Component._guid ] ) {
				// we create this counter so that we can in/decrement it as
				// instances are added and removed. When all components are
				// removed, the style is too
				componentsInPage[ Component._guid ] = 0;
				styles.push( Component.css );

				update(); // TODO can we only do this once for each runloop turn, but still ensure CSS is updated before onrender() methods are called?
			}

			componentsInPage[ Component._guid ] += 1;
		},

		remove: function ( Component ) {
			if ( !Component.css ) {
				return;
			}

			componentsInPage[ Component._guid ] -= 1;

			if ( !componentsInPage[ Component._guid ] ) {
				removeFromArray( styles, Component.css );
				runloop.scheduleTask( update );
			}
		}
	};
}

export default css;
