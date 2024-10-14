<script>
	import gsap from 'gsap';
	import { onMount } from 'svelte';
    import DropdownsWithSafetyTriangle from './dropdowns-with-safety-triangle.js';

    let listEl;
    let debug = false;

	onMount(() => {
		const safeDropdowns = new DropdownsWithSafetyTriangle(listEl);

        return () => {
            safeDropdowns.cleanup();
        }
	});
</script>

<div>
    <ul class="card dropdown-list-group" class:debug={debug} id="safety-triangle-demo" bind:this={listEl}>
        <li class="dropdown-list-group-item">
            <button><span>Dashboard</span></button>
        </li>
        <li class="dropdown-list-group-item">
            <button
                data-toggle="#collapse-1"
                aria-expanded="false"
                aria-controls="collapse-1"
            >
                <span>Settings</span>
            </button>
            <div class="collapse-item" id="collapse-1">
                <div class="card flex flex-col">
                    <button>Edit Profile</button>
                    <button>Change Password</button>
                    <button>Privacy Settings</button>
                    <button>Notifications</button>
                </div>
            </div>
        </li>
        <li class="dropdown-list-group-item">
            <button
                data-toggle="#collapse-3"
                aria-expanded="false"
                aria-controls="collapse-3"
            >
                <span>Reports</span>
            </button>
            <div class="collapse-item" id="collapse-3">
                <div class="card flex flex-col">
                    <button>Monthly Reports</button>
                    <button>Annual Reports</button>
                    <button>Custom Reports</button>
                    <button>Export Data</button>
                </div>
            </div>
        </li>
        <li class="dropdown-list-group-item">
            <button><span>Logout</span></button>
        </li>
    </ul>
    <div class="controls p-2 md:p-4">
        <label class="flex items-center justify-center cursor-pointer">
            <input checked={debug} on:change={(e) => debug = e.target.checked} type="checkbox" value="" class="peer appearance-none">
            <div class="flex-shrink-0 relative w-[38px] h-[21px] bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-foreground rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-foreground"></div>
            <span class="ms-2 text-xs md:text-sm whitespace-nowrap">Show safety triangles</span>
        </label>
        <div class="mobile-hint hidden">
            <span class="text-xs">Safety triangles don't work on touch screens.</span>
        </div>
    </div>
</div>

<style>
	.dropdown-list-group {
		position: relative;
        padding: 0;
        margin: 0 0 1.5rem 0;
        display: flex;
        flex-direction: column;
        list-style-type: none;
        font-size: .8rem;
        --item-size: 100px;
	}
	.dropdown-list-group-item {
		min-width: var(--item-size);
		position: static;
		padding: 0;
        overflow: hidden;
	}
	.dropdown-list-group-item button {
		padding: .25rem .5rem;
		width: 100%;
		text-align: left;
        color: #212529;
        cursor: default;
        position: relative;
        border: none;
        background: transparent;
	}
	.dropdown-list-group-item button[data-toggle]:after {
		content: '';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		right: .5rem;
		bottom: 0;
		width: 1rem;
		height: 1rem;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23212529' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-chevron-right'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E");
		background-size: contain;
		background-repeat: no-repeat;
	}

    .card {
        border: 1px solid #dee2e6;
        border-radius: 0.4rem;
        padding: 0.25rem;
        background-color: white;
    }
    .card button {
        cursor: default;
        border-radius: 4px;
        padding: .25rem .5rem;
    }
    .card button:hover {
        background-color: rgb(238, 238, 238);
    }

	.collapse-item {
		position: absolute;
		left: calc(100% - 0.25rem);
		top: -1px;
		min-width: var(--item-size);
        width: max-content;
        display: none;
	}

    #safety-triangle-demo {
        --triangle-stroke: none;
        --triangle-path-width: 0;
        --triangle-fill-color: transparent;
    }
    #safety-triangle-demo.debug {
        --triangle-stroke: none;
        --triangle-path-width: 0.4;
        --triangle-fill-color: rgba(204, 86, 86, 0.3);
    }
    #safety-triangle-demo :global(.safety-triangle) {
        position: absolute;
        pointer-events: none;
        z-index: 2;
    }
    #safety-triangle-demo :global(.safety-triangle .safety-path) {
        pointer-events: auto;
        stroke: var(--triangle-stroke);
        stroke-width: var(--triangle-path-width);
        fill: var(--triangle-fill-color);
    }

    .controls {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
    }

    @media (min-width: 590px) {
        .dropdown-list-group {
            --item-size: 150px;
            font-size: .9rem;
        }
    }

    @media not (pointer: fine) {
        #safety-triangle-demo :global(.safety-triangle) {
            display: none;
        }
        .controls label {
            display: none;
        }
        .mobile-hint {
            display: block;
        }
    }
</style>