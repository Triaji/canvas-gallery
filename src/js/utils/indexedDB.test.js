import '@testing-library/jest-dom/extend-expect';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import IndexedDB from './indexedDB.js';

let idb;
describe('indexedDB.js', () => {
  indexedDB = new FDBFactory();
  idb = new IndexedDB(indexedDB, 'canvas-image-annotate-db-test', 1, [
    { name: 'images', option: { keyPath: 'id' } },
    {
      name: 'annotations',
      option: { keyPath: 'id' },
      indexes: [{ name: 'imageId', field: 'imageId' }],
    },
  ]);

  const id = Date.now();

  it('should not be able to do anything before the DB is opened', (done) => {
    idb.add('images', { id, image: 'test image' }, (image) => {
      idb.update('images', { id, image: 'test image' }, (updatedImage) => {
        idb.count('images', (imageCount) => {
          idb.get('images', id, (image) => {
            idb.getAll('images', (images) => {
              idb.clear('images', (images) => {
                idb.remove('images', id, () => {
                  idb.removeByIndex('annotations', 'imageId', id, () => {
                    expect(imageCount).toBe(null);
                    expect(image).toBe(null);
                    expect(updatedImage).toBe(null);
                    expect(images).toBe(null);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  it('should retrieved the correct number and value of images and annotations', (done) => {
    idb.openDB(() => {
      idb.add('images', { id, image: 'test image' }, () => {
        idb.add(
          'annotations',
          { id: id + 1, imageId: id, tag: 'New Tag' },
          () => {
            idb.getAll('images', (images) => {
              idb.getAll('annotations', (annotations) => {
                expect(images).toHaveLength(1);
                expect(images[0].image).toBe('test image');
                expect(annotations).toHaveLength(1);
                expect(annotations[0].tag).toBe('New Tag');
                done();
              });
            });
          }
        );
      });
    });
  });

  it('should update images and annotations correctly', (done) => {
    idb.update('images', { id, image: 'test image 2' }, () => {
      idb.update(
        'annotations',
        { id: id + 1, imageId: id, tag: 'New Tag 2' },
        () => {
          idb.count('images', (imagesCount) => {
            idb.count('annotations', (annotationsCount) => {
              idb.get('images', id, (image) => {
                idb.get('annotations', id + 1, (annotation) => {
                  expect(imagesCount).toBe(1);
                  expect(annotationsCount).toBe(1);
                  expect(image.image).toBe('test image 2');
                  expect(annotation.tag).toBe('New Tag 2');
                  done();
                });
                done();
              });
            });
          });
        }
      );
    });
  });

  it('should remove images and annotations correctly', (done) => {
    idb.remove('images', id, () => {
      idb.remove('annotations', id + 1, () => {
        idb.getAll('images', (images) => {
          idb.getAll('annotations', (annotations) => {
            expect(images).toHaveLength(0);
            expect(annotations).toHaveLength(0);
            done();
          });
        });
      });
    });
  });

  it('should clear data correctly', (done) => {
    idb.add('images', { id, image: 'test image' }, () => {
      idb.add(
        'annotations',
        { id: id + 2, imageId: id, tag: 'New Tag' },
        () => {
          idb.add(
            'annotations',
            { id: id + 3, imageId: id, tag: 'New Tag' },
            () => {
              idb.removeByIndex('annotations', 'imageId', id, () => {
                idb.getAll('annotations', (annotations) => {
                  expect(annotations).toHaveLength(0);
                  done();
                });
              });
            }
          );
        }
      );
    });
  });

  it('should clear data correctly', (done) => {
    idb.add('images', { id, image: 'test image' }, () => {
      idb.add('images', { id: id + 1, image: 'test image' }, () => {
        idb.clear('images', () => {
          idb.getAll('images', (images) => {
            expect(images).toHaveLength(0);
            done();
          });
        });
      });
    });
  });
});
