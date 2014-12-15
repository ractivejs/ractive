import parseJSON from 'utils/parseJSON';
import processItems from './shared/processItems';

export default function Fragment$getArgsList () {
	var values, source, parsed, result;

	if ( this.dirtyArgs ) {
		source = processItems( this.items, values = {}, this.root._guid );
		parsed = parseJSON( '[' + source + ']', values );

		if ( !parsed ) {
			result = [ this.toString() ];
		} else {
			result = parsed.value;
		}

		this.argsList = result;
		this.dirtyArgs = false;
	}

	return this.argsList;
}