import sortByDocumentPosition from 'Ractive/prototype/shared/makeQuery/sortByDocumentPosition';
import sortByItemPosition from 'Ractive/prototype/shared/makeQuery/sortByItemPosition';

export default function () {
    this.sort( this._isComponentQuery ? sortByItemPosition : sortByDocumentPosition );
    this._dirty = false;
};
