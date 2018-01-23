import { warnIfDebug } from '../utils/log';

const leadingWhitespace = /^\s+/;

const ParseError = function ( message ) {
	this.name = 'ParseError';
	this.message = message;
	try {
		throw new Error(message);
	} catch (e) {
		this.stack = e.stack;
	}
};

ParseError.prototype = Error.prototype;

const Parser = function ( str, options ) {
	let item;
	let lineStart = 0;

	this.str = str;
	this.options = options || {};
	this.pos = 0;

	this.lines = this.str.split( '\n' );
	this.lineEnds = this.lines.map( line => {
		const lineEnd = lineStart + line.length + 1; // +1 for the newline

		lineStart = lineEnd;
		return lineEnd;
	}, 0 );

	// Custom init logic
	if ( this.init ) this.init( str, options );

	const items = [];

	while ( ( this.pos < this.str.length ) && ( item = this.read() ) ) {
		items.push( item );
	}

	this.leftover = this.remaining();
	this.result = this.postProcess ? this.postProcess( items, options ) : items;
};

Parser.prototype = {
	read ( converters ) {
		let i, item;

		if ( !converters ) converters = this.converters;

		const pos = this.pos;

		const len = converters.length;
		for ( i = 0; i < len; i += 1 ) {
			this.pos = pos; // reset for each attempt

			if ( item = converters[i]( this ) ) {
				return item;
			}
		}

		return null;
	},

	getContextMessage ( pos, message ) {
		const [ lineNum, columnNum ] = this.getLinePos( pos );
		if ( this.options.contextLines === -1 ) {
			return [ lineNum, columnNum, `${message} at line ${lineNum} character ${columnNum}` ];
		}

		const line = this.lines[ lineNum - 1 ];

		let contextUp = '';
		let contextDown = '';
		if ( this.options.contextLines ) {
			const start = lineNum - 1 - this.options.contextLines < 0 ? 0 : lineNum - 1 - this.options.contextLines;
			contextUp = this.lines.slice( start, lineNum - 1 - start ).join( '\n' ).replace( /\t/g, '  ' );
			contextDown = this.lines.slice( lineNum, lineNum + this.options.contextLines ).join( '\n' ).replace( /\t/g, '  ' );
			if ( contextUp ) {
				contextUp += '\n';
			}
			if ( contextDown ) {
				contextDown = '\n' + contextDown;
			}
		}

		let numTabs = 0;
		const annotation = contextUp + line.replace( /\t/g, ( match, char ) => {
			if ( char < columnNum ) {
				numTabs += 1;
			}

			return '  ';
		}) + '\n' + new Array( columnNum + numTabs ).join( ' ' ) + '^----' + contextDown;

		return [ lineNum, columnNum, `${message} at line ${lineNum} character ${columnNum}:\n${annotation}` ];
	},

	getLinePos ( char ) {
		let lineNum = 0;
		let lineStart = 0;

		while ( char >= this.lineEnds[ lineNum ] ) {
			lineStart = this.lineEnds[ lineNum ];
			lineNum += 1;
		}

		const columnNum = char - lineStart;
		return [ lineNum + 1, columnNum + 1, char ]; // line/col should be one-based, not zero-based!
	},

	error ( message ) {
		const [ lineNum, columnNum, msg ] = this.getContextMessage( this.pos, message );

		const error = new ParseError( msg );

		error.line = lineNum;
		error.character = columnNum;
		error.shortMessage = message;

		throw error;
	},

	matchString ( string ) {
		if ( this.str.substr( this.pos, string.length ) === string ) {
			this.pos += string.length;
			return string;
		}
	},

	matchPattern ( pattern ) {
		let match;

		if ( match = pattern.exec( this.remaining() ) ) {
			this.pos += match[0].length;
			return match[1] || match[0];
		}
	},

	allowWhitespace () {
		this.matchPattern( leadingWhitespace );
	},

	remaining () {
		return this.str.substring( this.pos );
	},

	nextChar () {
		return this.str.charAt( this.pos );
	},

	warn ( message ) {
		const msg = this.getContextMessage( this.pos, message )[2];

		warnIfDebug( msg );
	}
};

Parser.extend = function ( proto ) {
	const Parent = this;
	const Child = function ( str, options ) {
		Parser.call( this, str, options );
	};

	Child.prototype = Object.create( Parent.prototype );

	for ( const key in proto ) {
		if ( proto.hasOwnProperty( key ) ) {
			Child.prototype[ key ] = proto[ key ];
		}
	}

	Child.extend = Parser.extend;
	return Child;
};

export default Parser;
