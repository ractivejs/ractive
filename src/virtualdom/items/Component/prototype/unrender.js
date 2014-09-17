import fireEvent from 'Ractive/prototype/shared/fireEvent';

export default function Component$unrender ( shouldDestroy ) {
	fireEvent( this.instance, 'teardown', { reserved: true }); // TODO what's the meaning of reserved: true? not used anywhere AFAICT

	this.shouldDestroy = shouldDestroy;
	this.instance.unrender();
}
