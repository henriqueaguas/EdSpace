<script lang="ts">
	import Links from './NavBarLinks.svelte';

	export let show: boolean;
	export let hide: () => void;
</script>

<div
	class={`fixed top-[60px] ${
		show ? 'left-0' : 'left-[-100vw]'
	} md:left-[-100vw] w-[100vw] bg-darker h-screen pt-8 z-10`}
>
	<Links isOnSideBar={true} onNavigate={hide} />
</div>
