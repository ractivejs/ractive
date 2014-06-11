export default function Ractive$find ( selector ) {
	if ( !this.el ) {
		return null;
	}

	return this.fragment.find( selector );
}
