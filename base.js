class StandardObject {
    constructor(store) {
        this.store = store || {}
    }

    get keys()    { return Object.keys(this.store) }
    get values()  { return Object.values(this.store) }
    get entries() { return Object.entries(this.store) }
    has(key)      { return this.store.hasOwnProperty(key) }
    reset() {
         this.store = {}
    }
}

function dreplace(s, dict, regexTemplate = '\\b(?:$1)\\b', flags = 'g') {
    let escape
    if (flags.includes('e')) {
        escape = true
        flags = flags.replace('e', '')
    }
    const regex = ncg(regexTemplate, dict, escape)
    function fix(x) {
        if (x.startsWith('\\')) return '\\' + x
        return x
    }
    const parser = hasCaptureGroup(regexTemplate) ? (_, x) => dict[fix(x)] : (x) => dict[fix(x)]
    return replace(regex, parser, s, flags)
}

function ncg(template, ref, escape) {

    if (template === '') template = '(?:$1)'

    if (!ref && isIterable(template)) {
        return '\\b(?:' + ncgRunner(template, escape) + ')\\b'
    }

    else if (!isPrimitive(ref) && ref[0] && !isPrimitive(ref[0])) {
        return templater(template, ref.map((el) => ncgRunner(el, escape)))
    }

    else {
        return templater(template, ncgRunner(ref, escape))
    }
}

function isIterable(x) {
    return isArray(x) || isObject(x)
}

function isArray(a) {
    return Array.isArray(a)
}

function isObject(x) {
    return type(x) == 'Object'
}

function type(x) {
    return search(/object (\w+)/, Object.prototype.toString.call(x))
}

function search(regex, s, flags = '') {
    if (isString(regex)) regex = RegExp(regex, flags)

    const match = s.match(regex)
    return matchgetter(match)

}

function isString(s) {
    return typeof s === 'string'
}

function matchgetter(match) {
    return !match ? 
        null :
        match.length == 1 ?
        match[0] :
        match.length == 2 ?
        match[1] :
        match.slice(1)
}

function ncgRunner(ref, escape) {
    return escape ? prepareIterable(ref, 'keys').map(rescape).join('|') :
                    prepareIterable(ref, 'keys').join('|')
}

function prepareIterable(data, mode) {

    if (isNumber(data)) {
        return range(1, data)
    }
    if (isString(data)) {
        return [data]
    }
    if (isObject(data)) {
        if (mode == Array) mode == 'values'
        if (mode == Object) mode == 'entries'
        return Object[mode](data)
    }
    return data
}

function isNumber(s) {
    return typeof s == 'number' || test('^-?\\d+(?:\\.\\d+)?$', s)
}

function test(regex, s, flags = '') {
    return RegExp(regex, flags).test(s)
}

function range(...args) {
    let a
    let b
    let c
    if (!isPrimitive(args[args.length - 1])) {
        c = args.pop()
    }
    if (args.length == 1) {
        b = args[0]
        a = 1
    }
    else {
        ;[a, b] = args
    }

    if (isArray(b)) {
        b = b.length - 1
        a = 0
    }

    const store = []
    for (let i = a; i <= b ; i++) {
        if (c) {
            if (c.toString() == [].toString()) store.push([])
            else if (c.toString() == {}.toString()) store.push({})
        }
        else {
            store.push(i)
        }
    }
    return store
}

function isPrimitive(value) {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'symbol' ||
        typeof value === 'boolean'
    )
}

function rescape(s) {
    const rescapeRE = /[.\\[*+?()|^${}\[\]]/g
    return s.replace(rescapeRE, '\\$&')
}

function templater(s, ref) {
    if (!s.includes('$')) return s

    let regex = /\$(\w)/g
    if (isPrimitive(ref)) {
        ref = [ref]
    }
    else {
        regex = /\$(\w+)/g
    }

    return s.replace(regex, (_, x) => {
        return isArray(ref) ? ref[Number(x) - 1] : ref[x]
    })
}

function hasCaptureGroup(s) {
    return test(/[^\\]\((?!\?)/, s)
}

function replace(regex, replacement, s, flags = 'gm') {
    if (isString(regex)) regex = RegExp(regex, flags)
    return s.replace(regex, replacement)
}

function argsplit(s, ref, regex = '($1)(\\w+)') {
    let match = search(ncg(regex, ref), s)
    return match ? match : [null, null]
}



function coinflip(n = 0.5) {
    return Math.random() > 1 - n
}




function merge(...args) {
    let first = args[0]

    if (isObject(first)) {
        const store = {}
        for (let arg of args) {
            Object.assign(store, arg)
        }
        return store
    }

    if (isArray(first)) {
        const store = []
        for (let arg of args) {
            store.push(...arg)
        }
        return store
    }

    if (isString(first)) {
        if (first.includes('\n')) return args.join('\n')
        if (first.includes(' ')) return args.join(' ')
        return args.join('\n')
    }

    if (isNumber(first)) {
        return sum(args.map(Number))
    }
}


function getLast(arr, n = -1) {
    return arr[arr.length + n]
}







function tryval(s) {

    try {
        return {
            input: s,
            value: eval(s)
        }
    }

    catch(e) {
        return {
            input: s,
            error: e.toString()
        }
    }
}


function abbreviate(s) {
    let start = test(/[A-Z]/, s[0]) ? '' : s[0]
    let abrev = start + s.replace(/[\da-z]+/g, '').toLowerCase()
    return abrev
}

const catpics = [
  //'dancing.jpg',
  'fist on chin.jpg',
  'flying.jpg',
  'like a boss.jpg',
  'ocean sunset.jpg',
  'pose f.jpg',
]

function counted(regex, s, flags = 'g') {
    if (isString(s)) {
        if (isString(regex)) {
            regex = rescape(regex)
            if (isWord(regex)) regex = '\\b' + regex + '\\b'
            regex = RegExp(regex, flags)
        }

        const matches = s.match(regex)
        return matches ? matches.length : 0
    }
    else if (isArray(s)) {
        return s.filter(regex).length
    }
}


function hasMultipleVariables(s) {
    return counted(/\b[abcde]\b/g, s) > 1
}

function shuffle(arr) {
    const ref = Array.from(arr)
    let m = arr.length
    while (m) {
        let i = ~~(Math.random() * m--)
        let t = ref[m]
        ref[m] = ref[i]
        ref[i] = t
    }
    return ref
}

function isBoolean(x) {
    return x === true || x === false
}


class Clock {
    constructor(options) {
        this.increment = 1000
        this.speed = 1

        if (isObject(options)) {
            if (options.duration) this.duration = options.duration
            if (options.increment) this.increment = options.increment
            if (options.steps) this.increment = this.duration / options.steps
        }
        else {
            this.duration = options
        }
    }

    async start(duration) {
        if (duration) this.duration = duration
        if (this.duration <= 10) this.duration *= 1000

        this.count = 0
        this._stop = false
        await this.runner()
    }

    stop() {
        this._stop = true
    }

    pause() {
        this.stop()
    }

    async resume() {
        this._stop = false
        await this.runner()
    }

    runner() {

        if (this._onTick) this._onTick()

        return new Promise((resolve) => {
            const runner = () => {

                if (this.isDone()) {
                    clearTimeout(this.timerID)
                    if (this._onFinish) this._onFinish()
                    resolve()
                }

                else {
                    this.count += this.increment
                    this.timerID = setTimeout(() => {
                        if (this._onTick) this._onTick()
                        runner()
                    }, Math.floor(this.increment / this.speed))
                }
            }

            runner()
        })
    }

    at(n, fn) {
        let current = this._onTick
        this._onTick = () => this.count == n * this.increment ? this.handle(fn()) : current()
    }

    set onTick(fn) {
        this._onTick = () => this.handle(fn(this.timeLeft, this.count, this.duration))
    }

    set onFinish(fn) {
        this._onFinish = () => fn(this.timeLeft, this.count, this.duration)
    }

    isDone() { return this.count >= this.duration || this._stop }
    get timeLeft() { 
        //console.log(this.duration)
        //console.log(this.count)
        //console.log(this.increment)
        return Math.round((this.duration - this.count) / this.increment) 
    }

    handle(result) {
        if (result === true) this._stop = true
        else if (isNumber(result)) this.duration += result
    }
}


function isFirst(key, state = $$) {
    if (!state[key]) {
        state[key] = true
        return true
    }
    return false
}

function coerceError(arg) {
    if (!exists(arg)) throw new Error('coercing error')
}

function toArgument(s) {
    s = s.trim()

    if (isNumber(s)) return Number(s)
    if (s == 'false') return false
    if (s == 'true') return true
    if (s == 'null') return null
    if (s == 'Number') return Number
    if (s == 'String') return String 
    return s
}

function randomPick(items) {
    if(!isArray(items)) return items
    return items[Math.floor(Math.random() * items.length)]
}

function isWord(s) {
    return test(/^[a-zA-Z]+$/, s)
}

function createConfig(s) {
    if (isWord(s)) return s
    if (s == '') return s
    const regex = /(.*?) *[:=] *(.*?)(?:$|, ?|  )/g
    return reduce(findall(regex, s), (k,v) => [k.trim(), v ? toArgument(v) : true])
}

function isPromise(x) {
    return x.constructor.name == 'Promise'
}

function getExtension(file) {
    return search(/\.(\w+)$/, file)
}

function rng(min = 2, max = 10, negative = null, boundary = null) {
    if (isFunction(min)) {
        while (true) {
            let n = negative ? rng(max, negative) : rng()
            if (min(n)) return n
        }
    }

    if (isArray(min)) {
        return randomPick(min)
    }

    min = Math.ceil(min)
    max = Math.floor(max)
    let value = Math.floor(Math.random() * (max - min + 1)) + min
    if (negative) value = Math.abs(value) * -1
    if (boundary) value = roundToNearest(value, boundary) + boundary
    return value
}

function sorted(items, fn, reverse = false) {

    const defaultObjectSort = (s) => s[1]
    const defaultNumberSort = (s) => s

    if (items.store) {
        items = Object.entries(items.store) 
    } else if (isObject(items)) {
        items = Object.entries(items)
    }
    
    if (!fn) fn = isDoubleIterable(items) ? 
        defaultObjectSort : 
        isNumber(items[0]) ?
        defaultNumberSort :
        char2n

    function runner(a, b) {
        if (reverse) return Number(fn(b)) - Number(fn(a))
        return Number(fn(a)) - Number(fn(b))
    }

    items.sort(runner)
    return items
}

function isDoubleIterable(items) {
    return isObject(items) || isNestedArray(items)
}

function isNestedArray(x) {
    return isArray(x) && isArray(x[0])
}

function char2n(ch) {
    return ch.toLowerCase().charCodeAt(0) - 97
}

function datestamp(date) {
    const [m, d, y] = getMDY(date)
    return m.toString().padStart(2, 0) + '-' + d.toString().padStart(2, 0) + '-' + y
}

function getMDY(date) {
    if (!date) date = new Date()
    else if (isString(date)) {
        date = new Date(date)
    }
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return [month, day, year]
}

function newlineIndent(s, n) {
    return '\n' + indent(isArray(s) ? s.join('\n') : s, n) + '\n'
}

function indent(s, n = 4) {
    return replace('^', toSpaces(n), s, 'gm')
}

function toSpaces(n = 4) {
    return isNumber(n) ? ' '.repeat(n) : n
}

function iterate(items, fn, ...args) {
    const store = []
    if (isNumber(items)) {
        items = range(1, items)
    }
    else {
        items = toArray(items)
    }

    for (let i = 0; i < items.length; i++) {
        store.push(fn(items[i], ...args))
    }
    return store
}

function toArray(val) {
  return isArray(val) ? val : [val]
}

function sortStorage() {
    return reduce(sorted(this.store, zoop(fn)), (k,v) => [k,v])
}
class Storage {
    constructor(mode = Array) { 
        this.store = {}; 
        this._mode = mode
    }
    delete(k)            { delete this.store[k] }
    get value()          { return this.store }
    get keys()           { return Object.keys(this.store) }
    get values()         { return Object.values(this.store) }
    get entries()         { return Object.entries(this.store) }
    get(k)               { return this.store[k] }
    set(k, v)            { this.store[k] = v; return v }
    has(k)               { return this.store.hasOwnProperty(k) }
    forEach(fn)          { return Object.entries(this.store).forEach(([k,v]) => fn(k,v)) }
    reset(k) {
        if (!k) { this.store = {}; return }

        switch (this._mode) {
            case Array: this.store[k] = []; break;
            case Number: this.store[k] = 0; break;
            case String: this.store[k] = ''; break;
            case Object: this.store[k] = {}; break;
            case null: this.store[k] = null; break;
        }
    }

    add(k, v) {
        if (k == null) return 

        switch (this._mode) {
            case Array:  this.addArray(k, v) ; break;
            case Object: this.addObject(k, v); break;
            case String: this.addString(k, v); break;
            case Number: return this.addNumber(k, v); break;
            default: this.set(k, v)          ; break;
        }

        return this.get(k)
    }

    addNumber(k, v) {
        v = v == null ? 1 : Number(v)
        return this.store[k] ? (this.store[k] += v) : (this.store[k] = v)
    }

    addString(k, v, delimiter = '') {
        this.store[k] ? (this.store[k] += delimiter + v) : (this.store[k] = v)
    }

    addArray(k, v) {
        if (isArray(v))  {
            this.store[k]? this.store[k].push(...v) : this.store[k] = v
        } else {
            this.store[k]? this.store[k].push(v) : this.store[k] = [v]
        }
    }

    addObject(k, v) {
        this.store[k] ? 
            Object.assign(this.store[k], v) :
            this.store[k] = v
    }
}

function reduce(items, fn = (k,v) => [k,v]) {
   if (!exists(items)) return {}
   items = prepareIterable(items, 'entries')

   const store = {}
   const doublet = isDoubleIterable(items)


   for (let i = 0; i < items.length; i++) {
       const item = items[i]
       
       const value = doublet ? fn(...item, i) : fn(item, i)
       if (!exists(value)) continue
       if (isArray(value) && value.length == 2) {
          store[value[0]] = value[1]
       } else {
          if (doublet) store[item[0]] = value
          else {
              store[item] = value
          }
       }
   }
   return store
}

function exists(input) {
    if (input == null) return false
    if (isString(input)) return input.trim().length > 0
    if (isArray(input)) return input.filter(exists).length > 0
    if (isObject(input)) return Object.keys(input).length > 0
    return true
}

function remove(arr, index) {
    return arr.splice(index, 1)[0]
}

function modularIncrement(arr, item, increment = 1) {
    if (increment == '+') increment = 1
    else if (increment == '-') increment = -1

    if (isObject(arr)) {
        arr = Object.keys(arr)
    }

    if (!item) return arr[0]
    const i = arr.indexOf(item)
    if (i < 0) return arr[0]


    let newIndex

    if (i + increment < 0) {
        newIndex = arr.length - 1
    }
    else  {
        newIndex = (i + increment) % arr.length
    }
    
    const p = arr[newIndex]
    return p
}

function mreplace(regex, replacement, s, flags = 'g', singular = false) {
    if (arguments.length == 2) {
        replacement = ''
        s = arguments[1]
    }

    if (arguments.length == 3 && arguments[2] == true) {
        replacement = ''
        s = arguments[1]
        singular = arguments[2]
    }

    const store = []
    const sliceBy = hasCaptureGroup(regex) ? 1 : 0

    function parser(...args) {
        args = args.slice(sliceBy, -2).filter((x) => x != null)
        store.push(smallify(args))
        return isString(replacement) ? replacement : replacement(...args)
    }

    const text = replace(regex, parser, s.trim(), flags).replace(/^\n+/, '').trimEnd()
    if (singular) return [text, smallify(store)]
    return [text, store]
}

function smallify(x) {
    return x.length == 0 ?
        null :
        x.length == 1 ?
        x[0] :
        x
}

function sleep(delay = 3000) {
    if (delay < 100) delay *= 1000
    return new Promise((resolve) => setTimeout(resolve, delay))
}

function parens(s) {
    return '(' + s + ')'
}

function unique(a, b) {

    if (isNestedArray(a)) {
        const seen = []
        const store = a.filter(x => {
            if (seen.includes(x[0])) return false
            seen.push(x[0])
            return true
        })
        return store
    }

    if (b) return a.filter((item) => !b.includes(item))
    return isArray(a) && a.length > 1 ? Array.from(new Set(a)) : a
}

function stringify(s) {
    return isPrimitive(s) ? s : JSON.stringify(s, null, 2)
}

function getStorage(key, placeholder = null) {
    return key in localStorage ? parseJSON(localStorage.getItem(key)) : placeholder
}

function parseJSON(s) {
    if (/^[\d/]+$/.test(s)) {
        return Number(s)
    } 
    return /^[{\[]/.test(s) ? JSON.parse(s) : s
}

function delta(a, b) {
    const p = Math.abs(a - b)
    console.log({'delta': p, a, b})
    return p
}

function splitonce(s, delimiter = '\\s') {
   if (isRegExp(delimiter)) delimiter = delimiter.source
   let regex = '^(.*?)' + delimiter + '([^]+)$'

   return search(regex, s) || [s, '']
}

function isRegExp(x) {
    return x.constructor.name == 'RegExp'
}

function pop(arr, key, fallback) {
    if (isObject(arr)) {
        let value = arr[key]
        delete arr[key]
        return value
    }

    if (isArray(arr)) {
        const index = isFunction(key) ? 
            arr.findIndex(key) : 
            isNumber(key) ? key : arr.indexOf(key)
        if (index < 0) {
            if (fallback) {
                return pop(arr, fallback)
            }
            else {
                return 
            }
        }
        else {
            return remove(arr, index)
        }
    }
}

function isFunction(x) {
    return typeof x === 'function'
}

function fill(arr, n) {
    while (arr.length <= n) {
        arr.push(null)
        counter()
    }
}

function counter(n) {
    if (typeof __count__ == 'undefined') __count__ = 0
    __count__++
    if (__count__ == 1000) throw ""
    if (n && __count__ == n) throw ""
    return __count__
}

function joined(arr) {
    if (arguments.length > 1) {
        arr = Array.from(arguments).filter(exists).map(String)
        if (test(/^[ .]$/, getLast(arr))) {
            delimiter = arr.pop()
            return arr.join(delimiter)
        }
    }

    let s = ''
    for (let item of arr) {
        s += item
        s += item.includes('\n') ? '\n\n' : '\n'
    }
    return s
}

function assign(obj, key, items) {
    if (obj[key] && items) Object.assign(obj[key], items)
    else if (items) obj[key] = items
}

function findall(regex, s, flags = 'g', filtered = false) {
    if (isString(regex)) regex = RegExp(regex, flags)

    let store = []
    let match
    s = s.trim()

    while (exists(match = regex.exec(s))) {
        if (match.length == 1) {
            store.push(match[0])
        }

        else if (filtered) {
            store.push(smallify(match.slice(1).filter(exists)))
        }
        else if (match.length == 2) {
            store.push(match[1])
        }
        else {
            store.push(match.slice(1))
        }
    }
    return store
}

function divify(tag, attrs, children) {
    if (tag == 'img' && isString(attrs)) return divify('img', {class: 'img', src: attrs}, '')


    if (children == null) {
        console.log(attrs)
        throw new Error("")
    }

    let s = toOpeningTag(tag, attrs)
    let indentation = 4

    if (isArray(children)) {
        s += newlineIndent(children.map(x => {
            if (isArray(x)) {
                return divify(x)
            }
            
            if (!x) {
                console.log(children)
                throw "ummmmmm not sure but x doesnt exist"
            }

            if (isObject(x)) {
                console.log(children)
                throw "ummmmmm not sure why its an object"
            }

            if (isNumber(x)) x = String(x)
                
            return x.includes('\n')  && !x.startsWith('<') ? newlineIndent(x) : x 
        }), indentation)
    }

    else if (isDefined(children)) {
        if (isNumber(children)) children = String(children)
        s += children.includes('\n') ? newlineIndent(children, indentation) : children
    }

    s += toClosingTag(tag)
    return s
}

function toOpeningTag(el, attrs = '', props = '') {
    if (el == 'html') return '<!doctype html><html>'
    
    if (attrs) {
        if (isString(attrs)) attrs = ' class=' + doublequote(attrs)
        else if (isObject(attrs)) {
            attrs = Object.entries(attrs).reduce((acc, [a,b]) => acc += ` ${a}="${b}"`, '')
        }
    }
    else {
        attrs = ''
    }

    if (props) attrs = ' ' + props

    const suffix = hasHtmlSuffix(el) ? '>' : '/>'
    return '<' + el + attrs + suffix
}

function doublequote(s) {
    return '"' + s + '"'
}

function hasHtmlSuffix(el) {
    const items = ['style', 'pre', 'script', 'body', 'ul', 'li', 'p', 'textarea', 'button', 'section', 'div', 'h1', 'h2', 'h3', 'main', 'blockquote', 'span', 'article', 'body', 'html']
    return items.includes(el)
}

function isDefined(x) {
    return x != null
}

function toClosingTag(el) {
    const noclosers = ['input', 'hr', 'br', 'link', 'img']
    if (noclosers.includes(el)) return ''
    return '</' + el + '>'
}

function toString(x) {
    if (isObject(x)) return JSON.stringify(x, null, 2)
    if (isArray(x)) joined(x)
    if (isRegExp(x)) return x.source
    return x.toString()
}

function split(s, regex = / +/) {
    if (isNumber(regex)) return [s.slice(0, regex), s.slice(regex)]
    return s.trim().split(regex)
}

function matchall(regex, s) {
    const match = s.match(regex, s)
    return match ? match : []
}

class AnimationState {
    constructor() {
        this.store = {}
        this.fill = 'forwards'
        this.easing = 'linear'
        this.iterations = 1
        this.delay = 0
        this.duration = 750
    }

    export() {
        return {
            animate: this.animate.bind(this),
        }
    }

    register(key, options) {
        this.store[key] = options 
    }

    animate(element, key) {
        const ref = this.store[key]
        
        element.style.background = 'white'
        const options = {
            fill: ref.fill ? 'forwards' : this.fill,
            duration: ref.duration || this.duration,
            delay: ref.delay || this.delay,
            iterations: ref.iterations || this.iterations,
            easing: this.easing,
        }

        let keyframes

        if (ref.background) {
            keyframes = [
                {offset: 0, background: 'red'},
                {offset: 1, background: ref.background}
            ]
            keyframes = [
                {offset: 1, background: ref.background},
            ],
            console.log(keyframes)
        }
        else {
            console.log(ref)
            throw "@animate not done yet"
        }
        
        return element.animate(keyframes, options).finished
    }

    get options() {
        return {
            duration: this.duration,
            fill: this.fill,
            delay: this.delay,
        }
    }
}

class GlobalState {
    constructor() {
        this.store = {}
    }

    export() {
        return {
            createVar: this.createVar.bind(this),
            incrementVar: this.incrementVar.bind(this),
            resetVar: this.resetVar.bind(this),
            getVar: this.getVar.bind(this),
            setVar: this.setVar.bind(this),
        }
    }
    getVar(key) {
        return this.store[key]
    }

    setVar(key, value) {
        if (!this.store.hasOwnProperty(key)) {
            this.store[key] = key.endsWith('s') ? [] : ''
        }

        if (isArray(this.store[key])) {
            this.store[key].push(value)
        }

        else {
            this.store[key] = value
        }
    }

    createVar(key, value) {
        if (!this.store.hasOwnProperty(key)) {
            this.store[key] = value || 0
        }
    }

    incrementVar(key) {
        this.createVar(key)
        this.store[key] += 1
        return this.store[key]
    }

    resetVar(key) {
        this.createVar(key)
        this.store[key] = 0
    }

}

function toCamelCase(s) {
    return s.replace(/-\w/g, (x) => x.slice(1).toUpperCase())
}

function modularIncrementFn(arr, index, fn) {

    index = arr.indexOf(index)

    for (let i = index; i < arr.length; i++) {
        let item = arr[i]
        if (fn(item)) return item
    }

    for (let i = 0; i < index; i++) {
        let item = arr[i]
        if (fn(item)) return item
    }

    return null
}

function randomColor() {
    return randomPick(['red', 'blue', 'green'])
}

function getNumbers(s) {
    const regex = /-?\d+\.?\d*/g
    const match = s.match(regex)
    return match ? match.map(Number) : []
}

function flat(arr) {
    const store = []
    for (let item of arr) {
        if (isArray(item)) store.push(...item)
        else store.push(item)
    }
    return store
}

function sum(items, fn) {
    return items.reduce((acc, item, i) => (acc += fn ? fn(item, i) : item), 0)
}

function isOdd(n) {
    return n % 2 == 1
}

function getOptions(s) {

     if (test(/:\w/, s)) {
         let [a,b] = mreplace(/:(\w+)/g, '', s)
         return [a, reduce(b, (x) => [x, true])]
     }

     if (test(/=/, s)) {
         let [a,b] = mreplace(/(\w+)=(\w+)/g, '', s)
         const p = [a, reduce(b, (k, v) => [k, v])]
         return p
     }

     else {
         let [a,b] = mreplace(/[;@](\w+)/g, '', s)
         return [a, reduce(b, (x) => [x, true])]
     }
}

function hasNumber(x) {
    return isString(x) && test(/\d/, x) || typeof x == 'number'
}

function len(x) {
    if (isNumber(x)) return x.toString().length
    return x.length || Object.keys(x).length || 0
}

function isTrue(x) {
    return x === true
}

function sortEach(storage, reverse) {
    storage.forEach((k, v) => {
        storage.store[k] = sorted(v, len, reverse)
    })
}

function stringCall(fn, ...args) {
    return fn + parens(args.join(', '))
}

function pipe(...a) {
    if (isArray(a[0])) a = a[0]
    if (isFunction(a)) {
        return a
    }
    return (...args) => a.filter(x => x).reduce((y, f) => isArray(y) ? f(...y) : f(y), args)
    return (x) => a.filter(x => x).reduce((y, f) => f(y), x)
}

function isClassObject(x) {
    return x && !isArray(x) && (typeof x == 'object')
}

function logged(...args) {
    console.log(args)
}

function forEach(items, fn, delayFn) {
    let index = 0
    let defaultDelay = 100
    let delay

    if (isNumber(delayFn)) {
        delay = delayFn
        delayFn = null
    }

    return new Promise(resolve => {
        function runner() {
            let isLast = index == items.length - 1
            let item = items[index]
            if (delayFn) delay = delayFn(item, defaultDelay, index, isLast) || defaultDelay
            let action = isLast ? resolve : runner
            let value = fn(item)
            index++

            if (isPromise(value)) {
                value.then(() => action())
            }

            else {
                setTimeout(action, delay)
            }
        }
        runner()
    })
}

function toggle(state, key, from, to, duration = 750) {
    if (arguments.length == 2) {
        if (isBoolean(state[key])) state[key] = !state[key]
        return 
    }

    if (arguments.length == 3) {
        if (isBoolean(state[key])) {
            from = state[key]
            to = !state[key]
            duration = arguments[2]
        }
        else {
            to = from
            from = state[key]
        }
    }

    state[key] = to
    setTimeout(() => {
        state[key] = from
    }, duration)
}

function isStandardHtml(s) {
    return htmlElements.includes(s)
}

const htmlElements = [
    'template',
    'transition',
    'transition-group',
    'style', 'script', 'body', 'ul', 'li', 'p', 'textarea', 'button', 'section', 'div', 'h1', 'h2', 'h3', 'main', 'blockquote', 'span', 'article', 'body', 'html',
    'button',
    'textarea',
    'slideshow',
    'td',
    'table',
    'tr',
    'td',
    'title',
    'input',
    'h1',
    'h2',
    'h3',
    'hr', 'br', 'link', 'img',
    'h4',
    'h5',
    'h6',
    'code',
    'pre',
    'img',
    'li',
    'ul',
    'p',
    'div',
    'h',
    'main',
    'section',
    'span',
    'a',
]

function isNode() {
    return typeof window === 'undefined' || window.isNodeWindow
}

function indexgetter(arr, index) {
    if (!index) return 0
    if (!isNumber(index)) index = arr.indexOf(index)
    return index
}

function insert(arr, item, index) {
    index = indexgetter(arr, index)
    arr.splice(index, 0, item)
    return arr
}

function getSpaces(s) {
    return search(/^ */, s) || ''
}

function dedent(s) {
    s = s.trimEnd().replace(/^\n+/, '')
    const spaces = getSpaces(s)
    return replace('^' + spaces, '', s)
}

function identity(...args) {
    return args.length == 1 ? args[0] : args
}

function trimmed(s) {
    if (s.trim().length == '') return s
    return s.trim()
}

function throwError(s) {
    throw new Error(s)
}

function inferlang(s) {
    const dict = {
        '<': 'html',
        'function': 'js',
        'def': 'py',
        '.': 'css',
    }

    let match = s.match(/^\.|<|function|def/)
    return dict[match] || 'js'
}

function aggregate(regex, s, fn = identity) {
    const storage = new Storage(Array)
    const matches = findall(regex, s)
    for (let [a, b] of matches) {
        console.log([a,b])
        const value = fn(b)
        storage.add(a, value)
    }
    return storage
}

function paired(list, mode = Array) {
    const store = mode == Object ? {} : []

    for (let i = 0; i < list.length - 1; i += 2) {
        if (mode == Object) store[list[i]] = list[i + 1]
        else {
            store.push([list[i], list[i + 1]])
        }
    }
    return store
}

function toDictionary(items) {
    if (!isNestedArray(items)) items = paired(items)
    return reduce(items, (k,v) => [k, v])
}

function isJson(x) {
    return x.endsWith('.json')
}

function typed(x) {
    return search(/object (\w+)/, Object.prototype.toString.call(x))
}

function splitmapfilter(s, regex, fn, ...args) {
    const runner = (x, i, arr) => fn(x, ...args, i)
    return s.trim().split(regex).filter(exists).map(runner).filter(exists)
}

function isClass(x) {
    if (!x) return false
    return isFunction(x) && test(/^class|^\[ *?native/i, x.toString())
}

function getFirstParameter(fn) {
    return search(/\((\w+)/, String(fn))
}

function itersearch(s, ...regexes) {
    for (let regex of regexes) {
        let flag = search(/\/(\w+)$/, regex.toString())
        let fn = flag && flag.includes('g') ? findall : search
        if (!s) return 
        s = fn(regex, s)
    }
    return s
}

function getParameters(s) {
    return itersearch(s, /\(([^]+?)\)/, /(?:\.\.\.)?(\w+)(?:,|$)/g) || []
}

function backspaced(s) {
    return s ? s.slice(0, -1) : ''
}

function isElement(s) {
    return s.constructor.name.startsWith('HTML')
}

function allEqual(arr) {
    return arr.every(x => x == arr[0])
}

function getFirst(x, mode) {
    if (isObject(x)) {
        return Object[mode](x)[0]
    }
    if (mode == String) {
        return search(/^\S+/, x)
    }
    if (isString(x)) {
        return search(/[\w-]+/, x)
    }

    if (isArray(x)) {
        return x[0]
    }
}

function hasComma(s) {
    return s.includes(',')
}

function toLiteralArray(s) {
    return s.slice(1, -1).split(',')
}

class Cache extends StandardObject {
    constructor() {
        super()
    }

    get(key, fallback) {
        if (!this.has(key)) {
            this.store[key] = isFunction(fallback) ? fallback() : fallback
        }
        return this.store[key]
    }

    set(key, value) {
        if (isObject(key)) {
            this.store = key
            // resetting the cache essentially
        }
        else {
            this.store[key] = value
            return value
        }
    }

}

class UniqueGenerator {
    constructor(items) {
        this.items = items
        this.index = 0
    }

    generate() {
        return this.items[this.index++]
    }

    reset() {
        this.items = shuffle(this.items)
        this.index = 0
    }
}

class UniqueStorage {
    constructor(condition) {
        this.condition = condition
        this.reset()
    }

    reset() {
        this.store = []
    }
    add(fn, ...args) {
        let value
        let count = 0
        if (this.store.length > 5) {
            this.reset()
        }
        while (++count < 50) {
            value = fn(...args)
            if (this.store.includes(value)) {
                continue
            }
            if (this.condition && !this.condition(value)) {
                console.log('failed condition', value)
                continue
            }
            this.store.push(value)
            return value
        }
        throw ""
    }
}

class Watcher {
    constructor(fn = identity) {
        this.fn = fn
        this.seen = []
    }
    isFresh(item) {
        let value = this.fn(item)
        if (this.seen.includes(value)) return false
        this.seen.push(value)
        return true
    }

}

class Indexed extends StandardObject {
    constructor(store = {}, modulus = false) {
        super(store)
        this.tracker = exists(store) ? reduce(store, (k, v) => [k, {index: 0, done: false}]) : {}
        this.done = {}
        this.key = this.keys[0]
        this.modulus = modulus
    }


    get(index) {
        return this.store[this.key][index]
    }

    get index() {
        return this.tracker[this.key].index
    }

    set index(val) {
        if (this.get(val)) {
            this.tracker[this.key].index = val
        }
        else {
            this.tracker[this.key].done = true
            const done = this.incrementKey(this.key)
            if (done) {
                this.finished = true
            }
        }
    }

    get value() {
        return this.store[this.key][this.index]
    }
    get length() {
        return this.store[this.key].length
    }

    incrementKey(key) {
        let count = 0
        while (count++ < this.keys.length) {
             key = modularIncrement(this.keys, key)
             if (this.tracker[key].done === false) {
                 this.key = key
                 return false
             }
        }
        return true
    }

    set(key) {
        this.key = key
    }

    isDone(key) {
        console.throw('in prog?')
        console.log([key, this.index], 'needs', this.length)
        const done = this.index == this.length
        if (done) {
            this.tracker[this.key].done = true
        }
        return done
    }
}



function toUpperCase(s) {
    return s.toUpperCase()
}

function hasEquals(s) {
    return test(/=/, s)
}

function hasVariableX(s) {
    return test(/x/, s)
}


function hasNaN(s) {
    return s.toString().includes('NaN')
}

function isNiceAnswer(n) {
    return n > 0 && isInteger(n) && n <= 10
}


function wordToNumber(s) {
    return numberWords.indexOf(s.toLowerCase())
}

function hasTerminatingDecimal(s) {
    return len(s) < 6 || isRepeatingDecimal(s)
}

function getprimefactors(n) {
    return getFactors(n).filter(isPrime)
}

function getdigits(x) {
    return String(x).split('').map(Number)
}

function numbersort(arr) {
    arr.sort((a,b) => (a - b))
    return arr
}



function notPrime(n) {
    return !isPrime(n)
}

function power10(n) {
    return Math.pow(10, n)
}

function getDecimalLength(n) {
    return search(/\.(.+)/, n).length || 0
}

function hasLetter(s) {
    return test(/[a-zA-Z]/, s)
}


function subtractALittle(n) {
    let offset = rng(0.25 * n, 0.75 * n)
    return [offset, n - offset]
}

function endsWithNumber(s) {
    return test(/\d+$/, s)
}

function depluralize(s) {
    if (!s.endsWith('s')) return s
    return s.plural(true)
}





















function getOperators(s) {
    return s.match(/[\+\-\*]/g)
}


function hasMathOperator(x) {
    return test(/[^*+-]/, x)
}

function isNegativeAnswer(s) {
    return String(s).trim().startsWith('-')
}

function isLatexOperator(s) {
    const r = /[\+\-\*]/
    return test(r, s)
}

function isLatexFraction(s) {
    return test('frac', s)
}

function isLatexExponent(s) {
    return /^\w+\^/.test(s)
}



function simplifyRatio(a,b) {
    let g = gcd(a,b)
    return [a,b].map(x => x/g)
}




function hasDecimal(x, n = 0) {
    return test('\\.' + '\\d'.repeat(n), String(x))
}

function isSquare(x) {
    return !hasDecimal(Math.sqrt(x))
}

function isCube(x) {
    return !hasDecimal(Math.cbrt(x))
}










function fractionToPercent(a, b) {
    return 100 * (a/b) + '%'
}


function hasWord(s) {
    return /[a-zA-Z]{3,}/.test(s)
}

function getWords(s, min = 2, max = 100) {
    const regex = RegExp(`[a-zA-Z]{${min},${max}}`, 'g')
    return s.match(regex)
}

function shared(a, b) {
    return a.filter(x => b.includes(x))
}



function copy(x) {
    return JSON.parse(JSON.stringify(x))
}


function getVariables(s) {
    return s.match(/[a-z]/g)
}


function hasVariable(s) {
    return test(/\b[abcde]\b/, s)
}

function isTerminating(a, b) {
    if (isPrime(b)) return false
    return true
}


function isInteger(n) {
   return Number.isInteger(Number(n))
}


function isPositive(n) {
    return n >= 0
}


function lcm(a, b) {
    return (a * b) / gcd(a, b);
}


function countDecimalPlaces(n) {
    return (n.toString().split('.')[1] || '').length
}

function divmod(n, d) {
    return [ Math.floor (n / d), Math.floor (n % d) ]
}


function toRatio(a, b) {
    return simplifyRatio(a,b).join(':')
}

function hasLookAround(s) {
    return test(/\(\?\</, s.toString())
}

function isPercentage(s) {
    return s.toString().endsWith('%')
}


function toInteger(x) {
    return Math.round(x)
}


function isCapitalized(s) {
    return /^[A-Z]/.test(s)
}


function zeroPad(x) {
    return String(x).length == 1 ? '0' + x : x
}

function changeDate(s, increment) {
   return s.replace(/-\d+/, (x) => '-' + zeroPad(Number(x.slice(1)) + increment))
}

function isYesterday(date) {
    return changeDate(datestamp(), -1) == date
}

function isToday(date) {
    return datestamp() == date
}


function isRepeatingDecimal(s) {
    s = s.toString()
    if (!s.includes('.')) return 
    const decimal = s.split('.')[1]
    return decimal[0] == decimal[1] == decimal[2] == decimal[5] == decimal[6]
}

function getFactors(number) {
    const factors = [];
    for (var i = 1; i <= number; i++) {
        if (number % i == 0) {
           factors.push(i)
        }
    }

    return factors
}

function gcd(a, b, ...args) {
    if (args.length > 0) {
        return [a, b, ...args].reduce((acc, item) => gcd(acc, item))
    }
    if (a == 0)
        return b;

    while (b != 0) {
        if (a > b)
            a = a - b;
        else {
            b = b - a;
        }
    }
    return a;
}

const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'
]

function autoAction(state, key, callback, options) {
    if (!options) options = {duration: 100, steps: 5}

    const clock = new Clock(options)

    clock.onTick = (timeLeft) => {
        //console.log('||', 'timeLeft' , timeLeft, '||')
        if (state.hasOwnProperty(key)) {
            return true
        }

        if (timeLeft == 0) {
            //console.log('auto-initialization commenced')
            callback(state)

            if (!state.hasOwnProperty(key)) {
                state[key] = 200
            }

            return true
        }
        if (timeLeft < 1) {
            throw new Error("yeah...rrrrerror")
        }
    }

    clock.start()
}



function hasHtmlSuffix(el) {
    const items = ['style', 'pre', 'script', 'body', 'ul', 'li', 'p', 'textarea', 'button', 'section', 'div', 'h1', 'h2', 'h3', 'main', 'blockquote', 'span', 'article', 'body', 'html', 'head']
    return items.includes(el)
}

