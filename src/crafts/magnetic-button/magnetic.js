import gsap from "gsap";

export default class Magnetic {
    constructor(el, options = {}) {
        this.el = typeof el === 'string' ? document.querySelector(el) : el;
        this.options = Object.assign(
            {},
            {
                parallax: this.el.dataset.magneticParallax || true,
                parallaxDirection: 'positive', // "negative"
                parallaxAmount: 0.1,
                y: parseFloat(this.el.dataset.magneticY) || 0.2,
                x: parseFloat(this.el.dataset.magneticX) || 0.2,
                speed: 0.5,
                revertspeed: 0.8,
            },
            options
        );

        this.y = 0;
        this.x = 0;
        this.width = 0;
        this.height = 0;
        this.event = {};
        
        if (this.el.dataset.magneticInit || !this.el) {
            return;
        }
        
        this.inner = this.options.parallax === true ? this.createInner() : null;
        this.el.setAttribute('data-magnetic-init', true);
        this.listeners();
    }

    createInner() {
        let inner = document.createElement('div');
        const specificInner = this.el.querySelector('[data-magnetic-inner]');
        if (specificInner) {
            inner.appendChild(specificInner.cloneNode(true));
            specificInner.remove();
            this.el.appendChild(inner);
        } else {
            inner.innerHTML = this.el.innerHTML;
            this.el.innerHTML = '';
            this.el.appendChild(inner);
        }
        return inner;
    }

    listeners() {
        this.event.mouseenter = () => {
            this.y = this.el.getBoundingClientRect().top;
            this.x = this.el.getBoundingClientRect().left;
            this.width = this.el.offsetWidth;
            this.height = this.el.offsetHeight;
        };
        this.event.mousemove = (e) => {	
            const y = (e.clientY - this.y - this.height / 2) * this.options.y;
            const x = (e.clientX - this.x - this.width / 2) * this.options.x;
            this.move(x, y, this.options.speed, 'sine.out');
        };
        this.event.mouseleave = () => {
            this.move(0, 0, this.options.revertspeed, 'elastic.out(1, 0.6)');
        }

        gsap.matchMedia().add('(hover: hover)', () => {
            this.el?.addEventListener('mouseenter', this.event.mouseenter);
            this.el?.addEventListener('mousemove', this.event.mousemove);
            this.el?.addEventListener('mouseleave', this.event.mouseleave);
            return () => {
                this.el?.removeEventListener('mouseenter', this.event.mouseenter);
                this.el?.removeEventListener('mousemove', this.event.mousemove);
                this.el?.removeEventListener('mouseleave', this.event.mouseleave);
            }
        })

    }

    move(x, y, speed, ease) {
        gsap.to(this.el, {
            y: y,
            x: x,
            duration: speed,
            ease: ease,
        });
        if (this.inner !== null) {
            this.moveInner(x, y, speed, ease);
        }
    }

    moveInner(x, y, speed, ease) {
        let xy = {};
        if (this.options.parallaxDirection === 'positive') {
            xy = {
                y: y * (this.options.y + this.options.parallaxAmount),
                x: x * (this.options.x + this.options.parallaxAmount),
            };
        } else if (this.options.parallaxDirection === 'negative') {
            xy = {
                y: y * (-1 * this.options.y - this.options.parallaxAmount),
                x: x * (-1 * this.options.x - this.options.parallaxAmount),
            };
        }

        gsap.to(this.inner, {
            ...xy,
            duration: speed,
            ease: ease,
        });
    }
    kill() {
        if (this.el.dataset.preventKill) return;
        this.el.removeEventListener('mouseenter', this.event.mouseenter);
        this.el.removeEventListener('mousemove', this.event.mousemove);
        this.el.removeEventListener('mouseleave', this.event.mouseleave);
        this.el = null;
        this.inner = null;
    }
}