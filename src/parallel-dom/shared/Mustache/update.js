import isEqual from 'utils/isEqual';
import get from 'shared/get/_get';

var options = { evaluateWrapped: true };

export default function updateMustache () {
	var value = get( this.root, this.keypath, options );

	if ( !isEqual( value, this.value ) ) {
		this.setValue( value );
		this.value = value;

		// TODO can this check be eliminated?
		if ( this.parentFragment.bubble ) {
			this.parentFragment.bubble();
		}
	}
}
