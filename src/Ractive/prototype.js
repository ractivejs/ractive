import add from './prototype/add';
import animate from './prototype/animate';
import attachChild from './prototype/attachChild';
import detach from './prototype/detach';
import detachChild from './prototype/detachChild';
import find from './prototype/find';
import findAll from './prototype/findAll';
import findAllComponents from './prototype/findAllComponents';
import findComponent from './prototype/findComponent';
import findContainer from './prototype/findContainer';
import findParent from './prototype/findParent';
import fire from './prototype/fire';
import get from './prototype/get';
import getContext, { getNodeInfo } from './prototype/getContext';
import insert from './prototype/insert';
import link from './prototype/link';
import observe from './prototype/observe';
import observeOnce from './prototype/observeOnce';
import off from './prototype/off';
import on from './prototype/on';
import once from './prototype/once';
import pop from './prototype/pop';
import push from './prototype/push';
import readLink from './prototype/readLink';
import render from './prototype/render';
import reset from './prototype/reset';
import resetPartial from './prototype/resetPartial';
import resetTemplate from './prototype/resetTemplate';
import reverse from './prototype/reverse';
import set from './prototype/set';
import shift from './prototype/shift';
import sort from './prototype/sort';
import splice from './prototype/splice';
import subtract from './prototype/subtract';
import teardown from './prototype/teardown';
import toggle from './prototype/toggle';
import toCSS from './prototype/toCSS';
import toHTML from './prototype/toHTML';
import toText from './prototype/toText';
import transition from './prototype/transition';
import unlink from './prototype/unlink';
import unrender from './prototype/unrender';
import unshift from './prototype/unshift';
import update from './prototype/update';
import updateModel from './prototype/updateModel';

const proto = {
	add,
	animate,
	attachChild,
	detach,
	detachChild,
	find,
	findAll,
	findAllComponents,
	findComponent,
	findContainer,
	findParent,
	fire,
	get,
	getContext,
	getNodeInfo,
	insert,
	link,
	observe,
	observeOnce,
	off,
	on,
	once,
	pop,
	push,
	readLink,
	render,
	reset,
	resetPartial,
	resetTemplate,
	reverse,
	set,
	shift,
	sort,
	splice,
	subtract,
	teardown,
	toggle,
	toCSS,
	toCss: toCSS,
	toHTML,
	toHtml: toHTML,
	toText,
	transition,
	unlink,
	unrender,
	unshift,
	update,
	updateModel
};

Object.defineProperty( proto, 'target', {
	get() { return this.el; }
});

export default proto;
