'use strict'

const RefNode = require('@nhz.io/ref-node')

const stringify = o => JSON.stringify(o)
const sanitize = o => JSON.parse(JSON.stringify(o))

function createNode(root, path, nodes) {
    const sym = stringify(path)
    const node = nodes[sym] || new RefNode(root, path)
    node.sym = sym
    nodes[sym] = node
    node.refcount = node.refcount || 0
    return node
}

function createNodes(source, parse, root, path, nodes) {
    const node = createNode(root, path, nodes)
    const refs = parse(source).reduce((refs, {match, path}) => {
        const node = createNode(root, path, nodes)
        node.refcount++
        refs[match] = node
        return refs
    }, {})

    if (Object.keys(refs).length) {
        node.refs = Object.assign(node.refs || {}, refs)
    }
}

function resolveValue(node) {
    const keys = Object.keys(node.refs)
    if(keys.length === 1 && keys[0] === node.value) {
        return node.refs[keys[0]].value
    } else {
        return keys.reduce((result, key) => {
            return result.split(key).join(node.refs[key].value || '')
        }, node.value)
    }
}

function resolveNode(node) {
    if (!node.resolved && !node.resolving) {
        node.resolving = true
        if (node.refs) {
            const keys = Object.keys(node.refs)
            const count = keys.reduce((count, key) => {
                return resolveNode(node.refs[key]) ? count + 1 : count
            }, 0)

            if (count === keys.length)  {
                node.resolved = true
                node.value = resolveValue(node)
            }
        }
        else {
            node.resolved = node.resolves
        }
        node.resolving = false
    }
    return node.resolved
}

function resolveNodes(nodes, unresolved) {
    Object.keys(nodes).forEach(sym => {
        const node = nodes[sym]
        if (!resolveNode(node)) {
            if(node.refs) {
                Object.keys(node.refs).forEach(match => {
                    if (unresolved.indexOf(match) === -1) {
                        unresolved.push(match)
                    }
                })
            }
            if(node.parent) {
                delete node.parent[node.key]
            }
        }
    })
}

function clone(source, parse, root, path, nodes) {
    const type = typeof source
    switch (true) {
        case !source:
            break

        case type === 'string':
            createNodes(source, parse, root, path, nodes)
            break

        case type !== 'object':
            break

        case Array.isArray(source):
            return source.reduce((result, item, idx) => {
                result[idx] = clone(
                    item,            // source
                    parse,           // parse
                    root || result,  // root
                    [...path, idx],  // path
                    nodes            // nodes
                )
                return result
            }, [])

        default:
            return Object.keys(source).reduce((result, key) => {
                result[key] = clone(
                    source[key],     // source
                    parse,           // parse
                    root || result,  // root
                    [...path, key],  // path
                    nodes            // nodes
                )
                return result
            }, {})
    }

    return source
}

function defaultParser(str) {
    return (str.match(/\$\{[^{}]+?\}/gmi) || []).map(k => ({
        match: k, path: k.match(/\$\{([^{}]+?)\}/)[1].split('.')
    }))
}

module.exports = function resolve(source, unresolved = [], nodes = {}, parser) {
    const result = clone(
        sanitize(source),         // source
        parser || defaultParser,  // parse
        null,                     // root
        [],                       // path
        nodes                     // nodes
    )

    resolveNodes(nodes, unresolved)

    return result
}
