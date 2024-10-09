<script>
    import { onMount } from 'svelte';
    import Magnetic from './magnetic.js';

    let button;

    onMount(() => {
        const magentic = new Magnetic(button);

        return () => {
            magentic.kill();
        }
    });
    
</script>

<button 
    class="button-shadow relative transition-[background,box-shadow] py-4 px-8 bg-foreground/90 text-background rounded-full outline-none ring-foreground hover:bg-foreground focus-visible:bg-foreground focus-visible:ring focus-visible:ring-offset-2 after:absolute after:-inset-6 after:rounded-2xl" 
    bind:this={button}
>
    <slot />
</button>

<style>
    .button-shadow::before {
        content: '';
        top: 50%;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 100%;
        /* z-index: -1; */
        background: radial-gradient(ellipse at center, hsl(var(--foreground) / 1) 0%, hsl(var(--foreground) / 0) 70%);
        filter: blur(10px);
        opacity: 0.7;
        pointer-events: none;
    }
</style>