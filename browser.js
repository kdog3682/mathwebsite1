
function createVue(component, id = 'vue') {
    createElement('div', {id, className: id + '-container'}, create('body'))
    return new Vue(component).$mount('#' + id)
}


function webloader(key) {

    const scriptlibrary = {
        'vue': ['vue.js', 'vuex.js', 'vuerouter.js'],
        'prettier': ['standalone.js', 'parser-html.js', 'parser-babel.js'],
        'katex': ['katex.min.js', 'katex.min.css'],
        'Vue': ['vue.js'],
        'codemirror': ['codemirror.js', 'codemirror.css', 'codemirror.docs.css'],
        'quill': ['quill.js'],
        'nerdamer': ['nerdamer.js'],
        'self': ['questiongenerator.js'],
        'jshint': ['jshint.js'],
        'controller': ['element-controller.js', 'ec.css'],
    }

    if (!window.hasOwnProperty(key)) {
        console.log('loading', key, scriptlibrary[key])
        return forEach(scriptlibrary[key], load)
    }

    function load(x) {
        switch (getExtension(x)) {
            case 'css': return createElement('link',   {href: x, rel: 'stylesheet'}, document.head)
            case 'js':  return createElement('script', {src: x, charset: 'utf8'},    document.head)
            default:    return createElement('script', {src: x, charset: 'utf8'},    document.head)
        }
    }
}



function create(key) {
    if (key == 'body') {
        if (document.body) {
             //console.log('hi doc body exists')
        }

        return document.body ? 
            document.body : 
            document.documentElement.appendChild(document.createElement('body'))
    }
}


function createElement(tag = 'div', options = null, parent = document.body) {
    const element = document.createElement(tag)
    if (options) Object.assign(element, options)
    parent.appendChild(element)
    return element
}




function download(file, content) {
    if (!exists(content)) return 

    if (isJson(file)) {
        content = stringify(content)
    }
    else {
        switch (typed(content)) {
            case 'Object': 
            case 'Storage': 
                content = joined(Object.values(content)); break;
            case 'Array': 
                content = joined(content); break;
        }
    }

    const element = createElement('a', {
        href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
        download: file,
    })

    element.click()
    element.remove()
}


function setStorage(key, value = '') {
    if (!exists(value)) return 
    console.log('setting storage', value)
    localStorage.setItem(key, stringify(value))
}


function getBoundingClientRect(element) {
    const {height, width, top, left} = element.getBoundingClientRect()
    return {
        height: height + 'px',
        width: width + 'px',
        left: left + 'px',
        top: top + 'px',
    }
}

function getKeyArg(e) {
    let key = e.key || e
    let arg = ''
    if (e.ctrlKey) arg += 'ctrl-'
    if (e.altKey) arg += 'alt-'
    arg += key
    return arg
}

function isTypable(e) {
    if (e.altKey || e.ctrlKey) return 
    let s = e.key
    return s.length == 1 || s == ''
}



function prettify(s) {

    webloader('prettier')

    const prettierRef = {
        js: {
            parser: 'babel',
            plugins: prettierPlugins,
            arrowParens: 'always',
            bracketSpacing: true,
            printWidth: 100,
            tabWidth: 4,
            semi: false,
            singleQuote: true,
        },
        html: {
            parser: 'html',
            plugins: prettierPlugins,
        }
    }

    return prettier.format(s, prettierRef[inferlang(s)])
}


function getWindowFunctions(fn = identity) {
    const asArray = getParameters(fn.toString()).length == 2
    const filtration = asArray ? (x) => fn(...x) : (x) => fn(x[0])
    return Object.entries(window).filter(filtration).map((item, i) => item[1])
}



function preventDefaultFactory() {
    
    let shiftKey
    let ctrlKey

    function preventDefault(e) {
        if (e.shiftKey && e.key == '') {
            shiftKey = true
            return 
        }

        if (e.ctrlKey && e.key == '') {
            ctrlKey = true
            return 
        }

        if (e.shiftKey && e.ctrlKey) {
            return 
        }

        if (isString(e)) return 
        if (ctrlKey && test(/[abcdefg]/, e.key)) e.preventDefault()
        if (ctrlKey && test(/[i-+]/, e.key)) {
            return 
        }

        ctrlKey = false
        shiftKey = false
        if (e.srcElement != document.body) return 
        const allowDefault = ['F5', 'r', 'F1', 'F2']
        if (allowDefault.includes(e.key)) return 
        e.preventDefault()
    }
    return preventDefault
}





function setupDirectives() {
    const dollarFunctions = getWindowFunctions((x) => x.startsWith('$'))
    console.log('dollarfuncs', dollarFunctions)
    dollarFunctions.forEach(vuetify)
}

async function getClipboard() {
    return navigator.clipboard.readText()
}


function setClipboard(s) {
    navigator.clipboard.writeText(stringify(s))
}


function loadcss(s) {
    if (s.length < 20) s = getStorage(s)
    if (s.length < 5) throw new Error("")
    return createElement('style', {innerHTML: s}, document.head)
}


function setupFade() {
    const fadestring = '.fade-enter-active { transition: opacity 1s } .fade-leave-active { transition: opacity 0.75s; } .fade-enter, .fade-leave-to { opacity: 0;}'
    loadcss(fadestring)
}

function setupController(vueApp, target) {
    webloader('controller')
    setTimeout(() => {
        window.controller = new ElementController(null, vueApp, target)
        window.vue = window.controller.vue
    }, 250)
}

function setupVue(component) {
    window.vue = createVue(component)
}


function createListener(state, ref, enterRef) {

    state.keyhandler = keyhandler
    window.addEventListener('keydown', keyhandler)
    const preventDefault = preventDefaultFactory()
    

    function run(ref, key, ...args) {
        let item = ref[key]

        if (isString(item)) {
            switch (item) {
                case 'toggle': return state[key] = !state[key]
                default: return state[key] = item
            }
        }

        else {
            item(state, ...args)
        }

        state.display = ''
    }

    function keyhandler(e) {
        preventDefault(e)
        let key = getKeyArg(e)
        console.log('adasdfadf')
        console.log(key)
        let display = state.display


        if (display == '' && ref.onEmpty(state, e)) {
            return 
        }

        if (key == 'Enter') {
            const [a,b] = test(/^[^\w\s]/, display) ? 
                search(/^([^\w\s]+)(.*)/, display) :
                search(/^(\w+) ?(.*)/, display)

            if (enterRef && a in enterRef) {
                run(enterRef, a, b)
            }
            else {
                run(ref, key, display)
            }

            return 
        }

        if (key == 'Escape') {
            state.display = ''
            return 
        }

        if (key == 'Backspace') {
            state.display = backspaced(display)
            return 
        }

        if (key in ref) {
            run(ref, key)
            return 
        }


        if (display && !display.includes(' ') && (ref.hasOwnProperty(display + e.key))) {
            run(ref, display + e.key)
            return 
        }

        if (isTypable(e)) {
            state.display += e.key
        }
    }
}

function animated(el, key, start, end, options = 1000) {
    el.style[key] = start
    const animation = el.animate([{[key]: start}, {[key]: end}], options)
    return animation.finished.then(() => el.style[key] = end)
}


function appeardisappear(el, duration = 5000) {
    el.style.opacity = 0
    const keyframes = [
        {opacity : 0, offset: 0},
        {opacity : 1, offset: 0.1},
        {opacity : 1, offset: 0.9},
        {opacity : 0, offset: 1},
    ]
    const options = {
        duration,
        fill: 'forwards',
    }

    return el.animate(keyframes, options).finished.then((x) => el.style.opacity = 0)
}
