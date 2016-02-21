import { addCSS } from '../../../../global/css';
import transformCss from './transform';
import { uuid } from '../../../../utils/id';
import { warnIfDebug } from '../../../../utils/log';
import { INSTANCE_CSS_UNSUPPORTED } from '../../../../messages/warnings';

export default {
	name: 'css',

	// Called when creating a new component definition
	extend: ( Parent, proto, options ) => {
		if ( !options.css ) return;

		const id = uuid();
		const styles = options.noCssTransform ? options.css : transformCss( options.css, id );

		proto.cssId = id;

		addCSS( { id, styles } );

	},

	// Called when creating a new component instance
	init: ( Parent, target, options ) => {
		if ( !options.css ) return;

		warnIfDebug( INSTANCE_CSS_UNSUPPORTED );
	}

};
