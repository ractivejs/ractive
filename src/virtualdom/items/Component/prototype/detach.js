import Hook from 'Ractive/prototype/shared/hooks/Hook';

var detachHook = new Hook( 'detach' );

export default function Component$detach () {
	var detached = this.instance.fragment.detach();
	detachHook.fire( this.instance );
	return detached;
}
