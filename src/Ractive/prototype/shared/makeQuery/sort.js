import sortByDocumentPosition from './sortByDocumentPosition';
import sortByItemPosition from './sortByItemPosition';

export default function () {
	this.sort( this._isComponentQuery ? sortByItemPosition : sortByDocumentPosition );
	this._dirty = false;
}
