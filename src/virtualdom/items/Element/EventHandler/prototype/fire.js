// This function may be overwritten, if the event directive
// includes parameters
export default function EventHandler$fire ( event ) {
	this.root.fire( this.action.toString(), event );
}
