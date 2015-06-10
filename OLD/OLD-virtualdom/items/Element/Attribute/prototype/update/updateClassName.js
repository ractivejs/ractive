import { safeToStringValue } from 'utils/dom';
export default function Attribute$updateClassName () {
	this.node.className = safeToStringValue( this.value );
}
