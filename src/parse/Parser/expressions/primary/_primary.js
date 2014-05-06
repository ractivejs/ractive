import getLiteral from 'parse/Parser/expressions/primary/literal/_literal';
import getReference from 'parse/Parser/expressions/primary/reference';
import getBracketedExpression from 'parse/Parser/expressions/primary/bracketedExpression';

export default function ( tokenizer ) {
    return getLiteral( tokenizer )
        || getReference( tokenizer )
        || getBracketedExpression( tokenizer );
};
