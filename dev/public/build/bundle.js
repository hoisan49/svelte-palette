
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }

    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }

    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;

      var _s, _e;

      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    var o$1=function(o){return o.reduce((function(o,n){var t=_slicedToArray(n,3),a=t[0],c=t[1],i=t[2];return a&&c?[].concat(_toConsumableArray(o),[c]):!a&&i?[].concat(_toConsumableArray(o),[i]):o}),[]).join(" ")};

    const ADD = 'add';
    const CLICK = 'click';
    const ERROR = 'error';
    const SELECT = 'select';

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function elasticOut(t) {
        return (Math.sin((-13.0 * (t + 1.0) * Math.PI) / 2) * Math.pow(2.0, -10.0 * t) + 1.0);
    }

    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* ..\src\components\PaletteSlot.svelte generated by Svelte v3.44.0 */
    const file$4 = "..\\src\\components\\PaletteSlot.svelte";

    function create_fragment$4(ctx) {
    	let button;
    	let button_aria_label_value;
    	let button_style_value;
    	let button_class_value;
    	let button_intro;
    	let mounted;
    	let dispose;

    	let button_levels = [
    		{ "data-testid": "__palette-slot-root__" },
    		/*$$restProps*/ ctx[5],
    		{
    			"aria-label": button_aria_label_value = /*color*/ ctx[0] || /*emptyAriaLabel*/ ctx[3]
    		},
    		{
    			style: button_style_value = "--color:" + /*color*/ ctx[0] + "; --outerBorderColor:" + (/*color*/ ctx[0] || '#aaa') + ";"
    		},
    		{
    			class: button_class_value = o$1([
    				[!/*color*/ ctx[0], 'empty'],
    				[/*selected*/ ctx[1], 'selected'],
    				[!/*disabled*/ ctx[2], 'clickable']
    			])
    		},
    		{ disabled: /*disabled*/ ctx[2] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			set_attributes(button, button_data);
    			toggle_class(button, "svelte-bk5582", true);
    			add_location(button, file$4, 22, 0, 541);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (button.autofocus) button.focus();

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*_onClick*/ ctx[4]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				{ "data-testid": "__palette-slot-root__" },
    				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5],
    				dirty & /*color, emptyAriaLabel*/ 9 && button_aria_label_value !== (button_aria_label_value = /*color*/ ctx[0] || /*emptyAriaLabel*/ ctx[3]) && { "aria-label": button_aria_label_value },
    				dirty & /*color*/ 1 && button_style_value !== (button_style_value = "--color:" + /*color*/ ctx[0] + "; --outerBorderColor:" + (/*color*/ ctx[0] || '#aaa') + ";") && { style: button_style_value },
    				dirty & /*color, selected, disabled*/ 7 && button_class_value !== (button_class_value = o$1([
    					[!/*color*/ ctx[0], 'empty'],
    					[/*selected*/ ctx[1], 'selected'],
    					[!/*disabled*/ ctx[2], 'clickable']
    				])) && { class: button_class_value },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] }
    			]));

    			toggle_class(button, "svelte-bk5582", true);
    		},
    		i: function intro(local) {
    			if (!button_intro) {
    				add_render_callback(() => {
    					button_intro = create_in_transition(button, scale, { duration: 500, easing: elasticOut });
    					button_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const omit_props_names = ["color","selected","disabled","emptyAriaLabel"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PaletteSlot', slots, []);
    	let { color = null } = $$props;
    	let { selected = false } = $$props;
    	let { disabled = false } = $$props;
    	let { emptyAriaLabel = 'No color' } = $$props;
    	const dispatch = createEventDispatcher();
    	const _onClick = () => !disabled && dispatch(CLICK, { color });

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('color' in $$new_props) $$invalidate(0, color = $$new_props.color);
    		if ('selected' in $$new_props) $$invalidate(1, selected = $$new_props.selected);
    		if ('disabled' in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ('emptyAriaLabel' in $$new_props) $$invalidate(3, emptyAriaLabel = $$new_props.emptyAriaLabel);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		scale,
    		elasticOut,
    		resolveClassName: o$1,
    		CLICK,
    		color,
    		selected,
    		disabled,
    		emptyAriaLabel,
    		dispatch,
    		_onClick
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('color' in $$props) $$invalidate(0, color = $$new_props.color);
    		if ('selected' in $$props) $$invalidate(1, selected = $$new_props.selected);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ('emptyAriaLabel' in $$props) $$invalidate(3, emptyAriaLabel = $$new_props.emptyAriaLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, selected, disabled, emptyAriaLabel, _onClick, $$restProps];
    }

    class PaletteSlot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			color: 0,
    			selected: 1,
    			disabled: 2,
    			emptyAriaLabel: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaletteSlot",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get color() {
    		throw new Error("<PaletteSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<PaletteSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<PaletteSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<PaletteSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<PaletteSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<PaletteSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get emptyAriaLabel() {
    		throw new Error("<PaletteSlot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set emptyAriaLabel(value) {
    		throw new Error("<PaletteSlot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ..\src\components\PaletteEyeDropper.svelte generated by Svelte v3.44.0 */
    const file$3 = "..\\src\\components\\PaletteEyeDropper.svelte";

    // (25:0) {#if !!window.EyeDropper}
    function create_if_block$2(ctx) {
    	let button;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M 16 2.908 C 15.991 2.106 15.656 1.343 15.072 0.794 C 13.917 -0.299 12.048 -0.258 10.904 0.886 L 9.096 2.694 C 8.315 1.982 7.113 2.009 6.365 2.756 L 5.786 3.335 C 5.272 3.85 5.272 4.683 5.786 5.199 L 5.956 5.368 L 1.809 9.515 C 1.039 10.288 0.7 11.39 0.902 12.461 L 0.096 14.307 C -0.092 14.734 0.002 15.232 0.333 15.561 C 0.579 15.808 0.913 15.948 1.262 15.948 C 1.445 15.948 1.625 15.91 1.792 15.837 L 3.522 15.081 C 4.594 15.283 5.696 14.944 6.469 14.174 L 10.615 10.028 L 10.785 10.197 C 11.3 10.711 12.134 10.711 12.649 10.197 L 13.228 9.618 C 13.974 8.87 14.001 7.668 13.29 6.887 L 15.131 5.045 C 15.7 4.481 16.013 3.709 16 2.908 Z M 5.537 13.242 C 5.036 13.741 4.309 13.936 3.626 13.754 C 3.482 13.716 3.329 13.728 3.193 13.787 L 1.424 14.559 L 2.196 12.791 C 2.256 12.654 2.268 12.501 2.229 12.357 C 2.048 11.674 2.243 10.947 2.741 10.447 L 6.888 6.3 L 9.683 9.096 L 5.537 13.242 Z");
    			attr_dev(path, "class", "svelte-8o16rt");
    			add_location(path, file$3, 27, 3, 703);
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			attr_dev(svg, "width", "16px");
    			attr_dev(svg, "height", "16px");
    			attr_dev(svg, "class", "svelte-8o16rt");
    			add_location(svg, file$3, 26, 2, 646);
    			attr_dev(button, "data-testid", "__palette-eyedropper-root__");
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "aria-label", /*buttonAriaLabel*/ ctx[0]);
    			attr_dev(button, "class", "svelte-8o16rt");
    			add_location(button, file$3, 25, 1, 514);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*_onClick*/ ctx[1]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*buttonAriaLabel*/ 1) {
    				attr_dev(button, "aria-label", /*buttonAriaLabel*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(25:0) {#if !!window.EyeDropper}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = !!window.EyeDropper && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!!window.EyeDropper) if_block.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PaletteEyeDropper', slots, []);
    	let { buttonAriaLabel = 'Submit this hex color value' } = $$props;
    	const dispatch = createEventDispatcher();

    	const _onClick = async () => {
    		try {
    			const eyeDropper = new EyeDropper();
    			const { sRGBHex: color } = await eyeDropper.open();
    			dispatch(ADD, { color });
    		} catch(error) {
    			dispatch(ERROR, { error });
    		}
    	};

    	const writable_props = ['buttonAriaLabel'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PaletteEyeDropper> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('buttonAriaLabel' in $$props) $$invalidate(0, buttonAriaLabel = $$props.buttonAriaLabel);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ADD,
    		ERROR,
    		buttonAriaLabel,
    		dispatch,
    		_onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('buttonAriaLabel' in $$props) $$invalidate(0, buttonAriaLabel = $$props.buttonAriaLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [buttonAriaLabel, _onClick];
    }

    class PaletteEyeDropper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { buttonAriaLabel: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaletteEyeDropper",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get buttonAriaLabel() {
    		throw new Error("<PaletteEyeDropper>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonAriaLabel(value) {
    		throw new Error("<PaletteEyeDropper>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ..\src\components\PaletteInput.svelte generated by Svelte v3.44.0 */
    const file$2 = "..\\src\\components\\PaletteInput.svelte";

    // (41:4) {#if inputType !== 'color'}
    function create_if_block_1$1(ctx) {
    	let paletteslot;
    	let updating_color;
    	let current;

    	function paletteslot_color_binding(value) {
    		/*paletteslot_color_binding*/ ctx[10](value);
    	}

    	let paletteslot_props = {
    		"data-testid": "__palette-input-slot__",
    		role: "presentation",
    		tabindex: "-1",
    		disabled: true
    	};

    	if (/*color*/ ctx[0] !== void 0) {
    		paletteslot_props.color = /*color*/ ctx[0];
    	}

    	paletteslot = new PaletteSlot({ props: paletteslot_props, $$inline: true });
    	binding_callbacks.push(() => bind(paletteslot, 'color', paletteslot_color_binding));

    	const block = {
    		c: function create() {
    			create_component(paletteslot.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paletteslot, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paletteslot_changes = {};

    			if (!updating_color && dirty & /*color*/ 1) {
    				updating_color = true;
    				paletteslot_changes.color = /*color*/ ctx[0];
    				add_flush_callback(() => updating_color = false);
    			}

    			paletteslot.$set(paletteslot_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paletteslot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paletteslot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paletteslot, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(41:4) {#if inputType !== 'color'}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#if inputType !== 'color'}
    function create_if_block$1(ctx) {
    	let paletteeyedropper;
    	let current;

    	paletteeyedropper = new PaletteEyeDropper({
    			props: {
    				buttonAriaLabel: /*eyeDropperButtonAriaLabel*/ ctx[5]
    			},
    			$$inline: true
    		});

    	paletteeyedropper.$on("add", /*_onEyeDropperAdd*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(paletteeyedropper.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paletteeyedropper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paletteeyedropper_changes = {};
    			if (dirty & /*eyeDropperButtonAriaLabel*/ 32) paletteeyedropper_changes.buttonAriaLabel = /*eyeDropperButtonAriaLabel*/ ctx[5];
    			paletteeyedropper.$set(paletteeyedropper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paletteeyedropper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paletteeyedropper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paletteeyedropper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(60:4) {#if inputType !== 'color'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let form;
    	let t0;
    	let input;
    	let t1;
    	let button;
    	let svg;
    	let g;
    	let path;
    	let button_disabled_value;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*inputType*/ ctx[1] !== 'color' && create_if_block_1$1(ctx);
    	let if_block1 = /*inputType*/ ctx[1] !== 'color' && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			button = element("button");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(input, "data-testid", "__palette-input-input__");
    			attr_dev(input, "type", /*inputType*/ ctx[1]);
    			input.value = /*color*/ ctx[0];
    			attr_dev(input, "aria-label", /*inputAriaLabel*/ ctx[2]);
    			attr_dev(input, "title", /*inputTitle*/ ctx[3]);
    			attr_dev(input, "class", "svelte-1rml9as");
    			toggle_class(input, "color", /*inputType*/ ctx[1] === 'color');
    			add_location(input, file$2, 41, 1, 1363);
    			attr_dev(path, "d", "M 14.857 9.143 L 9.143 9.143 L 9.143 14.857 C 9.143 15.489 8.631 16 8 16 C 7.369 16 6.857 15.489 6.857 14.857 L 6.857 9.143 L 1.143 9.143 C 0.512 9.143 0 8.632 0 8 C 0 7.368 0.512 6.857 1.143 6.857 L 6.857 6.857 L 6.857 1.143 C 6.857 0.511 7.369 0 8 0 C 8.631 0 9.143 0.511 9.143 1.143 L 9.143 6.857 L 14.857 6.857 C 15.488 6.857 16 7.368 16 8 C 16 8.632 15.488 9.143 14.857 9.143 Z");
    			attr_dev(path, "class", "svelte-1rml9as");
    			add_location(path, file$2, 53, 4, 1817);
    			attr_dev(g, "transform", "matrix(0.75, 0, 0, 0.75, 0, 0)");
    			add_location(g, file$2, 52, 3, 1765);
    			attr_dev(svg, "viewBox", "0 0 12 12");
    			attr_dev(svg, "width", "12px");
    			attr_dev(svg, "height", "12px");
    			attr_dev(svg, "class", "svelte-1rml9as");
    			add_location(svg, file$2, 51, 2, 1708);
    			attr_dev(button, "data-testid", "__palette-input-submit__");
    			attr_dev(button, "type", "submit");
    			button.disabled = button_disabled_value = !/*isValid*/ ctx[6];
    			attr_dev(button, "aria-label", /*buttonAriaLabel*/ ctx[4]);
    			attr_dev(button, "class", "svelte-1rml9as");
    			add_location(button, file$2, 50, 1, 1594);
    			attr_dev(form, "data-testid", "__palette-input-root__");
    			attr_dev(form, "class", "svelte-1rml9as");
    			add_location(form, file$2, 39, 0, 1136);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			if (if_block0) if_block0.m(form, null);
    			append_dev(form, t0);
    			append_dev(form, input);
    			append_dev(form, t1);
    			append_dev(form, button);
    			append_dev(button, svg);
    			append_dev(svg, g);
    			append_dev(g, path);
    			append_dev(form, t2);
    			if (if_block1) if_block1.m(form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", prevent_default(/*_onChange*/ ctx[7]), false, true, false),
    					listen_dev(form, "submit", prevent_default(/*_onSubmit*/ ctx[9]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*inputType*/ ctx[1] !== 'color') {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*inputType*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(form, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*inputType*/ 2) {
    				attr_dev(input, "type", /*inputType*/ ctx[1]);
    			}

    			if (!current || dirty & /*color*/ 1 && input.value !== /*color*/ ctx[0]) {
    				prop_dev(input, "value", /*color*/ ctx[0]);
    			}

    			if (!current || dirty & /*inputAriaLabel*/ 4) {
    				attr_dev(input, "aria-label", /*inputAriaLabel*/ ctx[2]);
    			}

    			if (!current || dirty & /*inputTitle*/ 8) {
    				attr_dev(input, "title", /*inputTitle*/ ctx[3]);
    			}

    			if (dirty & /*inputType*/ 2) {
    				toggle_class(input, "color", /*inputType*/ ctx[1] === 'color');
    			}

    			if (!current || dirty & /*isValid*/ 64 && button_disabled_value !== (button_disabled_value = !/*isValid*/ ctx[6])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (!current || dirty & /*buttonAriaLabel*/ 16) {
    				attr_dev(button, "aria-label", /*buttonAriaLabel*/ ctx[4]);
    			}

    			if (/*inputType*/ ctx[1] !== 'color') {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*inputType*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(form, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const validationRegex = /^#?(([0-9a-f]{2}){3,4}|([0-9a-f]){3})$/gi;

    function instance$2($$self, $$props, $$invalidate) {
    	let isValid;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PaletteInput', slots, []);
    	let { color = null } = $$props;
    	let { inputType = 'text' } = $$props;
    	let { inputAriaLabel = 'Enter an hex color value' } = $$props;
    	let { inputTitle = 'The value must be a valid hex color' } = $$props;
    	let { buttonAriaLabel = 'Submit this hex color value' } = $$props;
    	let { eyeDropperButtonAriaLabel = 'Pick a color from the screen' } = $$props;
    	const dispatch = createEventDispatcher();
    	const _isValid = value => !!value && validationRegex.test(value);

    	const _onChange = ({ target: { value } }) => {
    		$$invalidate(0, color = value);
    	};

    	const _onEyeDropperAdd = ({ detail: { color: value } }) => {
    		$$invalidate(0, color = value);
    	};

    	const _onSubmit = () => {
    		dispatch(ADD, { color });
    	};

    	const writable_props = [
    		'color',
    		'inputType',
    		'inputAriaLabel',
    		'inputTitle',
    		'buttonAriaLabel',
    		'eyeDropperButtonAriaLabel'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PaletteInput> was created with unknown prop '${key}'`);
    	});

    	function paletteslot_color_binding(value) {
    		color = value;
    		$$invalidate(0, color);
    	}

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('inputType' in $$props) $$invalidate(1, inputType = $$props.inputType);
    		if ('inputAriaLabel' in $$props) $$invalidate(2, inputAriaLabel = $$props.inputAriaLabel);
    		if ('inputTitle' in $$props) $$invalidate(3, inputTitle = $$props.inputTitle);
    		if ('buttonAriaLabel' in $$props) $$invalidate(4, buttonAriaLabel = $$props.buttonAriaLabel);
    		if ('eyeDropperButtonAriaLabel' in $$props) $$invalidate(5, eyeDropperButtonAriaLabel = $$props.eyeDropperButtonAriaLabel);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ADD,
    		PaletteSlot,
    		PaletteEyeDropper,
    		color,
    		inputType,
    		inputAriaLabel,
    		inputTitle,
    		buttonAriaLabel,
    		eyeDropperButtonAriaLabel,
    		dispatch,
    		validationRegex,
    		_isValid,
    		_onChange,
    		_onEyeDropperAdd,
    		_onSubmit,
    		isValid
    	});

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('inputType' in $$props) $$invalidate(1, inputType = $$props.inputType);
    		if ('inputAriaLabel' in $$props) $$invalidate(2, inputAriaLabel = $$props.inputAriaLabel);
    		if ('inputTitle' in $$props) $$invalidate(3, inputTitle = $$props.inputTitle);
    		if ('buttonAriaLabel' in $$props) $$invalidate(4, buttonAriaLabel = $$props.buttonAriaLabel);
    		if ('eyeDropperButtonAriaLabel' in $$props) $$invalidate(5, eyeDropperButtonAriaLabel = $$props.eyeDropperButtonAriaLabel);
    		if ('isValid' in $$props) $$invalidate(6, isValid = $$props.isValid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color*/ 1) {
    			$$invalidate(0, color = color?.replace(validationRegex, '#$1') || '');
    		}

    		if ($$self.$$.dirty & /*inputType*/ 2) {
    			$$invalidate(1, inputType = inputType === 'text' || inputType === 'color'
    			? inputType
    			: 'text');
    		}

    		if ($$self.$$.dirty & /*color*/ 1) {
    			$$invalidate(6, isValid = _isValid(color));
    		}
    	};

    	return [
    		color,
    		inputType,
    		inputAriaLabel,
    		inputTitle,
    		buttonAriaLabel,
    		eyeDropperButtonAriaLabel,
    		isValid,
    		_onChange,
    		_onEyeDropperAdd,
    		_onSubmit,
    		paletteslot_color_binding
    	];
    }

    class PaletteInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			color: 0,
    			inputType: 1,
    			inputAriaLabel: 2,
    			inputTitle: 3,
    			buttonAriaLabel: 4,
    			eyeDropperButtonAriaLabel: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaletteInput",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get color() {
    		throw new Error("<PaletteInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<PaletteInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputType() {
    		throw new Error("<PaletteInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputType(value) {
    		throw new Error("<PaletteInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputAriaLabel() {
    		throw new Error("<PaletteInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputAriaLabel(value) {
    		throw new Error("<PaletteInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputTitle() {
    		throw new Error("<PaletteInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputTitle(value) {
    		throw new Error("<PaletteInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonAriaLabel() {
    		throw new Error("<PaletteInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonAriaLabel(value) {
    		throw new Error("<PaletteInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get eyeDropperButtonAriaLabel() {
    		throw new Error("<PaletteInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set eyeDropperButtonAriaLabel(value) {
    		throw new Error("<PaletteInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var e=function(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n};var r=function(r){if(Array.isArray(r))return e(r)};var t=function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)};var n=function(r,t){if(r){if("string"==typeof r)return e(r,t);var n=Object.prototype.toString.call(r).slice(8,-1);return "Object"===n&&r.constructor&&(n=r.constructor.name),"Map"===n||"Set"===n?Array.from(r):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?e(r,t):void 0}};var o=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")};var i=function(e){return r(e)||t(e)||n(e)||o()};var a=function(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")};function u(e,r){for(var t=0;t<r.length;t++){var n=r[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}var l=function(e,r,t){return r&&u(e.prototype,r),t&&u(e,t),e};var c=function(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e},f=function(e){return 1===(null==e?void 0:e.nodeType)};function s(e,r){var t;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(t=function(e,r){if(!e)return;if("string"==typeof e)return d(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(e);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return d(e,r)}(e))||r&&e&&"number"==typeof e.length){t&&(e=t);var n=0,o=function(){};return {s:o,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,u=!1;return {s:function(){t=e[Symbol.iterator]();},n:function(){var e=t.next();return a=e.done,e},e:function(e){u=!0,i=e;},f:function(){try{a||null==t.return||t.return();}finally{if(u)throw i}}}}function d(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n}var v=function(){function e(){a(this,e),c(this,"_observer",null);}return l(e,[{key:"wait",value:function(r){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},a=o.events,u=void 0===a?e.EVENTS:a,l=o.timeout,c=void 0===l?0:l,d=o.attributeFilter,v=void 0===d?void 0:d,b=o.onError,m=void 0===b?void 0:b;return this.clear(),new Promise((function(o,a){var l=f(r)?r:document.querySelector(r);l&&u.includes(e.EXIST)&&(n?n(l,e.EXIST):o({node:l,event:e.EXIST})),c>0&&(t._timeout=setTimeout((function(){t.clear();var e=new Error("[TIMEOUT]: Element ".concat(r," cannot be found after ").concat(c,"ms"));n?null==m||m(e):a(e);}),c)),t._observer=new MutationObserver((function(t){t.forEach((function(t){var a,l=t.type,c=t.target,d=t.addedNodes,v=t.removedNodes,b=t.attributeName,m=t.oldValue;if("childList"===l&&(u.includes(e.ADD)||u.includes(e.REMOVE))){var y,E=s([].concat(i(u.includes(e.ADD)?Array.from(d):[]),i(u.includes(e.REMOVE)?Array.from(v):[])));try{for(E.s();!(y=E.n()).done;){var h,A=y.value;(A===r||!f(r)&&null!==(h=A.matches)&&void 0!==h&&h.call(A,r))&&(n?n(A,Array.from(d).includes(A)?e.ADD:e.REMOVE):o({node:A,event:Array.from(d).includes(A)?e.ADD:e.REMOVE}));}}catch(e){E.e(e);}finally{E.f();}}"attributes"===l&&u.includes(e.CHANGE)&&((c===r||!f(r)&&null!==(a=c.matches)&&void 0!==a&&a.call(c,r))&&(n?n(c,e.CHANGE,{attributeName:b,oldValue:m}):o({node:c,event:e.CHANGE,options:{attributeName:b,oldValue:m}})));}));})),t._observer.observe(document.documentElement,{subtree:!0,childList:u.includes(e.ADD)||u.includes(e.REMOVE),attributes:u.includes(e.CHANGE),attributeOldValue:u.includes(e.CHANGE),attributeFilter:v});}))}},{key:"clear",value:function(){var e;null===(e=this._observer)||void 0===e||e.disconnect(),clearTimeout(this._timeout);}}]),e}();c(v,"EXIST","DOMObserver_exist"),c(v,"ADD","DOMObserver_add"),c(v,"REMOVE","DOMObserver_remove"),c(v,"CHANGE","DOMObserver_change"),c(v,"EVENTS",[v.EXIST,v.ADD,v.REMOVE,v.CHANGE]);

    const useTooltip = (node, { contentSelector, contentClone, contentActions, contentClassName, disabled }) => {
    	Tooltip.init(contentSelector, contentClone);

    	const tooltip = new Tooltip(node, contentActions, contentClassName);
    	if (disabled) {
    		tooltip.disable();
    	}

    	return {
    		update: ({
    			contentSelector: newContentSelector,
    			contentClone: newContentClone,
    			contentActions: newContentActions,
    			contentClassName: newContentClassName,
    			disabled: newDisabled,
    		}) => {
    			Tooltip.update(newContentSelector, newContentClone);

    			tooltip.update(newContentActions, newContentClassName);
    			newDisabled ? tooltip.disable() : tooltip.enable();
    		},
    		destroy: () => {
    			tooltip.destroy();
    		},
    	}
    };

    class Tooltip {
    	static #isInitialized = false
    	static #observer = null
    	static #tooltip = null
    	static #contentSelector = null
    	static #instances = []

    	#target = null
    	#actions = null
    	#container = null
    	#events = []

    	#boundEnterHandler = null
    	#boundLeaveHandler = null

    	constructor(target, actions, className) {
    		this.#target = target;
    		this.#actions = actions;
    		this.#container = Tooltip.#tooltip;

    		this.#className = className;

    		this.#activateTarget();

    		Tooltip.#instances.push(this);
    	}

    	static init(contentSelector, contentClone = false) {
    		if (!Tooltip.#isInitialized) {
    			Tooltip.#tooltip = document.createElement('div');

    			Tooltip.#observer = new v();
    			Tooltip.#observer.wait(contentSelector, null, { events: [v.EXIST, v.ADD] }).then(({ node }) => {
    				const child = contentClone ? node.cloneNode(true) : node;
    				Tooltip.#tooltip.appendChild(child);
    			});

    			Tooltip.#contentSelector = contentSelector;
    			Tooltip.#isInitialized = true;
    		}
    	}

    	static update(contentSelector, contentClone = false) {
    		if (Tooltip.#isInitialized && contentSelector !== Tooltip.#contentSelector) {
    			Tooltip.#contentSelector = contentSelector;

    			Tooltip.#observer.wait(contentSelector, null, { events: [v.EXIST, v.ADD] }).then(({ node }) => {
    				Tooltip.#tooltip.innerHTML = '';
    				const child = contentClone ? node.cloneNode(true) : node;
    				Tooltip.#tooltip.appendChild(child);
    			});
    		}
    	}

    	static destroy() {
    		Tooltip.#instances.forEach((instance) => {
    			instance.destroy();
    		});
    		Tooltip.#instances = [];

    		Tooltip.#tooltip?.parentNode?.removeChild(Tooltip.#tooltip);
    		Tooltip.#tooltip = null;

    		Tooltip.#contentSelector = null;

    		Tooltip.#observer.clear();
    		Tooltip.#isInitialized = false;
    	}

    	get #className() {
    		return this.#container?.getAttribute('class')
    	}

    	set #className(value) {
    		this.#container?.setAttribute('class', value || '__tooltip__default');
    	}

    	update(actions, className) {
    		this.#actions = actions;
    		this.#className = className;
    	}

    	destroy() {
    		this.#deactivateTarget();
    		this.#removeContainerFromTarget();
    	}

    	enable() {
    		this.#boundEnterHandler = this.#onTargetEnter.bind(this);
    		this.#boundLeaveHandler = this.#onTargetLeave.bind(this);

    		this.#target.addEventListener('mouseenter', this.#boundEnterHandler);
    		this.#target.addEventListener('mouseleave', this.#boundLeaveHandler);
    	}

    	disable() {
    		this.#target.removeEventListener('mouseenter', this.#boundEnterHandler);
    		this.#target.removeEventListener('mouseleave', this.#boundLeaveHandler);

    		this.#boundEnterHandler = null;
    		this.#boundLeaveHandler = null;
    	}

    	#activateTarget() {
    		this.#target.title = '';
    		this.#target.setAttribute('style', 'position: relative');

    		this.enable();
    	}

    	#deactivateTarget() {
    		this.disable();
    	}

    	#appendContainerToTarget() {
    		this.#target.appendChild(this.#container);

    		if (this.#actions) {
    			Object.entries(this.#actions).forEach(([key, { eventType, callback, callbackParams, closeOnCallback }]) => {
    				const trigger = key === '*' ? this.#container : this.#container.querySelector(key);
    				if (trigger) {
    					const listener = (event) => {
    						callback?.apply(null, [...callbackParams, event]);
    						if(closeOnCallback) {
    							this.#removeContainerFromTarget();
    						}
    					};
    					trigger.addEventListener(eventType, listener);
    					this.#events.push({ trigger, eventType, listener });
    				}
    			});
    		}
    	}

    	#removeContainerFromTarget() {
    		if (this.#target.contains(this.#container)) {
    			this.#target.removeChild(this.#container);
    		}

    		this.#events.forEach(({ trigger, eventType, listener }) => trigger.removeEventListener(eventType, listener));
    		this.#events = [];
    	}

    	#onTargetEnter() {
    		this.#appendContainerToTarget();

    		Tooltip.#observer.wait(`.${this.#className}`, null, { events: [v.EXIST] }).then(({ node }) => {
    			const { width: targetWidth } = this.#target.getBoundingClientRect();
    			const { width: tooltipWidth, height: tooltipHeight } = this.#container.getBoundingClientRect();
    			this.#container.style.left = `${-(tooltipWidth - targetWidth) >> 1}px`;
    			this.#container.style.top = `${-tooltipHeight - 6}px`;
    		});
    	}

    	#onTargetLeave() {
    		this.#removeContainerFromTarget();
    	}
    }

    /* ..\src\components\Palette.svelte generated by Svelte v3.44.0 */
    const file$1 = "..\\src\\components\\Palette.svelte";
    const get_input_slot_changes = dirty => ({});
    const get_input_slot_context = ctx => ({});
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});
    const get_footer_divider_slot_changes = dirty => ({});
    const get_footer_divider_slot_context = ctx => ({});

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    const get_slot_slot_changes = dirty => ({ color: dirty & /*colors, maxColors*/ 65 });
    const get_slot_slot_context = ctx => ({ color: /*color*/ ctx[20] });
    const get_transparent_slot_slot_changes = dirty => ({});
    const get_transparent_slot_slot_context = ctx => ({});
    const get_header_divider_slot_changes = dirty => ({});
    const get_header_divider_slot_context = ctx => ({});
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (51:1) {#if $$slots.header}
    function create_if_block_2(ctx) {
    	let t;
    	let current;
    	const header_slot_template = /*#slots*/ ctx[15].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[14], get_header_slot_context);
    	const header_divider_slot_template = /*#slots*/ ctx[15]["header-divider"];
    	const header_divider_slot = create_slot(header_divider_slot_template, ctx, /*$$scope*/ ctx[14], get_header_divider_slot_context);
    	const header_divider_slot_or_fallback = header_divider_slot || fallback_block_5(ctx);

    	const block = {
    		c: function create() {
    			if (header_slot) header_slot.c();
    			t = space();
    			if (header_divider_slot_or_fallback) header_divider_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (header_slot) {
    				header_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			if (header_divider_slot_or_fallback) {
    				header_divider_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (header_slot) {
    				if (header_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						header_slot,
    						header_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[14], dirty, get_header_slot_changes),
    						get_header_slot_context
    					);
    				}
    			}

    			if (header_divider_slot) {
    				if (header_divider_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						header_divider_slot,
    						header_divider_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(header_divider_slot_template, /*$$scope*/ ctx[14], dirty, get_header_divider_slot_changes),
    						get_header_divider_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(header_divider_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(header_divider_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (header_slot) header_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (header_divider_slot_or_fallback) header_divider_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(51:1) {#if $$slots.header}",
    		ctx
    	});

    	return block;
    }

    // (53:30)      
    function fallback_block_5(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			attr_dev(hr, "class", "palette__divider svelte-6xp0k7");
    			add_location(hr, file$1, 53, 3, 1536);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_5.name,
    		type: "fallback",
    		source: "(53:30)      ",
    		ctx
    	});

    	return block;
    }

    // (58:2) {#if showTransparentSlot}
    function create_if_block_1(ctx) {
    	let li;
    	let current;
    	const transparent_slot_slot_template = /*#slots*/ ctx[15]["transparent-slot"];
    	const transparent_slot_slot = create_slot(transparent_slot_slot_template, ctx, /*$$scope*/ ctx[14], get_transparent_slot_slot_context);
    	const transparent_slot_slot_or_fallback = transparent_slot_slot || fallback_block_4(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (transparent_slot_slot_or_fallback) transparent_slot_slot_or_fallback.c();
    			attr_dev(li, "data-testid", "__palette-row__");
    			attr_dev(li, "class", "svelte-6xp0k7");
    			add_location(li, file$1, 58, 3, 1649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (transparent_slot_slot_or_fallback) {
    				transparent_slot_slot_or_fallback.m(li, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (transparent_slot_slot) {
    				if (transparent_slot_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						transparent_slot_slot,
    						transparent_slot_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(transparent_slot_slot_template, /*$$scope*/ ctx[14], dirty, get_transparent_slot_slot_changes),
    						get_transparent_slot_slot_context
    					);
    				}
    			} else {
    				if (transparent_slot_slot_or_fallback && transparent_slot_slot_or_fallback.p && (!current || dirty & /*selectedColor*/ 2)) {
    					transparent_slot_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(transparent_slot_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(transparent_slot_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (transparent_slot_slot_or_fallback) transparent_slot_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(58:2) {#if showTransparentSlot}",
    		ctx
    	});

    	return block;
    }

    // (60:34)        
    function fallback_block_4(ctx) {
    	let paletteslot;
    	let current;

    	paletteslot = new PaletteSlot({
    			props: {
    				emptyAriaLabel: "transparent",
    				selected: /*selectedColor*/ ctx[1] === null
    			},
    			$$inline: true
    		});

    	paletteslot.$on("click", /*_onSlotSelect*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(paletteslot.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paletteslot, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paletteslot_changes = {};
    			if (dirty & /*selectedColor*/ 2) paletteslot_changes.selected = /*selectedColor*/ ctx[1] === null;
    			paletteslot.$set(paletteslot_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paletteslot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paletteslot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paletteslot, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_4.name,
    		type: "fallback",
    		source: "(60:34)        ",
    		ctx
    	});

    	return block;
    }

    // (87:30)        
    function fallback_block_3(ctx) {
    	let paletteslot;
    	let current;

    	paletteslot = new PaletteSlot({
    			props: {
    				"data-testid": "__palette-slot__",
    				color: /*color*/ ctx[20],
    				selected: /*color*/ ctx[20] === /*selectedColor*/ ctx[1]
    			},
    			$$inline: true
    		});

    	paletteslot.$on("click", /*_onSlotSelect*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(paletteslot.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paletteslot, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paletteslot_changes = {};
    			if (dirty & /*colors, maxColors*/ 65) paletteslot_changes.color = /*color*/ ctx[20];
    			if (dirty & /*colors, maxColors, selectedColor*/ 67) paletteslot_changes.selected = /*color*/ ctx[20] === /*selectedColor*/ ctx[1];
    			paletteslot.$set(paletteslot_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paletteslot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paletteslot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paletteslot, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_3.name,
    		type: "fallback",
    		source: "(87:30)        ",
    		ctx
    	});

    	return block;
    }

    // (69:2) {#each colors.slice(0, colors.length < maxColors || maxColors === -1 ? colors.length : maxColors) as color, index}
    function create_each_block(ctx) {
    	let li;
    	let t;
    	let useTooltip_action;
    	let current;
    	let mounted;
    	let dispose;
    	const slot_slot_template = /*#slots*/ ctx[15].slot;
    	const slot_slot = create_slot(slot_slot_template, ctx, /*$$scope*/ ctx[14], get_slot_slot_context);
    	const slot_slot_or_fallback = slot_slot || fallback_block_3(ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (slot_slot_or_fallback) slot_slot_or_fallback.c();
    			t = space();
    			attr_dev(li, "data-testid", "__palette-row__");
    			attr_dev(li, "class", "svelte-6xp0k7");
    			add_location(li, file$1, 69, 3, 2011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (slot_slot_or_fallback) {
    				slot_slot_or_fallback.m(li, null);
    			}

    			append_dev(li, t);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(useTooltip_action = useTooltip.call(null, li, {
    					contentSelector: /*tooltipContentSelector*/ ctx[4] || '.tooltip__button',
    					contentClone: !!/*tooltipContentSelector*/ ctx[4],
    					contentActions: {
    						'*': {
    							eventType: 'click',
    							callback: /*_onTooltipClick*/ ctx[10],
    							callbackParams: [/*index*/ ctx[22]],
    							closeOnCallback: true
    						}
    					},
    					contentClassName: /*tooltipClassName*/ ctx[3],
    					disabled: !/*allowDeletion*/ ctx[2]
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (slot_slot) {
    				if (slot_slot.p && (!current || dirty & /*$$scope, colors, maxColors*/ 16449)) {
    					update_slot_base(
    						slot_slot,
    						slot_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(slot_slot_template, /*$$scope*/ ctx[14], dirty, get_slot_slot_changes),
    						get_slot_slot_context
    					);
    				}
    			} else {
    				if (slot_slot_or_fallback && slot_slot_or_fallback.p && (!current || dirty & /*colors, maxColors, selectedColor*/ 67)) {
    					slot_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (useTooltip_action && is_function(useTooltip_action.update) && dirty & /*tooltipContentSelector, tooltipClassName, allowDeletion*/ 28) useTooltip_action.update.call(null, {
    				contentSelector: /*tooltipContentSelector*/ ctx[4] || '.tooltip__button',
    				contentClone: !!/*tooltipContentSelector*/ ctx[4],
    				contentActions: {
    					'*': {
    						eventType: 'click',
    						callback: /*_onTooltipClick*/ ctx[10],
    						callbackParams: [/*index*/ ctx[22]],
    						closeOnCallback: true
    					}
    				},
    				contentClassName: /*tooltipClassName*/ ctx[3],
    				disabled: !/*allowDeletion*/ ctx[2]
    			});
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slot_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slot_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (slot_slot_or_fallback) slot_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(69:2) {#each colors.slice(0, colors.length < maxColors || maxColors === -1 ? colors.length : maxColors) as color, index}",
    		ctx
    	});

    	return block;
    }

    // (98:29)     
    function fallback_block_2(ctx) {
    	let hr;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			attr_dev(hr, "class", "palette__divider svelte-6xp0k7");
    			add_location(hr, file$1, 98, 2, 2723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(98:29)     ",
    		ctx
    	});

    	return block;
    }

    // (102:21)      
    function fallback_block_1(ctx) {
    	let paletteinput;
    	let current;

    	paletteinput = new PaletteInput({
    			props: {
    				color: /*selectedColor*/ ctx[1],
    				inputType: /*inputType*/ ctx[7]
    			},
    			$$inline: true
    		});

    	paletteinput.$on("add", /*_onInputAdd*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(paletteinput.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(paletteinput, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paletteinput_changes = {};
    			if (dirty & /*selectedColor*/ 2) paletteinput_changes.color = /*selectedColor*/ ctx[1];
    			if (dirty & /*inputType*/ 128) paletteinput_changes.inputType = /*inputType*/ ctx[7];
    			paletteinput.$set(paletteinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paletteinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paletteinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(paletteinput, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(102:21)      ",
    		ctx
    	});

    	return block;
    }

    // (101:21)     
    function fallback_block(ctx) {
    	let current;
    	const input_slot_template = /*#slots*/ ctx[15].input;
    	const input_slot = create_slot(input_slot_template, ctx, /*$$scope*/ ctx[14], get_input_slot_context);
    	const input_slot_or_fallback = input_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (input_slot_or_fallback) input_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (input_slot_or_fallback) {
    				input_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (input_slot) {
    				if (input_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						input_slot,
    						input_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(input_slot_template, /*$$scope*/ ctx[14], dirty, get_input_slot_changes),
    						get_input_slot_context
    					);
    				}
    			} else {
    				if (input_slot_or_fallback && input_slot_or_fallback.p && (!current || dirty & /*selectedColor, inputType*/ 130)) {
    					input_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (input_slot_or_fallback) input_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(101:21)     ",
    		ctx
    	});

    	return block;
    }

    // (108:0) {#if !tooltipContentSelector}
    function create_if_block(ctx) {
    	let button;
    	let svg;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "M 512,800 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 256,0 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 256,0 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z M 1152,76 v 948 H 256 V 76 Q 256,54 263,35.5 270,17 277.5,8.5 285,0 288,0 h 832 q 3,0 10.5,8.5 7.5,8.5 14.5,27 7,18.5 7,40.5 z M 480,1152 h 448 l -48,117 q -7,9 -17,11 H 546 q -10,-2 -17,-11 z m 928,-32 v -64 q 0,-14 -9,-23 -9,-9 -23,-9 h -96 V 76 q 0,-83 -47,-143.5 -47,-60.5 -113,-60.5 H 288 q -66,0 -113,58.5 Q 128,-11 128,72 v 952 H 32 q -14,0 -23,9 -9,9 -9,23 v 64 q 0,14 9,23 9,9 23,9 h 309 l 70,167 q 15,37 54,63 39,26 79,26 h 320 q 40,0 79,-26 39,-26 54,-63 l 70,-167 h 309 q 14,0 23,-9 9,-9 9,-23 z");
    			attr_dev(path, "class", "svelte-6xp0k7");
    			add_location(path, file$1, 111, 4, 3165);
    			attr_dev(g, "transform", "matrix(1,0,0,-1,197.42373,1255.0508)");
    			attr_dev(g, "class", "svelte-6xp0k7");
    			add_location(g, file$1, 110, 3, 3107);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 -256 1792 1792");
    			attr_dev(svg, "class", "svelte-6xp0k7");
    			add_location(svg, file$1, 109, 2, 3035);
    			attr_dev(button, "data-testid", "__palette-tooltip__");
    			attr_dev(button, "class", "tooltip__button svelte-6xp0k7");
    			add_location(button, file$1, 108, 1, 2965);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(108:0) {#if !tooltipContentSelector}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let t0;
    	let ul;
    	let t1;
    	let t2;
    	let t3;
    	let section_class_value;
    	let t4;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*$$slots*/ ctx[12].header && create_if_block_2(ctx);
    	let if_block1 = /*showTransparentSlot*/ ctx[5] && create_if_block_1(ctx);

    	let each_value = /*colors*/ ctx[0].slice(0, /*colors*/ ctx[0].length < /*maxColors*/ ctx[6] || /*maxColors*/ ctx[6] === -1
    	? /*colors*/ ctx[0].length
    	: /*maxColors*/ ctx[6]);

    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const footer_divider_slot_template = /*#slots*/ ctx[15]["footer-divider"];
    	const footer_divider_slot = create_slot(footer_divider_slot_template, ctx, /*$$scope*/ ctx[14], get_footer_divider_slot_context);
    	const footer_divider_slot_or_fallback = footer_divider_slot || fallback_block_2(ctx);
    	const footer_slot_template = /*#slots*/ ctx[15].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[14], get_footer_slot_context);
    	const footer_slot_or_fallback = footer_slot || fallback_block(ctx);
    	let if_block2 = !/*tooltipContentSelector*/ ctx[4] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			ul = element("ul");
    			if (if_block1) if_block1.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (footer_divider_slot_or_fallback) footer_divider_slot_or_fallback.c();
    			t3 = space();
    			if (footer_slot_or_fallback) footer_slot_or_fallback.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(ul, "class", "palette__list svelte-6xp0k7");
    			add_location(ul, file$1, 56, 1, 1589);
    			attr_dev(section, "class", section_class_value = "" + (null_to_empty(o$1([[!!/*$$props*/ ctx[11].class, /*$$props*/ ctx[11].class, 'palette__root']])) + " svelte-6xp0k7"));
    			add_location(section, file$1, 49, 0, 1363);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t0);
    			append_dev(section, ul);
    			if (if_block1) if_block1.m(ul, null);
    			append_dev(ul, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(section, t2);

    			if (footer_divider_slot_or_fallback) {
    				footer_divider_slot_or_fallback.m(section, null);
    			}

    			append_dev(section, t3);

    			if (footer_slot_or_fallback) {
    				footer_slot_or_fallback.m(section, null);
    			}

    			insert_dev(target, t4, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$$slots*/ ctx[12].header) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$$slots*/ 4096) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(section, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*showTransparentSlot*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*showTransparentSlot*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(ul, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*tooltipContentSelector, _onTooltipClick, tooltipClassName, allowDeletion, colors, maxColors, selectedColor, _onSlotSelect, $$scope*/ 17759) {
    				each_value = /*colors*/ ctx[0].slice(0, /*colors*/ ctx[0].length < /*maxColors*/ ctx[6] || /*maxColors*/ ctx[6] === -1
    				? /*colors*/ ctx[0].length
    				: /*maxColors*/ ctx[6]);

    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (footer_divider_slot) {
    				if (footer_divider_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						footer_divider_slot,
    						footer_divider_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(footer_divider_slot_template, /*$$scope*/ ctx[14], dirty, get_footer_divider_slot_changes),
    						get_footer_divider_slot_context
    					);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						footer_slot,
    						footer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[14], dirty, get_footer_slot_changes),
    						get_footer_slot_context
    					);
    				}
    			} else {
    				if (footer_slot_or_fallback && footer_slot_or_fallback.p && (!current || dirty & /*selectedColor, inputType, $$scope*/ 16514)) {
    					footer_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 2048 && section_class_value !== (section_class_value = "" + (null_to_empty(o$1([[!!/*$$props*/ ctx[11].class, /*$$props*/ ctx[11].class, 'palette__root']])) + " svelte-6xp0k7"))) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (!/*tooltipContentSelector*/ ctx[4]) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(footer_divider_slot_or_fallback, local);
    			transition_in(footer_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(footer_divider_slot_or_fallback, local);
    			transition_out(footer_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			if (footer_divider_slot_or_fallback) footer_divider_slot_or_fallback.d(detaching);
    			if (footer_slot_or_fallback) footer_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;

    	validate_slots('Palette', slots, [
    		'header','header-divider','transparent-slot','slot','footer-divider','input','footer'
    	]);

    	const $$slots = compute_slots(slots);
    	let { colors = [] } = $$props;
    	let { selectedColor = null } = $$props;
    	let { allowDuplicates = false } = $$props;
    	let { allowDeletion = false } = $$props;
    	let { tooltipClassName = null } = $$props;
    	let { tooltipContentSelector = null } = $$props;
    	let { showTransparentSlot = false } = $$props;
    	let { maxColors = 30 } = $$props;
    	let { inputType = 'text' } = $$props;
    	const dispatch = createEventDispatcher();

    	const _selectColor = color => {
    		$$invalidate(1, selectedColor = color);
    		dispatch(SELECT, { color });
    	};

    	const _addColor = color => $$invalidate(0, colors = allowDuplicates || !colors.includes(color)
    	? [
    			...colors.slice(0, colors.length < maxColors || maxColors === -1
    			? colors.length
    			: maxColors - 1),
    			color
    		]
    	: colors);

    	const _removeColor = index => $$invalidate(0, colors = colors.filter((c, i) => i !== index));
    	const _onSlotSelect = ({ detail: { color } }) => _selectColor(color);
    	const _onInputAdd = ({ detail: { color } }) => _addColor(color);
    	const _onTooltipClick = index => _removeColor(index);

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('colors' in $$new_props) $$invalidate(0, colors = $$new_props.colors);
    		if ('selectedColor' in $$new_props) $$invalidate(1, selectedColor = $$new_props.selectedColor);
    		if ('allowDuplicates' in $$new_props) $$invalidate(13, allowDuplicates = $$new_props.allowDuplicates);
    		if ('allowDeletion' in $$new_props) $$invalidate(2, allowDeletion = $$new_props.allowDeletion);
    		if ('tooltipClassName' in $$new_props) $$invalidate(3, tooltipClassName = $$new_props.tooltipClassName);
    		if ('tooltipContentSelector' in $$new_props) $$invalidate(4, tooltipContentSelector = $$new_props.tooltipContentSelector);
    		if ('showTransparentSlot' in $$new_props) $$invalidate(5, showTransparentSlot = $$new_props.showTransparentSlot);
    		if ('maxColors' in $$new_props) $$invalidate(6, maxColors = $$new_props.maxColors);
    		if ('inputType' in $$new_props) $$invalidate(7, inputType = $$new_props.inputType);
    		if ('$$scope' in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		resolveClassName: o$1,
    		SELECT,
    		PaletteInput,
    		PaletteSlot,
    		useTooltip,
    		colors,
    		selectedColor,
    		allowDuplicates,
    		allowDeletion,
    		tooltipClassName,
    		tooltipContentSelector,
    		showTransparentSlot,
    		maxColors,
    		inputType,
    		dispatch,
    		_selectColor,
    		_addColor,
    		_removeColor,
    		_onSlotSelect,
    		_onInputAdd,
    		_onTooltipClick
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ('colors' in $$props) $$invalidate(0, colors = $$new_props.colors);
    		if ('selectedColor' in $$props) $$invalidate(1, selectedColor = $$new_props.selectedColor);
    		if ('allowDuplicates' in $$props) $$invalidate(13, allowDuplicates = $$new_props.allowDuplicates);
    		if ('allowDeletion' in $$props) $$invalidate(2, allowDeletion = $$new_props.allowDeletion);
    		if ('tooltipClassName' in $$props) $$invalidate(3, tooltipClassName = $$new_props.tooltipClassName);
    		if ('tooltipContentSelector' in $$props) $$invalidate(4, tooltipContentSelector = $$new_props.tooltipContentSelector);
    		if ('showTransparentSlot' in $$props) $$invalidate(5, showTransparentSlot = $$new_props.showTransparentSlot);
    		if ('maxColors' in $$props) $$invalidate(6, maxColors = $$new_props.maxColors);
    		if ('inputType' in $$props) $$invalidate(7, inputType = $$new_props.inputType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		colors,
    		selectedColor,
    		allowDeletion,
    		tooltipClassName,
    		tooltipContentSelector,
    		showTransparentSlot,
    		maxColors,
    		inputType,
    		_onSlotSelect,
    		_onInputAdd,
    		_onTooltipClick,
    		$$props,
    		$$slots,
    		allowDuplicates,
    		$$scope,
    		slots
    	];
    }

    class Palette extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			colors: 0,
    			selectedColor: 1,
    			allowDuplicates: 13,
    			allowDeletion: 2,
    			tooltipClassName: 3,
    			tooltipContentSelector: 4,
    			showTransparentSlot: 5,
    			maxColors: 6,
    			inputType: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Palette",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get colors() {
    		throw new Error("<Palette>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Palette>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedColor() {
    		throw new Error("<Palette>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedColor(value) {
    		throw new Error("<Palette>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allowDuplicates() {
    		throw new Error("<Palette>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allowDuplicates(value) {
    		throw new Error("<Palette>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allowDeletion() {
    		throw new Error("<Palette>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allowDeletion(value) {
    		throw new Error("<Palette>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipClassName() {
    		throw new Error("<Palette>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipClassName(value) {
    		throw new Error("<Palette>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipContentSelector() {
    		throw new Error("<Palette>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipContentSelector(value) {
    		throw new Error("<Palette>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showTransparentSlot() {
    		throw new Error("<Palette>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showTransparentSlot(value) {
    		throw new Error("<Palette>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxColors() {
    		throw new Error("<Palette>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxColors(value) {
    		throw new Error("<Palette>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputType() {
    		throw new Error("<Palette>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputType(value) {
    		throw new Error("<Palette>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let palette;
    	let t0;
    	let form;
    	let h1;
    	let t2;
    	let fieldset0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let fieldset1;
    	let label1;
    	let t5;
    	let input1;
    	let t6;
    	let fieldset2;
    	let label2;
    	let t7;
    	let input2;
    	let t8;
    	let fieldset3;
    	let label3;
    	let t9;
    	let input3;
    	let t10;
    	let fieldset4;
    	let label4;
    	let t11;
    	let input4;
    	let t12;
    	let fieldset5;
    	let label5;
    	let t13;
    	let input5;
    	let t14;
    	let fieldset6;
    	let label6;
    	let t15;
    	let input6;
    	let t16;
    	let fieldset7;
    	let label7;
    	let t17;
    	let input7;
    	let t18;
    	let fieldset8;
    	let label8;
    	let t19;
    	let select;
    	let option0;
    	let option1;
    	let t22;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	palette = new Palette({
    			props: {
    				colors: /*colors*/ ctx[10],
    				selectedColor: /*preselectColor*/ ctx[1] ? /*bgColor*/ ctx[0] : null,
    				allowDuplicates: /*allowDuplicates*/ ctx[3],
    				allowDeletion: /*allowDeletion*/ ctx[4],
    				tooltipClassName: /*useCustomTooltipClass*/ ctx[5] ? 'tooltip' : null,
    				tooltipContentSelector: /*useCustomTooltipContent*/ ctx[6]
    				? '.palette__tooltip__button'
    				: null,
    				showTransparentSlot: /*showTransparentSlot*/ ctx[7],
    				maxColors: /*maxColors*/ ctx[8],
    				inputType: /*inputType*/ ctx[9],
    				class: /*useCustomClass*/ ctx[2] ? 'palette' : null
    			},
    			$$inline: true
    		});

    	palette.$on("select", /*select_handler*/ ctx[11]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(palette.$$.fragment);
    			t0 = space();
    			form = element("form");
    			h1 = element("h1");
    			h1.textContent = "Settings";
    			t2 = space();
    			fieldset0 = element("fieldset");
    			label0 = element("label");
    			t3 = text("Preselect color:\r\n\t\t\t\t\t");
    			input0 = element("input");
    			t4 = space();
    			fieldset1 = element("fieldset");
    			label1 = element("label");
    			t5 = text("Use Custom Class:\r\n\t\t\t\t\t");
    			input1 = element("input");
    			t6 = space();
    			fieldset2 = element("fieldset");
    			label2 = element("label");
    			t7 = text("Allow Duplicates:\r\n\t\t\t\t\t");
    			input2 = element("input");
    			t8 = space();
    			fieldset3 = element("fieldset");
    			label3 = element("label");
    			t9 = text("Allow Deletion:\r\n\t\t\t\t\t");
    			input3 = element("input");
    			t10 = space();
    			fieldset4 = element("fieldset");
    			label4 = element("label");
    			t11 = text("Use Custom Tooltip Class:\r\n\t\t\t\t\t");
    			input4 = element("input");
    			t12 = space();
    			fieldset5 = element("fieldset");
    			label5 = element("label");
    			t13 = text("Use Custom Tooltip Content:\r\n\t\t\t\t\t");
    			input5 = element("input");
    			t14 = space();
    			fieldset6 = element("fieldset");
    			label6 = element("label");
    			t15 = text("Show Transparent Slot:\r\n\t\t\t\t\t");
    			input6 = element("input");
    			t16 = space();
    			fieldset7 = element("fieldset");
    			label7 = element("label");
    			t17 = text("Max Colors:\r\n\t\t\t\t\t");
    			input7 = element("input");
    			t18 = space();
    			fieldset8 = element("fieldset");
    			label8 = element("label");
    			t19 = text("Input Type:\r\n                    ");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "text";
    			option1 = element("option");
    			option1.textContent = "color";
    			t22 = space();
    			button = element("button");
    			button.textContent = "Delete";
    			add_location(h1, file, 54, 3, 1199);
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "class", "svelte-1bjsvyu");
    			add_location(input0, file, 58, 5, 1274);
    			attr_dev(label0, "class", "svelte-1bjsvyu");
    			add_location(label0, file, 56, 4, 1237);
    			attr_dev(fieldset0, "class", "svelte-1bjsvyu");
    			add_location(fieldset0, file, 55, 3, 1221);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "class", "svelte-1bjsvyu");
    			add_location(input1, file, 64, 5, 1418);
    			attr_dev(label1, "class", "svelte-1bjsvyu");
    			add_location(label1, file, 62, 4, 1380);
    			attr_dev(fieldset1, "class", "svelte-1bjsvyu");
    			add_location(fieldset1, file, 61, 3, 1364);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "svelte-1bjsvyu");
    			add_location(input2, file, 70, 5, 1562);
    			attr_dev(label2, "class", "svelte-1bjsvyu");
    			add_location(label2, file, 68, 4, 1524);
    			attr_dev(fieldset2, "class", "svelte-1bjsvyu");
    			add_location(fieldset2, file, 67, 3, 1508);
    			attr_dev(input3, "type", "checkbox");
    			attr_dev(input3, "class", "svelte-1bjsvyu");
    			add_location(input3, file, 76, 5, 1705);
    			attr_dev(label3, "class", "svelte-1bjsvyu");
    			add_location(label3, file, 74, 4, 1669);
    			attr_dev(fieldset3, "class", "svelte-1bjsvyu");
    			add_location(fieldset3, file, 73, 3, 1653);
    			attr_dev(input4, "type", "checkbox");
    			attr_dev(input4, "class", "svelte-1bjsvyu");
    			add_location(input4, file, 82, 5, 1856);
    			attr_dev(label4, "class", "svelte-1bjsvyu");
    			add_location(label4, file, 80, 4, 1810);
    			attr_dev(fieldset4, "class", "svelte-1bjsvyu");
    			add_location(fieldset4, file, 79, 3, 1794);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "class", "svelte-1bjsvyu");
    			add_location(input5, file, 88, 5, 2017);
    			attr_dev(label5, "class", "svelte-1bjsvyu");
    			add_location(label5, file, 86, 4, 1969);
    			attr_dev(fieldset5, "class", "svelte-1bjsvyu");
    			add_location(fieldset5, file, 85, 3, 1953);
    			attr_dev(input6, "type", "checkbox");
    			attr_dev(input6, "class", "svelte-1bjsvyu");
    			add_location(input6, file, 94, 5, 2175);
    			attr_dev(label6, "class", "svelte-1bjsvyu");
    			add_location(label6, file, 92, 4, 2132);
    			attr_dev(fieldset6, "class", "svelte-1bjsvyu");
    			add_location(fieldset6, file, 91, 3, 2116);
    			attr_dev(input7, "type", "number");
    			attr_dev(input7, "min", "1");
    			attr_dev(input7, "max", "30");
    			attr_dev(input7, "class", "svelte-1bjsvyu");
    			add_location(input7, file, 100, 5, 2318);
    			attr_dev(label7, "class", "svelte-1bjsvyu");
    			add_location(label7, file, 98, 4, 2286);
    			attr_dev(fieldset7, "class", "svelte-1bjsvyu");
    			add_location(fieldset7, file, 97, 3, 2270);
    			option0.__value = "text";
    			option0.value = option0.__value;
    			add_location(option0, file, 107, 24, 2536);
    			option1.__value = "color";
    			option1.value = option1.__value;
    			add_location(option1, file, 108, 24, 2596);
    			if (/*inputType*/ ctx[9] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[20].call(select));
    			add_location(select, file, 106, 20, 2479);
    			attr_dev(label8, "class", "svelte-1bjsvyu");
    			add_location(label8, file, 104, 4, 2432);
    			attr_dev(fieldset8, "class", "svelte-1bjsvyu");
    			add_location(fieldset8, file, 103, 3, 2416);
    			attr_dev(form, "class", "settings__form svelte-1bjsvyu");
    			add_location(form, file, 53, 2, 1165);
    			attr_dev(div, "class", "container svelte-1bjsvyu");
    			add_location(div, file, 39, 1, 685);
    			set_style(main, "--bgColor", /*bgColor*/ ctx[0]);
    			attr_dev(main, "class", "svelte-1bjsvyu");
    			add_location(main, file, 38, 0, 648);
    			attr_dev(button, "class", "palette__tooltip__button");
    			add_location(button, file, 116, 0, 2726);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(palette, div, null);
    			append_dev(div, t0);
    			append_dev(div, form);
    			append_dev(form, h1);
    			append_dev(form, t2);
    			append_dev(form, fieldset0);
    			append_dev(fieldset0, label0);
    			append_dev(label0, t3);
    			append_dev(label0, input0);
    			input0.checked = /*preselectColor*/ ctx[1];
    			append_dev(form, t4);
    			append_dev(form, fieldset1);
    			append_dev(fieldset1, label1);
    			append_dev(label1, t5);
    			append_dev(label1, input1);
    			input1.checked = /*useCustomClass*/ ctx[2];
    			append_dev(form, t6);
    			append_dev(form, fieldset2);
    			append_dev(fieldset2, label2);
    			append_dev(label2, t7);
    			append_dev(label2, input2);
    			input2.checked = /*allowDuplicates*/ ctx[3];
    			append_dev(form, t8);
    			append_dev(form, fieldset3);
    			append_dev(fieldset3, label3);
    			append_dev(label3, t9);
    			append_dev(label3, input3);
    			input3.checked = /*allowDeletion*/ ctx[4];
    			append_dev(form, t10);
    			append_dev(form, fieldset4);
    			append_dev(fieldset4, label4);
    			append_dev(label4, t11);
    			append_dev(label4, input4);
    			input4.checked = /*useCustomTooltipClass*/ ctx[5];
    			append_dev(form, t12);
    			append_dev(form, fieldset5);
    			append_dev(fieldset5, label5);
    			append_dev(label5, t13);
    			append_dev(label5, input5);
    			input5.checked = /*useCustomTooltipContent*/ ctx[6];
    			append_dev(form, t14);
    			append_dev(form, fieldset6);
    			append_dev(fieldset6, label6);
    			append_dev(label6, t15);
    			append_dev(label6, input6);
    			input6.checked = /*showTransparentSlot*/ ctx[7];
    			append_dev(form, t16);
    			append_dev(form, fieldset7);
    			append_dev(fieldset7, label7);
    			append_dev(label7, t17);
    			append_dev(label7, input7);
    			set_input_value(input7, /*maxColors*/ ctx[8]);
    			append_dev(form, t18);
    			append_dev(form, fieldset8);
    			append_dev(fieldset8, label8);
    			append_dev(label8, t19);
    			append_dev(label8, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			select_option(select, /*inputType*/ ctx[9]);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[12]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[13]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[14]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[15]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[16]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[17]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[18]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[19]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[20])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const palette_changes = {};
    			if (dirty & /*preselectColor, bgColor*/ 3) palette_changes.selectedColor = /*preselectColor*/ ctx[1] ? /*bgColor*/ ctx[0] : null;
    			if (dirty & /*allowDuplicates*/ 8) palette_changes.allowDuplicates = /*allowDuplicates*/ ctx[3];
    			if (dirty & /*allowDeletion*/ 16) palette_changes.allowDeletion = /*allowDeletion*/ ctx[4];
    			if (dirty & /*useCustomTooltipClass*/ 32) palette_changes.tooltipClassName = /*useCustomTooltipClass*/ ctx[5] ? 'tooltip' : null;

    			if (dirty & /*useCustomTooltipContent*/ 64) palette_changes.tooltipContentSelector = /*useCustomTooltipContent*/ ctx[6]
    			? '.palette__tooltip__button'
    			: null;

    			if (dirty & /*showTransparentSlot*/ 128) palette_changes.showTransparentSlot = /*showTransparentSlot*/ ctx[7];
    			if (dirty & /*maxColors*/ 256) palette_changes.maxColors = /*maxColors*/ ctx[8];
    			if (dirty & /*inputType*/ 512) palette_changes.inputType = /*inputType*/ ctx[9];
    			if (dirty & /*useCustomClass*/ 4) palette_changes.class = /*useCustomClass*/ ctx[2] ? 'palette' : null;
    			palette.$set(palette_changes);

    			if (dirty & /*preselectColor*/ 2) {
    				input0.checked = /*preselectColor*/ ctx[1];
    			}

    			if (dirty & /*useCustomClass*/ 4) {
    				input1.checked = /*useCustomClass*/ ctx[2];
    			}

    			if (dirty & /*allowDuplicates*/ 8) {
    				input2.checked = /*allowDuplicates*/ ctx[3];
    			}

    			if (dirty & /*allowDeletion*/ 16) {
    				input3.checked = /*allowDeletion*/ ctx[4];
    			}

    			if (dirty & /*useCustomTooltipClass*/ 32) {
    				input4.checked = /*useCustomTooltipClass*/ ctx[5];
    			}

    			if (dirty & /*useCustomTooltipContent*/ 64) {
    				input5.checked = /*useCustomTooltipContent*/ ctx[6];
    			}

    			if (dirty & /*showTransparentSlot*/ 128) {
    				input6.checked = /*showTransparentSlot*/ ctx[7];
    			}

    			if (dirty & /*maxColors*/ 256 && to_number(input7.value) !== /*maxColors*/ ctx[8]) {
    				set_input_value(input7, /*maxColors*/ ctx[8]);
    			}

    			if (dirty & /*inputType*/ 512) {
    				select_option(select, /*inputType*/ ctx[9]);
    			}

    			if (!current || dirty & /*bgColor*/ 1) {
    				set_style(main, "--bgColor", /*bgColor*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(palette.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(palette.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(palette);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const colors = [
    		'#865C54',
    		'#8F5447',
    		'#A65846',
    		'#A9715E',
    		'#AD8C72',
    		'#C2B091',
    		'#172B41',
    		'#32465C',
    		'#617899',
    		'#9BA2BC',
    		'#847999',
    		'#50526A',
    		'#8B8C6B',
    		'#97A847',
    		'#5B652C',
    		'#6A6A40',
    		'#F2D9BF',
    		'#F5BAAE',
    		'#F1A191'
    	];

    	let bgColor = colors[0];
    	let preselectColor = true;
    	let useCustomClass = false;
    	let allowDuplicates = true;
    	let allowDeletion = true;
    	let useCustomTooltipClass = false;
    	let useCustomTooltipContent = false;
    	let showTransparentSlot = true;
    	let maxColors = 20;
    	let inputType = 'text';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const select_handler = ({ detail: { color } }) => $$invalidate(0, bgColor = color);

    	function input0_change_handler() {
    		preselectColor = this.checked;
    		$$invalidate(1, preselectColor);
    	}

    	function input1_change_handler() {
    		useCustomClass = this.checked;
    		$$invalidate(2, useCustomClass);
    	}

    	function input2_change_handler() {
    		allowDuplicates = this.checked;
    		$$invalidate(3, allowDuplicates);
    	}

    	function input3_change_handler() {
    		allowDeletion = this.checked;
    		$$invalidate(4, allowDeletion);
    	}

    	function input4_change_handler() {
    		useCustomTooltipClass = this.checked;
    		$$invalidate(5, useCustomTooltipClass);
    	}

    	function input5_change_handler() {
    		useCustomTooltipContent = this.checked;
    		$$invalidate(6, useCustomTooltipContent);
    	}

    	function input6_change_handler() {
    		showTransparentSlot = this.checked;
    		$$invalidate(7, showTransparentSlot);
    	}

    	function input7_input_handler() {
    		maxColors = to_number(this.value);
    		$$invalidate(8, maxColors);
    	}

    	function select_change_handler() {
    		inputType = select_value(this);
    		$$invalidate(9, inputType);
    	}

    	$$self.$capture_state = () => ({
    		Palette,
    		colors,
    		bgColor,
    		preselectColor,
    		useCustomClass,
    		allowDuplicates,
    		allowDeletion,
    		useCustomTooltipClass,
    		useCustomTooltipContent,
    		showTransparentSlot,
    		maxColors,
    		inputType
    	});

    	$$self.$inject_state = $$props => {
    		if ('bgColor' in $$props) $$invalidate(0, bgColor = $$props.bgColor);
    		if ('preselectColor' in $$props) $$invalidate(1, preselectColor = $$props.preselectColor);
    		if ('useCustomClass' in $$props) $$invalidate(2, useCustomClass = $$props.useCustomClass);
    		if ('allowDuplicates' in $$props) $$invalidate(3, allowDuplicates = $$props.allowDuplicates);
    		if ('allowDeletion' in $$props) $$invalidate(4, allowDeletion = $$props.allowDeletion);
    		if ('useCustomTooltipClass' in $$props) $$invalidate(5, useCustomTooltipClass = $$props.useCustomTooltipClass);
    		if ('useCustomTooltipContent' in $$props) $$invalidate(6, useCustomTooltipContent = $$props.useCustomTooltipContent);
    		if ('showTransparentSlot' in $$props) $$invalidate(7, showTransparentSlot = $$props.showTransparentSlot);
    		if ('maxColors' in $$props) $$invalidate(8, maxColors = $$props.maxColors);
    		if ('inputType' in $$props) $$invalidate(9, inputType = $$props.inputType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bgColor,
    		preselectColor,
    		useCustomClass,
    		allowDuplicates,
    		allowDeletion,
    		useCustomTooltipClass,
    		useCustomTooltipContent,
    		showTransparentSlot,
    		maxColors,
    		inputType,
    		colors,
    		select_handler,
    		input0_change_handler,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler,
    		input4_change_handler,
    		input5_change_handler,
    		input6_change_handler,
    		input7_input_handler,
    		select_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
