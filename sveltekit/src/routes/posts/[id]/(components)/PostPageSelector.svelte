<script lang="ts">
	import MarkdownContent from '../../../(components)/MarkdownContent.svelte';
	import { fly } from 'svelte/transition';
	import QuizTaker from './QuizTaker.svelte';

	export let pages: tpost.PostPage[];

	let selectedPageIdx: number = 0;
	$: selectedPage = pages[selectedPageIdx];

	let pageElement: HTMLElement;

	function changePage(idx: number) {
		selectedPageIdx = idx;
		const pagesElementTop = pageElement.getBoundingClientRect().top + window.pageYOffset - 40;
		window.scrollTo({ top: pagesElementTop, behavior: 'smooth' });
	}
</script>

<div id="wrapper" class="flex flex-col justify-center w-full overflow-hidden">
	<h2 class="text-center text-white opacity-40 text-xl">Pages</h2>

	<ul
		id="page-selectors"
		class="flex items-center justify-center p-3 mb-8"
		bind:this={pageElement}
	>
		{#if pages}
			{#each Array.from({ length: pages.length }, (_, i) => i + 1) as pageNumber}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<li
					class={`w-8 h-8 flex items-center justify-center border-2 rounded-full border-orange mx-2 transition-all cursor-pointer hover:scale-125 ${
						selectedPageIdx + 1 === pageNumber
							? 'text-dark bg-orange font-bold scale-125'
							: ''
					}`}
					on:click={() => changePage(pageNumber - 1)}
				>
					{pageNumber}
				</li>
			{/each}
		{/if}
	</ul>

	<div id="page" class="min-h-[85vh] flex justify-center items-start">
		{#if selectedPage.type === 'Markdown'}
			<span class="w-full max-h-[87vh] overflow-y-scroll" in:fly>
				<MarkdownContent url={selectedPage.remoteUrl} />
			</span>
		{:else if selectedPage.type === 'Image'}
			<img
				in:fly
				class="w-[85%] md:w-[75%] max-h-[95vh] object-contain"
				src={selectedPage.remoteUrl}
				alt="img"
			/>
		{:else if selectedPage.type === 'PDF'}
			<object
				in:fly
				title="PDF attachment"
				class="w-full min-h-[700px]"
				data={selectedPage.remoteUrl}
				type="application/pdf"
				>{selectedPage.remoteUrl}
			</object>
		{:else if selectedPage.type === 'Quiz'}
			<span class="w-full flex justify-center" in:fly>
				<QuizTaker quiz={selectedPage.quiz} />
			</span>
		{/if}
	</div>
</div>
