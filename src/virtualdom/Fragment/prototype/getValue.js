import parseJSON from 'utils/parseJSON';

var empty = {};

export default function Fragment$getValue ( options = empty ) {
	var asArgs, values, source, parsed, cachedResult, dirtyFlag, result;

	asArgs = options.args;

	cachedResult = asArgs ? 'argsList' : 'value';
	dirtyFlag = asArgs ? 'dirtyArgs' : 'dirtyValue';

	if ( this[ dirtyFlag ] ) {
		source = processItems( this.items, values = {}, this.root._guid );
		parsed = parseJSON( asArgs ? '[' + source + ']' : source, values );

		if ( !parsed ) {
			result = asArgs ? [ this.toString() ] : this.toString();
		} else {
			result = parsed.value;
		}

		this[ cachedResult ] = result;
		this[ dirtyFlag ] = false;
	}

	return this[ cachedResult ];
}

function processItems ( items, values, guid, counter ) {
	counter = counter || 0;

	return items.map( function ( item ) {
		var placeholderId, wrapped, value;

		if ( item.text ) {
			return item.text;
		}

		if ( item.fragments ) {
			return item.fragments.map( function ( fragment ) {
				return processItems( fragment.items, values, guid, counter );
			}).join( '' );
		}

		placeholderId = guid + '-' + counter++;

		if ( wrapped = item.root.viewmodel.wrapped[ item.keypath ] ) {
			value = wrapped.value;
		} else {
			value = item.getValue();
		}

		values[ placeholderId ] = value;

		return '${' + placeholderId + '}';
	}).join( '' );
}
