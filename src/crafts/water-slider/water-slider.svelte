<script>
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	import displacementReference from './displacement.jpg';
	import imageReference1 from './images/1.jpg';
	import imageReference2 from './images/2.jpg';
	import imageReference3 from './images/3.jpg';

    let canvas;
    let wrap;
    let prevEl;
    let nextEl;
    let activeIndicator;
	
	onMount(async () => {

		const PIXI = await import('pixi.js');

		const waterSlider = document.querySelector('.water-slider');

		if (waterSlider.getAttribute('data-initialized')) {
			return;
		}

		// let imgSlides = Object.keys(await import.meta.glob('./images/*.*'));
		let imgSlides = [imageReference1, imageReference2, imageReference3];
		const duration = 1; // s
		const loopDuration = 5000; // ms

		const bullets = document.querySelectorAll(
			'.water-slider__bullets button:not(.active-indicator)'
		);

		let activeIndex = 0;
		let newIndex = 0;
		let lastIndex = 0;

		let transitioning = false;

		let loop = null;

		const app = new PIXI.Application({
			view: canvas,
			width: wrap.offsetWidth,
			height: wrap.offsetHeight,
			resizeTo: wrap,
		});

		imgSlides.forEach((img, i) => {
			PIXI.Assets.add(`slide-${i}`, img);
		});

		const images = await PIXI.Assets.load(
			imgSlides.map((e, i) => `slide-${i}`)
		);
		const slidesContainer = new PIXI.Container();
		Object.keys(images).forEach((key) => {
			const imageSprite = PIXI.Sprite.from(images[key]);
			slidesContainer.addChild(imageSprite);
		});

		gsap.set(slidesContainer.children, {
			alpha: 0,
		});
		gsap.set(slidesContainer.children[0], {
			alpha: 1,
		});

		slidesContainer.children.forEach((e) => coverImg(e));
		app.renderer.on('resize', () => {
			slidesContainer.children.forEach((e) => coverImg(e));
			gsap.set(activeIndicator, {
				left: bullets[activeIndex].offsetLeft,
			});
		});

		app.stage.addChild(slidesContainer);

		const displacementTexture = await PIXI.Assets.load(displacementReference);
		const displacementSprite = PIXI.Sprite.from(displacementTexture);
		displacementSprite.texture.baseTexture.wrapMode =
			PIXI.WRAP_MODES.REPEAT;
		displacementSprite.scale.set(1);
		displacementSprite.anchor.set(0);

		const displacementFilter = new PIXI.DisplacementFilter(
			displacementSprite
		);
		displacementFilter.scale.x = 10;
		displacementFilter.scale.y = 10;

		app.stage.filters = [displacementFilter];

		waterSlider.classList.add('init');

		const animation = gsap.timeline({
			paused: true,
			defaults: {
				duration: duration,
				// onComplete: () => {
				//     allPrevNextEl.forEach((buttons) => buttons.classList.remove("clicked"));
				//     loop = setInterval(nextSlide, loopDuration);
				// },
			},
		});
		animation.to(
			displacementSprite.anchor,
			{
				y: '-0.2',
				x: '-0.2',
				ease: 'none',
			},
			0
		);
		animation.to(
			displacementFilter.scale,
			{
				y: 150,
				x: 150,
				ease: 'power2.in',
			},
			0
		);
		animation.to(
			displacementSprite.anchor,
			{
				y: 0,
				x: 0,
				ease: 'power2.out',
			},
			duration
		);
		animation.to(
			displacementFilter.scale,
			{
				y: 0,
				x: 0,
				ease: 'power2.out',
			},
			duration
		);

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) {
					clearInterval(loop);
					loop = setInterval(nextSlide, loopDuration);
				} else {
					clearInterval(loop);
				}
			});
		});
		observer.observe(waterSlider);

		// Toggle active item by index
		const setActiveItem = (index) => {
			if (lastIndex === index) return true;
			if (transitioning) return;

			clearInterval(loop);

			transitioning = true;
			// allPrevNextEl.forEach((buttons) => buttons.classList.add("clicked"));

			activeIndex = index;

			makeDisplace();
			gsap.set(slidesContainer.children[index], {
				alpha: 1,
				delay: duration,
			});
			gsap.set(slidesContainer.children[lastIndex], {
				alpha: 0,
				delay: duration,
			});

			bullets[activeIndex].classList.add('active');
			gsap.to(activeIndicator, {
				left: bullets[activeIndex].offsetLeft,
				delay: duration / 2,
				duration: duration,
			});
			bullets[lastIndex].classList.remove('active');

			setTimeout(() => {
				transitioning = false;
				loop = setInterval(nextSlide, loopDuration);
			}, duration * 1000);

			lastIndex = index;
		};

		bullets[activeIndex].classList.add('active');
		gsap.set(activeIndicator, {
			left: bullets[activeIndex].offsetLeft,
		});

		bullets.forEach((el, index) => {
			el.addEventListener('click', function () {
				setActiveItem(index);
			});
		});

		nextEl.addEventListener('click', (e) => {
			nextSlide();
		});
		prevEl.addEventListener('click', (e) => {
			prevSlide();
		});

		waterSlider.setAttribute('data-initialized', true);

		function makeDisplace() {
			animation.pause(0);
			animation.play();
		}

		function coverImg(img) {
			const imgRatio = img.height / img.width;
			const winRatio = app.screen.height / app.screen.width;

			if (imgRatio > winRatio) {
				const h = app.screen.width * imgRatio;
				img.position.x = 0;
				img.position.y = (app.screen.height - h) / 2;
				img.width = app.screen.width;
				img.height = h;
			}

			if (imgRatio < winRatio) {
				const w = (app.screen.width * winRatio) / imgRatio;
				img.position.x = (app.screen.width - w) / 2;
				img.position.y = 0;
				img.width = w;
				img.height = app.screen.height;
			}
		}

		function nextSlide() {
			if (transitioning) return;
			newIndex =
				activeIndex === imgSlides.length - 1 ? 0 : activeIndex + 1;
			setActiveItem(newIndex);
		}
		function prevSlide() {
			if (transitioning) return;
			newIndex =
				activeIndex === 0 ? imgSlides.length - 1 : activeIndex - 1;
			setActiveItem(newIndex);
		}

        return () => {
            observer.disconnect();
            clearInterval(loop);
            app.destroy(true, { children: true, texture: true, baseTexture: true });
            bulletClickHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler));
            nextEl.removeEventListener('click', nextClickHandler);
            prevEl.removeEventListener('click', prevClickHandler);
            app.renderer.off('resize', resizeHandler);
            animation.kill();
            gsap.killTweensOf(activeIndicator);
            gsap.killTweensOf(slidesContainer.children);
        };
	});
</script>

<div class="water-slider">
	<div class="flex items-center justify-center gap-4">
		<button
			class="grid place-items-center p-2 rounded-md border border-border group"
            bind:this={prevEl}
		>
            <span class="sr-only">Previous</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				fill="currentColor"
				class="translate-x-[-1px] transition-transform group-hover:translate-x-[-3px] group-focus-visible:translate-x-[-3px]"
				viewBox="0 0 16 16"
                aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
				/>
			</svg>
		</button>
		<div class="water-slider__figures" bind:this={wrap}>
			<div class="water-slider__figures-inner">
				<canvas bind:this={canvas} class="water-slider__canvas"></canvas>
			</div>
		</div>
		<button
			class="grid place-items-center p-2 rounded-md border border-border group"
            bind:this={nextEl}
		>
            <span class="sr-only">Next</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				fill="currentColor"
				class="translate-x-[1px] transition-transform group-hover:translate-x-[3px] group-focus-visible:translate-x-[3px]"
				viewBox="0 0 16 16"
                aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
				/>
			</svg>
		</button>
	</div>
	<svg height="0" width="0" style="position:absolute;">
		<defs>
			<filter id="gooey">
				<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
				<feColorMatrix
					in="blur"
					mode="matrix"
					values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0 0 0 0 15 -5"
					result="goo"
				/>
				<feComposite in="SourceGraphic" in2="goo" operator="atop" />
			</filter>
		</defs>
	</svg>
	<div class="water-slider__bullets">
		<button class="active-indicator" bind:this={activeIndicator}></button>
		<button class="active"></button>
		<button></button>
		<button></button>
	</div>
</div>

<style lang="scss">
	.water-slider {
		--primary: rgb(47, 47, 47);
		--secondary: rgb(187, 187, 187);
		@media (max-width: 590px) {
			font-size: .8rem;
			padding: 1rem;
		}
		&__figures {
			position: relative;
			margin: 0 auto;
			aspect-ratio: 3 / 2;
			overflow: hidden;
			border-radius: .5rem;
			display: block;
			max-width: 200px;
			@media (min-width: 590px) {
				max-width: none;
				width: 350px;
			}
		}

		&__figures-inner {
			height: 100%;
			width: 100%;
			position: relative;
		}

		&__canvas {
			width: 100%;
			height: 100%;
		}
		&__bullets {
			display: flex;
			gap: .5rem;
			justify-content: center;
			position: relative;
			filter: url('#gooey');
			-webkit-filter: url('#gooey');
			margin-top: 1rem;
			@media (min-width: 590px) {
				gap: 1rem;
			}
			button {
				width: .9em;
				height: .9em;
				background-color: var(--secondary);
				border-radius: 50%;
				transition: background-color 0.5s 0.5s ease-in-out;
				&.active {
					background-color: var(--primary);
				}
				&.active-indicator {
					position: absolute;
					top: 0;
					left: 0;
					background-color: var(--primary);
				}
			}
		}
	}
</style>
