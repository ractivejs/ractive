// Type definitions for Ractive edge
// Project: https://ractive.js.org/
// Definitions By: Chris Reeves <https://github.com/evs-chris>
// Version: 1.0.0-edge+2018-04-22

export interface ValueMap {
	[key: string]: any;
}

export interface Adaptor {
	/** Called when Ractive gets a new value to see if the adaptor should be applied.
	 * @param value the value to evaluate
	 * @param keypath the keypath of the value in the Ractive data
	 * @param ractive the Ractive instance that is applying the value to the given keypath
	 * @returns true if the adaptor should be applied, false otherwisej
	 */
	filter: (value: any, keypath: string, ractive: Ractive) => boolean;

	/** Called when Ractive is applying the adaptor to a value
	 * @param ractive the Ractive instance that is applying the adaptor
	 * @param value the value to which the value is being applied
	 * @param keypath the keypath of the value to which the adaptor is being applied
	 * @param prefixer a helper function to prefix a value map with the current keypath
	 * @returns the adaptor
	 */
	wrap: (ractive: Ractive, value: any, keypath: string, prefixer: AdaptorPrefixer) => AdaptorHandle
}
export interface AdaptorHandle {
	/** Called when Ractive needs to retrieve the adapted value. */
	get: () => any;
	/** Called when Ractive needs to set a property of the adapted value e.g. r.set('adapted.prop', {}). */
	set: (prop: string, value: any) => void;
	/** Called when Ractive needs to replace the adapted value e.g. r.set('adapted', {}). */
	reset: (value: any) => void;
	/** Called when Ractive no longer needs the adaptor. */
	teardown: () => void;
}
export type AdaptorPrefixer = (map: ValueMap) => ValueMap;

export interface AnimateOpts {
	/** The duration for the transition in milliseconds. */
	duration?: number;
	/** An easing name e.g. 'ease' or an easing function. */
	easing?: string | Easing;
	/** An interpolator name or function. */
	interpolator?: string | Interpolator;
	/** This is called when an animation frame is applied.
	 * @param time the current time code as a number between 0 and 1
	 * @param value the value computed for the current time code
	 */
	step?: (time: number, value: any) => void;
	/** This is called when the animation is complete.
	 * @param value the final value of the animation
	 */
	complete?: (value: any) => void;
}
export interface AnimatePromise extends Promise<void> {
	/** Stops the associated animation. */
	stop(): void;
}

export interface ArrayPushPromise extends Promise<number> {
	/** The new length of the target array. */
	result: number;
}

export interface ArrayPopPromise extends Promise<any> {
	/** The value removed for the target array. */
	result: any;
}

export interface ArraySplicePromise extends Promise<any[]> {
	result: any[];
}

export interface AttachOpts {
	/** The name of an anchor to attach a child to e.g. 'foo' for <#foo />. */
	target?: string;
	/** If the target anchor is already occupied, this instance will be moved to the end of the queue to occupy it, meaning that all of the other attached instances will need to be detached before this one can occupy the anchor. */
	append?: boolean;
	/** If the target anchor is already occupied, this instance will be moved to the beginning of the queue to occupy it, meaning it will replace the instance currently occupying the anchor. */
	prepend?: boolean;
	/** The index of the position in the queue for the target anchor at which to insert this instance. 0 is equivalent to prepend: true. */
	insertAt?: number;
}

export class ContextHelper {
	/** The Ractive instance associated with this Context. */
	ractive: Ractive;
	/** A map of currently attached decorator handles, by name, that are associated with the element, if any, that this Context is associated with. */
	decorators: Registry<DecoratorHandle>;
	/** The element associated with this Context, if any. */
	node?: HTMLElement;
	/** The event associated with this Context, if any. */
	original?: Event;
	/** The event associated with this Context, if any. */
	event?: Event;
	/** The source component for a bubbled event Context, if any. */
	component?: Ractive;

	/** Add to the number at the given keypath
	 * @param keypath a Context-relative keypath to a number
	 * @param amount the amount to add to the target number - defaults to 1
	 */
	add(keypath: string, amount?: number): Promise<void>;

	/**
	 * Animate the value at the given keypath from its current value to the given value.
	 * @param keypath a Context-relative keypath to the value
	 * @param value the target value
	 * @param opts
	 */
	animate(keypath: string, value: any, opts?: AnimateOpts): AnimatePromise;

	/**
	 * Retrieve the value associated with the current Context.
	 * @param opts
	 */
	get(opts?: GetOpts): any

	/**
	 * Retrieve the value at the given keypath.
	 * @param keypath a Context-relative keypath to the value
	 * @param opts
	 */
	get(keypath: string, opts?: GetOpts): any;

	/**
	 * Retrieve the value associated with the twoway binding of the element e.g. .value in <input value="{{.value}}" />.
	 */
	getBinding(): any;

	/**
	 * Resolve the keypath associated with the twoway binding of the element e.g. '.value' in <input value="{{.value}}" />.
	 * @param ractive the instance against which to resolve the path
	 */
	getBindingPath(ractive?: Ractive): string;

	/**
	 * Retrieve the Context that is the parent of this one e.g. for {{#with foo}} from the <div> in {{#with foo}}{{#with bar}}<div />{{/with}}{{/with}}.
	 * @param crossComponentBoundary whether or not to cross a component boundary when getting the parent context
	 */
	getParent(crossComponentBoundary?: boolean): ContextHelper;

	/**
	 * Determine whether or not the element associated with the Context as a Ractive listener (on-event) for the given event.
	 * @param event the event for which to check
	 * @param bubble whether or not check parent elements for a listener if the current element does not have one - defaults to false
	 */
	hasListener(event: string, bubble?: boolean): boolean;

	/**
	 * Determine whether or not there is a twoway binding associated with the element associated with this Context.
	 */
	isBound(): boolean;

	/**
	 * Create a link to the given source keypath at the given target keypath, similar to a symlink in filesystems. This allows safely referencing the same data at two places in the same instance or across instances if given a target instance. Cross-instance links are also known as mappings.
	 * @param source the Context-relative keypath to the source of the link
	 * @param dest the Context-relative keypath for the destination
	 * @param opts
	 */
	link(source: string, dest: string, opts?: LinkOpts): Promise<void>;

	/**
	 * Attach a delegation-aware DOM event listener to the element associated with this Context.
	 * @param event the name of DOM event for which to listen
	 * @param callback the callback to call when the given event is fired
	 */
	listen(event: string, callback: (this: HTMLElement, event: Event) => void): ListenerHandle;

	/**
	 * Create an observer at the given keypath that will be called when the value at that Context-relative keypath mutates.
	 * @param keypath the keypath(s) to observe - multiple keypaths can be separated by a space
	 * @param callback
	 * @param opts
	 */
	observe(keypath: string, callback: ObserverCallback, opts?: ObserverOpts): ObserverHandle;

	/**
	 * Create an observer at the given keypath that will be called when the value at that Context-relative keypath mutates.
	 * @param keypath the keypath(s) to observe - multiple keypaths can be separated by a space
	 * @param callback
	 * @param opts
	 */
	observe(keypath: string, callback: ObserverArrayCallback, opts?: ObserverArrayOpts): ObserverHandle;

	/**
	 * Create a set of observers from the given map.
	 * @param map Context-relative keypath -> callback pairs to observe
	 * @returns an observer handle that controls all of the created observers
	 */
	observe(map: { [key: string]: ObserverCallback }, opts?: ObserverOpts): ObserverHandle;

	/**
	 * Create a set of observers from the given map.
	 * @param map Context-relative keypath -> callback pairs to observe
	 * @returns an observer handle that controls all of the created observers
	 */
	observe(map: { [key: string]: ObserverArrayCallback }, opts?: ObserverArrayOpts): ObserverHandle;

	/**
	 * Create an observer at the given keypath that will be called the first time the value at that Context-relative keypath mutates. After that call, the observer will be automatically cancelled.
	 * @param keypath the keypath(s) to observer - multiple keypaths can be separated by a space
	 * @param callback
	 * @param opts
	 */
	observeOnce(keypath: string, callback: ObserverCallback, opts?: ObserverOpts): ObserverHandle;

	/**
	 * Create an observer at the given keypath that will be called the first time the value at that Context-relative keypath mutates. After that call, the observer will be automatically cancelled.
	 * @param keypath the keypath(s) to observer - multiple keypaths can be separated by a space
	 * @param callback
	 * @param opts
	 */
	observeOnce(keypath: string, callback: ObserverArrayCallback, opts?: ObserverArrayOpts): ObserverHandle;

	/**
	 * Create a set of observers from the given map. After the first observed value from any of the set mutates, all of the observers will be cancelled.
	 * @param map Context-relative keypath -> callback pairs to observe
	 * @returns an observer handle that controls all of the created observersj
	 */
	observeOnce(map: { [key: string]: ObserverCallback }, opts?: ObserverOpts): ObserverHandle;

	/**
	 * Create a set of observers from the given map. After the first observed value from any of the set mutates, all of the observers will be cancelled.
	 * @param map Context-relative keypath -> callback pairs to observe
	 * @returns an observer handle that controls all of the created observersj
	 */
	observeOnce(map: { [key: string]: ObserverArrayCallback }, opts?: ObserverArrayOpts): ObserverHandle;

	/**
	 * Pop a value off the array at the given Context-relative keypath.
	 * @param keypath keypath to the target array
	 */
	pop(keypath: string): ArrayPopPromise;

	/**
	 * Push a value onto the array at the given Context-relative keypath. If there is no value (undefined) at the given keypath, an array will be created for it.
	 * @param keypath keypath to the target array
	 * @param values
	 */
	push(keypath: string, ...values: any[]): ArrayPushPromise;

	/**
	 * Manually call a Ractive event handler on the element associated with this Context e.g. to trigger the 'event' handler <div on-event="..." />, use context.raise('event');
	 * @param event the name of the event to trigger
	 * @param context the optional context to supply to the event handler
	 * @param args any additional args to supply to the event handler
	 */
	raise(event: string, context?: ContextHelper | {}, ...args: any[]): void;

	/**
	 * Get the source keypath for the given Context-relative keypath if it is a link.
	 * @param keypath
	 * @param opts
	 */
	readLink(keypath: string, opts?: ReadLinkOpts): ReadLinkResult;

	/**
	 * Resolve the given Context-relative keypath to a root keypath, optionally in the given instance. Note that some keypaths cannot be resolved to root keypaths.
	 * @param keypath relative keypath
	 * @param ractive target instance in which to resolve the keypath
	 */
	resolve(keypath: string, ractive?: Ractive): string;

	/**
	 * Reverse the array at the given Context-relative keypath.
	 * @param keypath keypath to the targret array
	 */
	reverse(keypath: string): ArraySplicePromise;

	/**
	 * Set a value at the given Context-relative keypath. If any intermediate levels do not exist in the data, they will be created as appriate - objects for string keys and arrays for numeric keys.
	 * @param keypath
	 * @param value the value to set
	 * @param opts
	 */
	set(keypath: string, value: any, opts?: SetOpts): Promise<void>;

	/**
	 * Set a set of values from the given map. All of the values will be set before any DOM changes are propagated, but the values will still be set in object order in the data, which can cause multiple invalidations on observers, bindings, and template nodes.j
	 * @param map Context-relative keypath -> value pairs to be set
	 */
	set(map: ValueMap, opts?: SetOpts): Promise<void>;

	/**
	 * Set the value associated with any twoway binding associated with this Context e.g. .value in <input value="{{.value}}" />.
	 * @param value the target value
	 */
	setBinding(value: any): Promise<void>;

	/**
	 * Shift a value off of the array at the given Context-relative keypath.
	 * @param keypath
	 */
	shift(keypath: string): ArrayPopPromise;

	/**
	 * Sort the array at the given Context-relative keypath.
	 * @param keypath
	 */
	sort(keypath: string): ArraySplicePromise;

	/**
	 * Splice the array at the given Context-relative keypath.
	 * @param keypath
	 * @param index index at which to start splicing
	 * @param drop number of items to drop starting at the given index
	 * @param add items to add at the given index
	 */
	splice(keypath: string, index: number, drop: number, ...add: any[]): ArraySplicePromise;

	/**
	 * Subtract an amount from the number at the given Context-relative keypath.
	 * @param keypath
	 * @param amount the amount to subtrat from the value - defaults to 1
	 */
	subtract(keypath: string, amount?: number): Promise<void>;

	/**
	 * Toggle the value at the given Context-relative keypath. If it is truthy, set it to false, otherwise, set it to true.
	 * @param keypath
	 */
	toggle(keypath: string): Promise<void>;

	/**
	 * Remove the link at the given Context-relative keypath.
	 * @param keypath
	 */
	unlink(keypath: string): Promise<void>;

	/**
	 * Remove a DOM listener in a delegation-aware way.
	 * @param event name of the event for which to stop listening
	 * @param callback the callback listener to remove
	 */
	unlisten(event: string, callback: (this: HTMLElement, event: Event) => void): void;

	/**
	 * Invalidate the model associated with the current Context. This will cause Ractive to check for any changes that may have happened directly to the data without going through a set or array method.
	 * @param opts
	 */
	update(opts?: UpdateOpts): Promise<void>;

	/**
	 * Invalidate the model at the given Context-relative keypath. This will cause Ractive to check for any changes that may have happened directly to the data without going through a set or array method.
	 * @param keypath
	 * @param opts
	 */
	update(keypath: string, opts?: UpdateOpts): Promise<void>;

	/**
	 * Cause any bindings associated with this Context to apply the value in the view to the model. Use this to pull changes made directly to view elements into the data.
	 * @param cascade whether or not to cause downstream models to also update
	 */
	updateModel(cascade?: boolean): Promise<void>;

	/**
	 * Cause any bindings associated with the given Context-relative keypath to apply the value in the view to the model. Use this to pull changes made directly to view elements into the data.
	 * @param keypath
	 * @param cascade whether or not to cause downstream models to also update
	 */
	updateModel(keypath: string, cascade?: boolean): Promise<void>;

	/**
	 * Unshift the given value onto the array at the given Context-relative keypath. If there is nothing at the given keypath (undefined), then an array will ne created.
	 * @param keypath
	 * @param value
	 */
	unshift(keypath: string, value: any): ArrayPushPromise;
}

export type Component = Static | Promise<Static>;

export interface ComputationDescriptor<T extends Ractive<T> = Ractive> {
	/**
	 * Called when Ractive needs to get the computed value. Computations are lazy, so this is only called when a dependency asks for a value.
	 */
	get: ComputationFn<T>;

	/**
	 * Called when Ractive is asked to set a computed keypath.
	 */
	set?: (value: any) => void;
}
export type ComputationFn<T extends Ractive<T> = Ractive> = (this: T) => any;
export type Computation<T extends Ractive<T> = Ractive> = string | ComputationFn<T> | ComputationDescriptor<T>;

export type CssFn = (data: DataGetFn) => string;

export type Data = ValueMap
export type DataFn<T extends Ractive<T> = Ractive> = (this: T) => ValueMap;
export type DataGetFn = (keypath: string) => any;

export interface DecoratorHandle {
	/**
	 * Called when any downstream template from the element will be updated.
	 */
	invalidate?: () => void;

	/**
	 * Called when the decorator is being removed from its element.
	 */
	teardown: () => void;

	/**
	 * Called when any arguments passed to the decorator update. If no update function is supplied, then the decorator will be torn down and recreated when the decorator arguments update.j
	 */
	update?: (...args: any[]) => void;
}
export type Decorator<T extends Ractive<T> = Ractive> = (this: T, node: HTMLElement, ...args: any[]) => DecoratorHandle;

export type Easing = (time: number) => number;

export type EventPlugin<T extends Ractive<T> = Ractive> = (this: T, node: HTMLElement, fire: (event: Event) => void) => { teardown: () => void };

export interface FindOpts {
	/**
	 * Whether or not to include attached children when searching.j
	 */
	remote?: boolean;
}

export interface GetOpts {
	/**
	 * Whether or not to include links and computations in the output. This creates a deep copy of the data, so changing any of it directly will have no effect on the data in Ractive's models. Defaults to true for root data and false everywhere else.
	 */
	virtual?: boolean;

	/**
	 * Whether or not to unwrap the value if it happens to be wrapped, returning the original value. Defaults to true.
	 */
	unwrap?: boolean
}

export type Interpolator = <T>(from: T, to: T) => (t: number) => T;

export interface LinkOpts {
	/**
	 * The ractive instance in which to find the source keypath.
	 */
	ractive?: Ractive;

	/**
	 * The ractive instance in which to find the source keypath.
	 */
	instance?: Ractive;

	/**
	 * The keypath to use for the link when handling a shuffle. For instance foo.1.bar will not shuffle with foo, but .bar will.
	 */
	keypath?: string;
}

export type ListenerCallback<T extends Ractive<T> = Ractive> = (this: T, ctx: ContextHelper, ...args: any[]) => boolean | void | Promise<any>;
export interface ListenerDescriptor<T extends Ractive<T> = Ractive> {
	/**
	 * The callback to call when the event is fired.
	 */
	handler: ListenerCallback<T>;

	/**
	 * Whether or not to immediately cancel the listener after the first firing.
	 */
	once?: boolean;
}
export interface ListenerHandle {
	/**
	 * Removes the listener from the event.j
	 */
	cancel: () => void;
}

export interface ObserverHandle {
	/**
	 * Removes the listener or observer.j
	 */
	cancel(): void;

	/**
	 * Stops further firings of the callback. Any related observers will still stay up-to-date, so the old value will be updated as the data changes.
	 */
	silence(): void;

	/**
	 * @returns true if the callback is not going to be called
	 */
	isSilenced(): boolean;

	/**
	 * Resume calling the callback with changes or events.
	 */
	resume(): void;
}

export interface Macro extends MacroFn {
	/** Get the css data for this macro at the given keypath. */
	styleGet(keypath: string): any;
	/** Set the css data for this macro at the given keypath to the given value. */
	styleSet(keypath: string, value: any): Promise<void>;
	/** Set the given map of values in the css data for this macro. */
	styleSet(map: ValueMap): Promise<void>;
}

export type MacroFn = (MacroHelper) => MacroHandle;

export interface MacroHandle {
	render?: () => void;
	teardown?: () => void;
	update?: (attributes: ValueMap) => void;
	invalidate?: () => void;
}

export class MacroHelper extends ContextHelper {
	name: string;
	attributes: ValueMap;
	template: Template;
	partials: PartialMap;

	/**
	 * Create an alias for the local context of the partial (@local).
	 * @param name The name to use when creating the alias to @local
	 */
	aliasLocal(name: string): void;

	/**
	 * Create an alias to a keypath in the local context of the partial (@local)
	 * @param reference The keypath to be aliased e.g. foo.bar for @local.foo.bar
	 * @param name The name to use when created the alias
	 */
	aliasLocal(reference: string, name: string): void;

	/**
	 * Change the template used to render this macro. The old template will be unrenedered and replaced with the given template.
	 * @param template The new template
	 */
	setTemplate(template: Template): void;
}

export interface MacroOpts {
	cssId?: string;
	noCssTransform?: boolean;
	css?: string | CssFn;
	cssData?: ValueMap;
	template?: Template;
	partials?: PartialMap;
}

/**
 * @param value the new value
 * @param old the old value
 * @param keypath the keypath of the observed change
 * @param parts keys for any wildcards in the observer
 */
export type ObserverCallback<T extends Ractive<T> = Ractive> = (this: T, value: any, old: any, keypath: string, ...parts: string[]) => void | Promise<any>;
export type ObserverArrayCallback<T extends Ractive<T> = Ractive> = (this: T, changes: ArrayChanges) => void | Promise<any>;
export interface ArrayChanges {
	/**
	 * The starting index for the changes.
	 */
	start: number;

	/**
	 * A list of any added items.
	 */
	inserted: any[];

	/**
	 * A list of any removed items.
	 */
	deleted: any[];
}
export interface ObserverBaseOpts {
	/**
	 * The context to be used for the callback.
	 */
	context?: any;

	/**
	 * Whether or not to defer calling the callback until after the DOM has been updated.
	 */
	defer?: boolean;

	/**
	 * Whether or not to call the callback with the initial value.
	 */
	init?: boolean;
}
export interface ObserverOpts extends ObserverBaseOpts {
	/**
	 * Whether or not to follow any links when observing.
	 */
	links?: boolean;

	/**
	 * The function called to get an old value for the observer. This can be used to do things like freeze the initial value as the old value for all future callbacks.
	 */
	old?: ObserverCallback;

	/**
	 * Whether or not to use strict equality when checking to see if a value has changed. Defaults to false.
	 */
	strict?: boolean;
}
export interface ObserverArrayOpts extends ObserverBaseOpts {
	/**
	 * Create an array observer, which fires array changes objects rather than the usual callback when array modification methods are used.
	 */
	array: boolean;
}
export interface ObserverBaseDescriptor<T extends Ractive<T> = Ractive> extends ObserverOpts {
	/**
	 * The observer callback.
	 */
	handler: ObserverCallback<T>;

	/**
	 * Whether or not to use observeOnce when subscribing the observer. Defaults to false.
	 */
	once?: boolean;
}
export interface ObserverArrayDescriptor<T extends Ractive<T> = Ractive> extends ObserverArrayOpts {
	/**
	 * The observer callback.j
	 */
	handler: ObserverArrayCallback<T>;

	/**
	 * Whether or not to use observeOnce when subscribing the observer. Defaults to false.
	 */
	once?: boolean;
}
export type ObserverDescriptor<T extends Ractive<T> = Ractive> = ObserverBaseDescriptor<T> | ObserverArrayDescriptor<T>;

export type ParseDelimiters = [ string, string ];

export type ParseFn = (helper: ParseHelper) => string | Array<{} | string> | ParsedTemplate;

export interface ParseHelper {
	/**
	 * Retrieves a template string from a script tag with the given id.j
	 */
	fromId(id: string): string;

	/**
	 * @returns true if the given value is a parsed template
	 */
	isParsed(template: any): boolean;

	/**
	 * Parse the given template with Ractive.parse.
	 */
	parse(template: string, opts?: ParseOpts): ParsedTemplate;
}

export interface ParsedTemplate {
	/** The version of the template spec that produced this template. */
	v: number;

	/** The array of template nodes. */
	t: any[];

	/** If csp mode was used to parse, the map of expression string -> expression functions. */
	e?: { [key: string]: Function };

	/** If the template includes any partials, the map of partial name -> template nodes. */
	p?: { [key: string]: any[] };
}

export type Partial = string | any[] | ParseFn | Macro;

export interface PartialMap {
	[key: string]: Partial;
}

export type PluginExtend = (PluginArgsExtend) => void;
export type PluginInstance = (PluginArgsInstance) => void;

export interface PluginArgsBase {
	Ractive: typeof Ractive;
}
export interface PluginArgsInstance {
	proto: Ractive;
	instance: Ractive;
}
export interface PluginArgsExtend {
	proto: Static;
	instance: Static;
}

export type Plugin = (PluginArgsBase) => void;

export interface ReadLinkOpts {
	/** Whether or not to follow through any upstream links when resolving the source. */
	canonical?: boolean;
}
export interface ReadLinkResult {
	/** The Ractive instance that hosts the source keypath. */
	ractive: Ractive;

	/** The keypath of the source in the host instance. */
	keypath: string;
}

export interface SanitizeOpts {
	/** A list of element names to remove from the template. */
	elements: string[];

	/** Whether or not to remove DOM event listener attributes, like onclick, from the template. */
	eventAttributes?: boolean;
}

export interface SetOpts {
	/** Whether or not to merge the given value into the existing data or replace the existing data. Defaults to replacing the existing data (false). */
	deep?: boolean;

	/** Whether or not to keep the template sturctures removed by this set around for future reinstatement. This can be used to avoid throwing away and recreating components when hiding them. Defaults to false. */
	keep?: boolean;

	/** When applied to an array keypath, whether or not to move the existing elements and their associated template around or simply replace them. Defaults to replacement (false). */
	shuffle?: Shuffler;
}

export interface StyleSetOpts extends SetOpts {
	/** Whether or not to apply the new styles immediately. Defaults to updating the Ractive-managed style tag (true) */
	apply?: boolean;
}

export type Shuffler = boolean | string | ShuffleFn;
export type ShuffleFn = (left: any, right: any) => (1 | 0 | -1);

export type Target = string | HTMLElement | ArrayLike<any>;

export type Template = ParsedTemplate | string | any[] | ParseFn;

export interface TransitionHelper {
	/** true if this transition is an intro */
	isIntro: boolean;

	/** true if this transition is an outro */
	isOutro: boolean;

	/** The name of the transition e.g. foo in foo-in-out. */
	name: string;

	/** The node to which the transition is being applied. */
	node: HTMLElement;

	/**
	 * Animate the given property to the given value.
	 * @param prop the css property to animate
	 * @param value the value to which to animate the prop
	 * @param opts a map of options, including duration to use when animating
	 * @param complete an optional callback to call when the animation is complete
	 * @returns a Promise that resolves when the animation is complete
	 */
	animateStyle(prop: string, value: any, opts: TransitionOpts & {}, complete?: () => void): Promise<void>;

	/**
	 * Animate the given map of properties.
	 * @param map a map of prop -> value to animate
	 * @param opts a map of options, including duration to use when animating
	 * @param complete an optional callback to call when the animation is complete
	 * @returns a Promise that resolves when the animation is complete
	 */
	animateStyle(map: ValueMap, opts: TransitionOpts & {}, complete?: () => void): Promise<void>;

	/**
	 * The function to call when the transition is complete. This is used to control the Promises returned by mutation methods.j
	 * @param noReset whether or not to skip resetting the styles back to their starting points - defaults to false
	 */
	complete(noReset?: boolean): void;

	/**
	 * Use getComputedStyle to retrieve the current value of the given prop.
	 */
	getStyle(prop: string): any;

	/**
	 * Use getComputedStyle to retrieve the current values of multiple props.
	 */
	getStyle(props: string[]): ValueMap;

	/**
	 * Merge the given params into a map, adding any defaults to the resulting object.
	 * @param params
	 * 	if a number, the duration in milliseconds
	 *  if slow, 600ms
	 *  if fast, 200ms
	 *  if any other string, 400ms
	 *  if a map, it is applied over defaultsj
	 */
	processParams(params: number | 'slow' | 'fast' | string | ValueMap, defaults?: ValueMap): ValueMap;

	/**
	 * Set an inline style for the given prop at the given value.
	 */
	setStyle(prop: string, value: any): void;

	/** Set inline styles for the given map of prop -> value. */
	setStyle(map: ValueMap): void;
}
export type Transition = (helper: TransitionHelper, ...args: any[]) => (void | Promise<void>);
export interface TransitionOpts {
	/** The duration for the transition in milliseconds, slow for 600ms, fast for 200ms, and any other string for 400ms. */
	duration?: number | 'slow' | 'fast' | string;

	/** The easing to use for the transition. */
	easing?: string;

	/** The delay in milliseconds to wait before triggering the transition. */
	delay?: number;
}

export interface UpdateOpts {
	/** Whether or not to force Ractive to consider a value to be changed. */
	force?: boolean;
}

export interface Registry<T> { [key: string]: T }

export interface BaseParseOpts {
	/** The number of lines of template above and below a line with an error to include in the error message. */
	contextLines?: number;

	/** Whether or not to produce a map of expression string -> function when parsing the template. */
	csp?: boolean;

	/** The regular mustach delimiters - defaults to {{ }}. */
	delimiters?: ParseDelimiters;

	/** Whether or not to collapse consective whitespace into a single space. */
	preserveWhitespace?: boolean;

	/** Whether or not to remove certain elements and event attributes from the parsed template. */
	sanitize?: boolean | SanitizeOpts;

	/** The static mustache delimiters - defaults to [[ ]]. */
	staticDelimiters?: ParseDelimiters;

	/** The static triple mustache delimiters - defaults to [[[ ]]]. */
	staticTripleDelimiters?: ParseDelimiters;

	/** Whether or not to remove HTML comments from the template. Defaults to true. */
	stripComments?: boolean;

	/** The triple mustache delimiters - defaults to {{{ }}}. */
	tripleDelimiters?: ParseDelimiters;
}

export interface ParseOpts extends BaseParseOpts {
	/** If true, the parser will operate as if in a tag e.g. foo="bar" is parsed as an attribute rather than a string. */
	attributes?: boolean;

	/** If true, will parse elements as plain text, which allows the resulting template to be used to produce templates that are also later parsed. */
	textOnlyMode?: boolean;
}

export interface BaseInitOpts<T extends Ractive<T> = Ractive> extends BaseParseOpts {
	/** Adaptors to be applied. */
	adapt?: (Adaptor | string)[];

	/** A map of adaptors. */
	adaptors?: Registry<Adaptor>;

	/** If set to false, disallow expressions in the template. */
	allowExpressions?: boolean;

	/** If true, this instance can occupy the target element with other existing instances rather than cause them to unrender. */
	append?: boolean;

	/* A map of components */
	components?: Registry<Component>;

	/** A map of computations */
	computed?: { [key: string]: Computation<T> };

	/** A map of decorators */
	decorators?: Registry<Decorator<T>>;

	/** Whether or not to use event delegation around suitabe iterative sections. Defaults to true. */
	delegate?: boolean;

	/** A map of easings */
	easing?: Registry<Easing>;

	/** A map of custom events */
	events?: Registry<EventPlugin<T>>;

	/** A map of interpolators for use with animate */
	interpolators?: Registry<Interpolator>;

	/** Whether or not twoway bindings default to lazy. */
	lazy?: boolean;

	/** Whether or not an element can transition if one of its parent elements is also transitioning. */
	nestedTransitions?: boolean;

	/** Whether or not to skip element intro transitions when the instance is being renered initially. */
	noIntro?: boolean;

	/** Whether or not to skip outro transitions when the instance is being unrendered. */
	noOutro?: boolean;

	/** A map of observers */
	observe?: Registry<ObserverCallback<T> | ObserverDescriptor<T>>;

	/** A map of event listeners */
	on?: Registry<ListenerCallback<T> | ListenerDescriptor<T>>;

	/** A map of partials */
	partials?: Registry<Partial>;

	/** Whether or not to consider instance memners like set when resolving values in the template. */
	resolveInstanceMembers?: boolean;

	/** Whether or not to invalidate computation dependencies when a computed value or one of its children is set. */
	syncComputedChildren?: boolean;

	/** The template to use when rendering. */
	template?: Template;

	/** A map of transitions */
	transitions?: Registry<Transition>;

	/** Whether or not to use transitions as elements are added and removed from the DOM. */
	transitionsEnabled?: boolean;

	/** Whether or not to use twoway bindings by default. */
	twoway?: boolean;

	/** Whether or not to issue a warning when an ambiguous reference fails to resolve to the immediate context. */
	warnAboutAmbiguity?: boolean;
}

export interface ExtendOpts<T extends Ractive<T> = Ractive> extends BaseInitOpts<T> {
	/** A list of attributes to be reserved by a component. Any additional attributes are collected into the extra-attributes partial. */
	attributes?: string[] | { optional?: string[], required?: string[] };

	/** The css to add to the page when the first instance of this component is rendered. */
	css?: string | CssFn;

	/** Default data to be supplied to any css functions. */
	cssData?: ValueMap;

	/** The id to use when transforming css to be scoped. Defaults to a random guid. */
	cssId?: string;

	/** A function supplying the default data for instances of this component. */
	data?: DataFn<T>;

	/** Whether or not data and plugins can be pulled from parent instances. Defaults to false. */
	isolated?: boolean;

	/** If true, css selectors will not be scoped using the cssId of this component. */
	noCssTransform?: boolean;

	/** An array of plugins to apply to the component. */
	use?: PluginExtend[];
}

export interface InitOpts<T extends Ractive<T> = Ractive> extends BaseInitOpts<T> {
	/** Initiial data for this instance. */
	data?: Data | DataFn<T>;

	/** The target element into which to render this instance. */
	el?: Target;

	/** The target element into which to render this instance. */
	target?: Target;

	/** An array of plugins to apply to the instance. */
	use?: PluginInstance[];

	/** If true, this instance can occupy the target element with other existing instances rather than cause them to unrender. Cannot be used with enhance. */
	append?: true;

	/** If true, this instance will try to reuse DOM nodes found in its target rather than discarding and replacing them. Cannot be used with append. */
	enhance?: true;
}

export interface Registries<T extends Ractive<T>> {
	adaptors: Registry<Adaptor>;
	components: Registry<Component>;
	decorators: Registry<Decorator<T>>;
	easings: Registry<Easing>;
	events: Registry<Event>;
	interpolators: Registry<Interpolator>;
	partials: Registry<Partial>;
}

export interface Constructor<T extends Ractive<T>, U extends InitOpts<T> = InitOpts<T>> {
	new(opts?: U): T;
}

export interface Static<T extends Ractive<T> = Ractive> {
	new<V extends InitOpts<T> = InitOpts<T>>(opts?: V): T;

	/** The registries that are inherited by all instance. */
	defaults: Registries<T>;

	adaptors: Registry<Adaptor>;
	components: Registry<Component>;
	css: string|CssFn;
	decorators: Registry<Decorator<T>>;
	easings: Registry<Easing>;
	events: Registry<EventPlugin<T>>;
	interpolators: Registry<Interpolator>;
	partials: Registry<Partial>;

	/** Create a new component with this constructor as a starting point. */
	extend<U, V extends ExtendOpts<T> = ExtendOpts<T>>(opts?: V): Static<Ractive<T & U>>;

	/** Create a new component with this constuuctor as a starting point using the given constructor. */
	extendWith<U extends Ractive<U>, V extends InitOpts<U> = InitOpts<U>, W extends ExtendOpts<U> = ExtendOpts<U>>(c: Constructor<U, V>, opts?: W): void;

	/** Get a Context for the given node or selector. */
	getContext(nodeOrQuery: HTMLElement | string): ContextHelper;

	/** @returns true if the given object is an instance of this constructor */
	isInstance(obj: any): boolean;

	/** Get the value at the given keypath from the Ractive shared store. */
	sharedGet(keypath: string, opts?: GetOpts): any;
	/** Set the given keypath in the Ractive shared store to the given value. */
	sharedSet(keypath: string, value: any, opts?: SetOpts): Promise<void>;
	/** Set the given map of values in the Ractive shared store. */
	sharedSet(map: ValueMap, opts?: SetOpts): Promise<void>;

	/** Get the css data for this constructor at the given keypath. */
	styleGet(keypath: string, opts?: GetOpts): any;
	/** Set the css data for this constructor at the given keypath to the given value. */
	styleSet(keypath: string, value: any, opts?: StyleSetOpts): Promise<void>;
	/** Set the given map of values in the css data for this constructor. */
	styleSet(map: ValueMap, opts?: StyleSetOpts): Promise<void>;

	/** Install one or more plugins on the component.  */
	use(...plugins: PluginExtend[]): Static;

	/** The Ractive constructor used to create this constructor. */
	Ractive: typeof Ractive;
	/** The parent constructor used to create this constructor. */
	Parent: Static;
}

export interface Children extends Array<Ractive> {
	/** Lists of instances targetting anchors by name. */
	byName: { [key: string]: Ractive[] }
}
export class Ractive<T extends Ractive<T> = Ractive<any>> {
	constructor(opts?: InitOpts<T>);

	/** If this instance is in a yielded template, the instance that is immediately above it. */
	container?: Ractive;
	/** If this instance is a component, the instance that controls it. */
	parent?: Ractive;
	/** If this instance is a component, the instance at the root of the template. */
	root: Ractive;
	/** A list of children attached to this instance. */
	children: Children;

	/**
	 * Whether or not this instance is currently rendered into the DOM.
	 */
	rendered: boolean;

	adaptors: Registry<Adaptor>;
	components: Registry<Component>;
	decorators: Registry<Decorator<T>>;
	easings: Registry<Easing>;
	events: Registry<EventPlugin<T>>;
	interpolators: Registry<Interpolator>;
	partials: Registry<Partial>;

	/** When overriding methods, the original method is available using this._super. */
	_super(...args: any[]): any;

	/** Add to the number at the given keypath
	 * @param keypath a keypath to a number
	 * @param amount the amount to add to the target number - defaults to 1
	 */
	add(keypath: string, amount?: number): Promise<void>;

	/**
	 * Animate the value at the given keypath from its current value to the given value.
	 * @param keypath a keypath to the value
	 * @param value the target value
	 * @param opts
	 */
	animate(keypath: string, value: any, opts?: AnimateOpts): AnimatePromise;

	/**
	 * Attach a child instance (component or not) to this instance. Use anchors (<#anchor/>) like component tags along with the target option to achieve unmanaged components. If an anchor is not used, the child will be responsible for rendering itself, but it will get a parent instance.
	 * @param child the instance to attach to this instance
	 * @param opts
	 */
	attachChild(child: Ractive, opts?: AttachOpts): Promise<void>;

	/**
	 * Detach this instance from the DOM.
	 */
	detach(): DocumentFragment;

	/**
	 * Detach a child instance that was previously attached with attachChild from this instance.
	 * @param child the instance to detach
	 */
	detachChild(child: Ractive): Promise<void>;

	/**
	 * Find an element in the DOM controlled by this instance.
	 * @param selector query used to find the first matching element
	 * @param opts
	 */
	find(selector: string, opts?: FindOpts): HTMLElement;

	/**
	 * Find all of the elements in the DOM controlled by this instance that match the given selector.
	 * @param selector query used to match elements
	 * @param opts
	 */
	findAll(selector: string, opts?: FindOpts): HTMLElement[];

	/**
	 * Find all of the components belonging to this instance.
	 * @param opts
	 */
	findAllComponents(opts?: FindOpts): Ractive[];

	/**
	 * Find all of the components with the given name belonging to this instance.
	 * @param name
	 * @param opts
	 */
	findAllComponents(name: string, opts?: FindOpts): Ractive[];

	/**
	 * Find the first component belonging to this instance.
	 * @param opts
	 */
	findComponent(opts?: FindOpts): Ractive;

	/**
	 * Find the first component with the given name belonging to this instance.
	 * @param name
	 * @param opts
	 */
	findComponent(name: string, opts?: FindOpts): Ractive;

	/**
	 * Find the immediate ancestor instance with the given name.
	 * @param name
	 */
	findContainer(name: string): Ractive;

	/**
	 * Find the owning ancestor instance with the given name. For yielded instances, this will be the instance that yielded the template containing the component.
	 * @param name
	 */
	findParent(name: string): Ractive;

	/**
	 * Fire a Ractive instance event.
	 * @param name the name of the event
	 * @param ctx an optional context or object to be merged with a context
	 * @param args additional args to pass to the event listeners
	 */
	fire(name: string, ctx: ContextHelper | {}, ...args: any[]): boolean;

	/**
	 * Retrieve the root object of this instance's data.
	 * @param opts
	 */
	get(opts?: GetOpts): any

	/**
	 * Retrieve the value at the given keypath in this instance's data.
	 * @param keypath a keypath to the value
	 * @param opts
	 */
	get(keypath: string, opts?: GetOpts): any;

	/**
	 * Get a Context object for the given node or node that matches the given query.
	 * @param query
	 */
	getContext(nodeOrQuery: HTMLElement | string): ContextHelper;

	/**
	 * Render this instance into the given target, optionally using the given anchor. If the instance is already attached to the DOM, it will first be detached.
	 * @param target
	 * @param anchor
	 */
	insert(target: Target, anchor: Target): void;

	/**
	 * Create a link to the given source keypath at the given target keypath, similar to a symlink in filesystems. This allows safely referencing the same data at two places in the same instance or across instances if given a target instance. Cross-instance links are also known as mappings.
	 * @param source the keypath to the source of the link
	 * @param dest the keypath for the destination
	 * @param opts
	 */
	link(source: string, dest: string, opts?: LinkOpts): Promise<void>;

	/**
	 * Create an observer at the given keypath that will be called when the value at that keypath mutates.
	 * @param keypath the keypath(s) to observe - multiple keypaths can be separated by a space
	 * @param callback
	 * @param opts
	 */
	observe(keypath: string, callback: ObserverCallback<T>, opts?: ObserverOpts): ObserverHandle;

	/**
	 * Create an observer at the given keypath that will be called when the value at that keypath mutates.
	 * @param keypath the keypath(s) to observe - multiple keypaths can be separated by a space
	 * @param callback
	 * @param opts
	 */
	observe(keypath: string, callback: ObserverArrayCallback<T>, opts?: ObserverArrayOpts): ObserverHandle;

	/**
	 * Create a set of observers from the given map.
	 * @param map keypath -> callback pairs to observe
	 * @returns an observer handle that controls all of the created observers
	 */
	observe(map: { [key: string]: ObserverCallback<T> }, opts?: ObserverOpts): ObserverHandle;

	/**
	 * Create a set of observers from the given map.
	 * @param map keypath -> callback pairs to observe
	 * @returns an observer handle that controls all of the created observers
	 */
	observe(map: { [key: string]: ObserverArrayCallback<T> }, opts?: ObserverArrayOpts): ObserverHandle;

	/**
	 * Create an observer at the given keypath that will be called the first time the value at that keypath mutates. After that call, the observer will be automatically cancelled.
	 * @param keypath the keypath(s) to observer - multiple keypaths can be separated by a space
	 * @param callback
	 * @param opts
	 */
	observeOnce(keypath: string, callback: ObserverCallback<T>, opts?: ObserverOpts): ObserverHandle;

	/**
	 * Create an observer at the given keypath that will be called the first time the value at that keypath mutates. After that call, the observer will be automatically cancelled.
	 * @param keypath the keypath(s) to observer - multiple keypaths can be separated by a space
	 * @param callback
	 * @param opts
	 */
	observeOnce(keypath: string, callback: ObserverArrayCallback<T>, opts?: ObserverArrayOpts): ObserverHandle;

	/**
	 * Create a set of observers from the given map. After the first observed value from any of the set mutates, all of the observers will be cancelled.
	 * @param map keypath -> callback pairs to observe
	 * @returns an observer handle that controls all of the created observersj
	 */
	observeOnce(map: { [key: string]: ObserverCallback<T> }, opts?: ObserverOpts): ObserverHandle;

	/**
	 * Create a set of observers from the given map. After the first observed value from any of the set mutates, all of the observers will be cancelled.
	 * @param map keypath -> callback pairs to observe
	 * @returns an observer handle that controls all of the created observersj
	 */
	observeOnce(map: { [key: string]: ObserverArrayCallback<T> }, opts?: ObserverArrayOpts): ObserverHandle;

	/**
	 * Stop listening to instance events. If no name is supplied, all events will have their listeners removed. If no handler is supplied, all listeners for the given event will be removed.
	 * @param event
	 * @param handler
	 */
	off(event?: string, handler?: ListenerCallback<T>): Ractive;

	/**
	 * Listen for an optionally namespaced instance event.
	 * @param event
	 * @param handler
	 * @returns an object that can be used to control the attached listeners
	 */
	on(event: string, handler: ListenerCallback<T>): ObserverHandle;

	/**
	 * Listen for a group of optionally namespaced instance events using the given map.
	 * @param map event name -> callback pairs to listen
	 */
	on(map: { [key: string]: ListenerCallback<T> }): ObserverHandle;

	/**
	 * Listen for an optionally namespaced instance event. After the listener has been triggered once, the listener will be automatically unsubscribed.
	 * @param event
	 * @param handler
	 */
	once(event: string, handler: ListenerCallback<T>): ObserverHandle;

	/**
	 * Listen for a group of optionally namespaced instance events using the given map. After a listener has been triggered once, all of the listeners will be automatically unsubscribed.
	 * @param map event name -> callback pairs to listen
	 */
	once(map: { [key: string]: ListenerCallback<T> }): ObserverHandle;

	/**
	 * Pop a value off the array at the given keypath.
	 * @param keypath keypath to the target array
	 */
	pop(keypath: string): ArrayPopPromise;

	/**
	 * Push a value onto the array at the given Context-relative keypath. If there is no value (undefined) at the given keypath, an array will be created for it.
	 * @param keypath keypath to the target array
	 * @param values
	 */
	push(keypath: string, ...values: any[]): ArrayPushPromise;

	/**
	 * Get the source keypath for the given keypath if it is a link.
	 * @param keypath
	 * @param opts
	 */
	readLink(keypath: string, opts?: ReadLinkOpts): ReadLinkResult;

	/** Render this instance into the given target. This is useful if the instance was not created with a target. */
	render(target: Target): Promise<void>;

	/**
	 * Replace this instance's data with the given data.
	 * @param data defaults to {}
	 */
	reset(data?: Data): Promise<void>;

	/**
	 * Replace the instance partial with the given name with a new partial template. Any instances of the partial rendered in the template will be re-rendered with the new template.
	 * @param name
	 * @param partial
	 */
	resetPartial(name: string, partial: Partial): Promise<void>;

	/**
	 * Re-render this instance with the given template replacing the current template.
	 * @param template
	 */
	resetTemplate(template: Template): Promise<void>;

	/**
	 * Reverse the array at the given keypath.
	 * @param keypath keypath to the targret array
	 */
	reverse(keypath: string): ArraySplicePromise;

	/**
	 * Set a value at the given keypath. If any intermediate levels do not exist in the data, they will be created as appriate - objects for string keys and arrays for numeric keys.
	 * @param keypath
	 * @param value the value to set
	 * @param opts
	 */
	set(keypath: string, value: any, opts?: SetOpts): Promise<void>;

	/**
	 * Set a set of values from the given map. All of the values will be set before any DOM changes are propagated, but the values will still be set in object order in the data, which can cause multiple invalidations on observers, bindings, and template nodes.j
	 * @param map keypath -> value pairs to be set
	 */
	set(map: ValueMap, opts?: SetOpts): Promise<void>;

	/**
	 * Shift a value off of the array at the given keypath.
	 * @param keypath
	 */
	shift(keypath: string): ArrayPopPromise;

	/**
	 * Sort the array at the given keypath.
	 * @param keypath
	 */
	sort(keypath: string): ArraySplicePromise;

	/**
	 * Splice the array at the given keypath.
	 * @param keypath
	 * @param index index at which to start splicing
	 * @param drop number of items to drop starting at the given index
	 * @param add items to add at the given index
	 */
	splice(keypath: string, index: number, drop: number, ...add: any[]): ArraySplicePromise;

	/**
	 * Subtract an amount from the number at the given keypath.
	 * @param keypath
	 * @param amount the amount to subtrat from the value - defaults to 1
	 */
	subtract(keypath: string, amount?: number): Promise<void>;

	/**
	 * Dispose of this instance, including unrendering the template and dismantling the data. Once this is done, the instance cannot be used again.
	 */
	teardown(): Promise<void>;

	/**
	 * Return any CSS belonging to this instance and any components it has rendered. This only works for instances of components create with extend or extendWith.
	 */
	toCSS(): string;

	/**
	 * Return the HTML for this instance as a string.
	 */
	toHTML(): string;

	/**
	 * Toggle the value at the given keypath. If it is truthy, set it to false, otherwise, set it to true.
	 * @param keypath
	 */
	toggle(keypath: string): Promise<void>;

	/**
	 * Trigger a transition on the element associated with the current event. This only works from event handlers.
	 * @param transition the transition to trigger
	 * @param opts
	 */
	transition(transition: string | Transition, opts?: TransitionOpts & {}): Promise<void>;

	/**
	 * Trigger a transition on the given element.
	 * @param transition thi transition to trigger
	 * @param node the element to transition
	 * @param opts
	 */
	transition(transition: string | Transition, node: HTMLElement, opts?: TransitionOpts & {}): Promise<void>;

	/**
	 * Remove the link at the given keypath.
	 * @param keypath
	 */
	unlink(keypath: string): Promise<void>;

	/**
	 * Unrender the current instance from the DOM.
	 */
	unrender(): Promise<void>;

	/**
	 * Invalidate the root model of this instance. This will cause Ractive to check for any changes that may have happened directly to the data without going through a set or array method.
	 * @param opts
	 */
	update(opts?: UpdateOpts): Promise<void>;

	/**
	 * Invalidate the model at the given keypath. This will cause Ractive to check for any changes that may have happened directly to the data without going through a set or array method.
	 * @param keypath
	 * @param opts
	 */
	update(keypath: string, opts?: UpdateOpts): Promise<void>;

	/**
	 * Cause any bindings associated with the root model of this instance to apply the value in the view to the model. Use this to pull changes made directly to view elements into the data.
	 * @param cascade whether or not to cause downstream models to also update
	 */
	updateModel(cascade?: boolean): Promise<void>;

	/**
	 * Cause any bindings associated with the given keypath to apply the value in the view to the model. Use this to pull changes made directly to view elements into the data.
	 * @param keypath
	 * @param cascade whether or not to cause downstream models to also update
	 */
	updateModel(keypath: string, cascade?: boolean): Promise<void>;

	/**
	 * Unshift the given value onto the array at the given keypath. If there is nothing at the given keypath (undefined), then an array will ne created.
	 * @param keypath
	 * @param value
	 */
	unshift(keypath: string, value: any): ArrayPushPromise;

	/** Install one or more plugins on the instance.  */
	use(...plugins: PluginInstance[]): Ractive;

	/** The registries that are inherited by all instance. */
	static defaults: Registries<Ractive>;

	static adaptors: Registry<Adaptor>;
	static components: Registry<Component>;
	static decorators: Registry<Decorator>;
	static easings: Registry<Easing>;
	static events: Registry<EventPlugin>;
	static interpolators: Registry<Interpolator>;
	static partials: Registry<Partial>;

	/** Create a new component with this constructor as a starting point. */
	static extend<U>(opts?: ExtendOpts<Ractive & U>): Static<Ractive<Ractive & U>>;

	/** Create a new component with this constuuctor as a starting point using the given constructor. */
	static extendWith<U extends Ractive<U>, V extends InitOpts<U> = InitOpts<U>, W extends ExtendOpts<U> = ExtendOpts<U>>(c: Constructor<U, V>, opts?: W): void;

	/** Get a Context for the given node or selector. */
	static getContext(nodeOrQuery: HTMLElement | string): ContextHelper;

	/** @returns true if the given object is an instance of this constructor */
	static isInstance(obj: any): boolean;

	/** Get the value at the given keypath from the Ractive shared store. */
	static sharedGet(keypath: string): any;
	/** Set the given keypath in the Ractive shared store to the given value. */
	static sharedSet(keypath: string, value: any): Promise<void>;
	/** Set the given map of values in the Ractive shared store. */
	static sharedSet(map: ValueMap): Promise<void>;

	/** Get the css data for this constructor at the given keypath. */
	static styleGet(keypath: string): any;
	/** Set the css data for this constructor at the given keypath to the given value. */
	static styleSet(keypath: string, value: any): Promise<void>;
	/** Set the given map of values in the css data for this constructor. */
	static styleSet(map: ValueMap): Promise<void>;

	static use(...args: PluginExtend[]): Static;

	/** The Ractive constructor used to create this constructor. */
	static Ractive: typeof Ractive;
	/** The parent constructor used to create this constructor. */
	static Parent: Static;
}

export module Ractive {
	/** The prototype for Context objects. You can use this to add methods and properties to Contexts. */
	const Context: typeof ContextHelper;

	/** When true, causes Ractive to emit warnings. Defaults to true. */
	let DEBUG: boolean;
	let DEBUG_PROMISES: boolean;

	/** true if Ractive detects that this environment supports svg. */
	const svg: boolean;

	const VERSION: string;

	/**
	 * Add Ractive-managed CSS to the managed style tag. This effectively global CSS managed by the Ractive constructor,
	 * as opposed scoped CSS installed on a component constructor.
	 */
	function addCSS(id: string, css: string | CssFn): void;

	/** Escape the given key, so that it can be safely used in a keypath e.g. 'foo.bar' becomes 'foo\.bar' */
	function escapeKey(key: string): string;

	/** Retrieve the CSS string for all loaded components. */
	function getCSS(): string;

	/** Check to see if CSS with the given id has already been added */
	function hasCSS(id: string): boolean;

	/** Safely join the given keys into a keypath. */
	function joinKeys(...keys: string[]): string;

	/**
	 * Initialize a macro function.
	 * @param macro
	 * @param options
	 */
	function macro(macro: MacroFn, options: MacroOpts): Macro;

	/**
	 * Parse the given template string into a template.j
	 */
	function parse(template: string, opts?: ParseOpts): ParsedTemplate;

	/** Split the given keypath into its constituent keys. */
	function splitKeypath(keypath: string): string[];

	/** Unescape the given key e.g. 'foo\.bar' becomes 'foo.bar'.k */
	function unescapeKey(key: string): string;
}

export default Ractive;
