if (!customElements.get('color-family')) {
    customElements.define(
        'color-family',
        class ColorFamily extends HTMLElement {
            constructor() {
                super();
                this.slider = this.querySelector('.style-color-family-content-box');
                this.sliderItems = Array.from(this.querySelectorAll('.color-family-item'));

                if (!this.slider) return;

                this.initPages();
                const resizeObserver = new ResizeObserver((entries) => this.initPages());
                resizeObserver.observe(this.slider);

                this.setEventListener();
            }

            setEventListener() {
                this.sliderItems.forEach(item => {
                    //item.addEventListener('mouseenter', (event) => this.sliderScroll(event));
                    item.addEventListener('mouseenter', debounce((event) => {this.sliderScroll(event);}, 100).bind(this));
                    item.addEventListener('mouseleave', this.closeColorBox.bind(this));
                    item.addEventListener('click', (event) => this.clickToClose(event));
                });

                let scrollTimeout;
                this.slider.addEventListener('scroll', (event) => {
                    if (this.mouseEmiter) {
                        clearTimeout(scrollTimeout);
                        scrollTimeout = setTimeout(() => {
                            if (!this.activeItem) return;
                            this.activeItem.classList.add('family-active');
                            this.showColorBox();
                        }, 100);
                    } else {
                        this.closeBoxs();
                    }
                });
            }

            initPages() {
                this.sliderWidth = this.slider.offsetWidth;
                this.itemHalfWidth = this.sliderItems[0].offsetWidth / 2;
            }

            sliderScroll(event) {
                this.activeItem = event.currentTarget || event.target;
                this.scrollToView();
                this.mouseEmiter = true;
                this.slider.dispatchEvent(new Event('scroll'));
            }

            clickToClose(event) {
                if (event.currentTarget.classList.contains('family-active')) {
                    this.activeItem = null;
                    this.closeColorBox();
                } else {
                    this.sliderScroll(event);
                }
            }

            closeColorBox() {
                //setTimeout(() => {
                    this.sliderItems.forEach(item => {
                        item.classList.remove('family-active');
                        item.querySelector('.color-list-box').classList.remove('color-list-active');
                    });
                //}, 100);
            }

            closeBoxs() {
                this.sliderItems.forEach(item => {
                    item.querySelector('.color-list-box').classList.remove('color-list-active');
                });
            }

            scrollToView() {
                if (window.supportSIV) {
                    this.activeItem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    return;
                }
                const sliderLeft = this.slider.scrollLeft;
                const itemLeft = this.activeItem.offsetLeft;
                this.slider.scrollBy({ left: itemLeft + this.itemHalfWidth - sliderLeft - this.sliderWidth / 2, top: 0, behavior: 'smooth' });
            }

            showColorBox() {
                const activeBox = this.activeItem.querySelector('.color-list-box');
                activeBox.classList.add('color-list-active');
                const sliderLeft = this.slider.scrollLeft;
                const itemHalfWidth = this.activeItem.offsetWidth / 2;
                const itemLeft = this.activeItem.offsetLeft;
                const boxHalfWidth = activeBox.offsetWidth / 2;
                let itemBoundLeft = itemLeft + itemHalfWidth - sliderLeft;
                if (itemBoundLeft < boxHalfWidth) {
                    activeBox.style.left = "0px";
                    activeBox.style.right = "auto";
                } else if ((this.sliderWidth - itemBoundLeft) < boxHalfWidth) {
                    activeBox.style.left = "auto";
                    activeBox.style.right = "0px";
                } else {
                    activeBox.style.left = itemBoundLeft - boxHalfWidth + "px";
                    activeBox.style.right = "auto";
                }
                this.style.setProperty("--triangle-left", (itemBoundLeft - activeBox.offsetLeft) + "px");
                this.mouseEmiter = false;
            }
        }
    );
}
