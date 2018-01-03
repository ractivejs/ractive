import { fromExpression, fromComputationString } from '../../parse/utils/createFunction';
import { doc } from '../../config/environment';
import { fatal } from '../../utils/log';
import { addFunctions } from '../../shared/getFunction';
import parse from '../../parse/_parse';

const parseOptions = [
	'delimiters',
	'tripleDelimiters',
	'staticDelimiters',
	'staticTripleDelimiters',
	'csp',
	'interpolate',
	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'contextLines',
	'parserTransforms',
	'allowExpressions'
];

const TEMPLATE_INSTRUCTIONS = `Either preparse or use a ractive runtime source that includes the parser. `;

const COMPUTATION_INSTRUCTIONS = `Either include a version of Ractive that can parse or convert your computation strings to functions.`;


function throwNoParse ( method, error, instructions ) {
	if ( !method ) {
		fatal( `Missing Ractive.parse - cannot parse ${error}. ${instructions}` );
	}
}

export function createFunction ( body, length ) {
	throwNoParse( fromExpression, 'new expression function', TEMPLATE_INSTRUCTIONS );
	return fromExpression( body, length );
}

export function createFunctionFromString ( str, bindTo ) {
	throwNoParse( fromComputationString, 'compution string "${str}"', COMPUTATION_INSTRUCTIONS );
	return fromComputationString( str, bindTo );
}

const parser = {

	fromId ( id, options ) {
		if ( !doc ) {
			if ( options && options.noThrow ) { return; }
			throw new Error( `Cannot retrieve template #${id} as Ractive is not running in a browser.` );
		}

		if ( id ) id = id.replace( /^#/, '' );

		let template;

		if ( !( template = doc.getElementById( id ) )) {
			if ( options && options.noThrow ) { return; }
			throw new Error( `Could not find template element with id #${id}` );
		}

		if ( template.tagName.toUpperCase() !== 'SCRIPT' ) {
			if ( options && options.noThrow ) { return; }
			throw new Error( `Template element with id #${id}, must be a <script> element` );
		}

		return ( 'textContent' in template ? template.textContent : template.innerHTML );

	},

	isParsed ( template) {
		return !( typeof template === 'string' );
	},

	getParseOptions ( ractive ) {
		// Could be Ractive or a Component
		if ( ractive.defaults ) { ractive = ractive.defaults; }

		return parseOptions.reduce( ( val, key ) => {
			val[ key ] = ractive[ key ];
			return val;
		}, {});
	},

	parse ( template, options ) {
		throwNoParse( parse, 'template', TEMPLATE_INSTRUCTIONS );
		const parsed = parse( template, options );
		addFunctions( parsed );
		return parsed;
	},

	parseFor( template, ractive ) {
		return this.parse( template, this.getParseOptions( ractive ) );
	}
};

export default parser;
