<script>
	import { Palette } from '@untemps/svelte-palette'
	const colors = [
		'#865C54',
		'#8F5447',
		'#A65846',
		'#A9715E',
		'#AD8C72',
		'#C2B091',
		'#172B41',
		'#32465C',
		'#617899',
		'#9BA2BC',
		'#847999',
		'#50526A',
		'#8B8C6B',
		'#97A847',
		'#5B652C',
		'#6A6A40',
		'#F2D9BF',
		'#F5BAAE',
		'#F1A191',
	]
	let bgColor = colors[0]
	let selectedColor = null

    const _onColorSelect = ({ detail: { color } }) => bgColor = color
</script>

<main style="--bgColor:{bgColor}">
    <Palette {colors} selectedColor={bgColor} allowDuplicates allowDeletion showTransparentSlot maxColors={30} class='palette' on:select={_onColorSelect} />
</main>

<style>
    main {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background-color: var(--bgColor);
    }

    :global(.palette) {
        display: flex;
        flex-direction: column;
        row-gap: 1rem;
        padding: 2rem;
        background: white;
        box-shadow: 0 0 10px 5px rgba(0,0,0,0.18);;
    }
</style>