import isClient from 'config/isClient';
import extend from 'utils/extend';
import fillGaps from 'utils/fillGaps';
import isObject from 'utils/isObject';
import TemplateParser from 'Ractive/initialise/templateParser';

export default function ( ractive, defaults, options ) {
    var template = ractive.template, templateParser, parsedTemplate;

    templateParser = new TemplateParser( ractive.parseOptions );

    // Parse template, if necessary
    if ( !templateParser.isParsed( template ) ) {

        // Assume this is an ID of a <script type='text/ractive'> tag
        if ( template.charAt( 0 ) === '#' ) {
            template = templateParser.fromId( template );
        } 
        
        parsedTemplate = templateParser.parse( template );

    } else {
        parsedTemplate = template;
    }

    // deal with compound template
    if ( isObject( parsedTemplate ) ) {
        fillGaps( ractive.partials, parsedTemplate.partials );
        parsedTemplate = parsedTemplate.main;
    }

    // If the template was an array with a single string member, that means
    // we can use innerHTML - we just need to unpack it
    if ( parsedTemplate && ( parsedTemplate.length === 1 ) && ( typeof parsedTemplate[0] === 'string' ) ) {
        parsedTemplate = parsedTemplate[0];
    }

    ractive.template = parsedTemplate;

    // Add partials to our registry
    extend( ractive.partials, options.partials );


};
