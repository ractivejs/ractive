import isEqual from 'utils/isEqual';
import get from 'shared/get/_get';

var options = { evaluateWrapped: true };

export default function updateMustache () {
    var value = get( this.root, this.keypath, options );

    if ( !isEqual( value, this.value ) ) {
        this.render( value );
        this.value = value;
    }
};
