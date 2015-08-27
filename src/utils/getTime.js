import { win } from 'config/environment';

const getTime = ( win && win.performance && typeof win.performance.now === 'function' ) ?
	() => win.performance.now() :
	() => Date.now();

export default getTime;
