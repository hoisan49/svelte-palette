
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
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
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    const outroing = new Set();
    let outros;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
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

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var dist = createCommonjsModule(function (module, exports) {
    function t(){}Object.defineProperty(exports,"__esModule",{value:!0});const e=t=>t;function n(t,e){for(const n in e)t[n]=e[n];return t}function o(t){return t()}function r(){return Object.create(null)}function l(t){t.forEach(o);}function i(t){return "function"==typeof t}function s(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function a(t,e,n,o){if(t){const r=c(t,e,n,o);return t[0](r)}}function c(t,e,o,r){return t[1]&&r?n(o.ctx.slice(),t[1](r(e))):o.ctx}function u(t,e,n,o,r,l,i){const s=function(t,e,n,o){if(t[2]&&o){const r=t[2](o(n));if(void 0===e.dirty)return r;if("object"==typeof r){const t=[],n=Math.max(e.dirty.length,r.length);for(let o=0;o<n;o+=1)t[o]=e.dirty[o]|r[o];return t}return e.dirty|r}return e.dirty}(e,o,r,l);if(s){const r=c(e,n,o,i);t.p(r,s);}}function d(t){const e={};for(const n in t)"$"!==n[0]&&(e[n]=t[n]);return e}function f(t,e){const n={};e=new Set(e);for(const o in t)e.has(o)||"$"===o[0]||(n[o]=t[o]);return n}function p(t){return null==t?"":t}const h="undefined"!=typeof window;let m=h?()=>window.performance.now():()=>Date.now(),v=h?t=>requestAnimationFrame(t):t;const b=new Set;function g(t){b.forEach((e=>{e.c(t)||(b.delete(e),e.f());})),0!==b.size&&v(g);}let _=!1;function y(t,e,n,o){for(;t<e;){const r=t+(e-t>>1);n(r)<=o?t=r+1:e=r;}return t}function $(t,e){_?(!function(t){if(t.hydrate_init)return;t.hydrate_init=!0;const e=t.childNodes,n=new Int32Array(e.length+1),o=new Int32Array(e.length);n[0]=-1;let r=0;for(let t=0;t<e.length;t++){const l=y(1,r+1,(t=>e[n[t]].claim_order),e[t].claim_order)-1;o[t]=n[l]+1;const i=l+1;n[i]=t,r=Math.max(i,r);}const l=[],i=[];let s=e.length-1;for(let t=n[r]+1;0!=t;t=o[t-1]){for(l.push(e[t-1]);s>=t;s--)i.push(e[s]);s--;}for(;s>=0;s--)i.push(e[s]);l.reverse(),i.sort(((t,e)=>t.claim_order-e.claim_order));for(let e=0,n=0;e<i.length;e++){for(;n<l.length&&i[e].claim_order>=l[n].claim_order;)n++;const o=n<l.length?l[n]:null;t.insertBefore(i[e],o);}}(t),(void 0===t.actual_end_child||null!==t.actual_end_child&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild),e!==t.actual_end_child?t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling):e.parentNode!==t&&t.appendChild(e);}function x(t,e,n){_&&!n?$(t,e):e.parentNode===t&&e.nextSibling==n||t.insertBefore(e,n||null);}function w(t){t.parentNode.removeChild(t);}function E(t){return document.createElement(t)}function A(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function C(t){return document.createTextNode(t)}function T(){return C(" ")}function S(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function D(t){return function(e){return e.preventDefault(),t.call(this,e)}}function N(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n);}function k(t,e){const n=Object.getOwnPropertyDescriptors(t.__proto__);for(const o in e)null==e[o]?t.removeAttribute(o):"style"===o?t.style.cssText=e[o]:"__value"===o?t.value=t[o]=e[o]:n[o]&&n[o].set?t[o]=e[o]:N(t,o,e[o]);}function L(t,e,n){t.classList[n?"add":"remove"](e);}function O(t,e,n=!1){const o=document.createEvent("CustomEvent");return o.initCustomEvent(t,n,!1,e),o}const q=new Set;let M,z=0;function H(t,e){const n=(t.style.animation||"").split(", "),o=n.filter(e?t=>t.indexOf(e)<0:t=>-1===t.indexOf("__svelte")),r=n.length-o.length;r&&(t.style.animation=o.join(", "),z-=r,z||v((()=>{z||(q.forEach((t=>{const e=t.__svelte_stylesheet;let n=e.cssRules.length;for(;n--;)e.deleteRule(n);t.__svelte_rules={};})),q.clear());})));}function j(t){M=t;}function V(){const t=function(){if(!M)throw new Error("Function called outside component initialization");return M}();return (e,n)=>{const o=t.$$.callbacks[e];if(o){const r=O(e,n);o.slice().forEach((e=>{e.call(t,r);}));}}}const I=[],P=[],B=[],R=[],F=Promise.resolve();let G=!1;function U(t){B.push(t);}let Q=!1;const J=new Set;function K(){if(!Q){Q=!0;do{for(let t=0;t<I.length;t+=1){const e=I[t];j(e),W(e.$$);}for(j(null),I.length=0;P.length;)P.pop()();for(let t=0;t<B.length;t+=1){const e=B[t];J.has(e)||(J.add(e),e());}B.length=0;}while(I.length);for(;R.length;)R.pop()();G=!1,Q=!1,J.clear();}}function W(t){if(null!==t.fragment){t.update(),l(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(U);}}let X;function Y(t,e,n){t.dispatchEvent(O(`${e?"intro":"outro"}${n}`));}const Z=new Set;let tt;function et(){tt={r:0,c:[],p:tt};}function nt(){tt.r||l(tt.c),tt=tt.p;}function ot(t,e){t&&t.i&&(Z.delete(t),t.i(e));}function rt(t,e,n,o){if(t&&t.o){if(Z.has(t))return;Z.add(t),tt.c.push((()=>{Z.delete(t),o&&(n&&t.d(1),o());})),t.o(e);}}const lt={duration:0};function it(n,o,r){let l,s,a=o(n,r),c=!1,u=0;function d(){l&&H(n,l);}function f(){const{delay:o=0,duration:r=300,easing:i=e,tick:f=t,css:p}=a||lt;p&&(l=function(t,e,n,o,r,l,i,s=0){const a=16.666/o;let c="{\n";for(let t=0;t<=1;t+=a){const o=e+(n-e)*l(t);c+=100*t+`%{${i(o,1-o)}}\n`;}const u=c+`100% {${i(n,1-n)}}\n}`,d=`__svelte_${function(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}(u)}_${s}`,f=t.ownerDocument;q.add(f);const p=f.__svelte_stylesheet||(f.__svelte_stylesheet=f.head.appendChild(E("style")).sheet),h=f.__svelte_rules||(f.__svelte_rules={});h[d]||(h[d]=!0,p.insertRule(`@keyframes ${d} ${u}`,p.cssRules.length));const m=t.style.animation||"";return t.style.animation=`${m?`${m}, `:""}${d} ${o}ms linear ${r}ms 1 both`,z+=1,d}(n,0,1,r,o,i,p,u++)),f(0,1);const h=m()+o,_=h+r;s&&s.abort(),c=!0,U((()=>Y(n,!0,"start"))),s=function(t){let e;return 0===b.size&&v(g),{promise:new Promise((n=>{b.add(e={c:t,f:n});})),abort(){b.delete(e);}}}((t=>{if(c){if(t>=_)return f(1,0),Y(n,!0,"end"),d(),c=!1;if(t>=h){const e=i((t-h)/r);f(e,1-e);}}return c}));}let p=!1;return {start(){p||(H(n),i(a)?(a=a(),(X||(X=Promise.resolve(),X.then((()=>{X=null;}))),X).then(f)):f());},invalidate(){p=!1;},end(){c&&(d(),c=!1);}}}function st(t){t&&t.c();}function at(t,e,n,r){const{fragment:s,on_mount:a,on_destroy:c,after_update:u}=t.$$;s&&s.m(e,n),r||U((()=>{const e=a.map(o).filter(i);c?c.push(...e):l(e),t.$$.on_mount=[];})),u.forEach(U);}function ct(t,e){const n=t.$$;null!==n.fragment&&(l(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[]);}function ut(t,e){-1===t.$$.dirty[0]&&(I.push(t),G||(G=!0,F.then(K)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31;}function dt(e,n,o,i,s,a,c=[-1]){const u=M;j(e);const d=e.$$={fragment:null,ctx:null,props:a,update:t,not_equal:s,bound:r(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:n.context||[]),callbacks:r(),dirty:c,skip_bound:!1};let f=!1;if(d.ctx=o?o(e,n.props||{},((t,n,...o)=>{const r=o.length?o[0]:n;return d.ctx&&s(d.ctx[t],d.ctx[t]=r)&&(!d.skip_bound&&d.bound[t]&&d.bound[t](r),f&&ut(e,t)),n})):[],d.update(),f=!0,l(d.before_update),d.fragment=!!i&&i(d.ctx),n.target){if(n.hydrate){_=!0;const t=function(t){return Array.from(t.childNodes)}(n.target);d.fragment&&d.fragment.l(t),t.forEach(w);}else d.fragment&&d.fragment.c();n.intro&&ot(e.$$.fragment),at(e,n.target,n.anchor,n.customElement),_=!1,K();}j(u);}class ft{$destroy(){ct(this,1),this.$destroy=t;}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1);}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1);}}function pt(t){const e=t-1;return e*e*e+1}function ht(t){return Math.sin(-13*(t+1)*Math.PI/2)*Math.pow(2,-10*t)+1}function mt(t,{delay:e=0,duration:n=400,easing:o=pt,start:r=0,opacity:l=0}={}){const i=getComputedStyle(t),s=+i.opacity,a="none"===i.transform?"":i.transform,c=1-r,u=s*(1-l);return {delay:e,duration:n,easing:o,css:(t,e)=>`\n\t\t\ttransform: ${a} scale(${1-c*e});\n\t\t\topacity: ${s-u*e}\n\t\t`}}const vt=t=>{if(!Array.isArray(t))throw new Error("resolveClass expects an array as input");return Object.values(t).reduce(((t,[e,n,o])=>e&&n?[...t,n]:!e&&o?[...t,o]:t),[]).join(" ")};function bt(t,e){void 0===e&&(e={});var n=e.insertAt;if(t&&"undefined"!=typeof document){var o=document.head||document.getElementsByTagName("head")[0],r=document.createElement("style");r.type="text/css","top"===n&&o.firstChild?o.insertBefore(r,o.firstChild):o.appendChild(r),r.styleSheet?r.styleSheet.cssText=t:r.appendChild(document.createTextNode(t));}}function gt(e){let o,r,l,i,s,a,c,u=[{"data-testid":"__palette-slot-root__"},e[5],{"aria-label":r=e[0]||e[3]},{style:l="--color:"+e[0]+"; --outerBorderColor:"+(e[0]||"#aaa")+";"},{class:i=vt([[!e[0],"empty"],[e[1],"selected"],[!e[2],"clickable"]])},{disabled:e[2]}],d={};for(let t=0;t<u.length;t+=1)d=n(d,u[t]);return {c(){o=E("button"),k(o,d),L(o,"svelte-132ecgz",!0);},m(t,n){x(t,o,n),a||(c=S(o,"click",D(e[4])),a=!0);},p(t,[n]){e=t,k(o,d=function(t,e){const n={},o={},r={$$scope:1};let l=t.length;for(;l--;){const i=t[l],s=e[l];if(s){for(const t in i)t in s||(o[t]=1);for(const t in s)r[t]||(n[t]=s[t],r[t]=1);t[l]=s;}else for(const t in i)r[t]=1;}for(const t in o)t in n||(n[t]=void 0);return n}(u,[{"data-testid":"__palette-slot-root__"},32&n&&e[5],9&n&&r!==(r=e[0]||e[3])&&{"aria-label":r},1&n&&l!==(l="--color:"+e[0]+"; --outerBorderColor:"+(e[0]||"#aaa")+";")&&{style:l},7&n&&i!==(i=vt([[!e[0],"empty"],[e[1],"selected"],[!e[2],"clickable"]]))&&{class:i},4&n&&{disabled:e[2]}])),L(o,"svelte-132ecgz",!0);},i(t){s||U((()=>{s=it(o,mt,{duration:500,easing:ht}),s.start();}));},o:t,d(t){t&&w(o),a=!1,c();}}}function _t(t,e,o){const r=["color","selected","disabled","emptyAriaLabel"];let l=f(e,r),{color:i=null}=e,{selected:s=!1}=e,{disabled:a=!1}=e,{emptyAriaLabel:c="No color"}=e;const u=V();return t.$$set=t=>{e=n(n({},e),d(t)),o(5,l=f(e,r)),"color"in t&&o(0,i=t.color),"selected"in t&&o(1,s=t.selected),"disabled"in t&&o(2,a=t.disabled),"emptyAriaLabel"in t&&o(3,c=t.emptyAriaLabel);},[i,s,a,c,()=>!a&&u("click",{color:i}),l]}bt("button.svelte-132ecgz{width:1rem;height:1rem;margin:0;padding:0;border:none;border-radius:50%;background-color:var(--color)}button.svelte-132ecgz:active{background-color:var(--color)}button.selected.svelte-132ecgz{outline:2px solid var(--outerBorderColor);outline-offset:2px}button.clickable.svelte-132ecgz{cursor:pointer}button.empty.svelte-132ecgz{border:#aaa solid 1px;background:linear-gradient(to top left, #00000000 calc(50% - 1px), #aaa 50% 50%, #00000000 calc(50% + 1px))}");class yt extends ft{constructor(t){super(),dt(this,t,_t,gt,s,{color:0,selected:1,disabled:2,emptyAriaLabel:3});}}function $t(t){let e,n,o,r,i,s,a,c,u,d,f,p,h;function m(e){t[7](e);}let v={"data-testid":"__palette-input-slot__",role:"presentation",tabindex:"-1",disabled:!0};return void 0!==t[0]&&(v.color=t[0]),n=new yt({props:v}),P.push((()=>function(t,e,n){const o=t.$$.props[e];void 0!==o&&(t.$$.bound[o]=n,n(t.$$.ctx[o]));}(n,"color",m))),{c(){e=E("form"),st(n.$$.fragment),r=T(),i=E("input"),s=T(),a=E("button"),c=A("svg"),u=A("polygon"),N(i,"data-testid","__palette-input-input__"),N(i,"type","text"),i.value=t[0],N(i,"aria-label",t[1]),N(i,"title",t[2]),N(i,"class","svelte-126m9ns"),N(u,"points","13,7 9,7 9,3 7,3 7,7 3,7 3,9 7,9 7,13 9,13 9,9 13,9"),N(u,"class","svelte-126m9ns"),N(c,"x","0px"),N(c,"y","0px"),N(c,"width","100%"),N(c,"height","100%"),N(c,"viewBox","0 0 16 16"),N(c,"role","presentation"),N(c,"class","svelte-126m9ns"),N(a,"data-testid","__palette-input-submit__"),N(a,"type","submit"),a.disabled=d=!t[4],N(a,"aria-label",t[3]),N(a,"class","svelte-126m9ns"),N(e,"data-testid","__palette-input-root__"),N(e,"class","svelte-126m9ns");},m(o,l){x(o,e,l),at(n,e,null),$(e,r),$(e,i),$(e,s),$(e,a),$(a,c),$(c,u),f=!0,p||(h=[S(i,"input",D(t[5])),S(e,"submit",D(t[6]))],p=!0);},p(t,[e]){const r={};var l;!o&&1&e&&(o=!0,r.color=t[0],l=()=>o=!1,R.push(l)),n.$set(r),(!f||1&e&&i.value!==t[0])&&(i.value=t[0]),(!f||2&e)&&N(i,"aria-label",t[1]),(!f||4&e)&&N(i,"title",t[2]),(!f||16&e&&d!==(d=!t[4]))&&(a.disabled=d),(!f||8&e)&&N(a,"aria-label",t[3]);},i(t){f||(ot(n.$$.fragment,t),f=!0);},o(t){rt(n.$$.fragment,t),f=!1;},d(t){t&&w(e),ct(n),p=!1,l(h);}}}bt("form.svelte-126m9ns.svelte-126m9ns{display:flex;align-items:center;column-gap:0.5rem}input.svelte-126m9ns.svelte-126m9ns{max-width:6rem;height:2.2rem;margin:0;padding:0.5rem}button.svelte-126m9ns.svelte-126m9ns{min-width:2.2rem;height:2.2rem;margin:0;padding:0.5rem;border-color:#ccc}button.svelte-126m9ns.svelte-126m9ns:disabled{opacity:0.5}button.svelte-126m9ns.svelte-126m9ns:focus{border-color:#666}svg.svelte-126m9ns.svelte-126m9ns{width:1rem;height:1rem}svg.svelte-126m9ns polygon.svelte-126m9ns{fill:#ccc}button.svelte-126m9ns:focus svg polygon.svelte-126m9ns{fill:#666}");const xt=/^#?(([0-9a-f]{2}){3,4}|([0-9a-f]){3})$/gi;function wt(t,e,n){let o,{color:r=null}=e,{inputAriaLabel:l="Enter an hex color value"}=e,{inputTitle:i="The value must be a valid hex color"}=e,{buttonAriaLabel:s="Submit this hex color value"}=e;const a=V();return t.$$set=t=>{"color"in t&&n(0,r=t.color),"inputAriaLabel"in t&&n(1,l=t.inputAriaLabel),"inputTitle"in t&&n(2,i=t.inputTitle),"buttonAriaLabel"in t&&n(3,s=t.buttonAriaLabel);},t.$$.update=()=>{var e;1&t.$$.dirty&&n(0,r=r?.replace(xt,"#$1")||""),1&t.$$.dirty&&n(4,o=!!(e=r)&&xt.test(e));},[r,l,i,s,o,t=>{const{target:{value:e}}=t;n(0,r=e);},()=>{a("add",{color:r});},function(t){r=t,n(0,r);}]}class Et extends ft{constructor(t){super(),dt(this,t,wt,$t,s,{color:0,inputAriaLabel:1,inputTitle:2,buttonAriaLabel:3});}}var At=function(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,o=new Array(e);n<e;n++)o[n]=t[n];return o},Ct=function(t){if(Array.isArray(t))return At(t)},Tt=function(t,e){if(t){if("string"==typeof t)return At(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?At(t,e):void 0}},St=function(t){return Ct(t)||function(t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)}(t)||Tt(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()};function Dt(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o);}}var Nt=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t},kt=function(t){return 1===(null==t?void 0:t.nodeType)};function Lt(t,e){var n;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(n=function(t,e){if(t){if("string"==typeof t)return Ot(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return "Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Ot(t,e):void 0}}(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var o=0,r=function(){};return {s:r,n:function(){return o>=t.length?{done:!0}:{done:!1,value:t[o++]}},e:function(t){throw t},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var l,i=!0,s=!1;return {s:function(){n=t[Symbol.iterator]();},n:function(){var t=n.next();return i=t.done,t},e:function(t){s=!0,l=t;},f:function(){try{i||null==n.return||n.return();}finally{if(s)throw l}}}}function Ot(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,o=new Array(e);n<e;n++)o[n]=t[n];return o}var qt=function(){function t(){((function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}))(this,t),Nt(this,"_observer",null);}return function(t,e,n){e&&Dt(t.prototype,e),n&&Dt(t,n);}(t,[{key:"wait",value:function(e){var n=this,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},l=r.events,i=void 0===l?t.EVENTS:l,s=r.timeout,a=void 0===s?0:s,c=r.attributeFilter,u=void 0===c?void 0:c,d=r.onError,f=void 0===d?void 0:d;return this.clear(),new Promise((function(r,l){var s=kt(e)?e:document.querySelector(e);s&&i.includes(t.ADD)&&(o?o(s,t.ADD):r({node:s,event:t.ADD})),a>0&&(n._timeout=setTimeout((function(){n.clear();var t=new Error("[TIMEOUT]: Element ".concat(e," cannot be found after ").concat(a,"ms"));o?null==f||f(t):l(t);}),a)),n._observer=new MutationObserver((function(n){n.forEach((function(n){var l,s=n.type,a=n.target,c=n.addedNodes,u=n.removedNodes,d=n.attributeName,f=n.oldValue;if("childList"===s&&(i.includes(t.ADD)||i.includes(t.REMOVE))){var p,h=Lt([].concat(St(i.includes(t.ADD)?Array.from(c):[]),St(i.includes(t.REMOVE)?Array.from(u):[])));try{for(h.s();!(p=h.n()).done;){var m,v=p.value;(v===e||!kt(e)&&null!==(m=v.matches)&&void 0!==m&&m.call(v,e))&&(o?o(v,Array.from(c).includes(v)?t.ADD:t.REMOVE):r({node:v,event:Array.from(c).includes(v)?t.ADD:t.REMOVE}));}}catch(t){h.e(t);}finally{h.f();}}"attributes"===s&&i.includes(t.CHANGE)&&(a===e||!kt(e)&&null!==(l=a.matches)&&void 0!==l&&l.call(a,e))&&(o?o(a,t.CHANGE,{attributeName:d,oldValue:f}):r({node:a,event:t.CHANGE,options:{attributeName:d,oldValue:f}}));}));})),n._observer.observe(document.documentElement,{subtree:!0,childList:i.includes(t.ADD)||i.includes(t.REMOVE),attributes:i.includes(t.CHANGE),attributeOldValue:i.includes(t.CHANGE),attributeFilter:u});}))}},{key:"clear",value:function(){var t;null===(t=this._observer)||void 0===t||t.disconnect(),clearTimeout(this._timeout);}}]),t}();Nt(qt,"ADD","DOMObserver_add"),Nt(qt,"REMOVE","DOMObserver_remove"),Nt(qt,"CHANGE","DOMObserver_change"),Nt(qt,"EVENTS",[qt.ADD,qt.REMOVE,qt.CHANGE]);bt('.__tooltip__default {\n    position: absolute;\n    z-index: 9999;\n    max-width: 120px;\n    background-color: black;\n    color: #fff;\n    text-align: center;\n    border-radius: 6px;\n    padding: 0.5rem;\n}\n\n.__tooltip__default::after {\n    content: "";\n    position: absolute;\n    top: 100%;\n    left: 50%;\n    margin-left: -5px;\n    border-width: 5px;\n    border-style: solid;\n    border-color: black transparent transparent transparent;\n}');const Mt=(t,{contentSelector:e,contentClone:n,contentActions:o,contentClassName:r,disabled:l})=>{zt.init(e,n);const i=new zt(t,o,r);return l&&i.disable(),{update:({contentSelector:t,contentClone:e,contentActions:n,contentClassName:o,disabled:r})=>{zt.update(t,e),i.update(n,o),r?i.disable():i.enable();},destroy:()=>{i.destroy();}}};class zt{static#t=!1;static#e=null;static#n=null;static#o=null;static#r=[];#l=null;#i=null;#s=null;#a=[];#c=null;#u=null;constructor(t,e,n){this.#l=t,this.#i=e,this.#s=zt.#n,this.#d=n,this.#f(),zt.#r.push(this);}static init(t,e=!1){zt.#t||(zt.#n=document.createElement("div"),zt.#e=new qt,zt.#e.wait(t,null,{events:[qt.ADD]}).then((({node:t})=>{const n=e?t.cloneNode(!0):t;zt.#n.appendChild(n);})),zt.#o=t,zt.#t=!0);}static update(t,e=!1){zt.#t&&t!==zt.#o&&(zt.#o=t,zt.#e.wait(t,null,{events:[qt.ADD]}).then((({node:t})=>{zt.#n.innerHTML="";const n=e?t.cloneNode(!0):t;zt.#n.appendChild(n);})));}static destroy(){var t,e;zt.#r.forEach((t=>{t.destroy();})),zt.#r=[],null===(t=zt.#n)||void 0===t||null===(e=t.parentNode)||void 0===e||e.removeChild(zt.#n),zt.#n=null,zt.#o=null,zt.#e.clear(),zt.#t=!1;}get#d(){var t;return null===(t=this.#s)||void 0===t?void 0:t.getAttribute("class")}set#d(t){var e;null===(e=this.#s)||void 0===e||e.setAttribute("class",t||"__tooltip__default");}update(t,e){this.#i=t,this.#d=e;}destroy(){this.#p(),this.#h();}enable(){this.#c=this.#m.bind(this),this.#u=this.#v.bind(this),this.#l.addEventListener("mouseenter",this.#c),this.#l.addEventListener("mouseleave",this.#u);}disable(){this.#l.removeEventListener("mouseenter",this.#c),this.#l.removeEventListener("mouseleave",this.#u),this.#c=null,this.#u=null;}#f(){this.#l.title="",this.#l.setAttribute("style","position: relative"),this.enable();}#p(){this.disable();}#b(){this.#l.appendChild(this.#s),this.#i&&Object.entries(this.#i).forEach((([t,{eventType:e,callback:n,callbackParams:o}])=>{const r="*"===t?this.#s:this.#s.querySelector(t);if(r){const t=t=>null==n?void 0:n.apply(null,[...o,t]);r.addEventListener(e,t),this.#a.push({trigger:r,eventType:e,listener:t});}}));}#h(){this.#l.contains(this.#s)&&this.#l.removeChild(this.#s),this.#a.forEach((({trigger:t,eventType:e,listener:n})=>t.removeEventListener(e,n))),this.#a=[];}#m(){this.#b(),zt.#e.wait(`.${this.#d}`,null,{events:[qt.ADD]}).then((({node:t})=>{const{width:e}=this.#l.getBoundingClientRect(),{width:n,height:o}=this.#s.getBoundingClientRect();this.#s.style.left=(-(n-e)>>1)+"px",this.#s.style.top=-o-6+"px";}));}#v(){this.#h();}}bt(".svelte-1h7x9i6.svelte-1h7x9i6{box-sizing:border-box}.palette__root.svelte-1h7x9i6.svelte-1h7x9i6{display:flex;flex-direction:column;row-gap:1rem;align-items:center;min-width:10rem;padding:2rem;background-color:#fafafa}.palette__list.svelte-1h7x9i6.svelte-1h7x9i6{--numCols:4;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(var(--numCols), 1fr);grid-gap:1rem;align-items:center;justify-items:center}.palette__divider.svelte-1h7x9i6.svelte-1h7x9i6{border:none;background-color:#ccc;width:100%;height:1px}.tooltip__button.svelte-1h7x9i6.svelte-1h7x9i6{cursor:pointer;margin:0;padding:0;background:none;border:none}.tooltip__button.svelte-1h7x9i6 svg.svelte-1h7x9i6{width:1.5rem}.tooltip__button.svelte-1h7x9i6 svg path.svelte-1h7x9i6{fill:white}.tooltip__button.svelte-1h7x9i6.svelte-1h7x9i6:active{background:none}.tooltip__button.svelte-1h7x9i6:active svg path.svelte-1h7x9i6{fill:#aaaaaa}@media(min-width: 320px){.palette__list.svelte-1h7x9i6.svelte-1h7x9i6{--numCols:5}}");const Ht=t=>({}),jt=t=>({}),Vt=t=>({}),It=t=>({}),Pt=t=>({}),Bt=t=>({});function Rt(t,e,n){const o=t.slice();return o[19]=e[n],o[21]=n,o}const Ft=t=>({color:65&t}),Gt=t=>({color:t[19]}),Ut=t=>({}),Qt=t=>({}),Jt=t=>({}),Kt=t=>({}),Wt=t=>({}),Xt=t=>({});function Yt(t){let e,n;const o=t[14].header,r=a(o,t,t[13],Xt),l=t[14]["header-divider"],i=a(l,t,t[13],Kt),s=i||function(t){let e;return {c(){e=E("hr"),N(e,"class","palette__divider svelte-1h7x9i6");},m(t,n){x(t,e,n);},d(t){t&&w(e);}}}();return {c(){r&&r.c(),e=T(),s&&s.c();},m(t,o){r&&r.m(t,o),x(t,e,o),s&&s.m(t,o),n=!0;},p(t,e){r&&r.p&&(!n||8192&e)&&u(r,o,t,t[13],n?e:-1,Wt,Xt),i&&i.p&&(!n||8192&e)&&u(i,l,t,t[13],n?e:-1,Jt,Kt);},i(t){n||(ot(r,t),ot(s,t),n=!0);},o(t){rt(r,t),rt(s,t),n=!1;},d(t){r&&r.d(t),t&&w(e),s&&s.d(t);}}}function Zt(t){let e,n;const o=t[14]["transparent-slot"],r=a(o,t,t[13],Qt),l=r||function(t){let e,n;return e=new yt({props:{emptyAriaLabel:"transparent",selected:null===t[1]}}),e.$on("click",t[7]),{c(){st(e.$$.fragment);},m(t,o){at(e,t,o),n=!0;},p(t,n){const o={};2&n&&(o.selected=null===t[1]),e.$set(o);},i(t){n||(ot(e.$$.fragment,t),n=!0);},o(t){rt(e.$$.fragment,t),n=!1;},d(t){ct(e,t);}}}(t);return {c(){e=E("li"),l&&l.c(),N(e,"data-testid","__palette-row__"),N(e,"class","svelte-1h7x9i6");},m(t,o){x(t,e,o),l&&l.m(e,null),n=!0;},p(t,e){r?r.p&&(!n||8192&e)&&u(r,o,t,t[13],n?e:-1,Ut,Qt):l&&l.p&&(!n||2&e)&&l.p(t,n?e:-1);},i(t){n||(ot(l,t),n=!0);},o(t){rt(l,t),n=!1;},d(t){t&&w(e),l&&l.d(t);}}}function te(e){let n,o,r,l,s,c;const d=e[14].slot,f=a(d,e,e[13],Gt),p=f||function(t){let e,n;return e=new yt({props:{"data-testid":"__palette-slot__",color:t[19],selected:t[19]===t[1]}}),e.$on("click",t[7]),{c(){st(e.$$.fragment);},m(t,o){at(e,t,o),n=!0;},p(t,n){const o={};65&n&&(o.color=t[19]),67&n&&(o.selected=t[19]===t[1]),e.$set(o);},i(t){n||(ot(e.$$.fragment,t),n=!0);},o(t){rt(e.$$.fragment,t),n=!1;},d(t){ct(e,t);}}}(e);return {c(){n=E("li"),p&&p.c(),o=T(),N(n,"data-testid","__palette-row__"),N(n,"class","svelte-1h7x9i6");},m(a,u){var d;x(a,n,u),p&&p.m(n,null),$(n,o),l=!0,s||(d=r=Mt.call(null,n,{contentSelector:e[4]||".tooltip__button",contentClone:!!e[4],contentActions:{"*":{eventType:"click",callback:e[9],callbackParams:[e[21]]}},contentClassName:e[3],disabled:!e[2]}),c=d&&i(d.destroy)?d.destroy:t,s=!0);},p(t,n){e=t,f?f.p&&(!l||8257&n)&&u(f,d,e,e[13],l?n:-1,Ft,Gt):p&&p.p&&(!l||67&n)&&p.p(e,l?n:-1),r&&i(r.update)&&28&n&&r.update.call(null,{contentSelector:e[4]||".tooltip__button",contentClone:!!e[4],contentActions:{"*":{eventType:"click",callback:e[9],callbackParams:[e[21]]}},contentClassName:e[3],disabled:!e[2]});},i(t){l||(ot(p,t),l=!0);},o(t){rt(p,t),l=!1;},d(t){t&&w(n),p&&p.d(t),s=!1,c();}}}function ee(t){let e;const n=t[14].input,o=a(n,t,t[13],jt),r=o||function(t){let e,n;return e=new Et({props:{color:t[1]}}),e.$on("add",t[8]),{c(){st(e.$$.fragment);},m(t,o){at(e,t,o),n=!0;},p(t,n){const o={};2&n&&(o.color=t[1]),e.$set(o);},i(t){n||(ot(e.$$.fragment,t),n=!0);},o(t){rt(e.$$.fragment,t),n=!1;},d(t){ct(e,t);}}}(t);return {c(){r&&r.c();},m(t,n){r&&r.m(t,n),e=!0;},p(t,l){o?o.p&&(!e||8192&l)&&u(o,n,t,t[13],e?l:-1,Ht,jt):r&&r.p&&(!e||2&l)&&r.p(t,e?l:-1);},i(t){e||(ot(r,t),e=!0);},o(t){rt(r,t),e=!1;},d(t){r&&r.d(t);}}}function ne(t){let e;return {c(){e=E("button"),e.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -256 1792 1792" class="svelte-1h7x9i6"><g transform="matrix(1,0,0,-1,197.42373,1255.0508)" class="svelte-1h7x9i6"><path d="M 512,800 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 256,0 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 256,0 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z M 1152,76 v 948 H 256 V 76 Q 256,54 263,35.5 270,17 277.5,8.5 285,0 288,0 h 832 q 3,0 10.5,8.5 7.5,8.5 14.5,27 7,18.5 7,40.5 z M 480,1152 h 448 l -48,117 q -7,9 -17,11 H 546 q -10,-2 -17,-11 z m 928,-32 v -64 q 0,-14 -9,-23 -9,-9 -23,-9 h -96 V 76 q 0,-83 -47,-143.5 -47,-60.5 -113,-60.5 H 288 q -66,0 -113,58.5 Q 128,-11 128,72 v 952 H 32 q -14,0 -23,9 -9,9 -9,23 v 64 q 0,14 9,23 9,9 23,9 h 309 l 70,167 q 15,37 54,63 39,26 79,26 h 320 q 40,0 79,-26 39,-26 54,-63 l 70,-167 h 309 q 14,0 23,-9 9,-9 9,-23 z" class="svelte-1h7x9i6"></path></g></svg>',N(e,"data-testid","__palette-tooltip__"),N(e,"class","tooltip__button svelte-1h7x9i6");},m(t,n){x(t,e,n);},d(t){t&&w(e);}}}function oe(t){let e,n,o,r,l,i,s,c,d,f,h=t[11].header&&Yt(t),m=t[5]&&Zt(t),v=t[0].slice(0,t[0].length<t[6]||-1===t[6]?t[0].length:t[6]),b=[];for(let e=0;e<v.length;e+=1)b[e]=te(Rt(t,v,e));const g=t=>rt(b[t],1,1,(()=>{b[t]=null;})),_=t[14]["footer-divider"],y=a(_,t,t[13],Bt),A=y||function(t){let e;return {c(){e=E("hr"),N(e,"class","palette__divider svelte-1h7x9i6");},m(t,n){x(t,e,n);},d(t){t&&w(e);}}}(),S=t[14].footer,D=a(S,t,t[13],It),k=D||ee(t);let L=!t[4]&&ne();return {c(){e=E("section"),h&&h.c(),n=T(),o=E("ul"),m&&m.c(),r=T();for(let t=0;t<b.length;t+=1)b[t].c();l=T(),A&&A.c(),i=T(),k&&k.c(),c=T(),L&&L.c(),d=C(""),N(o,"class","palette__list svelte-1h7x9i6"),N(e,"class",s=p(vt([[!!t[10].class,t[10].class,"palette__root"]]))+" svelte-1h7x9i6");},m(t,s){x(t,e,s),h&&h.m(e,null),$(e,n),$(e,o),m&&m.m(o,null),$(o,r);for(let t=0;t<b.length;t+=1)b[t].m(o,null);$(e,l),A&&A.m(e,null),$(e,i),k&&k.m(e,null),x(t,c,s),L&&L.m(t,s),x(t,d,s),f=!0;},p(t,[l]){if(t[11].header?h?(h.p(t,l),2048&l&&ot(h,1)):(h=Yt(t),h.c(),ot(h,1),h.m(e,n)):h&&(et(),rt(h,1,1,(()=>{h=null;})),nt()),t[5]?m?(m.p(t,l),32&l&&ot(m,1)):(m=Zt(t),m.c(),ot(m,1),m.m(o,r)):m&&(et(),rt(m,1,1,(()=>{m=null;})),nt()),8927&l){let e;for(v=t[0].slice(0,t[0].length<t[6]||-1===t[6]?t[0].length:t[6]),e=0;e<v.length;e+=1){const n=Rt(t,v,e);b[e]?(b[e].p(n,l),ot(b[e],1)):(b[e]=te(n),b[e].c(),ot(b[e],1),b[e].m(o,null));}for(et(),e=v.length;e<b.length;e+=1)g(e);nt();}y&&y.p&&(!f||8192&l)&&u(y,_,t,t[13],f?l:-1,Pt,Bt),D?D.p&&(!f||8192&l)&&u(D,S,t,t[13],f?l:-1,Vt,It):k&&k.p&&(!f||8194&l)&&k.p(t,f?l:-1),(!f||1024&l&&s!==(s=p(vt([[!!t[10].class,t[10].class,"palette__root"]]))+" svelte-1h7x9i6"))&&N(e,"class",s),t[4]?L&&(L.d(1),L=null):L||(L=ne(),L.c(),L.m(d.parentNode,d));},i(t){if(!f){ot(h),ot(m);for(let t=0;t<v.length;t+=1)ot(b[t]);ot(A,t),ot(k,t),f=!0;}},o(t){rt(h),rt(m),b=b.filter(Boolean);for(let t=0;t<b.length;t+=1)rt(b[t]);rt(A,t),rt(k,t),f=!1;},d(t){t&&w(e),h&&h.d(),m&&m.d(),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e);}(b,t),A&&A.d(t),k&&k.d(t),t&&w(c),L&&L.d(t),t&&w(d);}}}function re(t,e,o){let{$$slots:r={},$$scope:l}=e;const i=function(t){const e={};for(const n in t)e[n]=!0;return e}(r);let{colors:s=[]}=e,{selectedColor:a=null}=e,{allowDuplicates:c=!1}=e,{allowDeletion:u=!1}=e,{tooltipClassName:f=null}=e,{tooltipContentSelector:p=null}=e,{showTransparentSlot:h=!1}=e,{maxColors:m=30}=e;const v=V();return t.$$set=t=>{o(10,e=n(n({},e),d(t))),"colors"in t&&o(0,s=t.colors),"selectedColor"in t&&o(1,a=t.selectedColor),"allowDuplicates"in t&&o(12,c=t.allowDuplicates),"allowDeletion"in t&&o(2,u=t.allowDeletion),"tooltipClassName"in t&&o(3,f=t.tooltipClassName),"tooltipContentSelector"in t&&o(4,p=t.tooltipContentSelector),"showTransparentSlot"in t&&o(5,h=t.showTransparentSlot),"maxColors"in t&&o(6,m=t.maxColors),"$$scope"in t&&o(13,l=t.$$scope);},e=d(e),[s,a,u,f,p,h,m,({detail:{color:t}})=>(t=>{o(1,a=t),v("select",{color:t});})(t),({detail:{color:t}})=>(t=>o(0,s=c||!s.includes(t)?[...s.slice(0,s.length<m||-1===m?s.length:m-1),t]:s))(t),t=>(t=>o(0,s=s.filter(((e,n)=>n!==t))))(t),e,i,c,l,r]}exports.Palette=class extends ft{constructor(t){super(),dt(this,t,re,oe,s,{colors:0,selectedColor:1,allowDuplicates:12,allowDeletion:2,tooltipClassName:3,tooltipContentSelector:4,showTransparentSlot:5,maxColors:6});}},exports.PaletteInput=Et,exports.PaletteSlot=yt;

    });

    /* src\App.svelte generated by Svelte v3.44.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let palette;
    	let t0;
    	let div0;
    	let form;
    	let fieldset0;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let fieldset1;
    	let label1;
    	let t3;
    	let input1;
    	let t4;
    	let fieldset2;
    	let label2;
    	let t5;
    	let input2;
    	let t6;
    	let fieldset3;
    	let label3;
    	let t7;
    	let input3;
    	let t8;
    	let fieldset4;
    	let label4;
    	let t9;
    	let input4;
    	let t10;
    	let fieldset5;
    	let label5;
    	let t11;
    	let button;
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
    	let current;
    	let mounted;
    	let dispose;

    	palette = new dist.Palette({
    			props: {
    				colors: /*colors*/ ctx[9],
    				selectedColor: /*preselectColor*/ ctx[1] ? /*bgColor*/ ctx[0] : null,
    				allowDuplicates: /*allowDuplicates*/ ctx[2],
    				allowDeletion: /*allowDeletion*/ ctx[3],
    				tooltipClassName: /*useCustomTooltipClass*/ ctx[4] ? 'tooltip' : null,
    				tooltipContentSelector: /*useCustomTooltipContent*/ ctx[5]
    				? '.palette__tooltip__button'
    				: null,
    				showTransparentSlot: /*showTransparentSlot*/ ctx[6],
    				maxColors: /*maxColors*/ ctx[7],
    				class: /*useCustomClass*/ ctx[8] ? 'palette' : null
    			},
    			$$inline: true
    		});

    	palette.$on("select", /*select_handler*/ ctx[10]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			create_component(palette.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			form = element("form");
    			fieldset0 = element("fieldset");
    			label0 = element("label");
    			t1 = text("Preselect color:\r\n                        ");
    			input0 = element("input");
    			t2 = space();
    			fieldset1 = element("fieldset");
    			label1 = element("label");
    			t3 = text("Use Custom Class:\r\n                        ");
    			input1 = element("input");
    			t4 = space();
    			fieldset2 = element("fieldset");
    			label2 = element("label");
    			t5 = text("Allow Duplicates:\r\n                        ");
    			input2 = element("input");
    			t6 = space();
    			fieldset3 = element("fieldset");
    			label3 = element("label");
    			t7 = text("Allow Deletion:\r\n                        ");
    			input3 = element("input");
    			t8 = space();
    			fieldset4 = element("fieldset");
    			label4 = element("label");
    			t9 = text("Use Custom Tooltip Class:\r\n                        ");
    			input4 = element("input");
    			t10 = space();
    			fieldset5 = element("fieldset");
    			label5 = element("label");
    			t11 = text("Use Custom Tooltip Content:\r\n                        ");
    			button = element("button");
    			button.textContent = "Delete";
    			t13 = space();
    			input5 = element("input");
    			t14 = space();
    			fieldset6 = element("fieldset");
    			label6 = element("label");
    			t15 = text("Show Transparent Slot:\r\n                        ");
    			input6 = element("input");
    			t16 = space();
    			fieldset7 = element("fieldset");
    			label7 = element("label");
    			t17 = text("Max colors:\r\n                        ");
    			input7 = element("input");
    			attr_dev(input0, "type", "checkbox");
    			attr_dev(input0, "class", "svelte-1f3c8sx");
    			add_location(input0, file, 56, 24, 1525);
    			attr_dev(label0, "class", "svelte-1f3c8sx");
    			add_location(label0, file, 54, 20, 1450);
    			attr_dev(fieldset0, "class", "svelte-1f3c8sx");
    			add_location(fieldset0, file, 53, 16, 1418);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "class", "svelte-1f3c8sx");
    			add_location(input1, file, 62, 24, 1764);
    			attr_dev(label1, "class", "svelte-1f3c8sx");
    			add_location(label1, file, 60, 20, 1688);
    			attr_dev(fieldset1, "class", "svelte-1f3c8sx");
    			add_location(fieldset1, file, 59, 16, 1656);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "svelte-1f3c8sx");
    			add_location(input2, file, 68, 24, 2003);
    			attr_dev(label2, "class", "svelte-1f3c8sx");
    			add_location(label2, file, 66, 20, 1927);
    			attr_dev(fieldset2, "class", "svelte-1f3c8sx");
    			add_location(fieldset2, file, 65, 16, 1895);
    			attr_dev(input3, "type", "checkbox");
    			attr_dev(input3, "class", "svelte-1f3c8sx");
    			add_location(input3, file, 74, 24, 2241);
    			attr_dev(label3, "class", "svelte-1f3c8sx");
    			add_location(label3, file, 72, 20, 2167);
    			attr_dev(fieldset3, "class", "svelte-1f3c8sx");
    			add_location(fieldset3, file, 71, 16, 2135);
    			attr_dev(input4, "type", "checkbox");
    			attr_dev(input4, "class", "svelte-1f3c8sx");
    			add_location(input4, file, 80, 24, 2487);
    			attr_dev(label4, "class", "svelte-1f3c8sx");
    			add_location(label4, file, 78, 20, 2403);
    			attr_dev(fieldset4, "class", "svelte-1f3c8sx");
    			add_location(fieldset4, file, 77, 16, 2371);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "palette__tooltip__button svelte-1f3c8sx");
    			add_location(button, file, 86, 24, 2743);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "class", "svelte-1f3c8sx");
    			add_location(input5, file, 87, 24, 2839);
    			attr_dev(label5, "class", "svelte-1f3c8sx");
    			add_location(label5, file, 84, 20, 2657);
    			attr_dev(fieldset5, "class", "svelte-1f3c8sx");
    			add_location(fieldset5, file, 83, 16, 2625);
    			attr_dev(input6, "type", "checkbox");
    			attr_dev(input6, "class", "svelte-1f3c8sx");
    			add_location(input6, file, 93, 24, 3092);
    			attr_dev(label6, "class", "svelte-1f3c8sx");
    			add_location(label6, file, 91, 20, 3011);
    			attr_dev(fieldset6, "class", "svelte-1f3c8sx");
    			add_location(fieldset6, file, 90, 16, 2979);
    			attr_dev(input7, "type", "number");
    			attr_dev(input7, "min", "1");
    			attr_dev(input7, "max", "30");
    			attr_dev(input7, "class", "svelte-1f3c8sx");
    			add_location(input7, file, 99, 24, 3330);
    			attr_dev(label7, "class", "svelte-1f3c8sx");
    			add_location(label7, file, 97, 20, 3260);
    			attr_dev(fieldset7, "class", "svelte-1f3c8sx");
    			add_location(fieldset7, file, 96, 16, 3228);
    			attr_dev(form, "class", "settings__form svelte-1f3c8sx");
    			add_location(form, file, 52, 12, 1371);
    			attr_dev(div0, "class", "settings__container svelte-1f3c8sx");
    			add_location(div0, file, 51, 8, 1324);
    			attr_dev(div1, "class", "container svelte-1f3c8sx");
    			add_location(div1, file, 38, 4, 721);
    			set_style(main, "--bgColor", /*bgColor*/ ctx[0]);
    			attr_dev(main, "class", "svelte-1f3c8sx");
    			add_location(main, file, 37, 0, 681);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			mount_component(palette, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, form);
    			append_dev(form, fieldset0);
    			append_dev(fieldset0, label0);
    			append_dev(label0, t1);
    			append_dev(label0, input0);
    			input0.checked = /*preselectColor*/ ctx[1];
    			append_dev(form, t2);
    			append_dev(form, fieldset1);
    			append_dev(fieldset1, label1);
    			append_dev(label1, t3);
    			append_dev(label1, input1);
    			input1.checked = /*useCustomClass*/ ctx[8];
    			append_dev(form, t4);
    			append_dev(form, fieldset2);
    			append_dev(fieldset2, label2);
    			append_dev(label2, t5);
    			append_dev(label2, input2);
    			input2.checked = /*allowDuplicates*/ ctx[2];
    			append_dev(form, t6);
    			append_dev(form, fieldset3);
    			append_dev(fieldset3, label3);
    			append_dev(label3, t7);
    			append_dev(label3, input3);
    			input3.checked = /*allowDeletion*/ ctx[3];
    			append_dev(form, t8);
    			append_dev(form, fieldset4);
    			append_dev(fieldset4, label4);
    			append_dev(label4, t9);
    			append_dev(label4, input4);
    			input4.checked = /*useCustomTooltipClass*/ ctx[4];
    			append_dev(form, t10);
    			append_dev(form, fieldset5);
    			append_dev(fieldset5, label5);
    			append_dev(label5, t11);
    			append_dev(label5, button);
    			append_dev(label5, t13);
    			append_dev(label5, input5);
    			input5.checked = /*useCustomTooltipContent*/ ctx[5];
    			append_dev(form, t14);
    			append_dev(form, fieldset6);
    			append_dev(fieldset6, label6);
    			append_dev(label6, t15);
    			append_dev(label6, input6);
    			input6.checked = /*showTransparentSlot*/ ctx[6];
    			append_dev(form, t16);
    			append_dev(form, fieldset7);
    			append_dev(fieldset7, label7);
    			append_dev(label7, t17);
    			append_dev(label7, input7);
    			set_input_value(input7, /*maxColors*/ ctx[7]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[11]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[12]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[13]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[14]),
    					listen_dev(input4, "change", /*input4_change_handler*/ ctx[15]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[16]),
    					listen_dev(input6, "change", /*input6_change_handler*/ ctx[17]),
    					listen_dev(input7, "input", /*input7_input_handler*/ ctx[18])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const palette_changes = {};
    			if (dirty & /*preselectColor, bgColor*/ 3) palette_changes.selectedColor = /*preselectColor*/ ctx[1] ? /*bgColor*/ ctx[0] : null;
    			if (dirty & /*allowDuplicates*/ 4) palette_changes.allowDuplicates = /*allowDuplicates*/ ctx[2];
    			if (dirty & /*allowDeletion*/ 8) palette_changes.allowDeletion = /*allowDeletion*/ ctx[3];
    			if (dirty & /*useCustomTooltipClass*/ 16) palette_changes.tooltipClassName = /*useCustomTooltipClass*/ ctx[4] ? 'tooltip' : null;

    			if (dirty & /*useCustomTooltipContent*/ 32) palette_changes.tooltipContentSelector = /*useCustomTooltipContent*/ ctx[5]
    			? '.palette__tooltip__button'
    			: null;

    			if (dirty & /*showTransparentSlot*/ 64) palette_changes.showTransparentSlot = /*showTransparentSlot*/ ctx[6];
    			if (dirty & /*maxColors*/ 128) palette_changes.maxColors = /*maxColors*/ ctx[7];
    			if (dirty & /*useCustomClass*/ 256) palette_changes.class = /*useCustomClass*/ ctx[8] ? 'palette' : null;
    			palette.$set(palette_changes);

    			if (dirty & /*preselectColor*/ 2) {
    				input0.checked = /*preselectColor*/ ctx[1];
    			}

    			if (dirty & /*useCustomClass*/ 256) {
    				input1.checked = /*useCustomClass*/ ctx[8];
    			}

    			if (dirty & /*allowDuplicates*/ 4) {
    				input2.checked = /*allowDuplicates*/ ctx[2];
    			}

    			if (dirty & /*allowDeletion*/ 8) {
    				input3.checked = /*allowDeletion*/ ctx[3];
    			}

    			if (dirty & /*useCustomTooltipClass*/ 16) {
    				input4.checked = /*useCustomTooltipClass*/ ctx[4];
    			}

    			if (dirty & /*useCustomTooltipContent*/ 32) {
    				input5.checked = /*useCustomTooltipContent*/ ctx[5];
    			}

    			if (dirty & /*showTransparentSlot*/ 64) {
    				input6.checked = /*showTransparentSlot*/ ctx[6];
    			}

    			if (dirty & /*maxColors*/ 128 && to_number(input7.value) !== /*maxColors*/ ctx[7]) {
    				set_input_value(input7, /*maxColors*/ ctx[7]);
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

    	let bgColor = colors[Math.round(Math.random() * (colors.length - 1))];
    	let preselectColor = true;
    	let allowDuplicates = true;
    	let allowDeletion = true;
    	let useCustomTooltipClass = false;
    	let useCustomTooltipContent = false;
    	let showTransparentSlot = true;
    	let maxColors = 20;
    	let useCustomClass = false;
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
    		$$invalidate(8, useCustomClass);
    	}

    	function input2_change_handler() {
    		allowDuplicates = this.checked;
    		$$invalidate(2, allowDuplicates);
    	}

    	function input3_change_handler() {
    		allowDeletion = this.checked;
    		$$invalidate(3, allowDeletion);
    	}

    	function input4_change_handler() {
    		useCustomTooltipClass = this.checked;
    		$$invalidate(4, useCustomTooltipClass);
    	}

    	function input5_change_handler() {
    		useCustomTooltipContent = this.checked;
    		$$invalidate(5, useCustomTooltipContent);
    	}

    	function input6_change_handler() {
    		showTransparentSlot = this.checked;
    		$$invalidate(6, showTransparentSlot);
    	}

    	function input7_input_handler() {
    		maxColors = to_number(this.value);
    		$$invalidate(7, maxColors);
    	}

    	$$self.$capture_state = () => ({
    		Palette: dist.Palette,
    		colors,
    		bgColor,
    		preselectColor,
    		allowDuplicates,
    		allowDeletion,
    		useCustomTooltipClass,
    		useCustomTooltipContent,
    		showTransparentSlot,
    		maxColors,
    		useCustomClass
    	});

    	$$self.$inject_state = $$props => {
    		if ('bgColor' in $$props) $$invalidate(0, bgColor = $$props.bgColor);
    		if ('preselectColor' in $$props) $$invalidate(1, preselectColor = $$props.preselectColor);
    		if ('allowDuplicates' in $$props) $$invalidate(2, allowDuplicates = $$props.allowDuplicates);
    		if ('allowDeletion' in $$props) $$invalidate(3, allowDeletion = $$props.allowDeletion);
    		if ('useCustomTooltipClass' in $$props) $$invalidate(4, useCustomTooltipClass = $$props.useCustomTooltipClass);
    		if ('useCustomTooltipContent' in $$props) $$invalidate(5, useCustomTooltipContent = $$props.useCustomTooltipContent);
    		if ('showTransparentSlot' in $$props) $$invalidate(6, showTransparentSlot = $$props.showTransparentSlot);
    		if ('maxColors' in $$props) $$invalidate(7, maxColors = $$props.maxColors);
    		if ('useCustomClass' in $$props) $$invalidate(8, useCustomClass = $$props.useCustomClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		bgColor,
    		preselectColor,
    		allowDuplicates,
    		allowDeletion,
    		useCustomTooltipClass,
    		useCustomTooltipContent,
    		showTransparentSlot,
    		maxColors,
    		useCustomClass,
    		colors,
    		select_handler,
    		input0_change_handler,
    		input1_change_handler,
    		input2_change_handler,
    		input3_change_handler,
    		input4_change_handler,
    		input5_change_handler,
    		input6_change_handler,
    		input7_input_handler
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
