import runloop from 'global/runloop';
import css from 'global/css';

export default function Element$detach () {
	var Component;

	if ( this.node ) {
		// need to check for parent node - DOM may have been altered
		// by something other than Ractive! e.g. jQuery UI...
		if ( this.node.parentNode ) {
			this.node.parentNode.removeChild( this.node );
		}
		return this.node;
	}

	// If this element has child components with their own CSS, that CSS needs to
	// be removed now
	// TODO optimise this
	if ( this.cssDetachQueue.length ) {
		runloop.start();
		while ( Component === this.cssDetachQueue.pop() ) {
			css.remove( Component );
		}
		runloop.end();
	}
}
