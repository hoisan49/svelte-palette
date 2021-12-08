<script>
    import {Palette} from '@untemps/svelte-palette'
</script>

<main>
    <Palette colors={['#ff0', '#f00', '#00f']}/>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>