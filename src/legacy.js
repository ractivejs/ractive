(function ( doc ) {

	// Shims for older browsers

	if ( !Date.now ) {
		Date.now = function () { return +new Date(); };
	}

	if ( doc && !doc.createElementNS ) {
		doc.createElementNS = function ( ns, type ) {
			if ( ns !== null && ns !== 'http://www.w3.org/1999/xhtml' ) {
				throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml';
			}

			return doc.createElement( type );
		};
	}

	if ( !String.prototype.trim ) {
		String.prototype.trim = function () {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}

	
	(function() {
		if (!Event.prototype.preventDefault) {
			Event.prototype.preventDefault=function() {
				this.returnValue=false;
			};
		}
		if (!Event.prototype.stopPropagation) {
			Event.prototype.stopPropagation=function() {
				this.cancelBubble=true;
			};
		}
		if (!Element.prototype.addEventListener) {
			var eventListeners=[];
			
			var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
				var self=this;
				var wrapper=function(e) {
					e.target=e.srcElement;
					e.currentTarget=self;
					if (listener.handleEvent) {
						listener.handleEvent(e);
					} else {
						listener.call(self,e);
					}
				};
				if (type=="DOMContentLoaded") {
					var wrapper2=function(e) {
						if (document.readyState=="complete") {
							wrapper(e);
						}
					};
					document.attachEvent("onreadystatechange",wrapper2);
					eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
					
					if (document.readyState=="complete") {
						var e=new Event();
						e.srcElement=window;
						wrapper2(e);
					}
				} else {
					this.attachEvent("on"+type,wrapper);
					eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
				}
			};
			var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
				var counter=0;
				while (counter<eventListeners.length) {
					var eventListener=eventListeners[counter];
					if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
						if (type=="DOMContentLoaded") {
							this.detachEvent("onreadystatechange",eventListener.wrapper);
						} else {
							this.detachEvent("on"+type,eventListener.wrapper);
						}
						break;
					}
					++counter;
				}
			};
			Element.prototype.addEventListener=addEventListener;
			Element.prototype.removeEventListener=removeEventListener;
			if (HTMLDocument) {
				HTMLDocument.prototype.addEventListener=addEventListener;
				HTMLDocument.prototype.removeEventListener=removeEventListener;
			}
			if (Window) {
				Window.prototype.addEventListener=addEventListener;
				Window.prototype.removeEventListener=removeEventListener;
			}
		}
	}());


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
				if ( this.hasOwnProperty( i ) && this[i] === needle ) {
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
				if ( this.hasOwnProperty( i ) ) {
					callback.call( context, this[i], i, this );
				}
			}
		};
	}

	if ( !Array.prototype.map ) {
		Array.prototype.map = function ( mapper, context ) {
			var i, len, mapped = [];

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) ) {
					mapped[i] = mapper.call( context, this[i], i, this );
				}
			}

			return mapped;
		};
	}

	if ( !Array.prototype.filter ) {
		Array.prototype.filter = function ( filter, context ) {
			var i, len, filtered = [];

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) && filter.call( context, this[i], i, this ) ) {
					filtered[ filtered.length ] = this[i];
				}
			}

			return filtered;
		};
	}

}( document ));
