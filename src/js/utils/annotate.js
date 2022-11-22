export default class Annotate {
  constructor(canvas, annotate, draw, list) {
    this.elem = canvas;
    this.context = this.elem.getContext('2d');

    this.elemAnnotate = annotate;
    this.contextAnnotate = this.elemAnnotate.getContext('2d');

    this.elemDraw = draw;
    this.contextAnnotate.fillStyle = '#333333';
    this.contextDraw = this.elemDraw.getContext('2d');

    this.annotateList = list;
    this.elem.width =
      this.elemAnnotate.width =
      this.elemDraw.width =
        this.elem.parentElement.clientWidth;
    this.elem.height =
      this.elemAnnotate.height =
      this.elemDraw.height =
        this.elem.parentElement.clientHeight;
    this.width = this.elem.width;
    this.height = this.elem.height;
    this.ratio = 1;

    this.inputVisible = false;
    this.annotations = [];
    this.redraw = () => {};
    this.onCreateAnnotation = () => {};
    this.onUpdateAnnotation = () => {};

    this.initialX = 0;
    this.initialY = 0;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    this.diffX = 0;
    this.diffY = 0;
    this.annotationCollided = false;
    this.tagCollided = false;
    this.inputTag = null;
  }

  init() {
    const self = this;
    this.elemDraw.addEventListener('mousedown', this.onMouseDown);
    this.elemDraw.addEventListener('mouseup', this.onMouseUp);

    this.elemDraw.addEventListener(
      'touchstart',
      (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        self.elemDraw.dispatchEvent(mouseEvent);
      },
      false
    );

    this.elemDraw.addEventListener(
      'touchend',
      () => {
        const mouseEvent = new MouseEvent('mouseup', {});
        self.elemDraw.dispatchEvent(mouseEvent);
      },
      false
    );
    this.elemDraw.addEventListener(
      'touchmove',
      (e) => {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        self.elemDraw.dispatchEvent(mouseEvent);
      },
      false
    );

    document.body.addEventListener(
      'touchstart',
      (e) => {
        // console.log(e.target, self.elemDraw);
        if (e.target === self.elemDraw) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
    document.body.addEventListener(
      'touchend',
      (e) => {
        if (e.target === self.elemDraw) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
    document.body.addEventListener(
      'touchmove',
      (e) => {
        if (e.target === self.elemDraw) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  checkInputTagCollision = (pos) => {
    let collided = -1;

    const scale = this.width / 450;
    for (let i = 0; i < this.annotations.length; i++) {
      const annotate = this.annotations[i];

      if (
        pos.x >= annotate.x * scale &&
        pos.x <= (annotate.x + annotate.width) * scale &&
        pos.y >= annotate.y * scale &&
        pos.y <= annotate.y * scale + 20
      ) {
        collided = i;
        break;
      }
    }

    return collided;
  };

  checkAnnotationCollision = (pos) => {
    let collided = -1;
    const scale = this.width / 450;
    for (let i = 0; i < this.annotations.length; i++) {
      const annotate = this.annotations[i];

      if (
        pos.x >= annotate.x * scale &&
        pos.x <= (annotate.x + annotate.width) * scale &&
        pos.y >= annotate.y * scale &&
        pos.y <= (annotate.y + annotate.height) * scale
      ) {
        collided = i;
        break;
      }
    }

    return collided;
  };

  onMouseDown = (e) => {
    const scale = this.width / 450;

    // console.log(this.inputVisible, e.clientX, e.clientY);
    if (!this.inputVisible) {
      this.contextDraw.clearRect(0, 0, this.width, this.height);

      this.initialX = e.clientX - this.elemDraw.getBoundingClientRect().left;
      this.initialY = e.clientY - this.elemDraw.getBoundingClientRect().top;

      this.startX = e.clientX;
      this.startY = e.clientY;

      this.tagCollided = this.checkInputTagCollision({
        x: this.initialX,
        y: this.initialY,
      });

      this.annotationCollided = this.checkAnnotationCollision({
        x: this.initialX,
        y: this.initialY,
      });

      // console.log(
      //   this.tagCollided,
      //   this.initialX,
      //   this.initialY,
      //   e.clientX,
      //   e.clientY
      // );

      if (this.tagCollided > -1) {
        this.updateAnnotationTag(this.annotations[this.tagCollided]);
      } else if (this.annotationCollided > -1) {
        const annotation = this.annotations[this.annotationCollided];
        this.annotations[this.annotationCollided] = {
          ...this.annotations[this.annotationCollided],
          selected: true,
        };

        this.diffX = this.initialX - annotation.x * scale;
        this.diffY = this.initialY - annotation.y * scale;

        this.initialX =
          this.startX - this.diffX - this.elemDraw.getBoundingClientRect().left;
        this.initialY =
          this.startY - this.diffY - this.elemDraw.getBoundingClientRect().top;

        this.contextDraw.strokeRect(
          annotation.x * scale,
          annotation.y * scale,
          annotation.width * scale,
          annotation.height * scale
        );

        this.redraw && this.redraw();
      }

      this.elemDraw.addEventListener('mousemove', this.onMouseMove);
    }
  };

  onMouseMove = (e) => {
    if (!this.inputVisible) {
      const scale = this.width / 450;
      this.endX = e.clientX;
      this.endY = e.clientY;
      this.contextDraw.clearRect(0, 0, this.width, this.height);

      if (this.tagCollided === -1) {
        if (this.annotationCollided > -1) {
          const annotation = this.annotations[this.annotationCollided];
          this.initialX =
            this.endX - this.diffX - this.elemDraw.getBoundingClientRect().left;
          this.initialY =
            this.endY - this.diffY - this.elemDraw.getBoundingClientRect().top;

          this.contextDraw.strokeRect(
            this.initialX,
            this.initialY,
            annotation.width * scale,
            annotation.height * scale
          );
        } else {
          let w = this.endX - this.startX;
          let h = this.endY - this.startY;

          const ctx = this.elemDraw.getContext('2d');

          ctx.strokeRect(this.initialX, this.initialY, w, h);

          if (w < 0) {
            w *= -1;
          }

          if (h < 0) {
            h *= -1;
          }
          if (w < 70 || h < 30) {
            ctx.strokeStyle = '#FF0000';
          } else {
            ctx.strokeStyle = '#00FF00';
          }
        }
      }
    }
  };

  onMouseUp = () => {
    console.log('onMouseUp called');

    const scale = 450 / this.width;

    if (!this.inputVisible) {
      if (this.initialX) {
        this.contextDraw.clearRect(0, 0, this.width, this.height);

        if (this.tagCollided === -1) {
          if (this.annotationCollided > -1) {
            this.updateAnnotation({
              ...this.annotations[this.annotationCollided],
              x: this.initialX * scale,
              y: this.initialY * scale,
              selected: false,
            });
          } else {
            let w = this.endX - this.startX;
            let h = this.endY - this.startY;
            if (w < 0) {
              this.initialX += w;
              w *= -1;
            }

            if (h < 0) {
              this.initialY += h;
              h *= -1;
            }

            if (w > 70 && h > 30) {
              this.createAnnotation({
                id: Date.now(),
                x: this.initialX * scale,
                y: this.initialY * scale,
                width: w * scale,
                height: h * scale,
                tag: 'New Tag',
                selected: false,
              });
            } else {
              // console.log(w, h);
              if (!isNaN(w)) {
                alert('Annotation box too small');
              }
            }
          }
        }

        this.elemDraw.removeEventListener('mousemove', this.onMouseMove);
        this.initialX = undefined;
        this.initialY = undefined;
        this.startX = undefined;
        this.startY = undefined;
        this.endX = undefined;
        this.endY = undefined;
        this.annotationCollided = undefined;
        this.tagCollided = undefined;
      }
    }
  };

  updateAnnotationTag(annotation) {
    const self = this;
    const scale = this.width / 450;
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'fixed';
    input.style.fontSize = 10 * scale;
    input.style.padding = 5;
    input.style.left =
      annotation.x * scale + this.elemAnnotate.getBoundingClientRect().left;
    input.style.top =
      annotation.y * scale + this.elemAnnotate.getBoundingClientRect().top;
    input.style.width = annotation.width * scale;

    input.maxLength = Math.floor((annotation.width * scale) / (5 * scale));
    input.value = annotation.tag;
    const annotationItem = document.querySelector(
      `.annotation-${annotation.id}`
    );

    document.body.appendChild(input);
    setTimeout(() => {
      input.focus();
      annotationItem.classList.add('selected');
    }, 1);

    self.inputVisible = true;

    const blurInput = () => {
      input.blur();
    };

    const removeInput = () => {
      self.updateAnnotation({
        ...annotation,
        tag: input.value,
      });
      self.redraw();
      document.body.removeChild(input);
      self.inputVisible = false;
      annotationItem.classList.remove('selected');
      window.removeEventListener('scroll', blurInput);
    };

    const handleEnter = (e) => {
      const { keyCode } = e;
      if (keyCode === 13) {
        input.blur();
      }
    };

    input.onblur = () => {
      removeInput();
    };

    input.onkeydown = handleEnter;
    window.addEventListener('scroll', blurInput);
  }

  createAnnotation(annotation) {
    this.draw('annotation', annotation);
    this.onCreateAnnotation &&
      this.onCreateAnnotation(annotation, (annotationData) => {
        this.updateAnnotationTag(annotationData);
      });
  }

  updateAnnotation(annotation) {
    this.onUpdateAnnotation && this.onUpdateAnnotation(annotation, () => {});
  }

  draw(type, object, callback = () => {}) {
    const self = this;
    switch (type) {
      case 'image': {
        const imageRatio = object.width / object.height;
        const pos = { x: 0, y: 0 };
        // console.log(imageRatio, self.ratio, this);
        if (self.ratio < imageRatio) {
          const scale = self.width / object.width;
          object.width = self.width;
          object.height *= scale;

          pos.y = Math.floor((self.height - object.height) / 2);
        } else {
          const scale = self.height / object.height;
          object.height = self.height;
          object.width *= scale;

          pos.x = Math.floor((self.width - object.width) / 2);
        }

        self.context.drawImage(
          object,
          pos.x,
          pos.y,
          object.width,
          object.height
        );
        break;
      }
      case 'annotation': {
        const scale = self.width / 450;
        self.contextAnnotate.font = `${Math.floor(10 * scale)}px Roboto`;
        self.contextAnnotate.fillStyle = '#333333';
        self.contextAnnotate.fillText(
          object.tag,
          (object.x + 5) * scale,
          (object.y + 15) * scale,
          object.width * scale
        );
        self.contextAnnotate.strokeStyle = '#333333';
        self.contextAnnotate.strokeRect(
          object.x * scale,
          object.y * scale,
          object.width * scale,
          object.height * scale
        );

        break;
      }
    }

    callback();
  }

  clear(ctx) {
    ctx.clearRect(0, 0, this.elem.width, this.elem.height);
  }

  renderAnnotateList({ onDelete }) {
    const self = this;
    this.annotateList.innerHTML = '';
    const list = document.createElement('ul');
    this.annotations.forEach((annotation) => {
      const listItem = document.createElement('li');
      listItem.className = `annotation-item annotation-${annotation.id}`;

      const listItemText = document.createElement('span');
      listItemText.textContent = annotation.tag;
      listItemText.onclick = () => {
        window.scrollTo(0, 0);
        self.updateAnnotationTag(annotation, listItemText);
      };

      const listItemDelete = document.createElement('a');
      listItemDelete.textContent = 'Delete';
      listItemDelete.href = '#delete-annotation';
      listItemDelete.className = 'annotation-delete';
      listItemDelete.onclick = () => {
        if (confirm('Are you sure you want to delete this tag?') === true) {
          onDelete && onDelete(annotation);
        }
      };

      listItem.appendChild(listItemText);
      listItem.appendChild(listItemDelete);

      list.appendChild(listItem);
    });

    this.annotateList.appendChild(list);
  }
}
