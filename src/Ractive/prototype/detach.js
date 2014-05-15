import removeFromArray from 'utils/removeFromArray';

export default function () {
	removeFromArray( this.el.__ractive_instances__, this );
	return this.fragment.detach();
}
