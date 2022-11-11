export default class ImageUploader {
  constructor(elem, onImageProcessed) {
    this.uploadTrigger = elem;
    this.imageUploadInput = document.createElement('input');
    this.results = [];
    this.onImageProcessed = onImageProcessed;
  }

  init() {
    this.imageUploadInput.type = 'file';
    this.imageUploadInput.multiple = true;
    this.imageUploadInput.accept = 'image/*';
    this.imageUploadInput.style.setProperty('display', 'none', 'important');

    this.uploadTrigger.addEventListener('click', () => {
      this.imageUploadInput.click();
    });

    const self = this;

    this.imageUploadInput.addEventListener('change', (e) => {
      const promises = [];

      if (e.target.files) {
        for (let i = 0; i < e.target.files.length; i++) {
          const promise = self.processImage(e.target.files[i]);
          promises.push(promise);
        }

        self.processPromises(promises);
      }
    });
  }

  processImage(img) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(img);
      reader.onloadend = function (e) {
        resolve(e.target.result);
      };
    });
  }

  processPromises(promises) {
    const self = this;
    Promise.all(promises).then((results) => {
      self.onImageProcessed(results);
    });
  }
}
