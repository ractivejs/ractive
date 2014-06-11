import types from 'config/types';
import parseJSON from 'utils/parseJSON';

var empty = {};

export default function Fragment$getValue ( options ) {
	var asArgs, parse, value, values, jsonesque, parsed, cache, dirtyFlag, result;

	options = options || empty;
	asArgs = options.args;
	parse = asArgs || options.parse;

	cache = asArgs ? 'argsList' : 'value';
	dirtyFlag = asArgs ? 'dirtyArgs' : 'dirtyValue';

	if ( this[ dirtyFlag ] || !this.hasOwnProperty( cache ) ) {

		// Fast path
		if ( this.items.length === 1 && this.items[0].type === types.INTERPOLATOR ) {
			value = this.items[0].value;
			if ( value !== undefined ) {
				result = asArgs ? [ value ] : value;
			}
		}

		else {
			if ( parse ) {
				values = {};
				jsonesque = processItems( this.items, values, this.root._guid );

				parsed = parseJSON( asArgs ? '[' + jsonesque + ']' : jsonesque, values );
			}

			if ( !parsed ) {
				result = asArgs ? [ this.toString() ] : this.toString();
			} else {
				result = parsed.value;
			}
		}

		this[ cache ] = result;
		this[ dirtyFlag ] = false;
	}

	return this[ cache ];
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
			value = item.value;
		}

		values[ placeholderId ] = value;

		return '${' + placeholderId + '}';
	}).join( '' );
}
