import { splitKeypath } from '../../shared/keypaths';
import runloop from '../../global/runloop';

export default function unlink( here ) {
	const promise = runloop.start();
	this.viewmodel.joinAll( splitKeypath( here ), { lastLink: false } ).unlink();
	runloop.end();
	return promise;
}
