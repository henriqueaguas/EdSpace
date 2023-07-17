<script lang="ts">
	import MarkdownEditor from './(pages)/MarkdownEditor.svelte';
	import QuizEditor from './(pages)/(QuizEditor)/QuizEditor.svelte';
	import UploadFile from './(pages)/UploadFile.svelte';
	import { newBlankPage, pages } from '../(stores)/postPagesStore';
	import Icon from '../../../(assets)/Icon.svelte';

	export let MAX_PAGES_COUNT: number;

	type PageCategory = 'Quiz' | 'Markdown' | 'Upload';

	let showUploadForm = false;

	let selectedPageIdx = 0;
	$: selectedPage = $pages[selectedPageIdx];

	function createPage() {
		pages.update((p) => [...p, newBlankPage()]);
		// Select the new page
		selectedPageIdx = $pages.length - 1;
	}

	function pickPageType(category: PageCategory) {
		if (category === 'Markdown') {
			selectedPage.type = 'Markdown';
			selectedPage.content = '';
			selectedPage = selectedPage;
		} else if (category === 'Quiz') {
			selectedPage.type = 'Quiz';
			selectedPage.content = {
				name: '',
				questions: []
			} satisfies tquiz.Quiz;
			selectedPage = selectedPage;
		} else if (category === 'Upload') showUploadForm = true;
	}

	function selectPage(pageIdx: number) {
		selectedPageIdx = pageIdx;
		showUploadForm = false;
		pages.update((p) => p.filter((i) => i.type));
	}

	function deleteSelectedPage() {
		showUploadForm = false;

		if (selectedPageIdx === 0 && $pages.length === 1) {
			$pages[0] = newBlankPage();
			$pages = $pages;
			return;
		}

		let shiftedItems = $pages.slice(selectedPageIdx + 1);
		$pages.splice(selectedPageIdx, shiftedItems.length + 1);
		$pages.push(...shiftedItems);
		$pages = $pages;

		if (selectedPageIdx !== 0) {
			selectedPageIdx--;
		}
	}
</script>

<div class="flex flex-col items-start mt-3">
	<h5 class="text-start mb-3">Post Pages</h5>

	<ul class="flex gap-2 pl-1">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		{#each Array.from({ length: $pages.length }, (_, i) => i) as pageIdx}
			<li
				class={'flex items-center justify-center text-3xl border-2 transition-all cursor-pointer border-orange rounded-md px-2 shadow-md ' +
					(pageIdx === selectedPageIdx
						? 'bg-orange text-dark scale-110'
						: 'bg-dark text-orange hover:bg-orange hover:text-dark')}
				on:click={() => selectPage(pageIdx)}
			>
				{pageIdx + 1}
			</li>
		{/each}
		{#if $pages.length < MAX_PAGES_COUNT && $pages.every((p) => p.type != null)}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<button
				class={'flex items-center justify-center bg-dark text-orange hover:bg-orange hover:text-dark border-orange text-3xl border-2 transition-all cursor-pointer rounded-md px-2 shadow-md'}
				on:click={createPage}
			>
				+
			</button>
		{/if}
	</ul>

	<div
		id="current-page"
		class={`flex flex-col items-center justify-center w-full py-5 mt-2 rounded-lg ${
			selectedPage.type || showUploadForm ? '' : ' border-2 border-orange border-opacity-25'
		}`}
	>
		{#if selectedPage.type}
			{#if selectedPage.type === 'Markdown'}
				<span class="flex items-center gap-2 mb-8">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						on:click={deleteSelectedPage}
						class="transition-all cursor-pointer scale-110 pb-1"
					>
						<Icon name="Trash2" cl="text-red-600" />
					</span>
					<h4>Markdown Editor</h4>
				</span>
				<MarkdownEditor {selectedPage} />
			{:else if selectedPage.type === 'Quiz'}
				<span class="flex items-center gap-2 mb-8">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						on:click={deleteSelectedPage}
						class="transition-all cursor-pointer scale-110 pb-1"
					>
						<Icon name="Trash2" cl="text-red-600" />
					</span>
					<h4>Quiz Editor</h4>
				</span>
				<QuizEditor {selectedPage} />
			{:else if selectedPage.type === 'Image'}
				<span class="flex items-center gap-2 mb-8">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						on:click={deleteSelectedPage}
						class="transition-all cursor-pointer scale-110 pb-1"
					>
						<Icon name="Trash2" cl="text-red-600" />
					</span>
					<h4>Image Preview</h4>
				</span>
				<img
					class="w-[85%] md:w-[75%] max-h-[95vh] object-contain"
					src={selectedPage.localUrl}
					alt=""
				/>
			{:else if selectedPage.type === 'PDF'}
				<span class="flex items-center gap-2 mb-8">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						on:click={deleteSelectedPage}
						class="transition-all cursor-pointer scale-110 pb-1"
					>
						<Icon name="Trash2" cl="text-red-600" />
					</span>
					<h4>PDF Preview</h4>
				</span>
				<object
					title="PDF attachment"
					class="w-full min-h-[700px]"
					data={selectedPage.localUrl}
					type="application/pdf"
				>
					<p>Your web browser doesn't have a PDF plugin</p>
				</object>
			{/if}
		{:else if showUploadForm}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<span class="flex items-center gap-2 mb-8">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<span
					on:click={deleteSelectedPage}
					class="transition-all cursor-pointer scale-110 pb-1"
				>
					<Icon name="Trash2" cl="text-red-600" />
				</span>
				<h4>File Uploader</h4>
			</span>
			<UploadFile {selectedPage} onFileUploaded={() => (showUploadForm = false)} />
		{:else}
			<div class="flex items-center justify-center rounded-lg p-12 w-full">
				<div
					class="flex flex-col gap-6 items-center justify-center border-2 rounded-lg border-dashed border-orange p-10"
				>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105"
						on:click={() => pickPageType('Upload')}
					>
						<Icon name="Upload" cl="scale-150 mb-3" />
						<span class="text-lg font-bold text-center">Upload Files</span>
						<span class="text-center">(markdown, pdf, image, quiz)</span>
					</span>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105"
						on:click={() => pickPageType('Markdown')}
					>
						<Icon name="Edit" cl="scale-150 mb-3" />
						<span class="text-lg font-bold text-center">Write text/markdown</span>
					</span>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span
						class="flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105"
						on:click={() => pickPageType('Quiz')}
					>
						<Icon name="FileQuestion" cl="scale-150 my-2" />
						<span class="text-lg font-bold text-center">Create a Quiz</span>
					</span>
				</div>
			</div>
		{/if}
	</div>
</div>
