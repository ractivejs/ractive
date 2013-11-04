/*! qunit-assert-html - v0.2.0 - 2013-03-04
* https://github.com/JamesMGreene/qunit-assert-html
* Copyright (c) 2013 James M. Greene; Licensed MIT */
(function( QUnit, window, undefined ) {
	"use strict";

	var trim = function( s ) {
		if ( !s ) {
			return "";
		}
		return typeof s.trim === "function" ? s.trim() : s.replace( /^\s+|\s+$/g, "" );
	};

	var normalizeWhitespace = function( s ) {
		if ( !s ) {
			return "";
		}
		return trim( s.replace( /\s+/g, " " ) );
	};

	var dedupeFlatDict = function( dictToDedupe, parentDict ) {
		var key, val;
		if ( parentDict ) {
			for ( key in dictToDedupe ) {
				val = dictToDedupe[key];
				if ( val && ( val === parentDict[key] ) ) {
					delete dictToDedupe[key];
				}
			}
		}
		return dictToDedupe;
	};

	var objectKeys = Object.keys || (function() {
		var hasOwn = function( obj, propName ) {
			return Object.prototype.hasOwnProperty.call( obj, propName );
		};
		return function( obj ) {
			var keys = [],
				key;
			for ( key in obj ) {
				if ( hasOwn( obj, key ) ) {
					keys.push( key );
				}
			}
			return keys;
		};
	})();

	/**
	 * Calculate based on `currentStyle`/`getComputedStyle` styles instead
	 */
	var getElementStyles = (function() {

		// Memoized
		var camelCase = (function() {
			var camelCaseFn = (function() {
				// Matches dashed string for camelizing
				var rmsPrefix = /^-ms-/,
					msPrefixFix = "ms-",
					rdashAlpha = /-([\da-z])/gi,
					camelCaseReplacerFn = function( all, letter ) {
						return ( letter + "" ).toUpperCase();
					};

				return function( s ) {
					return s.replace(rmsPrefix, msPrefixFix).replace(rdashAlpha, camelCaseReplacerFn);
				};
			})();

			var camelCaseMemoizer = {};

			return function( s ) {
				var temp = camelCaseMemoizer[s];
				if ( temp ) {
					return temp;
				}

				temp = camelCaseFn( s );
				camelCaseMemoizer[s] = temp;
				return temp;
			};
		})();

		var styleKeySortingFn = function( a, b ) {
			return camelCase( a ) < camelCase( b );
		};

		return function( elem ) {
			var styleCount, i, key,
				styles = {},
				styleKeys = [],
				style = elem.ownerDocument.defaultView ?
					elem.ownerDocument.defaultView.getComputedStyle( elem, null ) :
					elem.currentStyle;

			// `getComputedStyle`
			if ( style && style.length && style[0] && style[style[0]] ) {
				styleCount = style.length;
				while ( styleCount-- ) {
					styleKeys.push( style[styleCount] );
				}
				styleKeys.sort( styleKeySortingFn );

				for ( i = 0, styleCount = styleKeys.length ; i < styleCount ; i++ ) {
					key = styleKeys[i];
					if ( key !== "cssText" && typeof style[key] === "string" && style[key] ) {
						styles[camelCase( key )] = style[key];
					}
				}
			}
			// `currentStyle` support: IE < 9.0, Opera < 10.6
			else {
				for ( key in style ) {
					styleKeys.push( key );
				}
				styleKeys.sort();

				for ( i = 0, styleCount = styleKeys.length ; i < styleCount ; i++ ) {
					key = styleKeys[i];
					if ( key !== "cssText" && typeof style[key] === "string" && style[key] ) {
						styles[key] = style[key];
					}
				}
			}

			return styles;

		};
	})();

	var serializeElementNode = function( elementNode, rootNodeStyles ) {
		var subNodes, i, len, styles, attrName,
			serializedNode = {
				NodeType: elementNode.nodeType,
				NodeName: elementNode.nodeName.toLowerCase(),
				Attributes: {},
				ChildNodes: []
			};

		subNodes = elementNode.attributes;
		for ( i = 0, len = subNodes.length ; i < len ; i++ ) {
			attrName = subNodes[i].name.toLowerCase();
			if ( attrName === "class" ) {
				serializedNode.Attributes[attrName] = normalizeWhitespace( subNodes[i].value );
			}
			else if ( attrName !== "style" ) {
				serializedNode.Attributes[attrName] = subNodes[i].value;
			}
			// Ignore the "style" attribute completely
		}

		// Only add the style attribute if there is 1+ pertinent rules
		styles = dedupeFlatDict( getElementStyles( elementNode ), rootNodeStyles );
		if ( styles && objectKeys( styles ).length ) {
			serializedNode.Attributes["style"] = styles;
		}

		subNodes = elementNode.childNodes;
		for ( i = 0, len = subNodes.length; i < len; i++ ) {
			serializedNode.ChildNodes.push( serializeNode( subNodes[i], rootNodeStyles ) );
		}

		return serializedNode;
	};

	var serializeNode = function( node, rootNodeStyles ) {
		var serializedNode;

		switch (node.nodeType) {
			case 1:   // Node.ELEMENT_NODE
				serializedNode = serializeElementNode( node, rootNodeStyles );
				break;
			case 3:   // Node.TEXT_NODE
				serializedNode = {
					NodeType: node.nodeType,
					NodeName: node.nodeName.toLowerCase(),
					NodeValue: node.nodeValue
				};
				break;
			case 4:   // Node.CDATA_SECTION_NODE
			case 7:   // Node.PROCESSING_INSTRUCTION_NODE
			case 8:   // Node.COMMENT_NODE
				serializedNode = {
					NodeType: node.nodeType,
					NodeName: node.nodeName.toLowerCase(),
					NodeValue: trim( node.nodeValue )
				};
				break;
			case 5:   // Node.ENTITY_REFERENCE_NODE
			case 6:   // Node.ENTITY_NODE
			case 9:   // Node.DOCUMENT_NODE
			case 10:  // Node.DOCUMENT_TYPE_NODE
			case 11:  // Node.DOCUMENT_FRAGMENT_NODE
			case 12:  // Node.NOTATION_NODE
				serializedNode = {
					NodeType: node.nodeType,
					NodeName: node.nodeName
				};
				break;
			case 2:   // Node.ATTRIBUTE_NODE
				throw new Error( "`node.nodeType` was `Node.ATTRIBUTE_NODE` (2), which is not supported by this method" );
			default:
				throw new Error( "`node.nodeType` was not recognized: " + node.nodeType );
		}

		return serializedNode;
	};

	var serializeHtml = function( html ) {
		var scratch = getCleanSlate(),
			rootNode = scratch.container(),
			rootNodeStyles = getElementStyles( rootNode ),
			serializedHtml = [],
			kids, i, len;
		rootNode.innerHTML = trim( html );

		kids = rootNode.childNodes;
		for ( i = 0, len = kids.length; i < len; i++ ) {
			serializedHtml.push( serializeNode( kids[i], rootNodeStyles ) );
		}

		scratch.reset();

		return serializedHtml;
	};

	var getCleanSlate = (function() {
		var containerElId = "qunit-html-addon-container",
			iframeReady = false,
			iframeLoaded = function() {
				iframeReady = true;
			},
			iframeReadied = function() {
				if (iframe.readyState === "complete" || iframe.readyState === 4) {
					iframeReady = true;
				}
			},
			iframeApi,
			iframe,
			iframeWin,
			iframeDoc;

		if ( !iframeApi ) {

			QUnit.begin(function() {
				// Initialize the background iframe!
				if ( !iframe || !iframeWin || !iframeDoc ) {
					iframe = window.document.createElement( "iframe" );
					QUnit.addEvent( iframe, "load", iframeLoaded );
					QUnit.addEvent( iframe, "readystatechange", iframeReadied );
					iframe.style.position = "absolute";
					iframe.style.top = iframe.style.left = "-1000px";
					iframe.height = iframe.width = 0;

					// `getComputedStyle` behaves inconsistently cross-browser when not attached to a live DOM
					window.document.body.appendChild( iframe );

					iframeWin = iframe.contentWindow ||
						iframe.window ||
						iframe.contentDocument && iframe.contentDocument.defaultView ||
						iframe.document && ( iframe.document.defaultView || iframe.document.window ) ||
						window.frames[( iframe.name || iframe.id )];

					iframeDoc = iframeWin && iframeWin.document ||
						iframe.contentDocument ||
						iframe.document;

					var iframeContents = [
						"<!DOCTYPE html>",
						"<html>",
						"<head>",
						"	<title>QUnit HTML addon iframe</title>",
						"</head>",
						"<body>",
						"	<div id=\"" + containerElId + "\"></div>",
						"	<script type=\"text/javascript\">",
						"		window.isReady = true;",
						"	</script>",
						"</body>",
						"</html>"
					].join( "\n" );

					iframeDoc.open();
					iframeDoc.write( iframeContents );
					iframeDoc.close();

					// Is ready?
					iframeReady = iframeReady || iframeWin.isReady;
				}
			});

			QUnit.done(function() {
				if ( iframe && iframe.ownerDocument ) {
					iframe.parentNode.removeChild( iframe );
				}
				iframe = iframeWin = iframeDoc = null;
				iframeReady = false;
			});

			var waitForIframeReady = function( maxTimeout ) {
				if ( !iframeReady ) {
					if ( !maxTimeout ) {
						maxTimeout = 2000;  // 2 seconds MAX
					}
					var startTime = new Date();
					while ( !iframeReady && ( ( new Date() - startTime ) < maxTimeout ) ) {
						iframeReady = iframeReady || iframeWin.isReady;
					}
				}
			};

			iframeApi = {
				container: function() {
					waitForIframeReady();
					if ( iframeReady && iframeDoc ) {
						return iframeDoc.getElementById( containerElId );
					}
					return undefined;
				},
				reset: function() {
					var containerEl = iframeApi.container();
					if ( containerEl ) {
						containerEl.innerHTML = "";
					}
				}
			};
		}

		// Actual function signature for `getCleanState`
		return function() { return iframeApi; };
	})();

	QUnit.extend( QUnit.assert, {

		/**
		 * Compare two snippets of HTML for equality after normalization.
		 *
		 * @example htmlEqual("<B>Hello, QUnit!</B>  ", "<b>Hello, QUnit!</b>", "HTML should be equal");
		 * @param {String} actual The actual HTML before normalization.
		 * @param {String} expected The excepted HTML before normalization.
		 * @param {String} [message] Optional message to display in the results.
		 */
		htmlEqual: function( actual, expected, message ) {
			if ( !message ) {
				message = "HTML should be equal";
			}

			this.deepEqual( serializeHtml( actual ), serializeHtml( expected ), message );
		},

		/**
		 * Compare two snippets of HTML for inequality after normalization.
		 *
		 * @example notHtmlEqual("<b>Hello, <i>QUnit!</i></b>", "<b>Hello, QUnit!</b>", "HTML should not be equal");
		 * @param {String} actual The actual HTML before normalization.
		 * @param {String} expected The excepted HTML before normalization.
		 * @param {String} [message] Optional message to display in the results.
		 */
		notHtmlEqual: function( actual, expected, message ) {
			if ( !message ) {
				message = "HTML should not be equal";
			}

			this.notDeepEqual( serializeHtml( actual ), serializeHtml( expected ), message );
		},

		/**
		 * @private
		 * Normalize and serialize an HTML snippet. Primarily only exposed for unit testing purposes.
		 *
		 * @example _serializeHtml('<b style="color:red;">Test</b>');
		 * @param {String} html The HTML snippet to normalize and serialize.
		 * @returns {Object[]} The normalized and serialized form of the HTML snippet.
		 */
		_serializeHtml: serializeHtml

	});
})( QUnit, this );