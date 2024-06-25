// /**
//  * Allows the use of attachments as a source in HTML <video> tags.
//  * Example usage:
//  * <video src=":/e26f134d3cbcd503bccd94d93fd2dcd3" width="60%" controls="controls"></video>
//  * 
//  */


function renderVideoHtml(before, src, after, contentScriptId, pluginOptions) {
    const resourceId = pluginOptions.ResourceModel.urlToId(src);
    const resourcesStorageItem = localStorage.getItem('resources')
    if (!resourcesStorageItem) return;
    let resources;
    try {
        resources = JSON.parse(resourcesStorageItem)
    } catch (e) {
        return;
    }
    const resourcePath = resources?.[resourceId]
    if (!resourcePath) return;

    return `<video${before}src="${resourcePath}"${after}>`

    /**
     * Does not work with tinymce
     */
    // const postMessageWithResponse = `
    //     if (this.hasAttribute('data-loaded')) return;
    //     this.setAttribute('data-loaded', true);
    //     const el = this;

    //     webviewApi.postMessage('${contentScriptId}', { type: 'getResource', value: '${resourceId}'}).then(function(response) {
    //         if (!response) return;
    //         el.src = response.path;
    //     });
    //     return;
    // `;

    // return `<video${before}src="${src}"${after} onloadstart="${postMessageWithResponse.replace(/\n/g, ' ')}">`
}

export default (context: { contentScriptId: string, postMessage: any } ) => {
    return {
        plugin: async (markdownIt , pluginOptions ) => {

            const htmlInlineDefaultRender = markdownIt.renderer.rules.html_inline ||
            function (tokens, idx, options, _env, self) {
                return self.renderToken(tokens, idx, options);
            };

            markdownIt.renderer.rules.html_inline = function (tokens, idx, options, env, self) {
                const token = tokens[idx];
                
                const videoRegex = /<video(.*?)src=["'](.*?)["'](.*?)>/gi;
                if (!token.content.match(videoRegex)) return htmlInlineDefaultRender(tokens, idx, options, env, self);

                return token.content.replace(videoRegex, (_v, before, src, after) => {
                    if (!pluginOptions.ResourceModel.isResourceUrl(src)) return `<video${before}src="${src}"${after}>`;
                    const r = renderVideoHtml(before, src, after, context.contentScriptId, pluginOptions);
                    if (r) return r;
                    return `<video${before}src="${src}"${after}>`;
                });
            }
            

        },
    };
};