export default class DropdownsWithSafetyTriangle {
    constructor(listEl) {
        this.listEl = listEl;

        this.collapseElements = this.listEl.querySelectorAll('.collapse-item');
        this.toggles = this.listEl.querySelectorAll('[data-toggle]');
        this.toggleAndCollapseWrappers = Array.from(this.toggles).map(toggle => toggle.parentElement);

        this.options = {
            puffer: 5,
            curveIntensity: 0.1,
            curveHeight: 15,
        }

        this.mouse = { x: 0, y: 0 };

        this.events = {
            mousemove: (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            },
            mouseenterToggle: (e) => {
                const index = Array.from(this.toggles).indexOf(e.target);
                this.collapseElements.forEach((collapse, collapseIndex) => {
                    if (index === collapseIndex) {
                        collapse.style.display = 'block';
                        this.showSafetyTriangle(
                            this.toggles[index],
                            collapse
                        );
                    } else {
                        collapse.style.display = 'none';
                        this.hideSafetyTriangle(collapse);
                    }
                });
            },
            mouseleaveToggleCollapseWrapper: (e) => {
                const index = Array.from(this.toggleAndCollapseWrappers).indexOf(e.target);
                this.collapseElements[index].style.display = 'none';
                this.hideSafetyTriangle(this.collapseElements[index]);
            },
            mouseleaveListEl: () => {
                this.collapseElements.forEach((collapse) => {
                    collapse.style.display = 'none';
                    this.hideSafetyTriangle(collapse);
                });
            },
            mouseenterCollapseElement: (e) => {
                const index = Array.from(this.collapseElements).indexOf(e.target.closest('.collapse'));
                this.hideSafetyTriangle(this.collapseElements[index]);
            },
        }

        this.init();
    }

    init() {
        window.addEventListener('mousemove', this.events.mousemove);
        this.toggles.forEach((toggle) => {
            toggle.addEventListener('mouseenter', this.events.mouseenterToggle);
        });
        this.toggleAndCollapseWrappers.forEach((wrapper) => {
            wrapper.addEventListener('mouseleave', this.events.mouseleaveToggleCollapseWrapper);
        });
        this.collapseElements.forEach((collapse) => {
            collapse.querySelector('.card')?.addEventListener('mouseenter', this.events.mouseenterCollapseElement);
        });
        this.listEl.addEventListener('mouseleave', this.events.mouseleaveListEl);
    }

    showSafetyTriangle(trigger, submenu) {
        const existingSafetyTriangle = submenu.querySelector('.safety-triangle');
        if (existingSafetyTriangle) return;

        const { bottom: triggerBottom, top: triggerTop } = trigger.getBoundingClientRect();
        let {
            width: submenuWidth,
            height: submenuHeight,
            x: submenuX,
            y: submenuY,
        } = submenu.getBoundingClientRect();

        submenuWidth = Math.floor(submenuWidth);
        submenuY = submenuY - this.options.puffer;

        const safetyTriangle = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        safetyTriangle.setAttributeNS(null, 'class', 'safety-triangle');

        const safetyPathTop = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        );
        safetyPathTop.setAttributeNS(null, 'class', 'safety-path');
        
        const safetyPathBottom = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        );
        safetyPathBottom.setAttributeNS(null, 'class', 'safety-path');

        safetyTriangle.appendChild(safetyPathTop);
        safetyTriangle.appendChild(safetyPathBottom);
        submenu.appendChild(safetyTriangle);

        const updatePaths = () => {
            const svgWidth = submenuX - this.mouse.x;
            const svgHeight = submenuHeight + this.options.puffer * 2;

            const controlPointTopX = svgWidth * (1 - this.options.curveIntensity);
            const controlPointTopY = this.options.curveHeight;
            const controlPointBottomX = svgWidth * (1 - this.options.curveIntensity);
            const controlPointBottomY = svgHeight - this.options.curveHeight;

            const pathTop = `M 0, ${triggerTop - submenuY} Q ${controlPointTopX},${controlPointTopY} ${svgWidth},0 L ${svgWidth},${triggerTop - submenuY} z`;
            const pathBottom = `M 0, ${triggerBottom - submenuY} Q ${controlPointBottomX},${controlPointBottomY} ${svgWidth},${svgHeight} L ${svgWidth},${triggerBottom - submenuY} z`;

            safetyPathTop.setAttribute('d', pathTop);
            safetyPathBottom.setAttribute('d', pathBottom);

            safetyTriangle.style.top = `-${this.options.puffer}px`;
            safetyTriangle.style.right = `${submenuWidth}px`;
            safetyTriangle.style.width = `${Math.max(0, svgWidth - this.options.puffer)}px`;
            safetyTriangle.style.height = `${svgHeight}px`;
        };

        updatePaths();
        trigger.addEventListener('mousemove', updatePaths);
        safetyTriangle.updatePaths = updatePaths;
        safetyTriangle.trigger = trigger;
    }

    hideSafetyTriangle(submenu) {
        const safetyTriangle = submenu?.querySelector('.safety-triangle');
        if (!safetyTriangle) return;

        if (safetyTriangle.updatePaths && safetyTriangle.trigger) {
            safetyTriangle.trigger.removeEventListener('mousemove', safetyTriangle.updatePaths);
        }

        safetyTriangle.remove();
    }

    cleanup() {
        window.removeEventListener('mousemove', this.events.mousemove);
        this.toggles.forEach((toggle) => {
            toggle.removeEventListener('mouseenter', this.events.mouseenterToggle);
        });
        this.toggleAndCollapseWrappers.forEach((wrapper) => {
            wrapper.removeEventListener('mouseleave', this.events.mouseleaveToggleCollapseWrapper);
        });
        this.collapseElements.forEach((collapse) => {
            collapse.querySelector('.card')?.removeEventListener('mouseenter', this.events.mouseenterCollapseElement);
        });
        this.listEl.removeEventListener('mouseleave', this.events.mouseleaveListEl);
    }
}