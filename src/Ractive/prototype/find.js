export default function Ractive$find ( selector ) {
	if ( !this.el ) throw new Error( `Cannot call ractive.find('${selector}') unless instance is rendered to the DOM` );

	return this.fragment.find( selector );
}
