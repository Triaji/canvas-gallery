import { fireEvent, createEvent } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import ImageUploader from './imageUploader.js';

describe('imageUploader.js', () => {
  const mockCallback = jest.fn();
  const doc = document.createElement('button');
  const imageUploader = new ImageUploader(doc, mockCallback);
  imageUploader.init();
  beforeEach(() => {});

  Object.defineProperty(global, 'FileReader', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      readAsDataURL: mockCallback,
      onloadend: mockCallback,
    })),
  });

  it('should process the images properly on upload', () => {
    const spyProcessImage = jest.spyOn(imageUploader, 'processImage');
    const spyProcessPromises = jest.spyOn(imageUploader, 'processPromises');
    const event = new Event('click', { bubbles: true, cancelable: false });
    fireEvent(doc, event);

    const myEvent = createEvent('change', imageUploader.imageUploadInput, {
      target: {
        files: [new File(['(image)'], 'image.png', { type: 'image/png' })],
      },
    });
    fireEvent(imageUploader.imageUploadInput, myEvent);

    expect(spyProcessImage).toHaveBeenCalled();
    expect(spyProcessPromises).toHaveBeenCalled();

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
