import circular from 'circular';

var Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function Section$createFragment ( options ) {
	var fragment = new Fragment( options );

	if ( this.rendered ) {
		this.docFrag.appendChild( fragment.render() );
	}

	return fragment;
}
