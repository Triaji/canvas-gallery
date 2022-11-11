import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import ImageGallery from './imageGallery.js';

describe('imageGallery.js', () => {
  const doc = document.createElement('div');
  const mockCallback = jest.fn();
  const imageGallery = new ImageGallery(doc, 50, mockCallback);
  beforeEach(() => {});

  it('should generate the correct number of child nodes', () => {
    imageGallery.loadImages([]);
    expect(imageGallery.elem.childElementCount).toBe(0);

    imageGallery.loadImages([{ image: '1' }, { image: '2', selected: true }]);
    expect(imageGallery.elem.childElementCount).toBe(2);
  });

  it('should call the action that is set during initialisation of the image gallery', () => {
    fireEvent.click(imageGallery.elem.firstChild);

    expect(mockCallback).toBeCalled();
  });
});
