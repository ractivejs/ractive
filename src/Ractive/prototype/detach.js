import removeFromArray from 'utils/removeFromArray';

export default function () {
	if ( this.el ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}
	return this.fragment.detach();
}
