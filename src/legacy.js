(function () {

	'use strict';

	// Shims for older browsers

	if ( !Date.now ) {
		Date.now = function () { return +new Date(); };
	}

	if ( !document.createElementNS ) {
		document.createElementNS = function ( ns, type ) {
			if ( ns !== null && ns !== 'http://www.w3.org/1999/xhtml' ) {
				throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml';
			}

			return document.createElement( type );
		};
	}

	if ( !Element.prototype.contains ) {
		Element.prototype.contains = function ( el ) {
			while ( el.parentNode ) {
				if ( el.parentNode === this ) {
					return true;
				}

				el = el.parentNode;
			}

			return false;
		};
	}

	if ( !String.prototype.trim ) {
		String.prototype.trim = function () {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}

	// https://gist.github.com/2864711/946225eb3822c203e8d6218095d888aac5e1748e
	// addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
	(function( win, doc ){
		var docHijack, addEvent, addListen;

		if ( win.addEventListener ) {
			return;
		}
	 
		docHijack = function ( p ) {
			var old = doc[p];
			doc[p] = function(v){
				return addListen( old( v ) );
			};
		};

		addEvent = function ( on, fn, self ) {
			return ( self = this ).attachEvent( 'on' + on, function ( e ) {
				e = e || win.event;
				e.preventDefault  = e.preventDefault  || function () { e.returnValue = false; };
				e.stopPropagation = e.stopPropagation || function () { e.cancelBubble = true; };
				fn.call( self, e );
			});
		};

		addListen = function ( obj, i ) {
			if ( i = obj.length ) {
				while ( i-- ) {
					obj[i].addEventListener = addEvent;
				}
			}

			else {
				obj.addEventListener = addEvent;
			}

			return obj;
		};
	 
		addListen([ doc, win ]);

		if ( 'Element' in win ) { //IE8
			win.Element.prototype.addEventListener = addEvent;
		}

		else { //IE < 8
			doc.attachEvent( 'onreadystatechange', function () {
				addListen( doc.all );
			}); //Make sure we also init at domReady
			docHijack( 'getElementsByTagName' );
			docHijack( 'getElementById' );
			docHijack( 'createElement' );
			addListen( doc.all ); 
		}
	})( window, document );


	// Array extras
	if ( !Array.prototype.indexOf ) {
		Array.prototype.indexOf = function ( needle, i ) {
			var len;

			if ( i === undefined ) {
				i = 0;
			}

			if ( i < 0 ) {
				i+= this.length;
			}

			if ( i < 0 ) {
				i = 0;
			}

			for ( len = this.length; i<len; i++ ) {
				if ( i in this && this[i] === needle ) {
					return i;
				}
			}

			return -1;
		};
	}

	if ( !Array.prototype.forEach ) {
		Array.prototype.forEach = function ( callback, context ) {
			var i, len;

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( i in this ) {
					callback.call( context, this[i], i, this );
				}
			}
		};
	}

	if ( !Array.prototype.map ) {
		Array.prototype.map = function ( mapper, context ) {
			var i, len, mapped = [];

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( i in this ) {
					mapped[i] = mapper.call( context, this[i], i, this );
				}
			}

			return mapped;
		};
	}

	if ( !Array.prototype.map ) {
		Array.prototype.map = function ( filter, context ) {
			var i, len, filtered = [];

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( i in this && filter.call( context, this[i], i, this ) ) {
					filtered[ filtered.length ] = this[i];
				}
			}

			return filtered;
		};
	}

}());
