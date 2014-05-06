import vendors from 'config/vendors';

var unprefixPattern = new RegExp( '^-(?:' + vendors.join( '|' ) + ')-' );

export default function ( prop ) {
    return prop.replace( unprefixPattern, '' );
};
