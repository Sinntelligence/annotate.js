# Table of Contents

-   [Introduction](#introduction)
-   [Features](#features)
-   [Installation](#installation)
-   [Basic Usage](#basic-usage)
-   [Constructor Parameters](#constructor-parameters)
-   [Runtime Property Setting](#runtime-property-setting)
-   [Event System](#event-system)
-   [Detailed Documentation](#detailed-documentation)
    -   [Constructor](#constructor)
    -   [Event Handling](#event-handling)
    -   [Zooming and Panning](#zooming-and-panning)
    -   [Transformation Tracking](#transformation-tracking)
    -   [User Interface Feedback](#user-interface-feedback)
    -   [Drawing Annotations](#drawing-annotations)
    -   [Managing Annotations](#managing-annotations)
    -   [Event Dispatching](#event-dispatching)
    -   [Transform Management](#transform-management)
    -   [Handling Larger Images](#handling-larger-images)
-   [Contributing](#contributing)
-   [License](#license)
-   [Contact](#contact)

# Annotate.js

Annotate.js is a versatile JavaScript class for creating, managing, and interacting with annotations on a canvas element. It's ideal for applications requiring detailed image annotations such as graphics editing, data labeling, or educational tools.

## Features

-   **Interactive Annotations**: Enables drawing, moving, and resizing annotations.
-   **Zooming and Panning**: Offers enhanced zoom in/out and panning capabilities for detailed work.
-   **Customizable Appearance**: Allows setting annotation colors and styles.
-   **Responsive Interaction**: Provides hover and selection states for a better user experience.

## Installation

Include `Annotate.js` in your project.

```html
<script src="path/to/Annotate.js"></script>
```

Basic usage to start using Annotate.js, add a canvas element in your HTML:

```html
<canvas id="myCanvas" width="800" height="600"></canvas>
```

Initialize .js in your JavaScript:

```javascript
var annotate = new Annotate("myCanvas", true, "MyClass", 1, "#FF0000");
```

This code snippet creates an annotation canvas on myCanvas, displaying annotation names, using 'MyClass' for categorization, a class ID of 1, and sets the annotation color to red.

### Constructor Parameters

1. **`canvasId` (string)**: ID of the canvas element in the DOM.
2. **`shouldShowAnnotations` (boolean)**: Flag to display annotation names (`true` to show, `false` to hide).
3. **`currentClassName` (string)**: Current ontology setting for categorizing annotations.
4. **`currentClassId` (Number)**: Numeric identifier for the class of annotations.
5. **`annotationColor` (string)**: HEX format color for annotations (e.g., `"#FF0000"`).
6. **`handleDrawingSizeHovered` (number)**: Pixel size of the handle when hovered over.
7. **`handleDrawingSize` (number)**: Pixel size of the handle when not hovered over.
8. **`annotationDetectionThreshold` (number)**: Area size in pixels around an annotation for cursor hover detection.
9. **`font` (string)**: Font style for annotation names (default `"40pt Arial"`).
10. **`fillStyle` (string)**: Fill color for annotation names (default `"black"`).
11. **`zoomLevel` (number)**: Zoom level for the canvas.
12. **`transparency` (string)**: Transparency level for annotations (e.g., `"50"` for 50% transparency).

To change the annotation color, class name, or class ID during runtime, you can simply set the properties:

```javascript
annotate.annotationColor = "#00FF00";
annotate.currentClassName = "MyNewClass";
annotate.currentClassId = 2;
```

To retriev the annotations, you can simply access the annotations property:

```javascript
var annotations = annotate.annotations;
```

The script also has its own event system, allowing you to listen for changes in the annotations:

```javascript
annotate.addEventListener("annotationChanged", function (e) {
    console.log("Annotations changed!");
});
```

## Detailed Documentation

### Constructor

```javascript
constructor(canvasId, shouldShowAnnotations, currentClassName, currentClassId, annotationColor) {
// Initialization logic...
}
```

Initializes the canvas with the given settings, preparing it for drawing and managing annotations.

### Event Handling

`initCanvas()`: Configures event listeners for drawing, moving, resizing annotations, and for canvas interactions like zooming and dragging.

### Zooming and Panning

-   **Zooming**: Adjusted via the `zoom` function based on user interactions.
-   **Scroll Handling**: Managed by `handleScroll` to control zooming through mouse wheel actions.

### Transformation Tracking

-   `trackTransforms()`: Enhances the canvas context to track transformations, aiding in zooming and panning.

### User Interface Feedback

-   **Cursor Styles**: Set using `setCursor` based on the annotation handle interaction.
-   **Hover States**: Managed by `isHoveringOverAnnotation` and `isHoveringOverHandle`.

### Drawing Annotations

`drawAnnotation(annotation)`: Renders annotations on the canvas, handling both the fill and the border.

### Managing Annotations

-   **Adding Annotations**: Done during the drawing process in the `mousemove` event listener.
-   **Removing Annotations**: Managed by removeAnnotations which clears the canvas of all annotations.

### Event Dispatching

`dispatchAnnotationChangeEvent()`: Signals changes in annotations, useful for integration with other parts of an application.

### Transform Management

`resetTransform()`: Resets the transformation matrix, useful for resetting zoom levels.

### Handling Larger Images

For larger images, dynamically adjust the canvas size to match the image dimensions:

```javascript
annotationHandler.frame.onload = function () {
    // Set the canvas size based on the loaded image
    annotationHandler.canvas.dataset.frameId = frameNumber;

    if (
        annotationHandler.canvas.width !== annotationHandler.frame.naturalWidth ||
        annotationHandler.canvas.height !== annotationHandler.frame.naturalHeight
    ) {
        annotationHandler.canvas.width = annotationHandler.frame.naturalWidth;
        annotationHandler.canvas.height = annotationHandler.frame.naturalHeight;
    }
};
```

This code snippet adjusts the canvas size to the image size, ensuring proper scaling and annotation accuracy.

### Contributing

Contributions are welcome. Please fork the repository, create a feature branch, and submit pull requests following the project's coding standards.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Contact

If you have any questions, feedback, or need assistance with Annotate.js, feel free to reach out.

-   **Name**: Moritz Patek
-   **Email**: [mzp@sinntelligence.ai](mailto:mzp@sinntelligence.ai)

Your insights and inquiries are always welcome and appreciated.
