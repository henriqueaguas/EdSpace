<script lang="ts">
	import { LogicConstraints } from '$lib/services/constraints';
	import Icon from '../../../../../(assets)/Icon.svelte';

	export let question: tquiz.QuizQuestion;
	export let questionNr: number;
	export let hasPrev: boolean;
	export let hasNext: boolean;
	export let onGotoNext: () => void;
	export let onGotoPrev: () => void;
	export let onRemoveQuestion: () => void;

	function addAnswer() {
		question.answers = [...question.answers, { answer: '', isCorrect: false }];
	}

	function removeAnswer(answer: string) {
		question.answers.splice(
			question.answers.findIndex((a) => a.answer === answer),
			1
		);
		question.answers = question.answers;
	}
</script>

<div
	class="flex rounded-lg flex-col items-center justify-start w-full gap-4 p-6 bg-dark text-orange shadow-sm shadow-black"
>
	<span class="flex items-center justify-center">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span class="w-8">
			{#if hasPrev}
				<span class="cursor-pointer pt-4" on:click={onGotoPrev}>
					<Icon name="ChevronLeft" />
				</span>
			{/if}
		</span>
		<span class="text-2xl font-bold text-orange text-opacity-80">#{questionNr} Question</span>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<button class="text-red-600 mx-2" on:click={onRemoveQuestion}>
			<Icon name="Trash2" />
		</button>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span class="w-8">
			{#if hasNext}
				<span class="cursor-pointer pt-4" on:click={onGotoNext}>
					<Icon name="ChevronRight" />
				</span>
			{/if}
		</span>
	</span>

	<input
		bind:value={question.title}
		type="text"
		placeholder="Write your question here"
		class="input-border-down w-[90%] text-center text-2xl"
	/>

	{#each question.answers as answer}
		<ul class="flex items-center justify-center gap-2 w-full h-10">
			<input
				bind:value={answer.answer}
				placeholder="Answer"
				type="text"
				class="input-border text-md w-[60%]"
			/>
			<input
				bind:checked={answer.isCorrect}
				type="checkbox"
				class="checkbox checkbox-success border-opacity-30 h-full w-10"
			/>
			<button
				on:click={() => removeAnswer(answer.answer)}
				class="text-red-600 transition-all hover:scale-110"
			>
				<Icon name="Trash2" />
			</button>
		</ul>
	{/each}

	{#if question.answers.length < LogicConstraints.Posts.QUIZ.MAX_ANSWERS}
		<button
			on:click={addAnswer}
			id="create-answer-btn"
			class="mbtn-hover border-opacity-50 p-0 py-2 px-10 rounded-3xl"
		>
			Add Answer
		</button>
	{/if}
</div>
