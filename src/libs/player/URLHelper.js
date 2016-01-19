class URLHelper {
    constructor() {
        this.doc = document;
        this.old_base = this.doc.getElementsByTagName('base')[0];
        this.old_href = this.old_base && this.old_base.href;
        this.doc_head = this.doc.head || this.doc.getElementsByTagName('head')[0];
        this.our_base = this.old_base || this.doc.createElement('base');
        this.resolver = this.doc.createElement('a');
    }

    resolveURL(base_url, url) {
        this.old_base || this.doc_head.appendChild(this.our_base);

        this.our_base.href = base_url;
        this.resolver.href = url;
        let resolved_url = this.resolver.href; // browser magic at work here

        this.old_base ? this.old_base.href = this.old_href : this.doc_head.removeChild(this.our_base);

        return resolved_url;
    };
}

export default URLHelper;