<script lang="ts">
	import AppLogo from './../../(assets)/AppLogo.svelte';
	import UserImage from './../UserImage.svelte';
	import SideBar from './(components)/SideBar.svelte';
	import Links from './(components)/NavBarLinks.svelte';
	import { signOut } from '@auth/sveltekit/client';
	import { callbackToHere } from '../../(utils)/callbackToHere';
	import { goto } from '$app/navigation';
	import Icon from '../../(assets)/Icon.svelte';
	import { onClickedOutside } from '../../(utils)/onClickedOutside';
	import { onDestroy } from 'svelte';

	export let me: tuser.User | null = null;

	let showSideBar = false;
	let showUserMenu = false;
	let userMenuElem: HTMLElement;
	let removeUserMenuEvent: (() => void) | null = null;

	$: {
		userMenuElem;

		if (userMenuElem) {
			removeUserMenuEvent?.();
			removeUserMenuEvent = onClickedOutside(userMenuElem, () => {
				showUserMenu = false;
			});
		}
	}

	onDestroy(() => {
		removeUserMenuEvent?.();
	});
</script>

<SideBar show={showSideBar} hide={() => (showSideBar = false)} />

<div
	class="flex items-center justify-between bg-darker w-screen min-h-[60px] gap-2 px-4 mb-8 shadow-md shadow-black"
>
	<span class="flex items-center gap-5">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<span
			on:click={() => (showSideBar = !showSideBar)}
			class="fill-orange scale-150 block md:hidden"
		>
			<Icon name="Menu" />
		</span>
		<a
			href={`${me !== null ? '/myfeeds' : '/'}`}
			id="logo"
			class="font-extrabold text-3xl hidden md:flex items-center justify-center gap-3"
		>
			<AppLogo />
			EdSpace
		</a>
	</span>

	<span class="w-[80%] justify-center hidden md:flex">
		<Links isOnSideBar={false} />
	</span>

	{#if me !== null}
		<span class="relative min-h-[3rem] min-w-[3rem] max-h-[3rem] max-w-[3rem]">
			<button on:click={() => (showUserMenu = !showUserMenu)}>
				<UserImage imageLink={me.image} size="small" cl="rounded-full" />
			</button>
			{#if showUserMenu}
				<ul
					bind:this={userMenuElem}
					class="absolute whitespace-nowrap right-0 bg-dark min-w-48 flex flex-col p-3 border-2 shadow-lg shadow-black border-darker rounded-md border-opacity-50"
				>
					<a href="/users/{me.id}">
						<li class="text-center font-bold py-1 cursor-pointer">My Profile</li>
					</a>
					<li class="text-center font-bold py-1 cursor-pointer">
						<button
							on:click={() => signOut()}
							class="bg-red-600 text-white w-full whitespace-nowrap py-1 px-2 rounded-sm transition-all hover:bg-opacity-80"
							>Sign Out</button
						>
					</li>
				</ul>
			{/if}
		</span>
	{:else}
		<button
			on:click={() => goto(`/auth?csrf=true`, { state: { callback: callbackToHere() } })}
			class="mbtn-invert-hover min-h-8 min-w-fit whitespace-nowrap font-bold flex items-center justify-center"
		>
			Sign In
		</button>
	{/if}
</div>
