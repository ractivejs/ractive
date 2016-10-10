/// <reference path="./jquery.d.ts" />
/// <reference path="./es6-promise.d.ts" />

// Official Type definitions for Ractive.js 0.7.3
// http://www.ractivejs.org
// Version: ractivejs.d.js v0.0.2 2016-10-08

interface IRactiveAdapt {
    // TODO still need to implement this
    filter: (object: Object, keypath: string, ractive: Ractive) => Function;
    wrap: (ractive: Ractive, object: Object, keypath : string, prefixer: string) => Function;
}

interface IRactiveDecorator {
    (node: HTMLElement, content: any): { teardown : () => void }; //TODO I don't know what this content is
}

interface IRactiveEasing {
    (x:number) : number;
}

// Event -----------
interface IRactiveFire {
    node: HTMLElement;
    original: Event;
    x: number;
    y: number;
}
interface IRactiveEvent {
    (node: HTMLElement, fire: IRactiveFire)
}
interface IRactiveSanitizeOptions {
    elements: string[];
    eventAttributes: boolean;
}
interface IRactiveParseOptions {
	preserveWhitespace: boolean;
	sanitize: any;
}


interface IRactiveTransitionObject {
    node?: HTMLElement;
    isIntro?: boolean;
    name?: string;
    params?: Array<Object | number | string>;
    complete?: (noReset: boolean) => void;
    getStyle?: {
        (prop: string) : string;
        (props: string[]): { [key: string]: string };
    }
    setStyle?: {
        (props: { [key: string]: string | number }): void;
        (prop: string, value?: string): void;
    }
    animateStyle?: {
        (prop: string, value: any, options: IRactiveTransitionAnimateOptions, complete : void): void;
        (props: { [key: string]: string | number }, options: IRactiveTransitionAnimateOptions, complete : void): void;
    }
}
interface IRactiveTransitionAnimateOptions {
    duration?: number;
    easing?: string;
    delay?: number;
}

interface IRactiveTransition {
    (t: IRactiveTransitionObject, ...args: any[]);
}

interface IRactiveOptions {
    adapt?: Array<IRactiveAdapt | String>;
    adaptors?: IRactiveAdapt[]| string[];
    append?: boolean;
    // complete? : any  // deprecated
    components?: { [key: string]: IRactiveExtend };
    computed?: { [key: string]: any }; // TODO to implement
    css?: string;
    data?: any;
    decorators?: { [key: string]: IRactiveDecorator };
    delimiters?: string[]; //[ '{{', '}}' ]
    easing?: { [key: string]: IRactiveEasing };
    el?: string | HTMLElement | JQuery;
    events?: { [key: string]: IRactiveEvent };
    interpolators?: Object | any; // TODO needed to be implemented
    isolated?: boolean; // default false
    lazy?: boolean; // default false
    magic?: boolean; // default false
    modifyArrays?: boolean; // default true
    noCssTransform?: boolean;// default false
    noIntro?: boolean;// default false
    // Lifecycle events
    onchange?: () => void;
    oncomplete?: () => void;
    onconfig?: () => void;
    onconstruct?: () => void;
    ondetach?: () => void;
    oninit?: () => void;
    oninsert?: () => void;
    onrender?: () => void;
    onteardown?: () => void;
    onunrender?: () => void;
    onupdate?: () => void;
    partials?: { [key: string]: string };
    preserveWhitespace?: boolean; //default false
    sanitize?: Boolean | IRactiveSanitizeOptions;
    staticDelimiters?: string[]; //[ open, close ] ex.: [ '[[', ']]' ]
    staticTripleDelimiters?: string[]; //  [ open, close ] ex.: [ '[[[', ']]]' ]
    stripComments?: boolean;
    template?: string;
    transitions?: { [key: string]: IRactiveTransition };
    transitionsEnabled?: boolean; //default true
    tripleDelimiters?: string[]; //  [ open, close ] ex.: [ '[[[', ']]]' ]
    twoway?: Boolean; //default true
}
interface IRactiveExtendOptions extends IRactiveOptions {
}

interface IRactiveAnimateOptions {
    easing?: string;
    duration?: number;
    step?: (t: number, value: number) => Function;
    complete?: (t: number, value: number) => Function;
    delay?: number;
}
interface IRactiveFindOptions {
    live?: Boolean;
}

interface IRactiveObserveOptions extends IRactiveObserveOnceOptions {
    init?: boolean;    // Default true
}
interface IRactiveObserveOnceOptions {
    context?: any; // default ractive
    defer?: boolean; // Default false
}
interface IRactiveObserve {
    cancel(): void;
}
// event --------------------
interface IRactiveEvent {
    name: string;
    node: HTMLElement;
    keypath: string;
    context: string| number| Object; // same as ractive.get(event.keypath)
    index: { [key: string]: number };
    component?: Ractive;
    original: Event;
    x: number; //works on tap plugin I think
    y: number; //works on tap plugin I think
}

declare class Ractive extends IRactive {
}
declare class IRactive {
	extend: {
		(options: IRactiveExtendOptions): IRactiveExtend;
	}
    constructor(options: IRactiveOptions);
    // Promises down here ------------------
    add(keypath: string, value: number): Promise<void>;
    animate(keypath: string, value:  number | Object, options?: IRactiveAnimateOptions): Promise<any>;
    animate(keypathValue: Object, options?: IRactiveAnimateOptions): Promise<any>;
    merge(keypath: string, values?: string | number | Object): Promise<any>;
    pop(keypath: string): Promise<any>;
    push(keypath, value : Object): Promise<any>;
    reset(keypathValue?: Object): Promise<any>;
    resetPartial(keypath: string, partial: string|Object|Function): Promise<any>;
    set(keypath: string, value?: string | number | Object): Promise<any>;
    set(keypathValue: Object): Promise<any>;
    shift(keypath: string): Promise<any>;
    splice(keypath: string, index: number, removeCount: number) : Promise<any>;
    //splice(keypath: string, index: number, removeCount: number): Promise<any>;
    subtract(keypath: string, value: number): Promise<void>;
    teardown() : Promise<any>;
    toggle(keypath: string): Promise<any>;
    unshift(keypath: string, value: Object): Promise<any>;
    update(keypath: string): Promise<any>;
    // -------------
    detach() : DocumentFragment;
    insert(element: DocumentFragment, anchor?: string): void; // appears to have some bug here
    // selector
    find(selector : string) : HTMLElement ;
    findAll(selector: string, options?: IRactiveFindOptions ) : HTMLAllCollection ;
    findAllComponents(name?: string, options?: IRactiveFindOptions); // TODO need to be tested and typed
    findComponent(name?: string, options?: IRactiveFindOptions); // TODO need to be tested and typed
    findParent(name?: string); // TODO need to be tested and typed
    // fire -----
    fire(name: string, ...args: any[]): void; // TODO: void?
    fire(name: string, event: Event, ...args: any[]): void; // TODO: void?
    // observe -------------------------
    observe(keypath: string, callback: (newValue: any, oldValue: any, keypath: string) => void, options?: IRactiveObserveOptions): IRactiveObserve;
    observe(map: { keypath: string, callback: (newValue: any, oldValue: any, keypath: string) => void }, options?: IRactiveObserveOptions): IRactiveObserve;
    observeOnce(keypath: string, callback: (newValue: any, oldValue: any, keypath: string) => void, options?: IRactiveObserveOptions): IRactiveObserve;
    // on off handles -----
    on(eventName: string, handler: (event?: IRactiveEvent | any, ...args: any[]) => any): IRactiveObserve; // todo what type is this?
    on(map: { [eventName: string]: (event?: IRactiveEvent | any, ...args: any[]) => any }): IRactiveObserve; // todo what type is this?
    off(eventName?: string): Ractive; // not workink like the doc I think, TO check later
    once(eventName: string, handler: (event?: IRactiveEvent | any, ...args: any[]) => any): IRactiveObserve;// todo what type is this?
    // get -----
    get(keypath: string): any;
    //render ----
    render(targer: HTMLElement | string | JQuery): Promise<any>;
    unrender(): Promise<any>; // note: just for the DOM, ractive instance is left intact
    toHTML(): string;
    updateModel(): Promise<any>;
}

// extend -----------------------
interface IRactiveExtend extends IRactive {
	new (options: IRactiveExtendOptions): IRactiveExtend;
	extend(options: IRactiveExtendOptions): IRactiveExtend;
}
declare module Ractive {
	var extend: (options: IRactiveExtendOptions) => IRactiveExtend;
	var getNodeInfo: (node: HTMLElement) => any; // TODO what is this?
	var parse: (template: string, options ?: IRactiveParseOptions) => any;
	// globals
	var adaptors: Object;
	var defaults: IRactiveOptions;
	var components: any;
	var transitions: any;
	var events: any;
	var decorators: any;
	var DEBUG: boolean;
}
