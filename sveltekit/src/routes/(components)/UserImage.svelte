<script lang="ts">
	export let imageLink: string | null | undefined;
	export let size: 'micro' | 'small' | 'medium' | 'big' = 'medium';
	export let cl = '';
</script>

{#if !imageLink}
	<div
		class={`${
			size === 'small'
				? 'profile-picture-small'
				: size === 'medium'
				? 'profile-picture-medium'
				: size === 'micro'
				? 'profile-picture-micro'
				: 'profile-picture-big'
		} bg-orange flex items-center justify-center text-dark font-bold text-xl ${cl}`}
	>
		?
	</div>
{:else}
	<img
		src={imageLink}
		alt=""
		class={`${
			size === 'small'
				? 'profile-picture-small'
				: size === 'medium'
				? 'profile-picture-medium'
				: size === 'micro'
				? 'profile-picture-micro'
				: 'profile-picture-big'
		} ${cl}`}
		referrerpolicy="no-referrer"
	/>
{/if}
