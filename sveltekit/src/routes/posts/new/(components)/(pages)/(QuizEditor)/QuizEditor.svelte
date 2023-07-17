<script lang="ts">
	import ShowFormError from './../../ShowFormError.svelte';
	import type { PostPageContent } from '../../../(stores)/postPagesStore';
	import { onMount } from 'svelte';
	import { LogicConstraints } from '$lib/services/constraints';
	import { QuizSchema } from '$lib/services/InputValidators/quiz';
	import QuestionEditor from './QuestionEditor.svelte';
	import type { ParseObjectError } from '$lib/_errors/ParseObjectError';

	export let selectedPage: PostPageContent;
	export let formErrors: Record<string, string> = {};

	// Initialize Quiz Page
	$: quiz = selectedPage.content as tquiz.Quiz; // | undefined
	$: currentQuestionIdx = quiz.questions.length === 0 ? null : quiz.questions.length - 1;

	function addQuestion() {
		quiz.questions = [...quiz.questions, { title: '', answers: [] }];
		currentQuestionIdx = currentQuestionIdx !== null ? quiz.questions.length - 1 : 0;
	}

	function removeQuestion() {
		if (currentQuestionIdx === null) {
			return;
		}

		let shiftedItems = quiz.questions.slice(currentQuestionIdx + 1);
		quiz.questions.splice(currentQuestionIdx, shiftedItems.length + 1);
		quiz.questions.push(...shiftedItems);
		quiz.questions = quiz.questions;

		if (currentQuestionIdx === 0) {
			if (quiz.questions.length === 0) currentQuestionIdx = null;
			// keep 0
		} else {
			currentQuestionIdx--;
		}

		quiz.questions = quiz.questions;
	}

	function gotoPrevQuestion() {
		if (currentQuestionIdx !== null) currentQuestionIdx--;
	}

	function gotoNextQuestion() {
		if (currentQuestionIdx !== null) currentQuestionIdx++;
	}

	// Keep validating quiz to provide quick feedback on error
	onMount(() => {
		setInterval(async () => {
			try {
				QuizSchema.parseSync(quiz);
				formErrors = {};
			} catch (e) {
				formErrors = (e as ParseObjectError).fieldErrors;
			}
		}, 1500);
	});
</script>

<div
	class="flex flex-col bg-orange text-dark p-4 py-6  md:p-6 items-start justify-start gap-4 w-full md:w-[70%] rounded-lg m-2 shadow-lg shadow-black"
>
	<label for="quiz-name" class="text-3xl w-full font-bold opacity-90">Name</label>
	<input
		bind:value={quiz.name}
		id="quiz-name"
		type="text"
		class="input-border text-start font-bold text-2xl w-full md:w-[80%] pl-5"
		maxlength={LogicConstraints.Posts.QUIZ.MAX_TEXT}
	/>
	<ShowFormError cl="font-bold" error={formErrors.name} />

	<label for="quiz-questions" class="text-3xl w-full font-bold opacity-90 ">Questions</label>
	{#if currentQuestionIdx !== null}
		<QuestionEditor
			bind:question={quiz.questions[currentQuestionIdx]}
			questionNr={currentQuestionIdx + 1}
			hasPrev={currentQuestionIdx !== null && currentQuestionIdx > 0}
			hasNext={currentQuestionIdx !== null && currentQuestionIdx < quiz.questions.length - 1}
			onGotoPrev={gotoPrevQuestion}
			onGotoNext={gotoNextQuestion}
			onRemoveQuestion={removeQuestion}
		/>
	{/if}
	<ShowFormError cl="font-bold" error={formErrors.questions} />

	{#if quiz.questions.length < LogicConstraints.Posts.QUIZ.MAX_QUESTIONS}
		<button
			on:click={addQuestion}
			id="create-question-btn"
			class="mbtn-invert-hover p-0 py-2 px-10 rounded-3xl border-dark"
		>
			Add Question
		</button>
	{/if}
</div>
