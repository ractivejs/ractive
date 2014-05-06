import warn from 'utils/warn';

export default function () {
    // TODO remove this method in a future version!
    warn( 'renderHTML() has been deprecated and will be removed in a future version. Please use toHTML() instead' );
    return this.toHTML();
};
