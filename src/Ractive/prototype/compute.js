import { splitKeypath } from 'shared/keypaths';
import { isString, isFunction } from 'utils/is';
import runloop from 'src/global/runloop';
import { fireShuffleTasks } from 'src/model/ModelBase';

export function compute ( path, computed ) {
	this.computed[ path ] = computed;
	if ( isString( computed ) || isFunction( computed ) ) computed = this.computed[ path ] = { get: computed };

	const keys = splitKeypath( path );
	if ( !~path.indexOf( '*' ) ) {
		const last = keys.pop();
		return this.viewmodel.joinAll( keys ).compute( last, computed );
	} else {
		computed.pattern = new RegExp( '^' + path.replace( /\*\*/g, '(.+)' ).replace( /\*/g, '((?:\\.|[^\\.])+)' ) + '$' );
	}
}

export default function Ractive$compute ( path, computed ) {
	const comp = compute.call( this, path, computed );
	const promise = runloop.start();

	if ( comp ) {
		const keys = splitKeypath( path );
		if ( keys.length === 1 && !comp.isReadonly ) {
			comp.set( this.viewmodel.value[ keys[0] ] );
		}

		const first = keys.reduce( ( a, c ) => a && a.childByKey[c], this.viewmodel );
		if ( first ) {
			first.rebind( comp, first, false );
			fireShuffleTasks();
		}
	}

	runloop.end();

	return promise;
}
