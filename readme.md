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

Initialize Annotate.js in your JavaScript:

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

#### Zoom Function

Adjusts the zoom level of the canvas based on user interactions, particularly through mouse wheel movements. The function scales the canvas view in or out while keeping the zoom centered around the current mouse position.

##### Parameters

-   **`clicks` (number)**: Represents the zoom level change. Positive values for zooming in, negative for zooming out.

#### Scroll Handling Function

Manages the scroll interaction for zooming purposes. It normalizes scroll actions from mouse wheels or trackpads to determine the zoom direction and magnitude, calling the `zoom` method appropriately.

##### Parameters

-   **`evt` (Event)**: The scroll event triggered by user interaction with the mouse wheel or trackpad.

#### Transformation Tracking Function

The `trackTransforms` method enhances the canvas context to track transformations such as scaling, rotation, and translation. This is essential for accurately handling zooming and panning operations on the canvas.

##### Description

This function overrides several canvas context methods (like `save`, `restore`, `scale`, `rotate`, `translate`, `transform`, and `setTransform`) to maintain a record of transformations applied to the canvas. It also adds a `transformedPoint` method to the context for converting coordinates in the transformed space, which is crucial for accurate interaction handling.

#### User Interface Feedback Functions

##### Set Cursor Function

`setCursor(handle)`: Sets the cursor style on the canvas, indicating the type of interaction available (e.g., resizing, moving). The cursor style is determined based on the specific annotation handle being interacted with.

###### Parameters

-   **`handle` (string)**: Identifier for the annotation handle (e.g., 'top-left', 'bottom-right').

##### Hover State Functions

1. **`isHoveringOverAnnotation(x, y)`**: Determines if the provided coordinates are hovering over any annotation on the canvas, returning the annotation object if hovered.

    - **`x` (number)**: X-coordinate relative to the canvas.
    - **`y` (number)**: Y-coordinate relative to the canvas.

2. **`isHoveringOverHandle(x, y, annotation)`**: Checks if the provided coordinates are over any of the resize handles of a given annotation, returning the handle identifier if hovered.

    - **`x` (number), `y` (number)**: Coordinates relative to the canvas.
    - **`annotation` (Object)**: The annotation object to check handles for.

#### Drawing Annotations Function

`drawAnnotation(annotation)`: This function is responsible for rendering annotations on the canvas. It takes care of both filling the annotation area and drawing its border.

##### Parameters

-   **`annotation` (Object)**: The annotation object to be drawn. It must have `start` and `end` properties defining the coordinates, and an `annotationColor` property for color.

#### Managing Annotations Functions

##### Adding Annotations

Annotations are added during the drawing process, which is managed within the `mousemove` event listener. This process involves capturing the mouse movement on the canvas and creating annotation objects based on the start and end points defined during the interaction.

##### Removing Annotations Function

`removeAnnotations()`: This function is responsible for removing all annotations from the canvas. It clears the internal annotations array and updates the canvas display to reflect the removal.

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
