import { splitKeypath } from '../../shared/keypaths';

export default function readLink ( keypath, options = {} ) {
	const path = splitKeypath( keypath );

	if ( this.viewmodel.has( path[0] ) ) {
		let model = this.viewmodel.joinAll( path );

		if ( !model.isLink ) return;

		while ( ( model = model.target ) && options.canonical !== false ) {
			if ( !model.isLink ) break;
		}

		if ( model ) return { ractive: model.root.ractive, keypath: model.getKeypath() };
	}
}
