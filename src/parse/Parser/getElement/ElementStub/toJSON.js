define([
	'config/types',
	'parse/Parser/utils/jsonifyStubs',
	'parse/Parser/getElement/ElementStub/utils/jsonifyDirective'
], function (
	types,
	jsonifyStubs,
	jsonifyDirective
) {

	'use strict';

	return function ( noStringify ) {
		var json, name, value, proxy, i, len, attribute;

		if ( this[ 'json_' + noStringify ] ) {
			return this[ 'json_' + noStringify ];
		}

		if ( this.component ) {
			json = {
				t: types.COMPONENT,
				e: this.component
			};
		} else {
			json = {
				t: types.ELEMENT,
				e: this.tag
			};
		}

		if ( this.doctype ) {
			json.y = 1;
		}

		if ( this.attributes && this.attributes.length ) {
			json.a = {};

			len = this.attributes.length;
			for ( i=0; i<len; i+=1 ) {
				attribute = this.attributes[i];
				name = attribute.name;

				if ( json.a[ name ] ) {
					throw new Error( 'You cannot have multiple attributes with the same name' );
				}

				// empty attributes (e.g. autoplay, checked)
				if( attribute.value === null ) {
					value = null;
				} else {
					//value = jsonifyStubs( attribute.value, noStringify );
					value = attribute.value.toJSON( noStringify );
				}

				json.a[ name ] = value;
			}
		}

		if ( this.items && this.items.length ) {
			json.f = jsonifyStubs( this.items, noStringify );
		}

		if ( this.proxies && this.proxies.length ) {
			json.v = {};

			len = this.proxies.length;
			for ( i=0; i<len; i+=1 ) {
				proxy = this.proxies[i];
				json.v[ proxy.directiveType ] = jsonifyDirective( proxy );
			}
		}

		if ( this.intro ) {
			json.t1 = jsonifyDirective( this.intro );
		}

		if ( this.outro ) {
			json.t2 = jsonifyDirective( this.outro );
		}

		if ( this.decorator ) {
			json.o = jsonifyDirective( this.decorator );
		}

		this[ 'json_' + noStringify ] = json;
		return json;
	};

});
