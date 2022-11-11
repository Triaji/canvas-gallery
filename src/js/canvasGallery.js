import Annotate from './utils/annotate.js';
import ImageUploader from './utils/imageUploader.js';
import ImageGallery from './utils/imageGallery.js';
import IndexedDB from './utils/indexedDB.js';

(function () {
  const containerAnnotations = document.querySelector(
    '#canvas-gallery .container-annotation'
  );
  const containerAnnotationsEmpty = document.querySelector(
    '#canvas-gallery .container-annotation-empty'
  );
  const navigatorDetail = document.querySelector(
    '#canvas-gallery .navigator-detail'
  );
  const detail = document.querySelector('#canvas-gallery .heading-detail');
  const buttonBack = document.querySelector('#canvas-gallery .button-back');
  const buttonNext = document.querySelector('#canvas-gallery .button-next');
  const buttonDelete = document.querySelector('#canvas-gallery .button-delete');
  const buttonClearTags = document.querySelector(
    '#canvas-gallery .button-clear-tags'
  );

  let storedData = [];
  let storedAnnotations = [];
  let selectedData = {};
  let selectedAnnotations = [];
  let selectedIndex = 0;

  const refreshDetail = () => {
    navigatorDetail.innerHTML = `${
      storedData.length > 0 ? selectedIndex + 1 : 0
    } of ${storedData.length}`;
    detail.innerHTML = `Image ${selectedIndex + 1}`;

    buttonBack.removeAttribute('disabled');
    buttonNext.removeAttribute('disabled');

    if (selectedIndex === 0) {
      buttonBack.setAttribute('disabled', true);
    }

    if (selectedIndex === storedData.length - 1) {
      buttonNext.setAttribute('disabled', true);
    }
  };

  const refreshIndex = () => {
    if (storedData.length > 0) {
      const elems = document.querySelectorAll('.hide-on-empty');
      elems.forEach((elem) => elem.classList.remove('hidden'));

      const elemsShow = document.querySelectorAll('.show-on-empty');
      elemsShow.forEach((elemShow) => elemShow.classList.add('hidden'));

      const elemsCentered = document.querySelectorAll('.center-on-empty');
      elemsCentered.forEach((elemShow) =>
        elemShow.classList.remove('centered')
      );
      resetSizes();
    } else {
      const elems = document.querySelectorAll('.hide-on-empty');
      elems.forEach((elem) => elem.classList.add('hidden'));

      const elemsShow = document.querySelectorAll('.show-on-empty');
      elemsShow.forEach((elemShow) => elemShow.classList.remove('hidden'));

      const elemsCentered = document.querySelectorAll('.center-on-empty');
      elemsCentered.forEach((elemShow) => elemShow.classList.add('centered'));
    }

    storedData = storedData.map((data, index) => ({ ...data, index }));
    selectedData = { ...storedData[selectedIndex], index: selectedIndex };
    imageGallery.loadImages(
      storedData.map((data, index) => ({
        ...data,
        selected: index === selectedIndex,
      }))
    );
  };

  const refreshCanvas = () => {
    if (selectedData?.image) {
      const myImage = new Image();
      myImage.src = selectedData.image;
      myImage.onload = function () {
        annotate.clear(annotate.context);
        annotate.draw('image', myImage, () => {});

        annotate.clear(annotate.contextAnnotate);
        annotate.annotations.forEach((annotation) => {
          if (!annotation.selected) {
            annotate.draw('annotation', annotation, () => {});
          }
        });
      };
    }
  };

  const refreshAnnotations = () => {
    if (storedData.length === 0) {
      containerAnnotationsEmpty.classList.add('hidden');
      containerAnnotations.classList.add('hidden');
    } else {
      selectedAnnotations = storedAnnotations.filter(
        (annotation) => annotation.imageId === selectedData.id
      );

      if (selectedAnnotations.length === 0) {
        containerAnnotations.classList.add('hidden');
        containerAnnotationsEmpty.classList.remove('hidden');
      } else {
        containerAnnotations.classList.remove('hidden');
        containerAnnotationsEmpty.classList.add('hidden');
      }

      annotate.annotations = selectedAnnotations;
      annotate.renderAnnotateList({
        onDelete: (annotation) => {
          idb.remove('annotations', annotation.id, () => {
            storedAnnotations = storedAnnotations.filter(
              (data) => data.id !== annotation.id
            );
            refreshAll();
          });
        },
      });
    }
  };

  const resetSizes = () => {
    annotate.elem.width = annotate.elem.parentElement.clientWidth;
    annotate.elem.height = annotate.elem.width;

    annotate.elemAnnotate.width = annotate.elem.width;
    annotate.elemAnnotate.height = annotate.elem.width;

    annotate.elemDraw.width = annotate.elem.width;
    annotate.elemDraw.height = annotate.elem.width;

    annotate.width = annotate.elem.width;
    annotate.height = annotate.elem.width;

    const width = document.body.clientWidth;
    const height = document.body.clientHeight;
    const sizeNotification = document.querySelector(
      '#canvas-gallery .size-notification'
    );
    const containerModule = document.querySelector(
      '#canvas-gallery .container-module'
    );

    if (width < 350 || height < 350) {
      sizeNotification.classList.remove('hidden');
      containerModule.classList.add('hidden');
    } else {
      sizeNotification.classList.add('hidden');
      containerModule.classList.remove('hidden');
    }
  };

  const refreshAll = () => {
    refreshIndex();
    refreshDetail();
    refreshCanvas();
    refreshAnnotations();
  };

  const idb = new IndexedDB(window.indexedDB, 'canvas-gallery-db', 1, [
    { name: 'images', option: { keyPath: 'id' } },
    {
      name: 'annotations',
      option: { keyPath: 'id' },
      indexes: [{ name: 'imageId', field: 'imageId' }],
    },
  ]);

  idb.openDB(() => {
    const loader = document.querySelector('#canvas-gallery .loader');
    const module = document.querySelector('#canvas-gallery .container-module');
    loader.classList.remove('hidden');
    module.classList.add('hidden');
    idb.getAll('images', (images) => {
      storedData = images.map((image, index) => ({ ...image, index }));
      selectedData = { ...images[selectedIndex], index: selectedIndex };

      idb.getAll('annotations', (annotations) => {
        storedAnnotations = annotations.map((annotation, index) => ({
          ...annotation,
          index,
        }));
        loader.classList.add('hidden');
        module.classList.remove('hidden');

        refreshAll();
      });
    });
  });

  const imageGallery = new ImageGallery(
    document.querySelector('#canvas-gallery .image-gallery'),
    100,
    (image) => {
      selectedIndex = image.index;
      imageGallery.elem.scroll({
        left: imageGallery.elem.children[selectedIndex].offsetLeft - 53,
        top: 0,
        behavior: 'smooth',
      });
      refreshAll();
    }
  );

  const annotate = new Annotate(
    document.querySelector('#canvas-gallery .canvas-image'),
    document.querySelector('#canvas-gallery .canvas-annotate'),
    document.querySelector('#canvas-gallery .canvas-draw'),
    document.querySelector('#canvas-gallery .list-annotation')
  );

  annotate.init();
  annotate.redraw = refreshCanvas;
  annotate.onCreateAnnotation = (annotation, callback) => {
    const annotationData = {
      ...annotation,
      imageId: selectedData.id,
    };
    idb.add('annotations', annotationData, () => {
      storedAnnotations.push(annotationData);

      refreshAll();
      callback(annotationData);
    });
  };

  annotate.onUpdateAnnotation = (annotation) => {
    idb.update('annotations', { ...annotation }, () => {
      storedAnnotations = storedAnnotations.map((sannotation) => {
        if (annotation.id === sannotation.id) {
          return annotation;
        }
        return sannotation;
      });

      refreshAll();
    });
  };

  new ImageUploader(
    document.querySelector('#canvas-gallery .button-upload'),
    (results) => {
      Promise.all(
        results.map(
          (result, index) =>
            new Promise((resolve) => {
              idb.add(
                'images',
                { id: Date.now() + index, image: result },
                (data) => {
                  storedData.push(data);
                  resolve();
                }
              );
            })
        )
      ).then(() => {
        refreshAll();
      });
    }
  ).init();

  buttonDelete.addEventListener('click', (e) => {
    if (confirm('Are you sure you want to delete this image?') === true) {
      e.target.setAttribute('disabled', true);

      const imgId = storedData[selectedIndex].id;
      idb.remove('images', imgId, () => {
        idb.removeByIndex('annotations', 'imageId', imgId, () => {
          storedData = storedData.filter((data) => data.id !== imgId);
          storedAnnotations = storedAnnotations.filter(
            (data) => data.imageId !== imgId
          );

          if (selectedIndex + 1 > storedData.length) {
            selectedIndex = storedData.length - 1;
          }

          e.target.removeAttribute('disabled');
          refreshAll();
        });
      });
    }
  });

  buttonBack.addEventListener('click', () => {
    if (selectedIndex > 0) {
      selectedIndex--;
      imageGallery.elem.scroll({
        left: imageGallery.elem.children[selectedIndex].offsetLeft - 53,
        top: 0,
        behavior: 'smooth',
      });
      refreshAll();
    }
  });

  buttonNext.addEventListener('click', () => {
    if (selectedIndex < storedData.length - 1) {
      selectedIndex++;
      imageGallery.elem.scroll({
        left: imageGallery.elem.children[selectedIndex].offsetLeft - 53,
        top: 0,
        behavior: 'smooth',
      });
      refreshAll();
    }
  });

  buttonClearTags.addEventListener('click', () => {
    if (
      confirm('Are you sure you want to clear all tags for this image?') ===
      true
    ) {
      idb.removeByIndex(
        'annotations',
        'imageId',
        storedData[selectedIndex].id,
        () => {
          storedAnnotations = storedAnnotations.filter(
            (data) => data.imageId !== storedData[selectedIndex].id
          );
          refreshAll();
        }
      );
    }
  });

  window.addEventListener('resize', () => {
    resetSizes();
    refreshCanvas();
    refreshAnnotations();
  });
})();
