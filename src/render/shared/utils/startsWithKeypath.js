export default function startsWithKeypath( target, keypath) {
    return target.substr( 0, keypath.length + 1 ) === keypath + '.';
};
