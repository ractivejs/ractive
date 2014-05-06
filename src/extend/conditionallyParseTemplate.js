import errors from 'config/errors';
import isClient from 'config/isClient';
import parse from 'parse/_parse';

export default function ( Child ) {
    var templateEl;

    if ( typeof Child.defaults.template === 'string' ) {
        if ( !parse ) {
            throw new Error( errors.missingParser );
        }

        if ( Child.defaults.template.charAt( 0 ) === '#' && isClient ) {
            templateEl = document.getElementById( Child.defaults.template.substring( 1 ) );
            if ( templateEl && templateEl.tagName === 'SCRIPT' ) {
                Child.defaults.template = parse( templateEl.innerHTML, Child );
            } else {
                throw new Error( 'Could not find template element (' + Child.defaults.template + ')' );
            }
        } else {
            Child.defaults.template = parse( Child.defaults.template, Child.defaults ); // all the relevant options are on Child.defaults
        }
    }
};
