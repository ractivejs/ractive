import getNewKeypath from 'virtualdom/items/shared/utils/getNewKeypath';
import resolveSpecialRef from 'shared/resolveSpecialRef';

export default function EventHandler$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	var fragment;
	if ( this.method ) {
		fragment = this.element.parentFragment;
		this.args.forEach( function ( arg ) {
			if ( arg.indexRef && arg.indexRef === indexRef ) {
				arg.value = newIndex;
			}

			if ( arg.specialRef ) {
				arg.value = resolveSpecialRef( fragment, arg.specialRef );
			}

			if ( arg.keypath && ( newKeypath = getNewKeypath( arg.keypath, oldKeypath, newKeypath ) ) ) {
				arg.keypath = newKeypath;
			}
		});

		return;
	}

	if ( typeof this.action !== 'string' ) {
		this.action.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}

	if ( this.dynamicParams ) {
		this.dynamicParams.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}
}
