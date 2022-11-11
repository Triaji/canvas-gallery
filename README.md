# Canvas Gallery

Image Gallery that allows you to annotate over the images on a canvas

## Features

- Upload one or multiple image files by clicking the upload button
- Uploaded images displayed on canvas and mini gallery
- Ability to create tags over the image by highlighting the image
- Text box showing automatically for you to enter the tag text for the newly created annotation (press enter or scroll or tap anywhere outside the canvas to dismiss the textbox and save the tag text)
- Tag management where you can view all tags created for the displayed image, delete one or delete all tags
- All data uploaded and annotations created would be stored in the browser's indexedDB
- Ability to update the tags by tapping the text of the tags and the textfield will appear for you to update the tags
- Ability to move the positions of the annotations by clicking and dragging the annotation

## Considerations

### Tags

- In creating a new tag, the highlighter box will be displaying red when it is too small (should be enough space to have text inside the box) and green when it is of appropriate size
- The minimum size of the of the tag is meant to be big enough to fit the default text ('New Tag')
- Added a dynamic max length for the text input so that the user doesn't add more text than the length of the annotation box
- Clicking the tags text on the text list would initiate the textfield to be shown on the canvas for the respective tag

### Canvas

- Usage of 3 canvases to separate the background image, annotations and the drawing/moving interactions.
- The reason of separation is that the canvas would need to be cleared and being redrawn whenever the user does highlighting or moving of the tags.
- Redrawing the background image canvas would not be needed so it shouldn't be refreshed all the time.
- During highlighting or moving it will be done on the draw canvas and once done, it will be removed from the draw canvas and moved to the annotation canvas.
- During moving of tag, the annotation canvas will be redrawn all tags except for the selected tags and move the selected tag to the draw canvas so that again during moving, would not need to keep redrawing the annotation canvas and just do redraw for the selected tag on the draw canvas which should be much lighter

### Storage

- Usage of IndexedDB over localstorage for browser storage because we need to store structured data to group the data for images and tags/annotations.
- IndexedDB also has indexing feature where you can specify index for the store. It is useful to group the tag with the image id as their index.
- During clearing all tags for the selected image, would use the image id to remove

### Layout

- Layout changes depending on screen size.
- For bigger desktop screen, its better to move the tag list to the side so that everything is visible without any scrolling needed to look through the tags for the image and to be able to show the canvas as big as possible without the need of scrolling.

### Interaction

- Both mouse interation for the desktop and touch interaction for the mobile is catered

## Setup

- At the root of the project directory, use npm to install the necessary packages

```bash
npm install
```

- To run the app on localhost, do the following command on the root project directory

```bash
http-server
```

- Go to the site address stated on your terminal (e.g. http://127.0.0.1:8080) on your browser

## Unit Testing

- To run the unit testing and to generate the coverage report, do the following command on the root project directory

```bash
npm run test
```

- The coverage report will be generated on the `coverage` folder on the root of the project. `coverage > lcov-report > index.html`

## Linter

- To run the linter do the following command on the root project directory

```bash
npm run lint
```

## Future Enhancements

- Ability to change colors for the strokes and text of the tags so that it can cater for colorful images that the tags might not show well in a specific color
- Ability to resize the tags
