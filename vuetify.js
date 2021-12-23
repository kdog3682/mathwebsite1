function vuetify(x) {
    return isDirective(x) ? vuetifyDirective(x) : vuetifyFunction(x)
}

function isDirective(x) {
    return getFirstParameter(x).startsWith('el')
}


function vuetifyDirective(fn) {

    function shortened(fn) {
        function directive(el, binding, node) {
            try {
                if (binding.value) {
                    fn(el, binding.value)
                }
            }
            catch(e) {
                console.log('error @ directive', e)
                console.log(binding)
            }
        }
        return directive
    }

    function create(fn) {
        return test(/^.*?binding/, fn.toString()) ? fn : shortened(fn)
    }
    
    const name = fn.name.replace(/^v/, '')
    Vue.directive(name, {inserted: create(fn), update: create(fn)})
}

function vuetifyFunction(fn) {
    const payload = isClass(fn) ? new fn() : fn
    let name = test(/^\$?(?:to|is|has|get|set|asdf)/, fn.name) ? fn.name : fn.name.toLowerCase()
    if (!name.startsWith('$')) name = '$' + name
    if (isClass(fn)) {
        name = '$' + abbreviate(payload.constructor.name)
    }
    console.log(name)
    Vue.prototype[name] = payload
}

