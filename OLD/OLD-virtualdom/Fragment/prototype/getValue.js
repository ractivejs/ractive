import parseJSON from 'utils/parseJSON';
import processItems from './shared/processItems';

export default function Fragment$getValue () {
	var values, source, parsed, result;

	if ( this.dirtyValue ) {
		source = processItems( this.items, values = {}, this.root._guid );
		parsed = parseJSON( source, values );

		if ( !parsed ) {
			result = this.toString();
		} else {
			result = parsed.value;
		}

		this.value = result;
		this.dirtyValue = false;
	}

	return this.value;
}