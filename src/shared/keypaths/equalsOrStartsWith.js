import startsWithKeypath from 'shared/keypaths/startsWith';

export default function equalsOrStartsWith( target, keypath) {
	return target === keypath || startsWithKeypath(target, keypath);
}
