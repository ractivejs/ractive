import { ensureArray, combine } from '../../../utils/array';

export default {
	extend: ( Parent, proto, options ) => {
		proto.adapt = combine( proto.adapt, ensureArray( options.adapt ) );
	},

	init () {}
};
