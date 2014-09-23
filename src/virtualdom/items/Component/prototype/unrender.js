import Hook from 'Ractive/prototype/shared/hooks/Hook';

var teardownHook = new Hook( 'teardown' );

export default function Component$unrender ( shouldDestroy ) {

	this.shouldDestroy = shouldDestroy;
	this.instance.unrender();

	if ( shouldDestroy ) {
		teardownHook.fire( this.instance );
	}
}
