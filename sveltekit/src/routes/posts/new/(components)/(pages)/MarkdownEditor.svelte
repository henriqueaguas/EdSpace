<script lang="ts">
	import MarkdownContent from '../../../../(components)/MarkdownContent.svelte';
	import type { PostPageContent } from '../../(stores)/postPagesStore';
	import Icon from '../../../../(assets)/Icon.svelte';

	export let selectedPage: PostPageContent;

	let mode: 'preview' | 'edit' = 'edit';
	let sideToSidePreview = true;
	$: pageContent = selectedPage.content as string;

	function adjustHeight(event: any) {
		event.target.style.height = 'auto';
		event.target.style.height = event.target.scrollHeight + 'px';
	}

	function textEditorInputHandler(e: any) {
		// Avoid Tab switching DOM element focus
		if (e.key === 'Tab') {
			e.preventDefault();
			const start = e.target.selectionStart;
			const end = e.target.selectionEnd;
			e.target.value =
				e.target.value.substring(0, start) + '\t' + e.target.value.substring(end);
			e.target.selectionStart = e.target.selectionEnd = start + 1;
		}
	}
</script>

<div class="w-[95vw] md:w-[85vw] mt-8 flex justify-start items-center gap-2">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span
		on:click={() => (sideToSidePreview = true)}
		class={`p-2 rounded-t-md h-full flex items-center cursor-pointer ${
			sideToSidePreview ? 'bg-orange fill-dark text-dark' : 'bg-dark fill-orange text-orange'
		}`}
	>
		<Icon name="Edit" cl="scale-[140%] mx-2" />
		<span>
			<hr
				class={`border-2 mx-2 rounded-full h-8 ` +
					(sideToSidePreview ? 'border-dark' : 'border-orange')}
			/>
		</span>
		<Icon name="Eye" cl="scale-[170%] mx-2" />
	</span>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span
		on:click={() => {
			mode = 'edit';
			sideToSidePreview = false;
		}}
		class={`p-3 h-12 rounded-t-md flex items-center cursor-pointer ${
			!sideToSidePreview && mode === 'edit' ? ' bg-orange text-dark' : 'bg-dark text-orange'
		}`}
	>
		<Icon name="Edit" cl="scale-[140%] mx-2" />
	</span>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span
		on:click={() => {
			mode = 'preview';
			sideToSidePreview = false;
		}}
		class={`p-2 rounded-t-md h-12 flex items-center cursor-pointer ${
			!sideToSidePreview && mode === 'preview'
				? 'bg-orange fill-dark text-dark'
				: 'bg-dark fill-orange text-orange'
		}`}
	>
		<Icon name="Eye" cl="scale-[170%] mx-2" />
	</span>
</div>

<div class="flex items-stretch justify-center w-[95vw] md:w-[85vw] gap-1 h-fit">
	{#if sideToSidePreview || mode === 'edit'}
		<textarea
			on:input={adjustHeight}
			bind:value={selectedPage.content}
			on:keydown={textEditorInputHandler}
			contenteditable
			class={(sideToSidePreview ? 'w-[50%]' : '') +
				` w-full min-h-[750px] text-white text-opacity-75 border-orange border-opacity-20 rounded-md p-6 text-2xl outline-none bg-dark border-2  placeholder:text-orange placeholder:opacity-50`}
			placeholder="Write in markdown here"
		/>
	{/if}
	{#if sideToSidePreview || mode === 'preview'}
		<span
			class={(sideToSidePreview ? 'w-[50%]' : '') +
				` w-full h-full min-h-[750px] bg-dark flex items-start border-2 border-orange border-opacity-20 rounded-md p-5`}
		>
			<MarkdownContent content={pageContent} />
		</span>
	{/if}
</div>
