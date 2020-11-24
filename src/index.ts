import marked from "marked"
import { promises } from "fs"
import assets from "./assets.json"
const fs = promises

class HtmlConverter {
    marked_options: marked.MarkedOptions
    renderer: marked.Renderer
    attrs_matcher: RegExp = /\&lt;\&lt;\S*\&gt;\&gt;/g
    fontawesome_matcher: RegExp = /\[\[[^\n]*\]\]/g
    ui_style: any = ""
    ui_script: any = ""
    template_html: any = ""
    designs: { [key: string]: string} = {}

    constructor() {
        this.ui_style = assets["ui-style"]
        this.ui_script = assets["ui-script"]
        this.template_html = assets["template-html"]

        for(let design of assets["designs"]) {
            const splited = design.split("::")
            const name: string = splited[0]
            const css: string = splited.slice(1).join("::")
            this.designs[name] = css
        }

        this.renderer = new marked.Renderer()
        this.renderer.heading = (text: string, level: number): string => {
            const fontawesome_loaded: string = this.loadFontAwesome(text)
            const attrs_loaded = this.loadAttrs(fontawesome_loaded)
            const classes = attrs_loaded.attrs.class.join(" ")
            const ids = attrs_loaded.attrs.id.join(" ")
            return `<h${level} class="${classes}" id="${ids}">${attrs_loaded.without_attrs}</h${level}>`
        }

        this.renderer.code = (code: string, infostring: string, isEscaped: boolean): string => {
            const fontawesome_loaded: string = this.loadFontAwesome(infostring)
            const attrs_loaded = this.loadAttrs(fontawesome_loaded)
            const language_class = attrs_loaded.without_attrs ? "language-" + attrs_loaded.without_attrs : ""
            const classes = attrs_loaded.attrs.class.join(" ")
            const ids = attrs_loaded.attrs.id.join(" ")

            const delimiter = ':';
            const info = infostring.split(delimiter);
            const lang = info.shift();
            const file_name = info.join(delimiter); // 2つ目以降のdelimiterはファイル名として扱う
            if (file_name) {
                const file_tag = '<code class="filename language-plaintext">'+file_name+'</code>'
                return `<pre>${file_tag}<code class="${language_class} ${classes} with-filename" id="${ids}">${code}</code></pre>`
            }else{
                return `<pre><code class="${language_class} ${classes}" id="${ids}">${code}</code></pre>`
            }
        }

        this.renderer.blockquote = (quote: string): string => {
            const fontawesome_loaded: string = this.loadFontAwesome(quote)
            const attrs_loaded = this.loadAttrs(fontawesome_loaded)
            const classes = attrs_loaded.attrs.class.join(" ")
            const ids = attrs_loaded.attrs.id.join(" ")
            return `<p><code class="${classes}" id="${ids}">${attrs_loaded.without_attrs}</code></p>`
        }

        this.renderer.listitem = (text: string): string => {
            const fontawesome_loaded: string = this.loadFontAwesome(text)
            const attrs_loaded = this.loadAttrs(fontawesome_loaded)
            const classes = attrs_loaded.attrs.class.join(" ")
            const ids = attrs_loaded.attrs.id.join(" ")
            return `<p class="list ${classes}" id="${ids}"><i class="list-icon fas fa-caret-right"></i>${attrs_loaded.without_attrs}</p>`
        }

        this.renderer.paragraph = (text: string): string => {
            const fontawesome_loaded: string = this.loadFontAwesome(text)
            const attrs_loaded = this.loadAttrs(fontawesome_loaded)
            const classes = attrs_loaded.attrs.class.join(" ")
            const ids = attrs_loaded.attrs.id.join(" ")
            return `<p class="${classes}" id="${ids}">${attrs_loaded.without_attrs}</p>`
        }

        this.renderer.tablecell = (content: string, flags: any): string => {
            const fontawesome_loaded: string = this.loadFontAwesome(content)
            const attrs_loaded = this.loadAttrs(fontawesome_loaded)
            const classes = attrs_loaded.attrs.class.join(" ")
            const ids = attrs_loaded.attrs.id.join(" ")
            const tag = flags.header ? "th" : "td"
            return `<${tag} class="${classes}" id="${ids}">${attrs_loaded.without_attrs}</${tag}>`
        }

        this.renderer.hr = (): string => {
            return `</div><div class="slide">`
        }

        this.renderer.image = (href: string, title: string, text: string): string => {
            const fontawesome_loaded: string = this.loadFontAwesome(text)
            const attrs_loaded = this.loadAttrs(fontawesome_loaded)
            const classes = attrs_loaded.attrs.class.join(" ")
            const ids = attrs_loaded.attrs.id.join(" ")
            return `<img class="${classes}" id="${ids}" src="${href}" alt="${attrs_loaded.without_attrs}">`
        }

        this.marked_options = {
            renderer: this.renderer,
            gfm: true
        }

        marked.use(this.marked_options)
    }

    async convert(amato_markdown: string, design_type: string = "default"): Promise<string> {
        if(!Object.keys(this.designs).includes(design_type)) {
            throw "Invalid design type."
        }

        const slides_html: string = marked(amato_markdown)
        const design_css = this.designs[design_type]
        const generated_html: string = this.template_html
            .replace("{{ui-css}}", this.ui_style)
            .replace("{{ui-script}}", this.ui_script)
            .replace("{{slides-html}}", slides_html)
            .replace("{{design-css}}", design_css)

        return generated_html
    }

    loadFontAwesome(text: string): string {
        const matched: RegExpMatchArray | null = text.match(this.fontawesome_matcher)
        let loaded: string = text
        if (matched) for (const match of matched) {
            const fontawesome_classes = match.replace(/\[|\]/g, "")
            const fontawesome = `<i class="${fontawesome_classes}"></i>`
            loaded = loaded.replace(match, fontawesome)
        }

        return loaded
    }

    getClassAndId(text: string): object {
        const attributes = text.replace(/\&lt;|\&gt;/g, "").split(/(?=\.)|(?=\#)/)
        let classes = []
        let ids = []

        for (const attr of attributes) {
            if (attr[0] == ".") classes.push(attr.slice(1))
            else if (attr[0] == "#") ids.push(attr.slice(1))
        }

        return {
            class: classes,
            id: ids
        }
    }

    loadAttrs(text: string): any {
        const attrs_segments = text.match(this.attrs_matcher)
        if (!attrs_segments) return {
            is_found_attrs: false,
            without_attrs: text,
            attrs: {
                class: [],
                id: []
            }
        }

        const without_attrs = text.replace(this.attrs_matcher, "")
        const attrs = this.getClassAndId(attrs_segments.join(""))

        return {
            is_found_attrs: true,
            without_attrs,
            attrs
        }
    }
}

export default HtmlConverter;