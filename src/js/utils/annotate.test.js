import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import Annotate from './annotate.js';

describe('annotate.js', () => {
  const parent = document.createElement('div');
  const canvas = document.createElement('canvas');
  const annotation = document.createElement('canvas');
  const draw = document.createElement('canvas');
  const list = document.createElement('div');

  parent.style.width = 450;
  parent.style.height = 450;

  jest.spyOn(parent, 'clientWidth', 'get').mockImplementation(() => 450);
  jest.spyOn(parent, 'clientHeight', 'get').mockImplementation(() => 450);

  parent.appendChild(canvas);
  parent.appendChild(annotation);
  parent.appendChild(list);

  const mockCallback = jest.fn();

  const annotate = new Annotate(canvas, annotation, draw, list);
  const defaultUpdateAnnotation = annotate.updateAnnotation;

  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 120,
        height: 120,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      };
    });
    jest.useFakeTimers();

    annotate.annotations = [
      { x: 100, y: 100, width: 150, height: 100, tag: 'New Tag 1' },
    ];
    annotate.init();
    annotate.renderAnnotateList(mockCallback);
    annotate.context.drawImage = mockCallback;
    annotate.redraw = mockCallback;
    annotate.onCreateAnnotation = (annotation, callback) => {
      callback(annotation);
    };
    annotate.onUpdateAnnotation = (annotation, callback) => {
      callback(annotation);
    };

    annotate.inputVisible = false;
    annotate.updateAnnotation = defaultUpdateAnnotation;
  });

  it('should generate the correct number of child nodes', (done) => {
    fireEvent.mouseDown(annotate.elemDraw, {
      clientX: 10,
      clientY: 10,
    });

    fireEvent.mouseMove(annotate.elemDraw, {
      clientX: 150,
      clientY: 100,
    });

    fireEvent.mouseUp(annotate.elemDraw, {
      clientX: 150,
      clientY: 100,
    });

    expect(annotate.inputVisible).toBe(true);

    fireEvent.scroll(window);

    done();
  });

  it('should update the annotation location when user click on an existing annotation location', (done) => {
    const mockCallbackUpdate = jest.fn();
    annotate.updateAnnotation = mockCallbackUpdate;

    fireEvent.mouseDown(annotate.elemDraw, {
      clientX: 150,
      clientY: 150,
    });

    fireEvent.mouseMove(annotate.elemDraw, {
      clientX: 200,
      clientY: 200,
    });

    fireEvent.mouseUp(annotate.elemDraw, {
      clientX: 200,
      clientY: 200,
    });

    expect(mockCallbackUpdate).toBeCalledWith({
      height: 100,
      selected: false,
      tag: 'New Tag 1',
      width: 150,
      x: 150,
      y: 150,
    });

    done();
  });

  it('should show input field when the text portion of the annotation is clicked', (done) => {
    annotate.inputVisible = false;
    fireEvent.mouseDown(annotate.elemDraw, {
      clientX: 110,
      clientY: 110,
    });

    expect(annotate.tagCollided).toBe(0);
    expect(annotate.inputVisible).toBe(true);
    fireEvent.scroll(window);

    done();
  });

  it('should show input field when the text portion of the annotation is touched', (done) => {
    annotate.inputVisible = false;
    fireEvent.touchStart(annotate.elemDraw, {
      target: annotate.elemDraw,
      touches: [{ clientX: 110, clientY: 110 }],
    });

    expect(annotate.tagCollided).toBe(0);
    expect(annotate.inputVisible).toBe(true);

    done();
  });

  it('should show input field when the text portion of the annotation is touched 2', (done) => {
    const mockCallbackUpdate = jest.fn();
    annotate.updateAnnotation = mockCallbackUpdate;
    annotate.inputVisible = false;
    fireEvent.touchStart(annotate.elemDraw, {
      target: annotate.elemDraw,
      touches: [{ clientX: 150, clientY: 150 }],
    });

    expect(annotate.tagCollided).toBe(-1);
    expect(annotate.annotationCollided).toBe(0);

    fireEvent.touchMove(annotate.elemDraw, {
      target: annotate.elemDraw,
      touches: [{ clientX: 200, clientY: 200 }],
    });

    fireEvent.touchEnd(annotate.elemDraw, {
      target: annotate.elemDraw,
      touches: [{ clientX: 200, clientY: 200 }],
    });

    expect(mockCallbackUpdate).toBeCalledWith({
      height: 100,
      selected: false,
      tag: 'New Tag 1',
      width: 150,
      x: 150,
      y: 150,
    });

    done();
  });

  it('should draw the image to fit the canvas', () => {
    const mockCallbackDrawImage = jest.fn();
    annotate.context.drawImage = mockCallbackDrawImage;
    annotate.draw('image', { width: 10, height: 10 });
    expect(mockCallbackDrawImage).toBeCalledWith(
      { height: 450, width: 450 },
      0,
      0,
      450,
      450
    );
  });

  it('should clear the correct context', () => {
    const mockCallbackContext = jest.fn();
    const mockCallbackContectAnnotation = jest.fn();
    annotate.context.clearRect = mockCallbackContext;
    annotate.contextAnnotate.clearRect = mockCallbackContectAnnotation;
    annotate.clear(annotate.context);

    expect(mockCallbackContext).toBeCalled();
    expect(mockCallbackContectAnnotation).not.toBeCalled();
  });
});
