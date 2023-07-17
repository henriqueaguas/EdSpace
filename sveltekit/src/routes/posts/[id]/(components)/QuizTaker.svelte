<script lang="ts">
	import { currentQuiz } from '../(stores)/quizTakerStore';

	export let quiz: tquiz.Quiz;

	/**
	 * QuizState is stored in a store in order to persist its state across this component remounts
	 * (e.g. user navigates to another post page)
	 */
	// Clone it so that reset works properly (the quiz received as prop is never modified)
	if ($currentQuiz === null || $currentQuiz.name !== quiz.name)
		currentQuiz.set(structuredClone(quiz));

	let currentQuestionIdx = 0;
	$: currentQuestion = $currentQuiz!.questions[currentQuestionIdx];
	$: currentAnswers = currentQuestion.answers;
	$: hasFinishedQuiz = $currentQuiz!.finished;

	$: quizStats = () => {
		$currentQuiz!.questions[currentQuestionIdx].answers[0].marked;

		const myCorrectAnswers = $currentQuiz!.questions.filter(
			(qq) => qq.answers.filter((a: any) => a.isCorrect && a.marked === true).length
		).length;

		const totalCorrectAnswers = $currentQuiz!.questions.filter(
			(qq) => qq.answers.filter((a: any) => a.isCorrect).length
		).length;

		const hasAnsweredAll =
			$currentQuiz!.questions.filter(
				(qq) => qq.answers.filter((a: any) => typeof a.marked !== 'undefined').length
			).length === $currentQuiz!.questions.length;

		return {
			totalCorrectAnswers,
			myCorrectAnswers,
			hasAnsweredAll
		};
	};

	function toggleAnswer(answer: string) {
		const answerIdx = currentQuestion.answers.findIndex((a) => a.answer === answer);
		const answerMarked = $currentQuiz!.questions[currentQuestionIdx].answers[answerIdx].marked;
		$currentQuiz!.questions[currentQuestionIdx].answers[answerIdx].marked = !answerMarked;
		$currentQuiz = $currentQuiz;
	}

	function finishQuiz() {
		$currentQuiz!.finished = true;
	}

	function retryQuiz() {
		currentQuiz.set(structuredClone(quiz));
		$currentQuiz = $currentQuiz;
		$currentQuiz!.finished = false;
		currentQuestionIdx = 0;
	}
</script>

<div
	class="flex flex-col bg-orange text-dark p-4 py-6 md:p-6 items-center justify-center gap-4 w-full md:w-[70%] rounded-lg m-2 shadow-lg shadow-black"
>
	<h4 class="w-full font-extrabold opacity-90 text-center">
		{quiz.name}
	</h4>

	<div
		class={`flex w-full h-full rounded-lg flex-col justify-between items-center gap-4 p-6 bg-dark text-orange shadow-sm shadow-black`}
	>
		{#if hasFinishedQuiz}
			<div class="w-full flex flex-col gap-2 items-center justify-center">
				<h4>Results</h4>
				<hr class="w-[85%] border-orange rounded-full border-2 mb-3" />
			</div>
		{:else}
			<span class="flex flex-col items-center justify-center">
				<h4>{currentQuestion.title}</h4>
				<p>{currentQuestionIdx + 1}/{quiz.questions.length}</p>
			</span>
		{/if}

		<ol class="w-full flex flex-col justify-center items-center">
			{#if hasFinishedQuiz}
				<li class="flex flex-col items-center justify-center">
					<label for="correct-answers-percentage" class="text-2xl font-bold"
						>Correct Answers</label
					>
					<div id="correct-answers-percentage">
						<span class="font-bold text-xl">{quizStats().myCorrectAnswers}</span>
						/
						<span class="font-bold text-xl">{quizStats().totalCorrectAnswers}</span>
						<span>
							({(quizStats().myCorrectAnswers / quizStats().totalCorrectAnswers) *
								100}%)
						</span>
					</div>
				</li>
			{:else}
				{#each currentAnswers as { answer, isCorrect, marked }}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<li
						on:click={() => toggleAnswer(answer)}
						class={`border-2 text-sm sm:text-lg border-opacity-60 border-orange font-bold rounded-md text-center py-1 md:py-2 px-9 my-2 w-[90%] md:w-[550px] max-w-full cursor-pointer transition-all hover:scale-105 
							${!marked ? 'text-orange bg-dark hover:bg-dark hover:text-orange' : ''}
							${marked && isCorrect ? 'text-dark bg-green-500 hover:bg-green-500 border-green-500' : ''}
							${marked && !isCorrect ? 'text-dark bg-red-700 hover:bg-red-700 border-red-700' : ''}
							`}
					>
						{answer}
					</li>
				{/each}
			{/if}
		</ol>

		<span id="quiz-navigation-buttons" class="flex w-full justify-between">
			<span class="w-32 flex justify-center items-center">
				{#if !hasFinishedQuiz && currentQuestionIdx > 0}
					<!-- content here -->
					<button
						class="text-sm md:text-lg py-1 px-4 md:py-2 md:px-8 bg-orange bg-opacity-90 rounded-sm text-dark font-bold transition-all hover:-translate-x-[2px] hover:bg-opacity-100"
						on:click={() => currentQuestionIdx--}>Previous</button
					>
				{/if}
			</span>

			{#if !hasFinishedQuiz && quizStats().hasAnsweredAll}
				<span id="quiz-stats" class="flex justify-center items-center">
					<button
						on:click={finishQuiz}
						class="bg-green-700 text-white text-opacity-80 bg-opacity-90 rounded-lg text-sm md:text-lg py-2 px-4 md:py-2 md:px-8 font-bold transition-all hover:-translate-y-[2px] hover:bg-opacity-100"
						>Finish</button
					>
				</span>
			{/if}

			{#if hasFinishedQuiz}
				<span id="retry-quiz" class="flex justify-center items-center">
					<button
						on:click={retryQuiz}
						class="bg-green-700 text-white text-opacity-80 bg-opacity-90 rounded-lg text-lg font-bold transition-all hover:-translate-y-[2px] hover:bg-opacity-100 py-2 px-6"
						>Try Again</button
					>
				</span>
			{/if}

			<span class="w-32 flex justify-center items-center">
				{#if !hasFinishedQuiz && currentQuestionIdx < quiz.questions.length - 1}
					<button
						class="text-sm md:text-lg py-1 px-4 md:py-2 md:px-8 bg-orange bg-opacity-90 rounded-sm text-dark font-bold transition-all hover:translate-x-[2px] hover:bg-opacity-100"
						on:click={() => currentQuestionIdx++}>Next</button
					>
				{/if}
			</span>
		</span>
	</div>
</div>
