import fireEvent from 'Ractive/prototype/shared/fireEvent';

export default function Component$unrender ( shouldDestroy ) {
	fireEvent( this.instance, 'teardown' );

	this.shouldDestroy = shouldDestroy;
	this.instance.unrender();
}
