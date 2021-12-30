let temp1


const katexitemc = {
    props: ['item'],
    render(h) {
        return renderhelper(this, h, this.item, 'katex-expression')
    }
}

const standardArithmetic = {
    computed: {

    ctInputButton() {
        const statements = ['nice!']

        if (this.isCorrect == true) {
            return randomPick(statements)
        }

        return 'enter'
     },

     csInputButton() {
        if (this.isCorrect) {
            return { background: green, color: 'white'}
        }
    },
     csInputContainer() {
        if (this.isCorrect == false) {
            return {background: 'blue'}
        }
    },


     csInputInput() {
        if (this.isCorrect == false) {
            return {color: 'white'}
        }
    },


      csHotstreak() {
          return {fontSize: (this.hotstreak) + 72 + 'px'}
      },
      tname() {
            console.log('hi tname')
            if (this.$qc.isCorrect) {
                return 'corec'
            }
            return 'wrng'
      }
    },
    components: {katexitemc},
    props: ['item', 'questionIndex'],

    data() {
        return {
            isCorrect: null,
            userAnswer: '',
            hotstreak: 0,
            disabled: false,
        }
    },
                            
    template: `
        <div>
            <transition name="katex-item" mode="out-in">
                <katexitemc :key="questionIndex" :item="item.question"/>
            </transition>

            <div class="input-container" style="transition: all 0.5s;" :style='csInputContainer'>
                <input :style='csInputInput' spellcheck="false" class="standard-input" ref="input" :disabled="disabled" v-model="userAnswer" @keydown.enter="submitAnswer"/>

                <button  style="transition: all 0.5s;" :style='csInputButton'  @click="submitAnswer" class="enter-button">{{ctInputButton}}</button>
            </div>


            <transition name="fade" mode="out-in">
                <div :style="csHotstreak" v-show="hotstreak > 0 && this.disabled" class="hotstreak">
                    +{{hotstreak}}
                </div>
            </transition>
        </div>
    `,

    adgtemplate: `
        <div @click="foobarfocus" >
            <transition name="katex-item" mode="out-in">
                <katexitemc :key="questionIndex" :item="item.question"/>
            </transition>

                <input class="standard-input" ref="input" style="transition: all 0.5s;" :style='csInput' :disabled="disabled" v-model="userAnswer" @keydown.enter="submitAnswer"/>

            <transition name="fade" mode="out-in">
                <div :style="csHotstreak" v-show="hotstreak > 0 && this.disabled" class="hotstreak">
                    {{hotstreak}}
                </div>
            </transition>
        </div>
    `,
    methods: {
        foobarfocus() {
            console.log('hiii foo')
            this.$refs.input.focus()
        },
        generate() {
            this.$qc.generate()
        },
        async submitAnswer(e) {
            this.$qc.handleInput(this)
        }
    },
    watch: {
        async mounted() {
            this.$refs.input.focus()
        },
    },
    created() {
       this.$qc.load(this) 
    },
    mounted() {
        this.$refs.input.focus()
    }
}


const solveForX = {
    computed: {},
    props: ['item', 'questionIndex'],

    data() {
        return {
            isCorrect: null,
            userAnswer: '',
            hotstreak: 0,
            disabled: false,
        }
    },
                            
    template: ` <div>
        hi from solveforx component
    </div>`,
}






class StyleTracker {
    constructor() {
        this.store = []
    }

    add(index, key, value) {
        if (!this.store[index]) this.store[index] = new Storage()
        this.store[index].add(key, value)
    }
    get(index, key, mode) {
        const ref = this.store[index]
        if (!ref) return ''
        
        const childRef = ref.get(key)
        if (childRef && childRef.length > 0) return childRef.join(' ')
        return ''
    }

}
function kmtyper(s) {
    if (looksLikeProse(s)) {
        return 'prose'
    }

    else {
        return 'katex'
    }
}


function sanitizeMathAnswer(s) {
    s = s.trim()
    if (s.startsWith('.')) return '0' + s
    else if (test(/^\d+\.\d+?0$/, s)) return s.replace(/0+$/, '')
    return s
}

function rhGetType(item) {
    if (isString(item)) {
        return 'katex-paragraph'

    }

    if (isObject(item)) {
        if (item.question) {
            if (hasMultipleVariables(item)) {
                return 'solve-for-variables'
            }

            if (hasVariableX(item)) {
                return 'solve-for-x'
            }
            
            if (isWordy(item)) {
                return 'word-problem'
            }

            else {
                return 'standard-arithmetic'
            }
        }
    }
}

function katexExpression(rh) {
    if (rh.items.length == 1) {
        const style = rh.item.length > 15 ? {fontSize: '40px'} : null
        return tvKatex(rh.item, 'katex-item', style)
    }
    else {
        return rh.items.map((item, i) => {
            return looksLikeProse(item) ? rh.h(...tvProse(item)) : rh.h(...tvKatex(item))
        })
    }
    
}
const renderlib = {
    //solveForX,
    //solveForVariables,
    //wordProblem,
    katexExpression,
}


const standardinputc = {
    props: [],
    template: `
        <div>
        
        </div>
    `,
    data() {
        return {
            
        }
    },
}






function renderhelper(vue, h, item, mode) {
    const type = mode ? mode : rhGetType(item)
    const fn = renderlib[toCamelCase(type)]

    if (isObject(fn)) {
        return h(fn, {props: item})
    }

    const renderhelper = new VueRenderHelper(vue, h, item)
    const value = fn(renderhelper)
    //console.log(value)

    if (isObject(value)) {
        return h('div', value)  
    }

    else if (isArray(value)) {
        if (isVNode(value[0])) {
            console.log('is child vnode')
            return h('div', {className: type}, value)
        }

        else if (isObject(value[1])) {
            return h(...value)
        }
        else if (isObject(value[0])) {
            return h('div', ...value)
        }
    }

    else {
        console.log(value.constructor.name)
        return value
    }
}

function qcEnter(qc, s) {
    console.log(qc)
    console.log(s)
}

function qcRef() {

    const ref = {
        Enter: qcEnter,
    }

    return [ref, null]
}

class QuizController {
    load(state) {
        const comps = state.$parent.$options.components
        const names = Object.keys(comps)
        const name = names[0]
        this[name] = state
    }
    constructor(vue) {
        this.hotstreaks = []
        this.vue = vue
        this.qg = new QuestionGenerator()
        this.qg.load()
        this.qg.setTopic('exponents')
        this.questionIndex = 0
        this.generate()
        this.correct = 0
        this.tempcorrect = 0
        this.tempwrong = 0
        this.incorrect = 0
        this.hotstreak = 0 
        this.count = 0
        this.hotTouches = 0

        //createListener(this, ...qcRef())
    }

    get templimit() {
        if (this.count < 7 || !this.touchedHotness) return 3
        if (this.hotstreak > 3 && this.count > 10) return 1
        else if (this.hotstreak > 4) return 1
        return 2
    }

    generate() {
        this.count += 1
        let item = this.qg.generate()
        this.item = item
        this.vue.cc = rhGetType(item)
        this.vue.item = item
        this.vue.questionIndex += 1
        this.questionIndex += 1
    }

    get touchedHotness() {
        return this.hotTouches > 0
    }

    get levelDeterminant() {
        // the level at which to revert the difficulty
        return 2
    }
    handleInput(state) {

        let userAnswer = sanitizeMathAnswer(state.userAnswer)

        if (userAnswer == this.item.answer || userAnswer == 'ez') {
            if (this.hotstreak == 2) {
                this.hotTouches += 1
            }

            this.correct += 1
            this.tempwrong = 0
            this.tempcorrect += 1

            if (this.tempcorrect >= this.templimit && !this.qg.finished) {
                this.tempcorrect = 0
                qgHarder(this.qg)
            }
            else {
                console.log('not harder')
                console.log(this.tempcorrect)
            }

            this.hotstreak += 1
            state.hotstreak += 1
            state.isCorrect = true
            state.disabled = true
            state.$refs.input.blur()

            setTimeout(() => {
                state.userAnswer = ''
                if (!this.qg.finished) {
                    console.log('not finished')
                    this.generate()
                    state.isCorrect = null
                    state.disabled = false
                    setTimeout(() => state.$refs.input.focus(), 25)
                }
                else {
                    console.log('done')
                    this.vue.$root.cc = 'endc'
                }
            }, 1500)

        }
        else {
            if (this.hotstreak > 1) this.hotstreaks.push(this.hotstreak)
            console.log('incorrect', 'reset hotstk')
            this.hotstreak = 0 
            state.hotstreak = 0 
            this.incorrect += 1
            this.tempcorrect = 0
            this.tempwrong += 1


            if (this.count > 10 || userAnswer == '' || this.tempwrong == this.wrongtemplimit) {
                state.isCorrect = false 
                this.tempwrong = 0
                if (this.qg.level > this.levelDeterminant && coinflip()) this.qg.level -= 1
                state.$refs.input.blur()

                setTimeout(() => {
                    state.userAnswer = this.item.answer
                    setTimeout(() => {
                        state.userAnswer = ''
                        this.generate()
                        state.isCorrect = null
                        state.disabled = false
                        setTimeout(() => state.$refs.input.focus(), 25)
                    }, 2000)
                }, 1500)
            }
            else {
                state.userAnswer = ''
            }
        }
    }

    get wrongtemplimit() {
        return 2
    }
}

function isVNode(x) {
    return x.constructor.name == 'VNode'
}



function isWordy(s) {
    return test(/[a-zA-Z]{2,} [a-zA-Z]{2,} [a-zA-Z]{2,}/, s)
}






function animated(element) {
    
    const options = {
        fill: 'forwards',
        iterations: 1,
        delay: 0,
        duration: 1000,
    }

    const keyframes = [
        {offset: 0, [key]: from},
        {offset: 0.25, [key]: to},
        {offset: 0.75, [key]: to},
        {offset: 1, [key]: from},
    ]

    return element.animate(keyframes, options).finished
}
function animateTo(element, key, from, to, config = {}) {
    element.style[key] = from

    const options = {
        fill: 'forwards',
        iterations: 1,
        delay: 0,
        duration: 1000,
    }

    if (isNumber(config)) {
        options.duration = config
    } else {
        Object.assign(options, config)
    }

    const keyframes = [
        {offset: 0, [key]: from},
        {offset: 0.25, [key]: to},
        {offset: 0.75, [key]: to},
        {offset: 1, [key]: from},
    ]

    return element.animate(keyframes, options).finished
}


function katexParagraphParsers() {
    
    return [parse1, parse2, parse3]

    function parse3(item, i) {

        const type = kmtyper(item, 'katex')
        const classRef = this.tracker.get(i, type, String)

        const elementRef = {
            'katex': {fn: tvKatex, className: 'katex-math-container'},
            'prose': {fn: tvProse, className: 'katex-prose'},
        }

        const ref = elementRef[type]
        coerceError(ref)

        const className = ref.className + ' ' + classRef

        const args = ref.fn(item, className)
        return this.h(...args)
    }

    function parse2(item, i) {
       return applyColors(item, this.numberColors)
    }

    function parse1(item, i) {
        let [text, options] = mreplace(/^\\\w+ */, item, true)
        if (options) options = options.trim().slice(1)
        
        switch (options) {
            case 'emph':
                this.colorGenerator.reset()
                const numbers = getNumbers(text)
                this.numberColors = reduce(numbers, (x) => {
                    let color = toTailwindColor(this.colorGenerator.generate())
                    return [x, color]
                })

                this.tracker.add(i, 'katex', 'katex-emph')
                return katwrap('large', katwrap('bold', text))
        }

        return text
    }
}


class VueRenderHelper {
    create(key) {
        if (key == 'katex') return this.h(...tvKatex(this.item, 'katex-item'))
    }
    constructor(vue, h, item) {
        this.h = h
        this.item = item
        this.items = splitkatex(item)
        this.vue = vue
        this.tracker = new StyleTracker()
        this.colorGenerator = new UniqueGenerator(['red', 'blue', 'green', 'violet'])
    }

    map(parsers) {
        for (let parser of parsers) {
            this.items = this.items.map(parser.bind(this))
        }
    }
}


function katexParagraph(rh) {
    rh.map(katexParagraphParsers())
    return rh.items
}


function splitkatex(s) {
    const regex = /(\.? (?:[a-zA-Z]{2,}(?: |$))+)/
    return split(s, regex).filter(exists)
}


function looksLikeProse(s) {
    return test(/^[a-zA-Z]{2,}/, s)
}

function tvKatex(item, className = 'katex-item', style) {
    return ['span', {style, class: className, directives: [{name: 'katex', value: item}]}]
}

function tvProse(item, className) {
    return ['span', {class: className}, item]
}

function applyColors(s, ref) {
    if (!ref) return s
    return replace(ncg('\\b(?:$1)\\b', ref), (x) => {
        let color = ref[x]
        return katwrap('textcolor', color, x)
    }, s, 'g')
}

function hasMultipleVariables(s) {
    return test(/[abcde]\b.*?\b[abcde]/, s)
}

function katwrap(key, a, b) {
    if (arguments.length == 2) {
        return `\\${key}{${a}}`
    }
    return `\\${key}{${a}}{${b}}`
}





function toTailwindColor(color) {
    return tailwind[color + rng(4,7)]
}


function vkatex(element, binding, value) {
    const displayMode = (binding.arg == 'display' || value.length > 15) ? true : false

    const options = {
        displayMode,
        throwOnError: true,
        minRuleThickness: 0.5,
    }

    try {
        katex.render(binding.value, element, options)
    }

    catch (e) {
        console.log(e)
    }
}






const questionItem = {
    render(h) {
        const item = '2^{3} \\cdot 2^{4} equals 2^{7} because \\emph 3 + 4 = 7'
        return renderhelper(this, h, item)
    }
}

            //<modalc v-show="showModal" :modalValue="modalValue" :modalItem="modalItem"/>

            //<p class="sentence">You answered a total of <span class="total-correct">{{totalCorrect}}</span> questions correctly.</p>
            //<p class="sentence">Come back tomorrow for new questions.</p>

const endc = {
    //props: ['totalCorrect', 'hotstreak'],
    template: `
        <div>
            <template v-if="hotstreak > 1">
                <p class="sentence">You answered <span :style="font" class="hot-streak">{{hotstreak}}</span> questions in a row.</p>
                <p class="encouragement-sentence">{{encouragement}}</p>
            </template>

            <template v-else>
                <div class="image-holder"> <img class="catpic" :src="catpic"/></div>
            </template>
        </div>
    `,
    data() {
        return {
            encouragement: randomPick(encouragements),
            totalCorrect: 0,
            hotstreak: 0,
            catpic: pathfixer(randomPick(catpics))
        }
    },
    mounted() {
        this.totalCorrect = globalDebug ? gdstrk : this.$qc.correct
        this.hotstreak = globalDebug ? gdstrk : this.$qc.hotstreak 
    },
    computed: {
        font() {
            if (this.hotstreak > 9) return {fontSize: '100px'}
        }
    }
}

const encouragements = [
    'Nice work!'
]

const questionc = {
    components: {standardArithmetic, solveForX},
    props: [],
    template: `
        <div>
            <transition name="fade" mode="out-in">
                <component :class="cc" :is="cc" 
                    :item="item" :questionIndex="questionIndex">
                </component>
            </transition>
        </div>
    `,
    data() {
        return {
            cc: 'standard-arithmetic',
            questionIndex: 0,
            item: null,
        }
    },
    mounted() {
        //setTimeout(() => {
            //this.cc = 'solve-for-x'
            //setTimeout(() => {
                //this.cc = 'standard-arithmetic'
            //}, 2000)
        //}, 3000)
    },

    computed: {
    },
    methods: {
    },
    created() {
        Vue.prototype.$qc = new QuizController(this)
    },
}

            //<div class="image-holder"> <img class="catpic" :src="catpic"/></div>

const encouragec = {
    template: `
        <div class="encouragement-component">
            <div class="encouragement">{{encouragement}}</div>
        </div>
    `,
    data() {
        return {
            catpic: '',
            encouragement: '',
        }
    },
    mounted() {
        this.catpic = pathfixer(randomPick(catpics))
        this.encouragement = 'You\'re going to do great!'
    },
}
function pathfixer(s) {
    let dir = 'assets'
    return dir + '/' + s
}
const startc = {
    components: {encouragec},
    template: `
        <div>
          <div class="left">
            <div class="math-practice-hero">math practice</div>
            <button @click="startClock" class="start-session">begin</button>
          </div>

          <div class="right">
                <transition name="fade" mode="out-in">
                    <template>
                        <div v-if="countdown>0 && isTicking" class="flash-number">{{countdown}}</div>
                        <encouragec v-else-if="isTicking"/>
                    </template>
                </transition>
          </div>
        
        </div>
    `,
    data() {
        return {
            countdown: 3,
            isTicking: false,
        }
    },
    mounted() {
        this.clock = new Clock(10)
        this.clock.onTick = (timeLeft) => {
            if (this.countdown >= 0) this.countdown -= 1
            if (timeLeft == 2) {
                this.$root.cc = 'questionc'
                return true
            }
        }

        //setTimeout(() => this.startClock() , 3000)
    },
    methods: {
        startClock() {
            if (this.countdown) {
                this.clock.start()
                this.isTicking = true
            }
            else {
                this.$root.cc = 'questionc'
            }
        }
    }
}




function $findref(key) {
    let ref = this
    while (ref.$parent._uid !== 0) {
        ref = ref.$parent
        if (ref.hasOwnProperty(key)) {
            return ref
        }
    }
}

function $toParent(key, value, ...args) {
    let ref = this.$findref(key)

    if (isFunction(ref[key])) {
        value ? ref[key](value, ...args) : ref[key]()
    }

    if (value == null) {
        switch (key) {
            case 'index':
                ref.index += 1
        }
    }

    else {
        ref[key] = value
    }
}

function foobar(vue, color, duration = 2000) {
    vue.disabled = true
    animateTo(vue.$refs.input, 'background', 'white', color, duration)

    setTimeout(() => {
        vue.userAnswer = ''
        vue.generate()

        setTimeout(() => {
            vue.disabled = false
            setTimeout(() => {
                vue.$refs.input.focus()
            }, 250)
        }, 1000)
        
    }, 1500)
}

// to load the  same picture over and over again ... is no fun...



function assignStyle(element, s) {
    const style = isString(s) ? reduceCss(getCssItems(s), Object) : s
    if (style) Object.assign(element.style, style)
    return element
}




const main = {
    components: {startc, questionc, endc},
    template: `
        <div class="app-container">
            <transition name="fade" mode="out-in">
                <component :class="cc" :is="cc"></component>
            </transition>
        </div>
    `,
    data() {
        return {
            cc: 'questionc', 
        }
    },
    mounted() {
    }
}
var green = tailwind['green5']
