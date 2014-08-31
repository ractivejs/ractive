import removeFromArray from 'utils/removeFromArray';

export default function Ractive$detach () {
	if ( this.detached ) {
		return this.detached;
	}

	if ( this.el ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}

	this.detached = this.fragment.detach();
	return this.detached;
}
