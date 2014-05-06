import startsWith from 'render/shared/utils/startsWith';
import getNewKeypath from 'render/shared/utils/getNewKeypath';

export default function assignNewKeypath ( target, property, oldKeypath, newKeypath ) {
    if ( !target[property] || startsWith(target[property], newKeypath) ) { return; }
    target[property] = getNewKeypath(target[property], oldKeypath, newKeypath);
};
