import startsWithKeypath from 'parallel-dom/items/shared/utils/startsWithKeypath';

export default function startsWith( target, keypath) {
	return target === keypath || startsWithKeypath(target, keypath);
}
