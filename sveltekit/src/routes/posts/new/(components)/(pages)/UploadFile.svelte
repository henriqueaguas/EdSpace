<script lang="ts">
	import FileDropZone from '../../../../(components)/FileDropZone.svelte';
	import { notify } from '../../../../(utils)/notify';
	import { type PostPageContent, pages } from '../../(stores)/postPagesStore';
	import { LogicConstraints } from '$lib/services/constraints';
	import { QuizSchema } from '$lib/services/InputValidators/quiz';

	export let selectedPage: PostPageContent;
	export let onFileUploaded: () => void;

	let file: File;

	// Upload Handler
	$: {
		(async () => {
			if (file) {
				if (file.size > LogicConstraints.Posts.MAX_FILE_SIZE)
					notify.error(
						`Max file size allowed is ${LogicConstraints.Posts.MAX_FILE_SIZE} Mb`
					);

				if (file.name.endsWith(LogicConstraints.Posts.ALLOWED_FILE_TYPES.MARKDOWN.ext)) {
					const text = await file.text();
					selectedPage.type = 'Markdown';
					selectedPage.content = text;
				} else if (file.name.endsWith(LogicConstraints.Posts.ALLOWED_FILE_TYPES.QUIZ.ext)) {
					const quiz: any = JSON.parse(await file.text());
					selectedPage.type = 'Quiz';
					QuizSchema.parse(quiz)
						.then((parsedQuiz) => (selectedPage.content = parsedQuiz))
						.catch((err) => {
							notify.error(err.message);
						});
				} else if (file.name.endsWith(LogicConstraints.Posts.ALLOWED_FILE_TYPES.PDF.ext)) {
					selectedPage.type = 'PDF';
					selectedPage.content = file;
					selectedPage.localUrl = URL.createObjectURL(file);
				} else {
					selectedPage.type = 'Image';
					selectedPage.content = file;
					selectedPage.localUrl = URL.createObjectURL(file);
				}
				$pages = $pages;
				onFileUploaded();
			}
		})();
	}
</script>

<FileDropZone bind:file validFileExtensions={LogicConstraints.Posts.ALLOWED_FILE_EXTENSIONS_LIST} />
