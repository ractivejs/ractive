import { unbind } from 'shared/methodCallers';

export default function EventHandler$unbind () {
	if ( this.method ) {
		return;
	}

	// Tear down dynamic name
	if ( typeof this.action !== 'string' ) {
		this.action.unbind();
	}

	// Tear down dynamic parameters
	if ( this.dynamicParams ) {
		this.dynamicParams.unbind();
	}
}
