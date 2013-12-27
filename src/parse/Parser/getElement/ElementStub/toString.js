define([
	'parse/Parser/utils/stringifyStubs',
	'config/voidElementNames'
], function (
	stringifyStubs,
	voidElementNames
) {

	'use strict';

	var htmlElements;

	htmlElements = 'a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd label legend li link map menu meta noframes noscript object ol p param pre q s samp script select small span strike strong style sub sup textarea title tt u ul var article aside audio bdi canvas command data datagrid datalist details embed eventsource figcaption figure footer header hgroup keygen mark meter nav output progress ruby rp rt section source summary time track video wbr'.split( ' ' );

	return function () {
		var str, i, len, attrStr, name, attrValueStr, fragStr, isVoid;

		if ( this.str !== undefined ) {
			return this.str;
		}

		// components can't be stringified
		if ( this.component ) {
			return ( this.str = false );
		}

		// if this isn't an HTML element, it can't be stringified (since the only reason to stringify an
		// element is to use with innerHTML, and SVG doesn't support that method.
		// Note: table elements and select children are excluded from this, because IE (of course)
		// fucks up when you use innerHTML with them
		if ( htmlElements.indexOf( this.tag.toLowerCase() ) === -1 ) {
			return ( this.str = false );
		}

		// do we have proxies or transitions or a decorator? if so we can't use innerHTML
		if ( this.proxies || this.intro || this.outro || this.decorator ) {
			return ( this.str = false );
		}

		// see if children can be stringified (i.e. don't contain mustaches)
		fragStr = stringifyStubs( this.items );
		if ( fragStr === false ) {
			return ( this.str = false );
		}

		// is this a void element?
		isVoid = ( voidElementNames.indexOf( this.tag.toLowerCase() ) !== -1 );

		str = '<' + this.tag;

		if ( this.attributes ) {
			for ( i=0, len=this.attributes.length; i<len; i+=1 ) {

				name = this.attributes[i].name;

				// does this look like a namespaced attribute? if so we can't stringify it
				if ( name.indexOf( ':' ) !== -1 ) {
					return ( this.str = false );
				}

				// if this element has an id attribute, it can't be stringified (since references are stored
				// in ractive.nodes). Similarly, intro and outro transitions
				if ( name === 'id' || name === 'intro' || name === 'outro' ) {
					return ( this.str = false );
				}

				attrStr = ' ' + name;

				// empty attributes
				if ( this.attributes[i].value !== null ) {
					attrValueStr = this.attributes[i].value.toString();

					if ( attrValueStr === false ) {
						return ( this.str = false );
					}

					if ( attrValueStr !== '' ) {
						attrStr += '=';

						// does it need to be quoted?
						if ( /[\s"'=<>`]/.test( attrValueStr ) ) {
							attrStr += '"' + attrValueStr.replace( /"/g, '&quot;' ) + '"';
						} else {
							attrStr += attrValueStr;
						}
					}
				}

				str += attrStr;
			}
		}

		// if this isn't a void tag, but is self-closing, add a solidus. Aaaaand, we're done
		if ( this.selfClosing && !isVoid ) {
			str += '/>';
			return ( this.str = str );
		}

		str += '>';

		// void element? we're done
		if ( isVoid ) {
			return ( this.str = str );
		}

		// if this has children, add them
		str += fragStr;

		str += '</' + this.tag + '>';
		return ( this.str = str );
	};

});