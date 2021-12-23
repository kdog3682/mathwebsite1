
function aggregateCSS(s) {
    const regex = /^(.*?) {\n([^]+?)\n}/gm
    const storage = aggregate(regex, s, (x) => runner(trimmed(dedent(x))))

    function runner(s) {
        return splitmapfilter(s, /;?\s*$/m, split, / *: */)
    }

    function parse(a, b) {
        const payload = reduceCss(toDictionary(b), String)
        return cssBracket(toCssClassName(a), payload)
    }

    const p = storage.entries.reduce((acc, [a,b]) => acc += '\n' + parse(a,b), '')
    return p
        //const ignore = ['unset', 'initial', 'none']
        //b = b.filter((x) => !ignore.includes(x[1]))
    //return p.replace(/.*?(?:unset|initial|none).+\n?
}


function cssValueParser(a, b) { /* marked */
    let key = cssattrmap[a]

    if (!b) return [key, 0]
    b = b.replace(/\$[a-zA-Z]+/, (x) => 'var' + parens('--' + x.slice(1)))
    const initials = ['none', 'transparent', 'unset', 'initial', 'auto']

    if (b == 'u' || b == 'n') return [key, 'unset']
    if (b == 'random') return [key, randomColor()]
    if (initials.includes(b)) return [key, b]
    if (b.startsWith('calc')) return [key, cssCalc(b.slice(4))]

    switch (a) {
        case 'a':
            return [key, cssAnimation(b)]
        case 'mc':
            return cssColorMatch(b)
        case 'pcal':
            return cssPcal(b)
        case 'bs':
            return [key, cssBoxShadow(b)]
        case 'br':
            if (b.length < 2 || isNumber(b)) break
        case 'bl':
        case 'bt':
        case 'bb':
        case 'b':
        case 'border':
            return cssBorder(b, key)
        case 'z':
        case 'offset':
        case 'scale':
        case 'fw':
        case 'o':
            return [key, b]
        case 'grid':
            throw ""
        case 'pos':
            let translateX
            let translateY

            let [posX, posY] = b.length == 2 ? 
                b.split('').map((x) => Number(x) * 10) : 
                b.split(/(?=\w\w$)/).map(Number)

            return [
                ['position', 'absolute'],
                ['top', posX + '%'],
                ['left', posY + '%'],
            ]

    }

    if (test(/color|background/, key)) {
        return [key, cssColor(b)]
    }

    b = cssUnit(b, key)

    switch (a) {
        case 'tx':
        case 'ty':
        case 'r':
            return ['transform', key + parens(doublequote(b))]
        case 'wh':
            return [['width', b], ['height', b]]
        case 'px':
        case 'py':
        case 'mx':
        case 'my':
            let $key = cssattrmap[a[0]]
            let $dirs = a[1] == 'x' ? ['left', 'right'] : ['top', 'bottom']
            return $dirs.map(($dir) => [$key + '-' + $dir, b])
    }

    return [key, b]
}


function getCssItems(s) {
    const regex = aggregateRegexFromHashmap(cssattrmap)

    return s.trim().split(/,? +/).reduce((acc, x) => {
        if (x in cabmap) {
            acc.push(...cabmap[x])
        } else if (match = search(regex, x)) {
            let value = cssValueParser(...match)
            isNestedArray(value) ? acc.push(...value) : acc.push(value)
        }
        else {
            console.log('error', [x])
        }
        return acc
    }, [])
}

function cssParser(name, value) {
    if (!value) return
    if (isObject(value)) return cssBracket(toCssClassName(name), reduceCss(value))
    if (test(/^.*?{/, value)) return value
    return cssBracket(toCssClassName(name), reduceCss(getCssItems(value)))
}


function reduceCss(css, mode, delimiter = '\n') {
    if (mode == Object) {
        return reduce(css, (a, b) => [toCamelCase(a), b])
    }
    return prepareIterable(css, 'entries').reduce((acc, [a,b]) => {
        return acc += cssEntry(a,b, delimiter)
    }, '').trimEnd()
}

function cssEntry(a, b, delimiter = '\n') {
    return a + ': ' + b + ';' + delimiter
}

function addCssPeriod(s) {
    return test(/^\./, s) ? s : '.' + s
}

function toCssClassName(s) {
    if (test(/hot/, s)) {
        console.log('hiii')
    }
    if (test(/-/, s)) return addCssPeriod(s)
    if (test(ncg('^(?:$1)\\b', htmlElements), s)) return s
    if (test(/hot/, s)) {
        console.log('hiii2')
    }
    return addCssPeriod(s)
}


function cssBracket(key, value) {
    return '\n' + key + ' ' + '{' + newlineIndent(value.trimEnd()) + '}' + '\n'
}


function aggregateRegexFromHashmap(map, regexTemplate = '^($1)(\\S+)') {

    const storage = new Storage()
    const store = []

    for (let item of sorted(Object.keys(map))) {
        storage.add(item[0], item)
    }

    sortEach(storage, true)

    storage.forEach((k, v) => {
        v.length == 1 ? 
            store.push(v[0]) :
            store.push(k + ncg('(?:$1)', v.map((x) => x.slice(1))))
    })

    return ncg(regexTemplate, store)
}


const cabmap = { /* marked */

  gradient: [
    ['-webkit-background-clip', 'text'],
    ['-webkit-text-fill-color', 'transparent'],
    //['display', 'inline-block'],
    ['background-image', 'linear-gradient(to right, #1de9b6, #2979ff)']
  ],

  content: [['content', '']],
  pseudo: [['content', '']],
  //ofh: [['overflow-x', 'hidden'], ['overflow-y', 'hidden']],
  ilb: [['display', 'inline-block']],
  inline: [['display', 'inline']],
  span: [['display', 'inline']],
  block: [['display', 'block']],
  ofh: [['overflow', 'hidden']],
  ttc: [['text-transform', 'capitalize']],
  ttuc: [['text-transform', 'uppercase']],
  ttlc: [['text-transform', 'lowercase']],
  ofs: [['overflow', 'scroll']],
  ofx: [['overflow-x', 'hidden']],
  ofy: [['overflow-y', 'hidden']],
  bebas: [ ['font-family', 'bebas']],
  pre: [
        ['font-family', "'Courier New', monospace"],
        ['whitespace', 'pre']
  ],

  whitespace: [
        ['font-family', "'Courier New', monospace"],
        ['whitespace', 'pre']
  ],
  perspect: [ [ 'perspective', '50%' ], [ 'transform', 'translate(-50%, -50%)' ] ],
  card: [ [ 'backface-visibility', 'hidden' ], [ 'transform', 'translate(-50%, -50%)' ] ],
  grid: [ [ 'backface-visibility', 'hidden' ], [ 'transform', 'translate(-50%, -50%)' ] ],
  grid: [ [ 'backface-visibility', 'hidden' ], [ 'transform', 'translate(-50%, -50%)' ] ],
  grid: [ [ 'display', 'grid' ] ],

  '3d': [ [ 'left', '50%' ], [ 'transform', 'translate(-50%, -50%)' ] ],

  absu:
   [ [ 'left', 'unset' ],
     [ 'right', 'unset' ],
     [ 'bottom', 'unset' ],
     [ 'top', 'unset' ],
     [ 'position', 'unset' ],
     [ 'transform', 'unset']
   ],

  origin:
   [ [ 'left', '50%' ],
     [ 'position', 'absolute' ],
     [ 'top', '50%' ],
     [ 'transform', 'translate(-50%, -50%)' ] ],
  east:
   [ [ 'right', '0' ],
     [ 'top', '50%' ],
     [ 'transform', 'translateY(-50%)' ] ],
  b0: [ ['bottom', '0'], ['position', 'absolute']],
  l0: [ ['left', '0'], ['position', 'absolute']],
  t0: [ ['top', '0'], ['position', 'absolute']],
  r0: [ ['right', '0'], ['position', 'absolute']],

  right: [ ['right', '0']],
  top: [ ['top', '0']],
  left: [ ['left', '0']],
  bottom: [ ['bottom', '0']],
  se: [ [ 'bottom', '0' ], [ 'right', '0' ] ],
  south:
   [ [ 'bottom', '0' ],
     [ 'left', '50%' ],
     [ 'transform', 'translateX(-50%)' ] ],
  sw: [ [ 'bottom', '0' ], [ 'left', '0' ] ],
  west:
   [ [ 'top', '50%' ],
     [ 'transform', 'translateY(-50%)' ],
     [ 'right', '0' ] ],
  nw: [ [ 'left', '0' ], [ 'top', '0' ] ],
  north:
   [ [ 'top', '0' ],
     [ 'left', '50%' ],
     [ 'transform', 'translateX(-50%)' ] ],

  "code": [
    [ 'font-family', 'source-code-pro, Menlo, Monaco, Consolas, \'Courier New\', monospace' ]
  ],

  "alwayse": [
    [ "min-width", "100%" ], 
    [ "min-height", "50px" ], 
  ],

  "middleright": [
    //[ "position", "absolute" ], [ "top", "50%" ], ["right", "-50%"],
    //[ "transform", "translateY(50%)"],
  ],

  "topleft": [
    [ "position", "absolute" ], [ "top", "0" ], ["left", "0"],
  ],

  "full": [
    [ "width", "100vw" ],
    [ "height", "100vh" ],
  ],
  "reset": [
    [
      "box-sizing",
      "border-box"
    ],

    [ 'font-family', '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Oxygen\',\n\'Ubuntu\', \'Cantarell\', \'Fira Sans\', \'Droid Sans\', \'Helvetica Neue\',\nsans-serif' ],
    [ '-webkit-font-smoothing', 'antialiased' ],
    [ '-moz-osx-font-smoothing', 'grayscale' ],

    [
      "padding",
      "0"
    ],

    [
      "margin",
      "0"
    ],
  ],

  "middlerighsfdgt": [
    [
      "position",
      "absolute"
    ],

    [
      "top",
      "50%"
    ],

    [
      "right",
      "0"
    ],

    [
      "transform",
      "translateY(50%)"
    ],
  ],

  "cabtac": [
    [
      "text-align",
      "center"
    ]
  ],
  "serrat": [
    [
      "font-family",
      "\"Montserrat Alternates\""
    ],
    [
      "font-weight",
      "700"
    ]
  ],
  "centered": [
    [
      "display",
      "flex"
    ],
    [
      "align-items",
      "center"
    ],
    [
      "justify-content",
      "center"
    ],
  ],
  "c": [
    [
      "flex-direction",
      "column",
    ],

    [
      "display",
      "flex"
    ],
    [
      "align-items",
      "center"
    ],
    [
      "justify-content",
      "center"
    ]
  ],

  "center": [
    [
      "display",
      "flex"
    ],
    [
      "align-items",
      "center"
    ],
    [
      "justify-content",
      "center"
    ]
  ],
  "jcse": [
    [
      "justify-content",
      "space-evenly"
    ]
  ],
  "spacebetween": [
    [
      "justify-content",
      "space-between"
    ]
  ],

  "se": [
    [
      "justify-content",
      "space-evenly"
    ]
  ],

  "sa": [
    [
      "justify-content",
      "space-between"
    ]
  ],

  "sb": [
    [
      "justify-content",
      "space-between"
    ]
  ],

  "jcsb": [
    [
      "justify-content",
      "space-between"
    ]
  ],
  "jcc": [
    [
      "justify-content",
      "center"
    ]
  ],
  "shadow": [
    [
      "box-shadow",
      "rgba(17, 17, 26, 0.05) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px"
    ]
  ],
  "shadow1": [
    [
      "0px 4px 10px rgba(0, 0, 0, 0.25)"
    ]
  ],
  "shadow2": [
    [
      "0px 4px 10px rgba(0, 0, 0, 0.1)"
    ]
  ],
  "tall": [
    [
      "transition",
      "all 1s ease-out"
    ]
  ],
  "gaa": [
    [
      "grid-area",
      "a"
    ]
  ],
  "gab": [
    [
      "grid-area",
      "b"
    ]
  ],
  "gac": [
    [
      "grid-area",
      "c"
    ]
  ],
  "gad": [
    [
      "grid-area",
      "d"
    ]
  ],
  "gae": [
    [
      "grid-area",
      "e"
    ]
  ],
  "halfscreen": [
    [
      "position",
      "absolute"
    ],
    [
      "width",
      "35%"
    ],
    [
      "right",
      "0"
    ],
    [
      "height",
      "90%"
    ]
  ],
  "xcenter": [
    [
      "position",
      "absolute"
    ],
    [
      "transform",
      "translateX(-50%)"
    ],
    [
      "left",
      "50%"
    ]
  ],
  "ycenter": [
    [
      "position",
      "absolute"
    ],
    [
      "transform",
      "translateY(-50%)"
    ],
    [
      "top",
      "50%"
    ]
  ],
  "space-between": [
    [
      "justify-content",
      "space-between"
    ]
  ],
  "jcbtwn": [
    [
      "justify-content",
      "space-between"
    ]
  ],
  "jcspc": [
    [
      "justify-content",
      "space-evenly"
    ]
  ],
  "abscenter": [
    [
      "position",
      "absolute"
    ],
    [
      "top",
      "0"
    ],
    [
      "left",
      "0"
    ],
    [
      "right",
      "0"
    ],
    [
      "bottom",
      "0"
    ],
    [
      "margin",
      "auto"
    ]
  ],
  "shadow-lg": [
    [
      "box-shadow",
      "rgba(0, 0, 0, 0.1) 0px 4px 12px"
    ]
  ],
  "shadow-sm": [
    [
      "box-shadow",
      "rgba(0, 0, 0, 0.08) 0px 4px 12px"
    ]
  ],
  "rounded": [
    [
      "border-radius",
      "5px"
    ]
  ],
  "times": [
    [
      "font-family",
      "Times"
    ]
  ],
  "georgia": [
    [
      "font-family",
      "Georgia"
    ]
  ],
  "mhauto": [
    [
      "margin",
      "0 auto"
    ]
  ],
  "mauto": [
    [
      "margin",
      "0 auto"
    ]
  ],
  "posa": [
    [
      "position",
      "absolute"
    ]
  ],
  "posr": [
    [
      "position",
      "relative"
    ]
  ],
  "fullscreen": [
    [
      "width",
      "100vw"
    ],
    [
      "height",
      "100vh"
    ]
  ],
  "full": [
    [
      "width",
      "100vw"
    ],
    [
      "height",
      "100vh"
    ]
  ],
  "caps": [
    [
      "text-transform",
      "uppercase"
    ]
  ],
  "underline": [
    [
      "border-bottom",
      "1px solid currentColor"
    ]
  ],
  "lh": [
    [
      "line-height",
      "1.4"
    ]
  ],
  "bold": [
    [
      "font-weight",
      "700"
    ]
  ],
  "superbold": [
    [
      "font-weight",
      "900"
    ]
  ],
  "flex": [
    [
      "display",
      "flex"
    ]
  ],
  "flexc": [
    [
      "display",
      "flex"
    ],
    [
      "flex-direction",
      "column"
    ]
  ],
  "unflex": [
    [
      "display",
      "unset"
    ],
    [
      "flex-direction",
      "unset",
    ],

    [
      "align-items",
      "unset",
    ],

    [
      "justify-content",
      "unset",
    ],
   ],

  "flexcol": [
    [
      "display",
      "flex"
    ],
    [
      "flex-direction",
      "column",
    ],

    [
      "align-items",
      "center",
    ],

    [
      "justify-content",
      "center",
    ],
  ],
  "gmail": [
    [
      "font",
      "small/ 1.5 Arial,Helvetica,sans-serif"
    ]
  ],
  "geist": [
    [
      "flex",
      "1"
    ],
    [
      "justify-content",
      "flex-start"
    ],
    [
      "align-items",
      "stretch"
    ]
  ],
  "antialiased": [
    [
      "text-rendering",
      "optimizeLegibility"
    ],
    [
      "-webkit-font-smoothing",
      "asdflxxanzztzzizzzaliased"
    ]
  ],
  "ol": [
    [
      "text-rendering",
      "optimizeLegibility"
    ],
    [
      "-webkit-font-smoothing",
      "antialiased"
    ]
  ],
  "round": [
    [
      "border-radius",
      "50%"
    ]
  ],
  "bsa": [
    [
      "box-shadow",
      "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
    ]
  ],
  "bsb": [
    [
      "box-shadow",
      "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)"
    ]
  ],
  "bsc": [
    [
      "box-shadow",
      "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)"
    ]
  ],
  "bsd": [
    [
      "box-shadow",
      "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)"
    ]
  ],
  "bse": [
    [
      "box-shadow",
      "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)"
    ]
  ],
  "shadow-md": [
    [
      "box-shadow",
      "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)"
    ]
  ],
  "gridpre": [
    [
      "display",
      "grid"
    ],
    [
      "grid-template-columns",
      "repeat(3, 1fr)"
    ]
  ],
  "grid2": [
    [
      "display",
      "grid"
    ]
  ],
  "transparent": [
    [
      "background",
      "transparent"
    ]
  ],
  "tac": [
    [
      "text-align",
      "center"
    ]
  ],
  "ta": [
    [
      "text-align",
      "center"
    ]
  ],
  "ilb": [
    [
      "display",
      "inline-block"
    ]
  ],
  "block": [
    [
      "display",
      "block"
    ]
  ],
  "radial": [
    [
      "border-radius",
      "50%"
    ]
  ],
  "absolute": [
    [
      "position",
      "absolute"
    ]
  ],

  "blue": [ [ "color", "tailwind-blue" ] ],
  "white": [ [ "color", "white" ] ],
  "black": [ [ "color", "#333" ] ],
  "green": [ [ "color", "tailwind-green" ] ],

  "font16": [
    [ "font-size", "24px" ],
    [ "font-weight", "600" ],
  ],

  "smf": [
    [ "font-size", "24px" ],
    [ "font-weight", "500" ],
  ],

  "sm": [
    [ "font-size", "24px" ],
    [ "font-weight", "500" ],
  ],

  "medf": [
    [ "font-size", "36px" ],
    [ "font-weight", "650" ],
  ],

  "med": [
    [ "font-size", "36px" ],
    [ "font-weight", "650" ],
  ],

  "lgf": [
    [ "font-size", "48px" ],
    [ "font-weight", "650" ],
  ],

  "lg": [
    [ "font-size", "48px" ],
    [ "font-weight", "650" ],
  ],

  "vlg": [
    [ "font-size", "72px" ],
    [ "font-weight", "800" ],
  ],

  "abs": [
    [
      "position",
      "absolute"
    ]
  ],
  "rel": [
    [
      "position",
      "relative"
    ]
  ],
  "sans": [
    [
      "font-family",
      "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif"
    ],
    [ '-webkit-font-smoothing', 'antialiased' ],
    [ '-moz-osx-font-smoothing', 'grayscale' ],
  ],
  "serif": [
    [
      "font-family",
      "Georgia"
    ]
  ],
  "garamond": [
    [
      "font-family",
      "Garamond"
    ]
  ],
  "monospace": [
    [
      "font-family",
      "monospace"
    ]
  ],
  "codestack": [
    [
      "font-family",
      "\"Source Code Pro\", Consolas, Monaco, Menlo, Consolas, monospace"
    ]
  ],
  "mono": [
    [
      "font-family",
      "Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace"
    ]
  ],
  "code": [
    [
      "font-family",
      "monospace"
    ]
  ],
  "hidden": [
    [
      "overflow",
      "hidden"
    ]
  ],
  "cursive": [
    [
      "font-family",
      "relative"
    ]
  ],
  "mathfont": [
    [
      "font-family",
      "relative"
    ]
  ],
  "flatwhite": [
    [
      "color",
      "#EAEAEA"
    ]
  ],
  "flatblack": [
    [
      "color",
      "#333"
    ]
  ],
  "flatblacksocketio": [
    [
      "color",
      "#555"
    ]
  ],
  "flatblack2d": [
    [
      "color",
      "#2d2d2d"
    ]
  ],
  "flatblack24": [
    [
      "color",
      "#242424"
    ]
  ],
  "charcoal": [
    [
      "color",
      "#333"
    ]
  ],
  "gtc": [
    [
      "grid-template-columns",
      "repeat(3, 1fr)"
    ]
  ],
  "gtr": [
    [
      "grid-template-rows",
      "repeat(3, 1fr)"
    ]
  ]
}

const cssattrmap = { /* marked */
    ls: 'letter-spacing',
    hsla: 'hsla',
    a: 'animation',
    kf: '',
    bottom: 'bottom',
    bot: 'bottom',
    top: 'top',
    left: 'left',
    right: 'right',
    cgap: 'column-gap',
    rgap: 'row-gap',
    mc: '',
    gap: 'grid-gap',
    wh: '',
    pcal: '',
    pos: '',
    px: '',
    bs: 'box-shadow',
    py: '',
    mx: '',
    my: '',
    offset: 'offset',
    border: '',
    'ai': 'align-items',
    'jc': 'justify-content',
    gc: 'grid-column',
    gr: 'grid-row',
    b: 'border',
    bb: 'border-bottom',
    bl: 'border-left',
    br: 'border-right',
    bt: 'border-top',
    z: 'z-index',
    o: 'opacity',
    fw: 'font-weight',
    br: 'border-radius',
    bw: 'border-weight',
    lh: 'line-height',
    gg: 'grid-gap',
    ggx: 'row-gap',
    border: 'border',
    ggy: 'column-gap',
    lg: 'linear-gradient',
    bg: 'background',
    bc: 'border-color',
    bb: 'border-bottom',
    fc: 'color',
    fs: 'font-size',
    mw: 'min-width',
    mh: 'min-height',
    minw: 'min-width',
    minh: 'min-height',
    maxw: 'max-width',
    maxh: 'max-height',
    gtc: 'grid-template-columns',
    gtr: 'grid-template-rows',
    w: 'width',
    h: 'height',
    p: 'padding',
    m: 'margin',
    pb: 'padding-bottom',
    pt: 'padding-top',
    pl: 'padding-left',
    pr: 'padding-right',
    mb: 'margin-bottom',
    mt: 'margin-top',
    ml: 'margin-left',
    mr: 'margin-right',
    l: 'left',
    t: 'top',
    right: 'right',
    r: 'rotate',
    ta: 'text-align',
    s: 'scale',
    tx: 'transform',
    ty: 'transform',
    tr: 'transform',
}




function cssCalc(b) {
    const expr = b.replace(/\dp/g, (x) => x[0] + '%').replace(/\d(?=$|[ -])/g, (x) => x + 'px')
    return stringCall('calc', expr)
}


function cssAnimation(b) {
    let items = b.split(/(\d)/)
    let animation
    let duration = '1s'
    let easing = 'ease-in-out'
    let iterations = 1
    let delay = 0
    switch (items.length) {
        case 1:
            animation = items[0]

        case 2:
            animation = items[0]
            duration = items[1] + 's'

        case 3:
            animation = items[0]
            duration = items[1] + 's'
            iterations = 'infinite'
    }
    return joined(animation, duration, easing, delay, iterations, ' ')
}

function cssColorMatch(b) {
    let [color, fontNumber] = hasNumber(b) ? b.split(/(\d+)/).map(atSecond(Number)) : [b, 5]
    let bgNumber = 9 - fontNumber || 1

    if (color.length < 3) color = roygbiv.find((y) => color == y[0])

    let fontColor = tailwind[color + fontNumber]
    let bgColor = tailwind[color + bgNumber]
    return [
        ['color', fontColor],   
        ['background', bgColor],   
    ]

}



const roygbiv = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']

function cssPcal(s) {
    let options

    ;[s, options] = getOptions(s)
    let ref = ['bl', 'br', 'b', 'tl', 'tr', 't']
    let [A,B] = argsplit(s, ref)
    let k = 1
    let margin = 50
    let bottomMargin = margin
    let rightMargin = margin

    if (options.bottom) bottomMargin += Number(options.bottom)
    if (options.right) rightMargin += Number(options.right)

    margin += 'px'
    bottomMargin += 'px'
    rightMargin += 'px'

    switch (A) {
        case 'bl':
        case 'br':
            return [
                ['width', B + '%'],
                ['right', rightMargin],
                ['bottom', bottomMargin],
            ]
        case 'b':
        case 'tl':
        case 'b':
        case 'b':
            return 
    }

    throw ""

    if (options.half) {
        k = 0.5
        return [
            ['width', `calc(${k} * (100% - 2 * ${b})`],
        ]
    }
    else {
        return [
            ['width', `calc(100% - 2 * ${b})`],
            ['height', `calc(100% - 2 * ${b})`],
            ['margin', b]
        ]
    }
}

function cssBoxShadow(b) {
    return "0px 4px 10px rgba(0, 0, 0, 0.25)"
}

function cssBorder(s, key) {
    let match = search(/(-?[\d.]+(?:px)?)(\w+)/, s)
    if (!match) {
        if (isNumber(s)) {
            return [key + '-' + 'width', s + 'px']
        }
        else {
            return ['border-color', cssColor(s)]
        }
    }

    let [a,b] = match
    
    let dashed = ' solid '
    if (isNumber(a)) a += 'px'
    b = cssColor(b)
    return [key, a + dashed + b]
}

function cssColor(b) {
    if (b.length < 3) b = b.replace(/\w/, (x) => roygbiv.find((y) => x == y[0]))
    if (!test(/\d$/, b)) b += 5
    return tailwind[b]
}

function cssUnit(b, key = 'width') {
    if (b.endsWith('p')) {
        return b.replace(/p$/, '%')
    } else if (b != 0 && test(/\d$/, b)) {
        let unit = cssunitmap[search(/\w+/, key)] || 'px'
        return b + unit
    }
    return b
}

const cssunitmap = {
    'rotate': 'deg',
    'scale': '',
    'translate': '%',
}

const tailwind = {
    charcoal: '#36454f',
    none: 'transparent',
    olive: '',
    strawberry: '',
    tomato: '',
    black1: 'asd',
    black2: 'asd',
    black3: 'asd',
    black4: 'asd',
    black5: 'asd',
    black: '#111',
    black6: 'asd',
    black7: 'asd',
    black8: '#111',
    black9: 'asd',
    gray1: '#f7fafc',
    gray2: '#edf2f7',
    gray3: '#e2e8f0',
    gray4: '#cbd5e0',
    gray5: '#a0aec0',
    gray: '#a0aec0',
    gray6: '#718096',
    gray7: '#4a5568',
    gray8: '#2d3748',
    gray9: '#1a202c',
    red1: '#fff5f5',
    red2: '#fed7d7',
    red3: '#feb2b2',
    red4: '#fc8181',
    red5: '#f56565',
    red6: '#e53e3e',
    red7: '#c53030',
    red8: '#9b2c2c',
    red9: '#742a2a',
    orange1: '#fffaf0',
    orange2: '#feebc8',
    orange3: '#fbd38d',
    orange4: '#f6ad55',
    orange5: '#ed8936',
    orange: '#ed8936',
    orange6: '#dd6b20',
    orange7: '#c05621',
    orange8: '#9c4221',
    orange9: '#7b341e',
    yellow1: '#fffff0',
    yellow2: '#fefcbf',
    yellow3: '#faf089',
    yellow4: '#f6e05e',
    yellow5: '#ecc94b',
    yellow: '#ecc94b',
    yellow6: '#d69e2e',
    yellow7: '#b7791f',
    yellow8: '#975a16',
    yellow9: '#744210',
    green1: '#f0fff4',
    green2: '#c6f6d5',
    green3: '#9ae6b4',
    green4: '#68d391',
    green5: '#48bb78',
    green: '#48bb78',
    green6: '#38a169',
    green7: '#2f855a',
    green8: '#276749',
    green9: '#22543d',
    teal1: '#e6fffa',
    teal2: '#b2f5ea',
    teal3: '#81e6d9',
    teal4: '#4fd1c5',
    teal5: '#38b2ac',
    teal: '#38b2ac',
    teal6: '#319795',
    teal7: '#2c7a7b',
    teal8: '#285e61',
    teal9: '#234e52',
    blue1: '#ebf8ff',
    blue2: '#bee3f8',
    blue3: '#90cdf4',
    blue4: '#63b3ed',
    blue5: '#4299e1',
    blue: '#4299e1',
    blue6: '#3182ce',
    blue7: '#2b6cb0',
    blue8: '#2c5282',
    blue9: '#2a4365',
    indigo1: '#ebf4ff',
    indigo2: '#c3dafe',
    indigo3: '#a3bffa',
    indigo4: '#7f9cf5',
    indigo5: '#667eea',
    indigo: '#667eea',
    indigo6: '#5a67d8',
    indigo7: '#4c51bf',
    indigo8: '#434190',
    indigo9: '#3c366b',
    purple1: '#faf5ff',
    purple2: '#e9d8fd',
    purple3: '#d6bcfa',
    purple4: '#b794f4',
    purple5: '#9f7aea',
    purple: '#9f7aea',
    purple6: '#805ad5',
    purple7: '#6b46c1',
    purple8: '#553c9a',
    purple9: '#44337a',
    violet1: '#fff5f7',
    violet2: '#fed7e2',
    violet3: '#fbb6ce',
    violet4: '#f687b3',
    violet5: '#ed64a6',
    violet: '#ed64a6',
    violet6: '#d53f8c',
    violet7: '#b83280',
    violet8: '#97266d',
    violet9: '#702459',

    pink1: '#fff5f7',
    pink2: '#fed7e2',
    pink3: '#fbb6ce',
    pink4: '#f687b3',
    pink5: '#ed64a6',
    pink: '#ed64a6',
    pink6: '#d53f8c',
    pink7: '#b83280',
    pink8: '#97266d',
    pink9: '#702459',
}

