

$(function () {
	var scr = document.createElement( 'script' ), innerHTML;
	innerHTML = scr.innerHTML = $( '#script' ).html();
	$( '#script' ).text( innerHTML );

	var expand = function ( content ) {
		$mirror.text( content + ' ' );
	};

	document.body.appendChild( scr );

	var $console = $( '#console' ), $mirror = $( '#consoleMirror' );
	$( '#console' )
	$console.on( 'keydown', function ( event ) {
		
		if ( event.which === 13 && !event.shiftKey ) {
			event.preventDefault();
			eval( this.value );
			return;
		}
		expand( this.value );
	});

	$console.on( 'keydown keypress keyup', function ( event ) {
		expand( this.value );
	});

	expand( $console.val() );

});