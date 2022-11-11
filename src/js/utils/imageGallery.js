export default class ImageGallery {
  constructor(elem, size, onClick) {
    this.elem = elem;
    this.size = size;
    this.onClick = onClick;
  }

  loadImages(images) {
    this.elem.innerHTML = '';
    if (images && images.length > 0) {
      images.forEach((image) => {
        const item = document.createElement('div');
        item.className = image.selected ? 'selected' : '';
        item.style.backgroundImage = `url(${image.image})`;
        item.style.backgroundSize = 'cover';
        item.style.backgroundPosition = 'center center';
        item.onclick = () => {
          this.onClick && this.onClick(image);
        };

        this.elem.appendChild(item);
      });
    }
  }
}
