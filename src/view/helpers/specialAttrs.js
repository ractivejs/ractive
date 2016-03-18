const space = /\s+/;
const ident = /[a-zA-Z]/;
const trim = /^\s*(.*)\s*$/;
const specials = { 'float': 'cssFloat' };

export function readStyle ( css ) {
  let attrs = {};
  let c, i = 0, txt = '', quote, id = true, last, cap = false, comment = false;
  for ( i = 0; i < css.length; i++ ) {
    c = css[i];

    // inside a comment
    if ( comment ) {
      if ( c === '*' && css[i + 1] === '/' ) {
        comment = false;
        i++;
        continue;
      } else continue;
    }

    // inside a quote
    if ( quote ) {
      txt += c;

      // escapes
      if ( c === '\\' ) {
        txt += css[++i];
        continue;
      }

      // end quote
      if ( c === quote ) {
        quote = false;
      }

      continue;
    }

    if ( space.test( c ) ) {
      if ( !id ) txt += c;
    } else if ( id && ident.test( c ) ) {
      if ( id === true ) id = c;
      else id += cap ? c.toUpperCase() : c;
    } else if ( id && c === '-' && id !== true ) {
      cap = true;
      continue;
    } else if ( c === '"' || c === "'" ) {
      txt += c;
      quote = c;
    } else if ( c === ':' ) {
      last = specials[id] || id;
      id = false;
    } else if ( c === ';' ) {
      if ( last ) attrs[ last ] = txt.replace( trim, '$1' );
      txt = '';
      id = true;
      last = false;
    } else if ( c === '/' && css[i + 1] === '*' ) {
      comment = true;
      i++;
    } else if ( !id ) {
      txt += c;
    }

    cap = false;
  }

  if ( last ) attrs[ last ] = txt.replace( trim, '$1' );

  return attrs;
}

export function readClass ( str ) {
  const list = str.split( space );

  // remove any empty entries
  let i = list.length;
  while ( i-- ) {
    if ( !list[i] ) list.splice( i, 1 );
  }

  return list;
}
