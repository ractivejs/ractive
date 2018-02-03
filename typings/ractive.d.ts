// Type definitions for Ractive edge
// Project: https://ractive.js.org/
// Definitions By: Chris Reeves <https://github.com/evs-chris>
// Version: 1.0.0-edge+2018-02-02

interface ValueMap {
	[key: string]: any;
}

interface Adaptor {
	filter: (value: any, keypath: string, ractive: Ractive) => boolean;
	wrap: (ractive: Ractive, value: any, keypath: string, prefixer: AdaptorPrefixer) => AdaptorHandle
}
interface AdaptorHandle {
	get: () => any;
	set: (prop: string, value: any) => void;
	reset: (value: any) => void;
	teardown: () => void;
}
type AdaptorPrefixer = (map: ValueMap) => ValueMap;

interface AnimateOpts {
	duration?: number;
	easing?: string | Easing;
	interpolator?: string | Interpolator;
	step?: (time: number, value: any) => void;
	complete?: (value: any) => void;
}
interface AnimatePromise extends Promise<void> {
	stop(): void;
}

interface ArrayPushPromise extends Promise<number> {
	result: number;
}

interface ArrayPopPromise extends Promise<any> {
	result: any;
}

interface ArraySplicePromise extends Promise<any[]> {
	result: any[];
}

interface AttachOpts {
	target?: string;
	append?: boolean;
	prepend?: boolean;
	insertAt?: number;
}

export class ContextHelper {
	ractive: Ractive;
	decorators: Registry<DecoratorHandle>;
	node?: HTMLElement;
	original?: Event;
	event?: Event;

	add(keypath: string, amount?: number): Promise<void>;
	animate(keypath: string, value: any, opts?: AnimateOpts): AnimatePromise;
	get(opts?: GetOpts): any
	get(keypath: string, opts?: GetOpts): any;
	getBinding(): any;
	getBindingPath(ractive?: Ractive): string;
	getParent(crossComponentBoundary?: boolean): ContextHelper;
	hasListener(event: string, bubble?: boolean): boolean;
	isBound(): boolean;
	link(source: string, dest: string, opts?: LinkOpts): Promise<void>;
	listen(event: string, callback: (event: Event) => void): ListenerHandle;
	observe(keypath: string, callback: ObserverCallback, opts?: ObserverOpts): ObserverHandle;
	observe(map: { [key: string]: ObserverCallback }, opts?: ObserverOpts): ObserverHandle;
	observeOnce(keypath: string, callback: ObserverCallback, opts?: ObserverOpts): ObserverHandle;
	observeOnce(map: { [key: string]: ObserverCallback }, opts?: ObserverOpts): ObserverHandle;
	pop(keypath: string): ArrayPopPromise;
	push(keypath: string, ...values: any[]): ArrayPushPromise;
	raise(event: string, context: ContextHelper | {}, ...args: any[]): void;
	readLink(keypath: string, opts?: ReadLinkOpts): ReadLinkResult;
	resolve(keypath: string, ractive?: Ractive): string;
	reverse(keypath: string): ArraySplicePromise;
	set(keypath: string, value: any, opts?: SetOpts): Promise<void>;
	set(map: ValueMap, opts?: SetOpts): Promise<void>;
	setBinding(value: any): Promise<void>;
	shift(keypath: string): ArrayPopPromise;
	sort(keypath: string): ArraySplicePromise;
	splice(keypath: string, index: number, drop: number, ...add: any[]): ArraySplicePromise;
	subtract(keypath: string, amount?: number): Promise<void>;
	toggle(keypath: string): Promise<void>;
	unlink(keypath: string): Promise<void>;
	unlisten(event: string, callback: (event: Event) => void): void;
	update(opts?: UpdateOpts): Promise<void>;
	update(keypath: string, opts?: UpdateOpts): Promise<void>;
	updateModel(cascade?: boolean): Promise<void>;
	updateModel(keypath: string, cascade?: boolean): Promise<void>;
	unshift(keypath: string, value: any): ArrayPushPromise;
}

type Component = Static | Promise<Static>;

interface ComputationDescriptor {
	get: () => any;
	set?: (value: any) => void;
}
type ComputationFn = () => any;
type Computation = string | ComputationFn | ComputationDescriptor;

type CssFn = (data: DataGetFn) => string;

type Data = ValueMap
type DataFn = () => ValueMap;
type DataGetFn = (keypath: string) => any;

interface DecoratorHandle {
	invalidate?: () => void;
	teardown: () => void;
	update?: (...args: any[]) => void;
}
type Decorator = (node: HTMLElement, ...args: any[]) => DecoratorHandle;

type Easing = (time: number) => number;

type EventPlugin = (node: HTMLElement, fire: (event: Event) => void) => { teardown: () => void };

interface FindOpts {
	remote?: boolean;
}

interface GetOpts {
	virtual?: boolean;
	unwrap?: boolean
}

type Interpolator = <T>(from: T, to: T) => (t: number) => T;

interface LinkOpts {
	ractive?: Ractive;
	instance?: Ractive;
	keypath?: string;
}

type ListenerCallback = (ctx: ContextHelper, ...args: any[]) => boolean | void;
interface ListenerDescriptor {
	handler: ListenerCallback;
	once?: boolean;
}
interface ListenerHandle {
	cancel: () => void;
}

interface ObserverHandle {
	cancel(): void;
	silence(): void;
	isSilenced(): boolean;
	resume(): void;
}

type ObserverCallback = (value: any, old: any, keypath: string, ...parts: string[]) => void;
interface ObserverOpts {
	array?: boolean;
	context?: any;
	defer?: boolean;
	init?: boolean;
	links?: boolean;
	old?: ObserverCallback;
	strict?: boolean;
}
interface ObserverDescriptor extends ObserverOpts {
	handler: ObserverCallback;
	once?: boolean;
}

type ParseDelimiters = [ string, string ];

type ParseFn = (helper: ParseHelper) => string | [] | ParsedTemplate;

interface ParseHelper {
	fromId(id: string): string;
	isParser(template: any): boolean;
	parse(template: string, opts?: ParseOpts): ParsedTemplate;
}

interface ParsedTemplate {
	v: number;
	t: any[];
	e?: { [key: string]: Function };
	p: { [key: string]: any[] };
}

type Partial = string | any[] | ParseFn;

interface ReadLinkOpts {
	canonical?: boolean;
}
interface ReadLinkResult {
	ractive: Ractive;
	keypath: string;
}

interface SetOpts {
	deep?: boolean;
	keep?: boolean;
	shuffle?: Shuffler;
}

type Shuffler = boolean | string | ShuffleFn;
type ShuffleFn = (left: any, right: any) => (1 | 0 | -1);

type Target = string | HTMLElement | ArrayLike<any>;

type Template = ParsedTemplate | string | any[] | ParseFn;

interface TransitionHelper {
	isIntro: boolean;
	isOutro: boolean;
	name: string;
	node: HTMLElement;

	animateStyle(prop: string, value: any, opts: TransitionOpts & {}, complete?: () => void): Promise<void>;
	animateStyle(map: ValueMap, opts: TransitionOpts & {}, complete?: () => void): Promise<void>;
	complete(reset?: boolean): void;
	getStyle(prop: string): any;
	getStyle(props: string[]): ValueMap;
	processParams(params: number | 'slow' | 'fast' | string | ValueMap, defaults?: ValueMap): ValueMap;
	setStyle(prop: string, value: any): void;
	setStyle(map: ValueMap): void;
}
type Transition = (helper: TransitionHelper, ...args: any[]) => (void | Promise<void>);
interface TransitionOpts {
	duration?: number | 'slow' | 'fast' | string;
	easing?: string;
	delay?: number;
}

interface UpdateOpts {
	force?: boolean;
}

interface Registry<T> { [key: string]: T }

interface BaseParseOpts {
	contextLines?: number;
	csp?: boolean;
	delimiters?: ParseDelimiters;
	preserveWhitespace?: boolean;
	sanitize?: boolean; //TODO
	staticDelimiters?: ParseDelimiters;
	staticTripleDelimiters?: ParseDelimiters;
	stripComments?: boolean;
	tripleDelimiters?: ParseDelimiters;
}

interface ParseOpts extends BaseParseOpts {
	textOnlyMode?: boolean;
}

interface BaseInitOpts extends BaseParseOpts {
	adapt?: (Adaptor | string)[];
	adaptors?: Registry<Adaptor>;
	allowExpressions?: boolean;
	append?: boolean;
	attributes?: string[] | { optional?: string[], required?: string[] };
	components?: Registry<Component>;
	computed?: { [key: string]: Computation };
	decorators?: Registry<Decorator>;
	delegate?: boolean;
	easing?: Registry<Easing>;
	events?: Registry<EventPlugin>;
	interpolators?: Registry<Interpolator>;
	lazy?: boolean;
	nestedTransitions?: boolean;
	noIntro?: boolean;
	noOutro?: boolean;
	observe?: Registry<ObserverCallback | ObserverDescriptor>;
	on?: Registry<ListenerCallback | ListenerDescriptor>;
	partials?: Registry<Partial>;
	resolveInstanceMembers?: boolean;
	syncComputedChildren?: boolean;
	template?: Template;
	transitions?: Registry<Transition>;
	transitionsEnabled?: boolean;
	twoway?: boolean;
	warnAboutAmbiguity?: boolean;
}

interface ExtendOpts extends BaseInitOpts {
	css?: string | CssFn;
	cssData?: ValueMap;
	cssId?: string;
	data?: DataFn;
	isolated?: boolean;
	noCssTransform?: boolean;
}

interface InstanceInitOpts extends BaseInitOpts {
	data?: Data | DataFn;
	el?: Target;
	target?: Target;
}

interface AppendInitOpts extends InstanceInitOpts {
	append: true;
}

interface EnhanceInitOpts extends InstanceInitOpts {
	enhance: true;
}

type InitOpts = InstanceInitOpts | AppendInitOpts | EnhanceInitOpts;

interface Registries {
	adaptors: Registry<Adaptor>;
	components: Registry<Component>;
	decorators: Registry<Decorator>;
	easings: Registry<Easing>;
	events: Registry<Event>;
	interpolators: Registry<Interpolator>;
	partials: Registry<Partial>;
}

interface Static {
	new(opts?: InitOpts): Ractive;

	defaults: Registries;

	adaptors: Registry<Adaptor>;
	components: Registry<Component>;
	decorators: Registry<Decorator>;
	easings: Registry<Easing>;
	events: Registry<EventPlugin>;
	interpolators: Registry<Interpolator>;
	partials: Registry<Partial>;

	extend(opts?: ExtendOpts): Static;
	extendWith<T extends Static>(c: T, opts?: ExtendOpts): void;

	getContext(query: HTMLElement | string): ContextHelper;
	isInstance(obj: any): boolean;
	sharedGet(keypath: string): any;
	sharedSet(keypath: string, value: any): Promise<void>;
	sharedSet(map: ValueMap): Promise<void>;
	styleGet(keypath: string): any;
	styleSet(keypath: string, value: any): Promise<void>;
	styleSet(map: ValueMap): Promise<void>;

	Ractive: Static;
	Parent: Static;
}

export class Ractive {
	constructor(opts?: InitOpts);

	container?: Ractive;
	parent?: Ractive;
	root: Ractive;

	adaptors: Registry<Adaptor>;
	components: Registry<Component>;
	decorators: Registry<Decorator>;
	easings: Registry<Easing>;
	events: Registry<EventPlugin>;
	interpolators: Registry<Interpolator>;
	partials: Registry<Partial>;

	_super(...args: any[]): any;

	add(keypath: string, amount?: number): Promise<void>;
	animate(keypath: string, value: any, opts?: AnimateOpts): AnimatePromise;
	attachChild(child: Ractive, opts?: AttachOpts): Promise<void>;
	detach(): DocumentFragment;
	detachChild(child: Ractive): Promise<void>;
	find(selector: string, opts?: FindOpts): HTMLElement;
	findAll(selector: string, opts?: FindOpts): HTMLElement[];
	findAllComponents(opts?: FindOpts): Ractive[];
	findAllComponents(name: string, opts?: FindOpts): Ractive[];
	findComponent(opts?: FindOpts): Ractive;
	findComponent(name: string, opts?: FindOpts): Ractive;
	findContainer(name: string): Ractive;
	findParent(name: string): Ractive;
	fire(name: string, ctx: ContextHelper | {}, ...args: any[]): boolean;
	get(opts?: GetOpts): any
	get(keypath: string, opts?: GetOpts): any;
	getContext(query: HTMLElement | string): ContextHelper;
	insert(target: Target, anchor: Target): void;
	link(source: string, dest: string, opts?: LinkOpts): Promise<void>;
	observe(keypath: string, callback: ObserverCallback, opts?: ObserverOpts): ObserverHandle;
	observe(map: { [key: string]: ObserverCallback }, opts?: ObserverOpts): ObserverHandle;
	observeOnce(keypath: string, callback: ObserverCallback, opts?: ObserverOpts): ObserverHandle;
	observeOnce(map: { [key: string]: ObserverCallback }, opts?: ObserverOpts): ObserverHandle;
	off(event?: string, handler?: ListenerCallback): Ractive;
	on(event: string, handler: ListenerCallback): ObserverHandle;
	on(map: { [key: string]: ListenerCallback }): ObserverHandle;
	once(event: string, handler: ListenerCallback): ObserverHandle;
	once(map: { [key: string]: ListenerCallback }): ObserverHandle;
	pop(keypath: string): ArrayPopPromise;
	push(keypath: string, ...values: any[]): ArrayPushPromise;
	readLink(keypath: string, opts?: ReadLinkOpts): ReadLinkResult;
	render(target: Target): Promise<void>;
	reset(data?: Data): Promise<void>;
	resetPartial(name: string, partial: Partial): Promise<void>;
	resetTemplate(template: Template): Promise<void>;
	reverse(keypath: string): ArraySplicePromise;
	set(keypath: string, value: any, opts?: SetOpts): Promise<void>;
	set(map: ValueMap, opts?: SetOpts): Promise<void>;
	shift(keypath: string): ArrayPopPromise;
	sort(keypath: string): ArraySplicePromise;
	splice(keypath: string, index: number, drop: number, ...add: any[]): ArraySplicePromise;
	subtract(keypath: string, amount?: number): Promise<void>;
	teardown(): Promise<void>;
	toCSS(): string;
	toHTML(): string;
	toggle(keypath: string): Promise<void>;
	transition(transition: string | Transition, opts?: TransitionOpts & {}): Promise<void>;
	transition(transition: string | Transition, node: HTMLElement, opts?: TransitionOpts & {}): Promise<void>;
	unlink(keypath: string): Promise<void>;
	unrender(): Promise<void>;
	update(opts?: UpdateOpts): Promise<void>;
	update(keypath: string, opts?: UpdateOpts): Promise<void>;
	updateModel(cascade?: boolean): Promise<void>;
	updateModel(keypath: string, cascade?: boolean): Promise<void>;
	unshift(keypath: string, value: any): ArrayPushPromise;

	static defaults: Registries;

	static adaptors: Registry<Adaptor>;
	static components: Registry<Component>;
	static decorators: Registry<Decorator>;
	static easings: Registry<Easing>;
	static events: Registry<EventPlugin>;
	static interpolators: Registry<Interpolator>;
	static partials: Registry<Partial>;

	static extend(opts?: ExtendOpts): Static;
	static extendWith<T extends Static>(c: T, opts?: ExtendOpts): void;

	static getContext(query: HTMLElement | string): ContextHelper;
	static isInstance(obj: any): boolean;
	static sharedGet(keypath: string): any;
	static sharedSet(keypath: string, value: any): Promise<void>;
	static sharedSet(map: ValueMap): Promise<void>;
	static styleGet(keypath: string): any;
	static styleSet(keypath: string, value: any): Promise<void>;
	static styleSet(map: ValueMap): Promise<void>;

	static Ractive: Static;
	static Parent: Static;
}

export module Ractive {
	const Context: typeof ContextHelper;

	let DEBUG: boolean;
	let DEBUG_PROMISES: boolean;

	const svg: boolean;

	const VERSION: string;

	function escapeKey(key: string): string;
	function getCSS(): string;
	function joinKeys(...keys: string[]): string;
	function parse(template: string, opts?: ParseOpts): ParsedTemplate;
	function splitKeypath(keypath: string): string[];
	function unescapeKey(key: string): string;
}

export default Ractive;
