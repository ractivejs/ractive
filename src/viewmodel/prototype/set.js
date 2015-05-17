export default function Viewmodel$set ( keypath, value, options = {} ) {

	// TODO: wildcard sets
	// if ( wildcard.test( model.getKeypath() ) ) {
	// getMatchingKeypaths( this, model.getKeypath() ).forEach( model => {
	// 	this.viewmodel.set( model, value );
	// });


	this.getContext( keypath ).set( value );

}

