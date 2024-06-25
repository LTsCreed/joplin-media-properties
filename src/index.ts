import joplin from 'api';
import { ContentScriptType } from 'api/types';
//import { Message } from "./types";



joplin.plugins.register({
	onStart: async function() {
		const contentScriptId = 'video-src-attachment';
		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			contentScriptId,
			'./videoSrcAttachmentCS.js',
		);

		/**
		 * Does not work with tinymce
		 */
		// await joplin.contentScripts.onMessage(
		// 	contentScriptId,
		// 	async (message: Message) => {
		// 		if (message.type === 'getResource') {
		// 			const resourcePath = await joplin.data.resourcePath(message.value).catch(() => undefined);
		// 			if (!resourcePath) return;
		// 			return {
		// 				"path": resourcePath
		// 			};
		// 		}
		// 	},
		// );

		async function updateResources() {
            const note = await joplin.workspace.selectedNote();

            if (note) {
				const resources = {}
				for (const item of note.body.matchAll(/:\/([A-Za-z0-9]{32})/gi)) {
					const resourceId = item[1]
					if (!resourceId) continue;
					if (resourceId in resources) continue;
					const resourcePath = await joplin.data.resourcePath(resourceId)
					if (!resourcePath) continue;
					resources[resourceId] = resourcePath;
				  }

				localStorage.setItem('resources', JSON.stringify(resources))
            }
        }

        // This event will be triggered when the user selects a different note
        await joplin.workspace.onNoteSelectionChange(() => {
            updateResources();
        });

        // This event will be triggered when the content of the note changes
        await joplin.workspace.onNoteChange(() => {
            updateResources();
        });

        // Update when the plugin starts
        updateResources();
	
	},
});
