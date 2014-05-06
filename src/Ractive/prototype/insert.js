import getElement from 'utils/getElement';

export default function ( target, anchor ) {
    target = getElement( target );
    anchor = getElement( anchor ) || null;

    if ( !target ) {
        throw new Error( 'You must specify a valid target to insert into' );
    }

    target.insertBefore( this.detach(), anchor );
    this.fragment.pNode = this.el = target;
};
