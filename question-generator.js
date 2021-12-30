
let __n = 2
var QuestionGenerator = (function() {

if (typeof window == 'undefined')  nerdamer = require("nerdamer/all.min")

function evaluated(s) {
    return nerdamer(s).evaluate().text()
}


function createError() {
    console.log('asdfasdfasdf')
    throw new Error("")
}

function coinflip(n = 0.5) {
    return Math.random() > 1 - n
}

const preparselib = {
    //multiplication: prepinfmult,
}

function prepinfmult(template, inf) {
     
}

const postparselib = {
    tens: (s) => lookbehindreplace(/= (\w+)/, toExponentialForm, s),
    exponents: (s) => lookbehindreplace(/= (\w+)/, toExponentialForm, s),
}

const floatingPointREGEX = '(?:.(?:' + [0,1,2,3,4,5,6,7,8,9].map((x) => x + '{' + 5 + ',}').join('|') + ')(?:\\d|e-\\d+)$)'
//console.log(floatingPointREGEX)
let globalDebug = true

const infusionRef = [
    [endsWithEquals, infusionEndsWithEquals],
    [hasVariableX, infusionHasX],
]

function endsWithEquals(s) {
    return s.endsWith('=')
}

function infusionEndsWithEquals(infusion) {
    infusion.populate()
    let s = infusion.s.replace(/ *=$/, '')
    //console.log(s)
    let answer = mathsolver(s)
    //console.log(answer)
    let numbers = getNumbers(s)
    let target = randomPick(numbers)
    let question = replace(target, 'x', s, 'g') + ' = ' + answer
    return {question, answer: target}
}

function infusionHasX(infusion) {
    if (!hasEquals(infusion.s)) infusion.s += ' = 0'
    infusion.populate()
    infusion.answer = nerdsolver(infusion.s)
    return infusion.value
}

class BaseGenerator {
    constructor(numbergen, watcher) {
        this.config = {
            level: 0,
            index: 0,
            finishOnHighNote: false,
        }
        this.numbergen = numbergen || new NumberGen() 
        this.watcher   = watcher   || new Watcher() 
    }

    generate(item, bypass) {
        let count = 0
        while (count++ < 20) {
            let value = this._generate(item)
            return value

            if (!this.validator(value, count, bypass)) {
                continue
            }
            
            if (!this.watcher.isFresh(value)) {
                continue
            }

            return value
        }

        // globalDebug
        this.watcher.reset()
        return this.generate(item, bypass)
    }

    validator(x, count, bypass) {

       if (count > 5 && bypass) {
           return true
       }

       if (this.config.onlyIntegerAnswers && isFraction(x.answer)) {
           return false
       }

       //if (this.config.onlyPositiveAnswers && parseInt(x.answer) <= 0) {
           //return false
       //}
       return true
    }

}

function lookbehindreplace(r, fn, s, flags = '') {
    const helper = (_, x, offset, original) => {
        const length = x.length
        const lookahead = original.slice(offset + _.length)
        const regex = RegExp(rescape(x) + '(?=$|' + lookahead.replace(/\n/g, '\\n') + ')')
        return _.replace(regex, fn(x))
    }

    return replace(r, helper, s, flags)
}


function rescape(s) {
    const rescapeRE = /[.\\[*+?()|^${}\[\]]/g
    return s.replace(rescapeRE, '\\$&')
}


function toLatex(s) {
    try {
        if (!(typeof nerdamer == 'undefined')) {
            return nerdamer.convertToLaTeX(s)
            let value = nerdamer.convertToLaTeX(s)
            return removeParens(value)
        }
        return toMath(s)
    }
    catch(e) {
        console.log('hi from error')
        console.log(e)
        consoleThrow()
        //return toMath(s)
    }


    const dict = {
        '*': '\\cdot',
        '?': '\\medspace ?',
    }
    return dreplace(s, dict, '(?:$1)', 'ge')

    //return s.replace(/\*/g, '\\cdot')


    //s = s.replace(/\^\w+/, (x) => x.replace(/\^/, '^{') + '}')
    //return s
}


function removeParens(s) {
    return s
    return s.replace(/\(|\)/g, '')
}


function conditionalAssign(to, from) {
    for (let [k, v] of Object.entries(from)) {
        if (to.hasOwnProperty(k) ) {
            to[k] = v
        }
    }
}


class Calculation {
    constructor() {
        this._symbols = {}
        this.defineOperator('!', this.factorial, 'postfix', 6)
        this.defineOperator('^', Math.pow, 'infix', 5, true)
        this.defineOperator('*', this.multiplication, 'infix', 4)
        this.defineOperator('/', this.division, 'infix', 4)
        this.defineOperator('+', this.last, 'prefix', 3)
        this.defineOperator('-', this.negation, 'prefix', 3)
        this.defineOperator('+', this.addition, 'infix', 2)
        this.defineOperator('-', this.subtraction, 'infix', 2)
        this.defineOperator(',', Array.of, 'infix', 1)
        this.defineOperator('(', this.last, 'prefix')
        this.defineOperator(')', null, 'postfix')
        this.defineOperator('min', Math.min)
        this.defineOperator('sqrt', Math.sqrt)
    }
    // Method allowing to extend an instance with more operators and functions:
    defineOperator(
        symbol,
        f,
        notation = 'func',
        precedence = 0,
        rightToLeft = false
    ) {
        // Store operators keyed by their symbol/name. Some symbols may represent
        // different usages: e.g. "-" can be unary or binary, so they are also
        // keyed by their notation (prefix, infix, postfix, func):
        if (notation === 'func') precedence = 0
        this._symbols[symbol] = Object.assign({}, this._symbols[symbol], {
            [notation]: {
                symbol,
                f,
                notation,
                precedence,
                rightToLeft,
                argCount: 1 + (notation === 'infix'),
            },
            symbol,
            regSymbol:
                symbol.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&') +
                (/\w$/.test(symbol) ? '\\b' : ''), // add a break if it's a name
        })
    }
    last(...a) {
        return a[a.length - 1]
    }
    negation(a) {
        return -a
    }
    addition(a, b) {
        return a + b
    }
    subtraction(a, b) {
        return a - b
    }
    multiplication(a, b) {
        return a * b
    }
    division(a, b) {
        return a / b
    }
    factorial(a) {
        if (a % 1 || !(+a >= 0)) return NaN
        if (a > 170) return Infinity
        let b = 1
        while (a > 1) b *= a--
        return b
    }
    static calc(s) {
        const calculator = new Calculation()
        return calculator.calculate(s)
    }

    static get(s) {
        const calculator = new Calculation()
        return calculator.calculate(s)
    }
    calculate(expression) {
        let match
        const values = [],
            operators = [this._symbols['('].prefix],
            exec = (_) => {
                let op = operators.pop()
                values.push(op.f(...[].concat(...values.splice(-op.argCount))))
                return op.precedence
            },
            error = (msg) => {
                let notation = match ? match.index : expression.length
                return `${msg} at ${notation}:\n${expression}\n${' '.repeat(
                    notation
                )}^`
            },
            pattern = new RegExp(
                // Pattern for numbers
                '\\d+(?:\\.\\d+)?|' +
                    // ...and patterns for individual operators/function names
                    Object.values(this._symbols)
                        // longer symbols should be listed first
                        .sort((a, b) => b.symbol.length - a.symbol.length)
                        .map((val) => val.regSymbol)
                        .join('|') +
                    '|(\\S)',
                'g'
            )
        let afterValue = false
        pattern.lastIndex = 0 // Reset regular expression object
        do {
            match = pattern.exec(expression)
            const [token, bad] = match || [')', undefined],
                notNumber = this._symbols[token],
                notNewValue = notNumber && !notNumber.prefix && !notNumber.func,
                notAfterValue =
                    !notNumber || (!notNumber.postfix && !notNumber.infix)
            // Check for syntax errors:
            if (bad || (afterValue ? notAfterValue : notNewValue))
                return error('Syntax error')
            if (afterValue) {
                // We either have an infix or postfix operator (they should be mutually exclusive)
                const curr = notNumber.postfix || notNumber.infix
                do {
                    const prev = operators[operators.length - 1]
                    if (
                        (curr.precedence - prev.precedence ||
                            prev.rightToLeft) > 0
                    )
                        break
                    // Apply previous operator, since it has precedence over current one
                } while (exec()) // Exit loop after executing an opening parenthesis or function
                afterValue = curr.notation === 'postfix'
                if (curr.symbol !== ')') {
                    operators.push(curr)
                    // Postfix always has precedence over any operator that follows after it
                    if (afterValue) exec()
                }
            } else if (notNumber) {
                // prefix operator or function
                operators.push(notNumber.prefix || notNumber.func)
                if (notNumber.func) {
                    // Require an opening parenthesis
                    match = pattern.exec(expression)
                    if (!match || match[0] !== '(')
                        return error('Function needs parentheses')
                }
            } else {
                // number
                values.push(+token)
                afterValue = true
            }
        } while (match && operators.length)
        return operators.length
            ? error('Missing closing parenthesis')
            : match
            ? error('Too many closing parentheses')
            : values.pop() // All done!
    }
}

function calculate(s) {
    let initial = eval(s)
    let value = fixFloatingPoint(initial)
    return value
}

const numberRef = {
    'pow2': [2, 4, 8],
    'pow64': [2, 4, 8, 16, 32, 64, 128],
    'pow3': [3, 9],
    pm: ['+', '-'],
    timesDivide: ['*', '/'],
}




function toMath(s) {
    const dictA = {
        'p': '+',
        't': '\\cdot',
        'm': '-',
        '=': '=',
    }

    const regex = / *[mpt=] *|e(-?[abcxyz\d]+)|sqrt(\w+)|([abcdxyz\d]\/[abcdxyz\d]+)/g
    return replace(regex, parser, s, 'g')

    function parser(x, exp, sqrt, frac) {
        x = x.trim()

        if (x in dictA) {
            return ' ' + dictA[x] + ' '
        }

        if (exp) {
            return '^{' + exp + '}'
        }

        if (sqrt) {
            return '\\sqrt{' + exp + '}'
        }

        if (frac) {
            let [a,b] = splitonce(frac, '/')
            return '\\frac{' + a + '}' + '{' + b + '}'
        }

    }
}

class QuestionGenerator {
    constructor() {
        this.count = 0
        this.tracker = {}
        this.NUMBER_RANGES = NUMBER_RANGES
        this.config = {
            latex: false
        }
    }

    setLevel(level, absolute = false) {
        if (absolute) {
            this.level = level
        }
        else {
            this.level += level
        }
    }

    load(student) {

        this.student = student || alanStudent
        this.indexed = new Indexed(this.student.templates)

        this.watcher = new Watcher(item => item.question || item.passage)
        this.numbergen = new NumberGen()

        const generators = {
            //'arithmetic': InfusionGenerator,
            //'exponents': InfusionGenerator,
            //'foobar': InfusionGenerator,
        }

        this.generators = this.indexed.keys.reduce((acc, key) => {

            const Generator = generators[key] || InfusionGenerator
            acc[key] = new Generator(this.numbergen, this.watcher)
            return acc

        }, {})

        this.setTopic()

        this.level = this.student.level     || 0
        this.index = this.student.lastIndex || 0
    }

    setTopic(topic) {
        this.topic = topic || getFirst(this.student.templates, 'keys')
        this.numbergen.config.topic = this.topic
        this.generator.config.topic = this.topic
        this.indexed.set(this.topic)
    }

    get generator() {
        return this.generators[this.topic]
    }

    setConfig(config) {
        Object.assign(this.numbergen.config, config)
        Object.assign(this.config, config)
        Object.assign(this.generator.config, config)
    }

    conditionalConfig(config) {
        conditionalAssign(this.numbergen.config, config)
        conditionalAssign(this.numbergen.storage.config, config)
        conditionalAssign(this.generator.config, config)
    }


    _postparse(value) {
        if (postparselib.hasOwnProperty(this.topic)) {
            //console.log('postparsing with lib')
            value.question = postparselib[this.topic](value.question, this)
        }
        //value.question = toLatex(value.question)
    }

    _preparse(template) {
        if (isFunction(template)) return template()
        if (coinflip(0.3) && test(/^\S+ \S \S+$/)) template = reverseMathString(template)
        template = template.replace(/[abcd\d][abcxyz]/g, (x) => x[0] + '*' + x[1])
        template = template.replace(/\$(\w+)/g, (_, key) => {
            return randomPick(numberRef[key])
        })
        return template.replace(/z+/g, (x) => '0'.repeat(rng(0, x.length + 1)))
    }

    getValue(template) {
        template = this._preparse(template)
        let value = this.generator.generate(template)
        this._postparse(value)

        if (!value.answer) {
            console.log('skipp template', template)
            this.index += 1
            return this.generate()
        }

        return value
    }

    generate() {
        this.count += 1
        this.numbergen.reset()
        return this.getValue(this.indexed.value)
    }

    get index() {
        return this.indexed.index
    }

    set index(val) {
        this.indexed.index = val
        this.topic = this.indexed.key
    }

    set level(level) {
        if (level < 0) level = 0
        this.numbergen.config.level = level
        this.generator.config.level = level
        this.config.level = level
    }


    get doneWithLevel() {
        return this.level == this.NUMBER_RANGES[this.topic].length - 1
    }

    get level() { 
        return this.config.level
    }

    reset(topic) {
        this.topic = topic || getFirst(this.student.templates, 'keys')
        this.level = this.student.level     || 0
        this.index = this.student.lastIndex || 0
    }

    // ------------------------------------------ 

    olddepincrementIndex(value = 1) {
        if (!value) return 
        this.index += value
        this.numbergen.config.level = this.student.level
    }

    oldincrementLevel(value = 1) {
        if (!value) return 
        this.level += value
        this.numbergen.config.level = this.level 
    }
    // ------------------------------------------ 

    get finished() {
        if (this.config.finishOnHighNote && this.streak != 3) {
            return false
        }
        if (this.count === this.config.questionLimit) {
            console.log('question limit reached')
            return true
        }
        if (this.indexed.finished) return true
    }

    get isDone() {
        return this.indexed.isDone
    }
}

function infusionDefault(infusion) {
    if (infusion.config.withVariables) infusion.withVariables()
    infusion.withNumbers()
    infusion.withEquals()
    return infusion.value
}

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




function getNumbers(s) {
    const regex = /-?\d+\.?\d*/g
    const match = s.match(regex)
    return match ? match.map(Number) : []
}






class Indexed extends StandardObject {
    constructor(store = {}, modulus = false) {
        super(store)
        this.tracker = exists(store) ? reduce(store, (k, v) => [k, {index: 0, done: false}]) : {}
        this.done = {}
        this.key = this.keys[0]
        this.modulus = modulus
    }


    get currentLength() {
        return this.store[this.key].length
    }

    get(index) {
        return this.store[this.key][index]
    }

    get index() {
        return this.tracker[this.key].index
    }

    set index(val) {
        /* marked */
        if (this.get(val)) {  // reached the end
            this.tracker[this.key].index = val
        }
        else {
            this.finished = true
            return 

            this.tracker[this.key].done = true
            const done = this.incrementKey(this.key)
            if (done) this.finished = true
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
        const done = this.index == this.length
        if (done) {
            this.tracker[this.key].done = true
        }
        return done
    }

}
function exists(input) {
    if (input == null) return false
    if (isString(input)) return input.trim().length > 0
    if (isArray(input)) return input.filter(exists).length > 0
    if (isObject(input)) return Object.keys(input).length > 0
    return true
}
function isString(s) {
    return typeof s === 'string'
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

    const match = s.toString().match(regex)
    return matchgetter(match)

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
function reduce(items, fn) {
   if (!items) return
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
    return typeof s == 'number' || test('^-?\\d+$', s)
}
function reverseMathString(s) {
    const items = s.split(' ')
    items.reverse()
    return items.join(' ')
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
function isDoubleIterable(items) {
    return isObject(items) || isNestedArray(items)
}
function isNestedArray(x) {
    return x[0] && isArray(x[0])
}
function modularIncrement(arr, item, increment = 1) {
    const i = arr.indexOf(item)
    return arr[(i + increment) % arr.length]
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
    reset() {
        this.seen = []
    }

}
function identity(s) {
    return s
}
class NumberGen {
    constructor() {
        this.config = {level: 1, uniqueNumbers: true}
        this.storage = new UniqueStorage()
        this.cache = new Cache()
        Object.assign(this.storage.config, this.config)
    }

    getCached(key, fn = 'getRandomNumber') {
        return this.cache.get(key, () => this[fn]())
    }
    getRandomElement() {
        const operations = [
            NumberGen.getFraction,
            NumberGen.getNumber,
            NumberGen.getPercentage,
        ]

        const operation = randomPick(operations)

        this.storage.condition = operation == NumberGen.getFraction ? 
            NumberGen.fractionCondition : null

        return this.storage.add(operation, this.config.level)
    }

    getRandomFraction() {
        return this.storage.add(NumberGen.getFraction, this.config.level)
    }

    getRandomNumber() {
        // there is no available number
        const value = this.storage.add(NumberGen.getNumber, this.config.topic, this.config.level)
        if (value == null) {
            console.log('hi')
            this.reset()
            return this.getRandomNumber()
        }

        return value
    }

    reset() {
        this.storage.reset()
        this.cache.reset()
        this.tempNumbers = []
    }

    static getNumber(topic, level) {
        const rangeRef = rangegetter(topic, level)
        if (isArray(rangeRef)) {
            return rng(...rangeRef)
        }

        if (isObject(rangeRef)) {
            const {decimals, range, fractions} = rangeRef
            if (decimals) return randomlyAddZeroes(rng(...range), decimals)
            if (fractions) return randomlyAddZeroes(rng(...range), decimals)
        }
    }

    static getFraction(level) {
        let range = rangegetter('fractions', level)
        const p = toFraction(...range)
        return p
    }

    static fractionCondition(x) {
        if (isArray(x)) return x[0] != x[1]
        if (isNumber(x)) return !isInteger(x)
        return true
    }
}
class UniqueStorage {
    constructor(condition) {
        this.condition = condition
        this.config = {uniqueNumbers: true}
        this.reset()
    }

    reset() {
        this.store = []
    }
    add(fn, ...args) {
        let value
        let count = 0

        if (this.store.length > 5) {
            createError()
            this.reset()
        }

        while (++count < 50) {
            value = fn(...args)
            if (value == null) {
                return createError()
            }

            if (isNumber(value) && this.config.uniqueNumbers && this.store.includes(value)) {
                continue
            }

            if (this.condition && !this.condition(value)) {
                continue
            }

            this.store.push(value)
            return value
        }
        return createError()
    }
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
function isFunction(x) {
    return typeof x === 'function'
}
function randomPick(items) {
    if(!isArray(items)) return items
    return items[Math.floor(Math.random() * items.length)]
}
function rangegetter(topic, level) {
    return NUMBER_RANGES[topic][level]
    let ref = isString(topic) ? NUMBER_RANGES[topic] : topic
    if (!ref) ref = NUMBER_RANGES.default

    const range = ref[level] == null ? ref[ref.length - 1] : ref[level]
    return range.length == 2 ? range : paired(range).map(x => rng(...x))
}


//numbera
function paired(list, mode = Array) {
    if (isOdd(list.length)) {
        throw 'odd list'
    }

    const store = mode == Object ? {} : []
    for (let i = 0; i < list.length - 1; i += 2) {
        if (mode == Object) store[list[i]] = list[i + 1]
        else {
            store.push([list[i], list[i + 1]])
        }
    }
    return store
}
function isOdd(n) {
    return n % 2 == 1
}
function rng(min = 1, max = 10) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min)
}
function rngadvanced(min = 2, max = 10, negative = null, boundary = null) {
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
function roundToNearest(n, boundary = 10) {
    return Math.ceil(n / boundary) * boundary
}
function toFraction(a, b, mode = String) {
    if (isArray(a)) {
        b = a[1]
        a = a[0]
    }
    return simplifyFraction(a, b)
    [a,b] = simplifyFraction(a, b)
    //console.log(a, b)
    if (b == 1) return a
    if (mode == Array) return [a, b]
    if (mode == String) return a + '/' + b
    return '\\frac' + '{' + a + '}' + '{' + b + '}'
}
function simplifyFraction(a,b) {
    if (!b) [a,b] = a.split('/')

    if (hasDecimal(a)) {let factor = Math.pow(10, countDecimalPlaces(a)); a *= factor; b *= factor}
    if (hasDecimal(b)) {let factor = Math.pow(10, countDecimalPlaces(b)); b *= factor; a *= factor}
    let g = gcd(a,b)
    //console.log(g)
    //console.log(a, b)
    const p = [a,b].map(x => x/g).join('/')
    //console.log(p)
    return p
}
function hasDecimal(x, n = 0) {
    return test('\\.' + '\\d'.repeat(n), String(x))
    // n is the number of decimal places to match.
}
function countDecimalPlaces(n) {
    return (n.toString().split('.')[1] || '').length
}
function gcd(a, b) {
    return !b ? a : gcd(b, a % b);
}
function isInteger(n) {
   return Number.isInteger(Number(n))
   return !isNaN(n) && parseInt(Number(n)) == n
}
class InfusionGenerator extends BaseGenerator {
    constructor(...args) {
        super(...args)
        Object.assign(this, StringMixins)
    }

    withNumbers() {

        const runnerA = (s) => {
            if (isFraction(s)) {
                return this.numbergen.getRandomFraction() 
            }

            if (s == 'n') {
                return NumberGen.getNumber(this.config.level)
            }

            if (this.config.useVariablesInAnswer && coinflip(0.35) && !this.numbergen.cache.has(s)) {
                return s.toUpperCase()
            }

            return this.numbergen.getCached(s)
        }

        const runnerB = (s) => this.config.addZerosOrDecimals ? 
            zeroify(s, rangegetter(this.config.addZerosOrDecimals, this.config.level)) : s

        this.replace(abcdeFractionRE, (s) => {
            let p = s.length == 1 ? runnerA(s) : identity(splitmapjoin(s, runnerA, '/', '/'))
            return runnerB(p)
        })

        console.log(this.s)
        //throw ""
        //unth 
        this.replace(/\$\{(.*?)\}/g, (_, x) => eval(x))
    }

    withVariables(letter = 'x') {
       if (test(letter, this.s)) return 
       const matches = this.s.match(abcdeRE)
       const match = randomPick(matches)
       this.replace(match, letter, 'g')
    }

    getAnswer(s) {
        if (this.config.topic == 'multiplication') return calculate(s)
        let answer = mathsolver(s)
        let value = this.config.asDecimal ? fixFloatingPoint(answer) : fractionize(answer)
        if (isInteger(value) && this.mode == 'question') value = randomlyAddZeroes(value)
        return value
    }

    withEquals() {
        if (test(/=/, this.s)) {
            this.answer = fractionize(nerdsolver(this.s))
        }

        else if (!test(/x/, this.s)) {
            let answer = this.getAnswer(this.s)
            if (!this.isValidAnswer(answer)) {
                return this.doItAgain()
            }
            // moving = ? to the postparse
            this.answer = answer
        }

        else if (test(xfracRE, this.s)) {
            let value = this.numbergen.getRandomFraction()
            let expr = replace(xfracRE, value, this.s)
            this.replace(xfracRE, 'x')
            let answer = this.getAnswer(expr)
            if (!this.isValidAnswer(answer)) return this.doItAgain()
            this.s += ' = ' + answer
            this.answer = value
        }
        else {
            let value = this.numbergen.getRandomNumber()
            let expr = replace('x', value, this.s)
            let answer = this.getAnswer(expr)
            if (!this.isValidAnswer(answer)) return this.doItAgain()
            this.s += ' = ' + answer
            this.answer = value
        }
        this.config.mode = null
    }

    isValidAnswer(answer) {
        if (answer == null) return false
        if (this.config.onlyPositive && answer < 0) return false
        return true

    }

    get value() {
        
        let question = toLatex(this.s)
        if (!test(/x/, question)) {
            question += ' = ?'
        }

        return {
            question,
            answer: this.answer,
        }
    }

    loadTemplate(template) {
        this.s = template
        this.original = template
        this.numbergen.reset()
    }

    _generate(template) {
        this.loadTemplate(template)

        for (let [k, v] of infusionRef) {
            if (k(this.s)) {
                return v(this)
            }
        }

        return infusionDefault(this)
        
    }


    populate() {
        this.replace(/[abcdefg]/g, (key) => this.numbergen.getCached(key))
    }

    doItAgain() {
        return this.next(this.original)
    }
    
    static repopulateNumbers(s) {
        return s.replace(simpleNumberRE, (x) => {
            return rngaround(x)
        })
    }
}
function isFraction(s) {
    if (isString(s)) {
        return s.includes('/')
    }
}
const StringMixins = {
    replace(regex, replacement, flags = '') {
        this.s = replace(regex, replacement, this.s, flags)
    }
}
function replace(regex, replacement, s, flags = 'g') {
    if (isString(regex)) {
        if (regex.startsWith('^') && regex.endsWith('$') && !flags.includes('m')) {
            flags += 'm'
        }
        regex = RegExp(regex, flags)
    }
    return s.replace(regex, replacement)
}
function coinflip(n = 0.5) {
    return Math.random() > 1 - n
}
function zeroify(n, range) {
    return fixFloatingPoint(addZeroes(n, rng(...range)))
}

function fixFloatingPoint(number) {
    return number.toString().replace(RegExp(floatingPointREGEX, 'g'), (x, offset, s) => {
        let a = x[0]
        let b = Number(x[1])

       //console.log({s, a, b, offset, x})

        if (a == '.') {
            if (offset == 2) return x[1]
            console.log('x', x)

            if (x[1] == 0 && x[2] == 0) return ''
            return x
        }

        if (b >= 5) return Number(a) + 1
        return a
    })

}
function mathTruncate(answer, degree) {
    // given shit ... and it was just taken.
    s = answer.toString()
    //console.log(s, 's')
    // truncation is actually kind of important
    let match = search(/(^.*?\.0+)(.+)/, s)
    if (match) {
        let [a, b] = match
        return a + b.slice(0, 2)
    }
    else {
        return isDecimal(answer) ? answer.toFixed(2).replace(/0+$/, '') : answer
    }
}
function isDecimal(x) {
   return /^-?\d*?\.\d+/.test(x.toString())
}
function addZeroes(n, amount) {
    return n * Math.pow(10, amount)
}
//const abcdeFractionRE = /[a-v]+(?:\/[a-e])?/g
const abcdeFractionRE = /[a-e]/g
//const abcdeFractionRE = /[a-v]+(?:\/[a-e])?/g
function splitmapjoin(x, fn, split, join) {
    const dict = {
        '': ['', ''],
        '\n': ['\n', '\n'],
        '\n+': [/\n\n+/, '\n'],
    }
    if (!split) {
        if (x.includes('\n') || isArray(x)) {
            [split, join] = ['\n', '\n']
        }
        else {
            [split, join] = [' ', ' ']
        }
    }
    if (!join) [split, join] = dict[split]
    
    const items = isArray(x) ? x : x.split(split)
    console.log({items})
    return items.map(pipe(fn)).join(join).trimEnd()
}
function pipe(...a) {
    if (isArray(a[0])) a = a[0]
    if (isFunction(a)) {
        return a
    }
    return (x) => a.filter(x => x).reduce((y, f) => f(y), x)
}
const abcdeRE = /[a-e]/g
function mathsolver(s) {
    try {
        if (typeof nerdamer == 'undefined') return 401
        return s.includes('=') ? nerdsolver(s) : evaluated(s)
    }
    catch(e) {
        return null
    }
}
function isNode() {
    return typeof window === 'undefined'
}
function nerdsolver(s, target) {
    if (typeof nerdamer == 'undefined') return 555
    function getTarget(s, target) {
        if (target && s.includes(target)) return target
        if (s.includes('x')) return 'x'
        return s.match(/[a-z]/i)[0]
    }
    function variableSolver(s) {
        return baseSolver(s, getTarget(s, target))
    }

    function baseSolver(s, target) {
        let a = nerdamer.solve(s, target || 'x')
        let b = nerdamer(a).expand().toString()
        return smallify(toLiteralArray(String(b)))
    }

    function xSolver(s) {
        return baseSolver(target)
    }

    const equationSolver = (s) => nerdamer.solveEquations(s.split(/, */)).map(x => x[1])

    function guessSolver(s) {
        // Solving for when there are 2 unknown variables
        // 9a + b = 22

        let [target, variables] = splitonce(getVariables(s))
        let expr = baseSolver(s, target)
        for (let i = 1; i <= 9; i++) {
            let answer = nerdsub(expr, variables[0], i).toString()
            if (isInteger(answer)) {
                let e = nerdsub(s, target, answer)
                let f = baseSolver(e, variables[0])
                return {[target]: Number(answer), [variables[0]]: Number(f)}
            }
        }
    }

    if (hasComma(s)) return equationSolver(s)
    if (hasMultipleVariables(s)) return guessSolver(s)
    return baseSolver(s, target)
}
function smallify(x) {
    return x.length == 0 ?
        null :
        x.length == 1 ?
        x[0] :
        x
}
function toLiteralArray(s) {
    return s.slice(1, -1).split(',')
}
function splitonce(s, delimiter = '\\s') {
   coerceError(s)
   if (isRegExp(delimiter)) delimiter = delimiter.source
   let regex = '^(.*?)' + delimiter + '([^]+)$'
   return search(regex, s) || [s, '']
}
function coerceError(arg, message = 'arg does not exist') {
    if (!arg) throw new Error(message)
}
function isRegExp(x) {
    return x.constructor.name == 'RegExp'
}
function getVariables(s) {
    return s.match(/[a-z]/g)
}
function nerdsub(expr, x, y) {
    if (isDoubleIterable(x)) {
        x = prepareIterable(x, 'entries')
        for (let [a,b] of x) {
            expr = nerdamer(expr).sub(a,b)
        }
    }
    else if (y != null) {
        expr = nerdamer(expr).sub(x, y)
    }

    return expr
}
function hasComma(s) {
    return s.includes(',')
}
function hasMultipleVariables(s) {
    return count(/\b[abcde]\b/g, s)
}
function count(regex, s) {
    return findall(regex, s).length
}
function findall(regex, s, flags = 'g', extra = '') {
    if (isString(regex)) regex = RegExp(regex, flags)

    let store = []
    let match
    s = s.trim()

    while (exists(match = regex.exec(s))) {
        if (match.length == 1) {
            store.push(match[0])
        }
        else if (match.length == 2) {
            store.push(match[1])
        }
        else {
            if (extra == 'nf') {
                store.push(match.slice(1))
            }
            else {
                store.push(smallify(match.slice(1).filter(exists)))
            }
        }
    }
    return store
}
function fractionize(s) {
    try {
        if (isNumber(s)) {
        return decimalToFraction(s)
        }
        
        if (isPercentage(s)) {
        return s
        }
        return s.replace(numberREGEX, decimalToFraction)
    }
    catch(e) {
        //console.log(e)
        return
    }
}
function decimalToFraction(dec) {
    let epsilon = 1e-7
    dec = Number(dec)
    //console.log(dec)
    if (isInteger(dec)) return dec
    let flag = false
    if (dec >= 1) {
        flag = true
        dec /= 100
    }
    var is_neg = dec < 0;
    dec = Math.abs(dec);
    //console.log(dec)
    var done = false;
    var n1 = 0, d1 = 1, n = 1, d = 0, n = 0, q = dec;
    while (!done) {
        if (n++ > 50) {
            console.log('done forced')
            done = true;
        }

        var a = parseInt(q);
        //console.log(a)
        var num = n1 + a * n;
        var den = d1 + a * d;
        //console.log(num, den)
        if (num > 1000 || den > 1000) {
            num = n
            den = d
            break
        }
        var e = (q - a);
        if (e < epsilon) {
            done = true;
        }
        q = 1 / e;
        n1 = n;
        d1 = d;
        n = num;
        d = den;
        if (Math.abs(num / den - dec) < epsilon || n > 30) {
            done = true;
        }
    }
    console.log(n, 'count')

    if (flag) {
        console.log('sup')
        den /= 100
        if (hasDecimal(den)) {
            den *= 100
            num *= 100
            let g = gcd(den, num)
            den /= g
            num /= g
        }
    }
    let p = [(is_neg ? -num : num), den];
    return toFraction(p)
}
function isPercentage(s) {
    return s.toString().endsWith('%')
}
const numberREGEX = /-?\d+(?:\.\d+)?/g
function randomlyAddZeroes(n, decimals = 1) {
    let [a, b] = [0, decimals]
    let r = coinflip(0.5)
    if (r > 0.67) return n + '0'.repeat(rng(a, b))
    if (r > 0.33) return '0.' + '0'.repeat(rng(a, b)) + n
    return n.toString().replace(/\d\d/, (x) => x[0] + '.' + x[1])
}
const xfracRE = /x\/[a-z]/
function stylemath(s) {
    s = addMathComma(s)

    const dict = { "-": "−", "/": "÷" }

    return s.replace(/-|\/|\*/g, (key) => {
        switch(key) {
            case '-':
            case '/':
                return dict[key]
            case '*':
                return test(/x/, s) ? "·" : "×"
        }
    })
}
function addMathComma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function hasVariableX(s) {
    return test(/[a-z]x/, s)
}
function hasEquals(s) {
    return test(/=/, s)
}
const simpleNumberRE = /\d+(?:\.\d+)?/g
function rngaround(n) {
    function runner(n) {
        if (isFraction(n)) {
            let count = 0
            let numbers = n.split('/').map(Number)
            let bigger = numbers[0] > numbers[1]
            let store = []
            if (bigger) {
                store.push(numbers[0] + rng(1, 5))
                store.push(Math.max(1, numbers[1] - rng(1, 5)))
                if (allEqual(store)) store[0] = store[0] + rng(1,3)
            }
            else {
                store.push(Math.max(1, numbers[0] - rng(1, 5)))
                store.push(numbers[1] + rng(1, 5))
                if (allEqual(store)) store[1] = store[1] + rng(1,3)
            }
            return simplifyFraction(n.replace(/\d+/g, (x) => store[count++]))

        }

        n = Number(n)
        if (n < 5) return rng(2, 5)
        if (n < 10) return rng(7, 13)
        if (n < 20) return rng(15, 30)
        if (n < 100) return rng(n - 10, n + 10)
        return rng(n - 100, n + 100)
    }
    let value = runner(n)
    return hasDecimal(n) ? value + addRandomDecimals(n) : value
}
function allEqual(arr) {
    return arr.every(x => x == arr[0])
}
function addRandomDecimals(n) {
    console.log('adding random decimals')
    let length = getDecimalLength(n)
    let range = [length, length - 1].map(power10)
    return '.' + rng(...range)

}
function getDecimalLength(n) {
    return search(/\.(.+)/, n).length || 0
}
function power10(n) {
    return Math.pow(10, n)
}
function getFirst(x, mode) {
    if (isObject(x)) {
        return Object[mode](x)[0]
    }
    if (mode == String) {
        return search(/^\S+/, x)
    }
    if (isString(x)) {
        return search('\\w+', x)
    }

    if (isArray(x)) {
        return x[0]
    }
}

//startpoint

function toExponentialForm(n) {
    if (n.length < 3) return n
    if (test(/000/, n)) return n.replace(/000+/, (x) => ' * 10^' + x.length)
    const store = new Storage(Number)
    const factors = getfactors(Number(n))
    if (factors.length < 5) return n
    factors.forEach((item, i) => store.add(item))

    let s = ''
    store.forEach((k, v) => {
        s += k + '^' + v + ' * '
    })
    return s.slice(0, -3)
}

function getfactors(n) {
  const factors = [];
  let divisor = 2;

  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  return factors;
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
    sort(fn)             { this.store = reduce(sorted(this.store, zoop(fn)), (k,v) => [k,v]) }
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

function char2n(ch) {
    return ch.toLowerCase().charCodeAt(0) - 97
}


return QuestionGenerator

})()


// 8^2 * 2^2x = 8^ (x + x)

const NUMBER_RANGES = {
    numbers: [[2, 9], [2, 18], [30, 50], [50, 75]],
    multiplication: [
        [11,13], 
        {range: [11,13], decimals: 1},
        [13,17],
        {range: [13,17], decimals: 1},
        //[16,19],
        //{range: [16,19], decimals: 1},
        //{range: [16,19], decimals: 2},
    ],
    //multiplication: [[11,15], [11, 19], [11, 19], [11, 19], [11, 19], [11, 19], [11, 19]],
    tens: [[2, 9], [2, 18], [30, 50], [50, 75]],
    exponents: [[2, 8], [3, 10]],
    fractions: [[1, 5], [3, 7], [1, 9]],
    answers: [[1, 9], [5,20]],
    addZeroes: [[1, 2], [2, 4], [4, 6]],
    addDecimals: [[-2, -1], [-3, -2], [-4, -3]],
    addZerosOrDecimals: [[1, 3], [-2, 3], [-3, 4]],
    levels: [[2, 9], [2, 18]],
    //numbers: [[2, 9], [2, 18], [30, 50], [50, 75], [76, 100], [30, 1000], [900, 1000], [2000, 2500], [2600, 3000]],
}

const alanStudent = {
    lastIndex: 0,
    level: 0,
    templates: {
        'multiplication': [
            'a * b',
            'a * x',
        ],
        'tens': [
            'a * 10^b * 10^x', 
            'a * 10^c * b * 10^d =',
            '2 * 10^3 * 5 * 10^4 =',
            '2 * 10^3 * 5 * 10^4 = 2^x',
        ],
        fractions: [
            'a/b - b/${2b} - b/${3b}',
            'a/b - a/c',
            'a/b - a',
            'a/b - b',
            '1/(a/b)',
            '((b/a) / (a/b))',
            '((4)/(b/a))/(a/b)',
            '1 / ((a/b) - b)',
            //progression('a/b'),
        ],
        roots: [
            // some connection ... to the other side of exponents.
            // when the child reflects poorly ...
            // kids have to be super careful ... 
            // to trust me ...
        ],

            //'a/b - x - b*c',
            //'ax - bc',
            //'2x - 3',
            //'ax - 3',


        'exponents': [
            //'2^a * 2^-b = 2^x',
            //'a^a * a^${2a} = a^(3x)',
            //'a^b * a^(c+2) = a^x',
            //'a^(-x) = a^(b+x+c)',
            //'c^a * c^b = c^x',
            'd^a * d^b * d^c / d^(a $pm c) = d^x',
            'd^a * ${d * d}^b * d^c / d^(a $pm c) = d^x',
            '$pow2^(a) $timesDivide $pow2^(x) = 2^a',
            '$pow3^(b) = $pow3^(a) / $pow3^(x)',
            '$pow3^(a) * $pow3^(x) = $pow3',
            '$pow2^a $timesDivide 2^x = 2^(x $pm x)',
            '2^a * 2^x = $pow64^(b $pm x)',
            '($pow3^a * (1/$pow3^c)) / ($pow3^b / $pow3^x)',
            //'2^a * 2^(-1)',
            //progression('a^b'),
        ],
    }
}



function medley() {
    const generator = new QuestionGenerator()
    generator.load(alanStudent)
    generator.setTopic('exponents')
    const items = generator.student.templates[generator.topic]
    for (i =0; i < items.length; i++) {
        console.log(generator.generate())
        if (__n && i == __n) return 
        generator.index += 1
    }
}

function progression(template, steps = 2) {
    let s = ''
    let operator = '*'
    let exponentOperator = randomPick(['+', '-', '*'])
    for (let i = 0; i < steps; i++) {
        let increment = i + 1
        let next = template.replace(/\^(\w)/, (_, x) => `^(${x} ${exponentOperator} ${increment})`)
        if (i < steps - 1) {
            s += next + ' ' + operator + ' '
        }
        else {
            s += next + ' = ' + template.replace(/\^(\w)/, '^x')
        }
    }
    const p = s.trim()
    return p
}

function randomPick(items) {
    if(!isArray(items)) return items
    return items[Math.floor(Math.random() * items.length)]
}

function isArray(a) {
    return Array.isArray(a)
}


//medley()

