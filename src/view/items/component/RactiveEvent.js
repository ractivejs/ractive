import Context from '../../../shared/Context';

export default class RactiveEvent {
	constructor ( component, name ) {
		this.component = component;
		this.name = name;
		this.handler = null;
	}

	listen ( directive ) {
		const ractive = this.component.instance;

		this.handler = ractive.on( this.name, ( ...args ) => {
			// watch for reproxy
			if ( args[0] instanceof Context ) {
				const ctx = args.shift();
				ctx.component = ractive;
				directive.fire( ctx, args );
			} else {
				directive.fire( {}, args );
			}

			// cancel bubbling
			return false;
		});
	}

	unlisten () {
		this.handler.cancel();
	}
}
