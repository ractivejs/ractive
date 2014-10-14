export default function resolveSpecialReference ( fragment, ref ) {
  var frag = fragment;
  
  if ( ref === '@keypath' ) {
    while ( frag ) {
      if ( !!frag.context ) return frag.context;
      frag = frag.parent;
    }
  }

  else if ( ref === '@index' || ref === '@key' ) {
    while ( frag ) {
      if ( frag.index !== undefined ) return frag.index;
      frag = frag.parent;
    }
  }
}
