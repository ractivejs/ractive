start = 
    ( mustache / triple / tag / text )*

mustache = 
	mustacheStart  wsp? mustacheContent wsp? mustacheEnd

mustacheStart =
	"{{"

mustacheContent =
	"test"

mustacheEnd = 
	"}}"

triple =
	tripleStart wsp? tripleContent wsp? tripleEnd

tripleStart = 
	"{{{"

tripleContent =
	"test"

tripleEnd =
	"}}}"

tag =
	"<" closing:"/"? name:tagName attrs:attribute* wsp? selfClosing:"/"? ">"
		{
			return {
				name: name,
				closing: !!closing,
				selfClosing: !!selfClosing,
				attrs: attrs
			};
		}

tagName =
	name:[a-zA-Z]+
		{ return name.join(''); }

attribute =
	wsp name:attributeName value:attributeValue
		{
			return {
				name: name,
				value: value
			};
		}

attributeName =
	chars:[a-zA-Z\-]+
		{ return chars.join( '' ); }

attributeValue =
	"=" value:( quotedAttributeValue / doubleQuotedAttributeValue / attributeValue )
		{
			return value;
		}

quotedAttributeValue =
	"'" chars:[^']+ "'"
		{
			return chars.join( '' );
		}

doubleQuotedAttributeValue =
	'"' chars:[^"]+ '"'
		{
			return chars.join( '' );
		}

unquotedAttributeValue =
	[a-zA-Z0-9]+

text =
	chars:[^<]+ { return chars.join( '' ); }

wsp =
	[ \t\r\n]*