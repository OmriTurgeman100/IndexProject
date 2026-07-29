import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { DecorationSet, Decoration } from '@tiptap/pm/view'
import { Node } from '@tiptap/pm/model'

type CustomExtensionOptions = {
    customOption: string
}

export const decorationsPluginKey = new PluginKey('DecorationsPlugin')

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildDecorations(doc: Node, keyword: string) {
    const decorations: Decoration[] = []
    const classes: string[] = []

    if (!keyword.trim()) {
        return {
            decorationSet: DecorationSet.empty,
            decorations,
            classes
        }
    }

    const regex = new RegExp(escapeRegExp(keyword), 'gi')
    let index = 1

    doc.descendants((node, pos) => {
        if (!node.isText || !node.text) return

        let match: RegExpExecArray | null

        while ((match = regex.exec(node.text)) !== null) {
            const from = pos + match.index
            const to = from + match[0].length

            decorations.push(
                Decoration.inline(from, to, {
                    class: `decorations-highlight decorations-highlight-${index}`,
                }),
            )

            classes.push(`decorations-highlight-${index}`)

            index++
        }
    })

    return {
        decorationSet: DecorationSet.create(doc, decorations),
        decorations,
        classes,
    }
}

export const DecorationsPlugin = Extension.create<CustomExtensionOptions>({
    name: 'DecorationsPlugin',

    addOptions() {
        return {
            customOption: 'keyword',
        }
    },

    addProseMirrorPlugins() {
        const { customOption } = this.options

        return [
            new Plugin({
                key: decorationsPluginKey,

                state: {
                    init(_, { doc }) {
                        return buildDecorations(doc, customOption)
                    },

                    apply(tr, oldDecorations) {
                        if (!tr.docChanged) {
                            return oldDecorations
                        }

                        return buildDecorations(tr.doc, customOption)
                    },
                },

                props: {
                    decorations(state) {
                        return decorationsPluginKey.getState(state)?.decorationSet
                    },
                },
            }),
        ]
    },
})