if (!customElements.get('product-media')) {
  customElements.define('product-media', class ProductMedia extends HTMLElement {
    connectedCallback() {
      this.videoUrl = this.dataset.videoUrl;
      this.videoElem = this.querySelector('video');
      this.images = this.querySelectorAll('img');
      this.playButton = this.querySelector('[data-vide-play]');
      this.stopButton = this.querySelector('[data-vide-stop]');
      this.loading = this.querySelector('.product-video-load');

      if (this.playButton) this.playButton.addEventListener('click', this.play.bind(this));
      if (this.stopButton) this.stopButton.addEventListener('click', this.stop.bind(this));
      // this.addEventListener('mouseenter', this.play.bind(this));
      this.addEventListener('mouseleave', this.stop.bind(this));

      // Hide the loading indicator when the video has loaded enough to start playing
      if (this.videoElem) this.videoElem.addEventListener('canplaythrough', this.onVideoLoaded.bind(this));
    }

    play() {
      if (!this.videoUrl || !this.videoElem) return;

      // Set the play button disapear
      this.playButton.style.display = 'none';
      this.stopButton.style.display = 'block';

      // Set the video source if it's not set
      if (this.videoElem.getAttribute('src') !== this.videoUrl) {
        this.videoElem.setAttribute('src', this.videoUrl);
        this.videoElem.load();
      }

      // Make the video visible and hide the image
      this.videoElem.parentElement.style.display = 'block';
      Array.from(this.images).forEach(image => image.style.display = 'none');

      // Set the loading visible
      this.loading.style.display = 'block';

      // Load and play the video
      // this.videoElem.load();
      this.videoElem.play();
    }

    stop() {
      if (!this.videoUrl || !this.videoElem) return;

      // Set the play button disapear
      this.playButton.style.display = 'block';
      this.stopButton.style.display = 'none';

      // Stop the video and clear the source
      this.videoElem.pause();
      // this.videoElem.setAttribute('src', '');

      // Hide the video and show the image again
      this.videoElem.parentElement.style.display = 'none';
      Array.from(this.images).forEach((image, index) => {
        if (index === 0) {
          image.style.display = 'block';
        } else {
          image.removeAttribute('style');
        }
      });
      this.loading.style.display = 'none';
    }

    onVideoLoaded() {
      // Hide the loading indicator when the video is ready to play
      this.loading.style.display = 'none';
    }
  });
}
