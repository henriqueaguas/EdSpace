<script lang="ts">
	import ShowFormError from './../posts/new/(components)/ShowFormError.svelte';
	import { notify } from '../(utils)/notify';
	import { onMount } from 'svelte';
	import { emailSchema } from '$lib/services/InputValidators/commonValidators';
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';
	import GoogleIcon from '../(assets)/GoogleIcon.svelte';
	import type { ParseObjectError } from '$lib/_errors/ParseObjectError';

	let email: string;
	let callbackUrl = history.state.callback || $page.url.searchParams.get('callback') || '/';
	let actionRequiredAuthn = history.state.requiresAuthn;

	let emailError: string | undefined = undefined;

	function signInEmail() {
		emailSchema
			.parse(email)
			.then((parsedEmail) => {
				notify.infiniteLoading('Please Wait');

				signIn('email', {
					email: parsedEmail,
					callbackUrl: callbackUrl
				});
			})
			.catch((err) => (emailError = (err as ParseObjectError).message));
	}

	onMount(() => {
		if (actionRequiredAuthn)
			notify.info('Looks like you need authentication to perform that operation');
	});
</script>

<svelte:head>
	<title>Authentication</title>
</svelte:head>

<div class="flex flex-col items-center gap-2 my-10 w-[90vw] max-w-[400px]">
	<h2 class="mb-6">Authentication</h2>

	<div class="mb-4 w-full">
		<label class="block text-white text-center text-opacity-90 mb-4 text-xl" for="email">
			Using Email
		</label>
		<input
			bind:value={email}
			on:input={() => (emailError = undefined)}
			class="outline-none bg-[#0A261F]  border-2 border-yellow-400 border-opacity-75 rounded w-full py-2 px-3 mb-1"
			id="email"
			type="email"
			placeholder="Email"
		/>
		<ShowFormError error={emailError} />
	</div>

	<div class="flex items-center justify-between mx-auto w-full">
		<button
			on:click={signInEmail}
			class="bg-yellow-400 bg-opacity-75 hover:bg-opacity-80 text-white font-bold w-full py-2 px-4 rounded transition-all hover:-translate-y-[2px]"
			type="button"
		>
			Sign In
		</button>
	</div>

	<div class="flex items-center justify-center my-8 w-full">
		<hr class="rounded-full border-[1px] border-gray-400 border-opacity-30 flex-grow" />
		<span class="mx-4 text-gray-400 font-bold text-opacity-40"> OR </span>
		<hr class="rounded-full border-[1px] border-gray-400 border-opacity-30 flex-grow" />
	</div>

	<div class="flex justify-center w-full">
		<button
			on:click={() => signIn('google', { callbackUrl: callbackUrl })}
			class="bg-brown flex items-center gap-2 justify-center py-2 rounded-lg w-full transition-all hover:-translate-y-[2px]"
		>
			<GoogleIcon />
			<span class="text-lg font-bold text-white text-opacity-90 whitespace-nowrap">
				Using Google
			</span>
		</button>
	</div>

	<a href="/" class="text-white text-opacity-50 underline underline-offset-2">Go Home</a>
</div>
