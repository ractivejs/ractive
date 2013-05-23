expr.digits = expr.regex( /^[0-9]+/ );
expr.exponent = expr.regex( /^[eE][\-+]?[0-9]+/ );
expr.fraction = expr.regex( /^\.[0-9]+/ );
expr.integer = expr.regex( /^(0|[1-9][0-9]*)/ );
expr.name = expr.regex( /^[a-zA-Z_$][a-zA-Z_$0-9]*/ );