import runloop from '../../global/runloop';

export default function removeMapping ( dest ) {
	const model = this._mappings[ dest ];
	if ( !model ) return;

	delete this._mappings[ dest ];

	if ( this.viewmodel.mappings[ dest ] === model ) {
		delete this.viewmodel.mappings[ dest ];
		runloop.start();

		runloop.forceRebind();
		this.fragment.rebind( this.viewmodel );
		runloop.end();
	}
}
