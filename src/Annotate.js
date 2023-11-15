/*!
 * Annotate.js
 *
 * Created by Moritz Patek
 * Email: mzp@sinntelligence.ai
 * GitHub: https://github.com/MoritzPatek
 *
 * Released under the MIT License.
 *
 * 2023 by Sinntelligence GmbH.
 * This software is part of the projects developed at Sinntelligence GmbH.
 * For more information about our projects and services, visit https://sinntelligence.ai
 */

class Annotate {
    // Constants
    static MAX_ZOOM = 5; // 500% zoom
    static MIN_ZOOM = 0.2; // 20% zoom
    static SCALE_FACTOR = 1.1;
    static HANDLE_SIZE = 15; // Increase the size of the hitbox for easier hovering
    static DEFAULT_COLOR = "#FF0000"; // Red
    static DRAW_ANNOTATION_NAME_OFFSET_X = 20;
    static DRAW_ANNOTATION_NAME_OFFSET_Y = 50;

    /**
     * Constructor for the canvas annotation manager.
     * Initializes the canvas with specified settings and prepares it for drawing and managing annotations.
     *
     * @param {string} canvasId - The ID of the canvas element in the DOM.
     * @param {boolean} shouldShowAnnotations - Flag to indicate whether annotations names should be displayed.
     * @param {string} currentClassName - The current ontology setting, used for categorizing annotations.
     * @param {Number} currentClassId - The current class ID, used for identifying the class of annotations.
     * @param {string} annotationColor - The color for annotations, specified in HEX format (e.g., "#FF0000").
     * @param {number} handleDrawingSizeHovered - The size of the handle when hovered over, in pixels.
     * @param {number} handleDrawingSize - The size of the handle when not hovered over, in pixels.
     * @param {number} annotationDetectionThreshold - The size of the area around an annotation where the cursor is considered to be hovering over it.
     * @param {string} font - The font style for annotation names.
     * @param {string} fillStyle - The fill color for annotation names.
     *
     */
    constructor(
        canvasId,
        shouldShowAnnotations,
        currentClassName,
        currentClassId,
        annotationColor,
        handleDrawingSizeHovered = 40,
        handleDrawingSize = 30,
        annotationDetectionThreshold = 20,
        font = "40pt Arial",
        fillStyle = "black",
        zoomLevel = 1,
        transparency = "50"
    ) {
        // Initialize properties with provided values
        this.shouldShowAnnotations = shouldShowAnnotations; // Whether to show annotation names
        this.currentOntology = currentClassName; // Current ontology setting
        this.currentClassId = currentClassId; // Current class ID for annotations
        this.annotationColor = annotationColor; // Color for drawing annotations
        this.handleDrawingSizeHovered = handleDrawingSizeHovered; // Size of the handle when hovered
        this.handleDrawingSize = handleDrawingSize; // Size of the handle when not hovered
        this.annotationDetectionThreshold = annotationDetectionThreshold; // Size of the area around an annotation where the cursor is considered to be hovering over it
        this.font = font; // Font style for annotation names
        this.fillStyle = fillStyle; // Fill color for annotation names
        this.zoomLevel = zoomLevel; // Zoom level for the canvas
        this.transparency = transparency; // Transparency for the annotations

        // Variables for interaction and calculations

        // Represents the canvas element on the webpage, identified by the provided canvasId.
        this.canvas = document.getElementById(canvasId);

        // The context of the canvas, used for drawing operations.
        this.ctx = this.canvas.getContext("2d");

        // Image object used for background or other frame-like purposes on the canvas.
        this.frame = new Image();

        // Horizontal scaling factor for resizing elements on the canvas.
        this.scaleX = null;

        // Vertical scaling factor for resizing elements on the canvas.
        this.scaleY = null;

        // Array to store annotation objects drawn on the canvas.
        this.annotations = [];

        // Flag indicating whether the user is currently drawing on the canvas.
        this.isDrawing = false;

        // Flag indicating whether an element on the canvas is being moved.
        this.isMoving = false;

        // Flag indicating whether an element on the canvas is being resized.
        this.isResizing = false;

        // Reference to the annotation object currently hovered over by the mouse.
        this.hoveredAnnotation = null;

        // Reference to the handle of the annotation being hovered over.
        this.hoveredHandle = null;

        // Reference to the handle of the annotation currently selected.
        this.selectedHandle = null;

        // Starting X-coordinate offset for moving or resizing operations.
        this.offsetX_start = null;

        // Starting Y-coordinate offset for moving or resizing operations.
        this.offsetY_start = null;

        // Ending X-coordinate offset for moving or resizing operations.
        this.offsetX_end = null;

        // Ending Y-coordinate offset for moving or resizing operations.
        this.offsetY_end = null;

        // Reference to the annotation object currently being moved.
        this.movingAnnotation = null;

        // Stores the last known position of the mouse or a moved object.
        this.lastKnownPosition = null;

        // Flag indicating whether a new annotation is currently being drawn.
        this.isDrawingAnnotation = false;

        // Stores the starting point coordinates for a new annotation.
        this.newAnnotationStart = null;

        // Stores the last X-coordinate during a drawing or moving operation.
        this.lastX = null;

        // Stores the last Y-coordinate during a drawing or moving operation.
        this.lastY = null;

        // Stores the starting point of a drag operation.
        this.dragStart = null;

        // Stores the current point during a drag operation.
        this.dragged = null;

        this.initCanvas(); // initialize the canvas
    }

    /**
     * Initializes the canvas and sets up various event listeners for drawing, moving, and resizing annotations.
     * It handles mouse interactions for dragging the canvas, drawing annotations, and moving or resizing existing annotations.
     * Additionally, it listens for keyboard events to delete annotations and manages zooming through mouse wheel events.
     *
     * @return {void} This function does not return anything.
     */
    initCanvas() {
        // Initialize canvas and context
        this.trackTransforms();

        // Add a 'mousedown' event listener to the canvas
        this.canvas.addEventListener(
            "mousedown",
            (evt) => {
                // Check if shift key is pressed and not currently resizing an annotation
                if (evt.shiftKey && !this.isResizing) {
                    // Disable text selection on the body to avoid user select issues during dragging
                    document.body.style.mozUserSelect =
                        document.body.style.webkitUserSelect =
                        document.body.style.userSelect =
                            "none";

                    // Calculate and set the last mouse position, adjusted for scale
                    this.lastX = (evt.offsetX || evt.pageX - this.canvas.offsetLeft) / this.scaleX;
                    this.lastY = (evt.offsetY || evt.pageY - this.canvas.offsetTop) / this.scaleY;

                    // Set the starting point for canvas dragging
                    this.dragStart = this.ctx.transformedPoint(this.lastX, this.lastY);
                    this.dragged = false;
                } else if (this.hoveredAnnotation) {
                    // Check if any annotation is currently hovered
                    if (this.hoveredHandle) {
                        // If hovering over a resize handle, start resizing mode
                        this.isResizing = true;
                        this.selectedHandle = this.hoveredHandle;
                    } else {
                        // If hovering over an annotation but not a handle, start moving mode
                        this.isMoving = true;
                        this.movingAnnotation = this.hoveredAnnotation;

                        // Calculate offsets for moving the annotation
                        this.offsetX_start = this.lastX - this.movingAnnotation.start.x;
                        this.offsetY_start = this.lastY - this.movingAnnotation.start.y;
                        this.offsetX_end = this.lastX - this.movingAnnotation.end.x;
                        this.offsetY_end = this.lastY - this.movingAnnotation.end.y;
                    }
                } else if (this.currentOntology !== null) {
                    // If an ontology is selected, start drawing a new annotation
                    this.isDrawingAnnotation = true;
                    var pt = this.ctx.transformedPoint(this.lastX, this.lastY);
                    this.newAnnotationStart = { x: pt.x, y: pt.y };
                } else {
                    // If none of the above, reset interaction flags
                    this.isMoving = false;
                    this.isDrawing = false;
                    this.isResizing = false;
                }
            },
            false
        );

        // Add a 'mousemove' event listener to the canvas
        this.canvas.addEventListener(
            "mousemove",
            (evt) => {
                // Update the current mouse position, adjusted for scale
                this.lastX = (evt.offsetX || evt.pageX - this.canvas.offsetLeft) / this.scaleX;
                this.lastY = (evt.offsetY || evt.pageY - this.canvas.offsetTop) / this.scaleY;

                // Mark the action as a drag operation
                this.dragged = true;

                // Handle canvas dragging if it has been initiated
                if (this.dragStart) {
                    var pt = this.ctx.transformedPoint(this.lastX, this.lastY);
                    this.ctx.translate(pt.x - this.dragStart.x, pt.y - this.dragStart.y);
                }

                // Update the current point for various interactions
                pt = this.ctx.transformedPoint(this.lastX, this.lastY);

                // Handle hover interactions unless resizing is in progress
                if (!this.isResizing) {
                    // Detect if the cursor is hovering over an annotation
                    this.hoveredAnnotation = this.isHoveringOverAnnotation(pt.x, pt.y);

                    // Set cursor style based on hover state
                    if (this.hoveredAnnotation) {
                        this.hoveredHandle = this.isHoveringOverHandle(pt.x, pt.y, this.hoveredAnnotation);
                        if (this.hoveredHandle) {
                            this.setCursor(this.hoveredHandle);
                        } else {
                            this.canvas.style.cursor = "move";
                        }
                    } else {
                        this.canvas.style.cursor = "default";
                    }
                    this.redraw();
                }

                // Handle moving annotations
                if (this.movingAnnotation) {
                    // Calculate new coordinates for the moving annotation
                    var newStartX = this.lastX - this.offsetX_start;
                    var newStartY = this.lastY - this.offsetY_start;
                    var newEndX = this.lastX - this.offsetX_end;
                    var newEndY = this.lastY - this.offsetY_end;

                    // Constrain to image boundaries
                    newStartX = Math.max(0, Math.min(newStartX, this.canvas.width));
                    newStartY = Math.max(0, Math.min(newStartY, this.canvas.height));
                    newEndX = Math.max(0, Math.min(newEndX, this.canvas.width));
                    newEndY = Math.max(0, Math.min(newEndY, this.canvas.height));

                    this.movingAnnotation.start.x = newStartX;
                    this.movingAnnotation.start.y = newStartY;
                    this.movingAnnotation.end.x = newEndX;
                    this.movingAnnotation.end.y = newEndY;
                    // Apply the new coordinates and mark the annotation as edited
                    this.movingAnnotation.state = "edited";
                    this.redraw();
                }

                // Handle resizing annotations
                if (this.isResizing) {
                    var pt = this.ctx.transformedPoint(this.lastX, this.lastY);

                    var newStartX = this.hoveredAnnotation.start.x;
                    var newStartY = this.hoveredAnnotation.start.y;
                    var newEndX = this.hoveredAnnotation.end.x;
                    var newEndY = this.hoveredAnnotation.end.y;

                    switch (this.selectedHandle) {
                        case "top-left":
                            newStartX = pt.x;
                            newStartY = pt.y;
                            break;
                        case "top-right":
                            newEndX = pt.x;
                            newStartY = pt.y;
                            break;
                        case "bottom-left":
                            newStartX = pt.x;
                            newEndY = pt.y;
                            break;
                        case "bottom-right":
                            newEndX = pt.x;
                            newEndY = pt.y;
                            break;
                        case "top-middle":
                            newStartY = pt.y;
                            break;
                        case "bottom-middle":
                            newEndY = pt.y;
                            break;
                        case "left-middle":
                            newStartX = pt.x;
                            break;
                        case "right-middle":
                            newEndX = pt.x;
                            break;
                    }

                    // Constrain to image boundaries
                    newStartX = Math.max(0, Math.min(newStartX, this.canvas.width));
                    newStartY = Math.max(0, Math.min(newStartY, this.canvas.height));
                    newEndX = Math.max(0, Math.min(newEndX, this.canvas.width));
                    newEndY = Math.max(0, Math.min(newEndY, this.canvas.height));

                    this.hoveredAnnotation.start.x = newStartX;
                    this.hoveredAnnotation.start.y = newStartY;
                    this.hoveredAnnotation.end.x = newEndX;
                    this.hoveredAnnotation.end.y = newEndY;

                    // Apply the new coordinates and mark the annotation as edited
                    this.hoveredAnnotation.state = "edited";
                    this.redraw();
                }

                // Handle drawing new annotations
                if (this.isDrawingAnnotation) {
                    var tempAnnotation = {
                        start: this.newAnnotationStart,
                        end: { x: pt.x, y: pt.y },
                        annotationColor: this.annotationColor,
                    };
                    this.redraw();
                    this.drawAnnotation(tempAnnotation);
                }
            },
            false
        );

        // Add a 'mouseup' event listener to the canvas
        this.canvas.addEventListener(
            "mouseup",
            (evt) => {
                // Reset the starting point for dragging
                this.dragStart = null;

                // If the canvas wasn't dragged, execute zooming based on the shift key state

                if (!this.dragged) this.zoom(evt.shiftKey ? -this.zoomLevel : this.zoomLevel);

                // Finalize drawing a new annotation
                if (this.isDrawingAnnotation) {
                    // Transform the current mouse position to canvas coordinates
                    var pt = this.ctx.transformedPoint(this.lastX, this.lastY);

                    // Normalize the start and end coordinates of the annotation
                    let normalizedStart = {
                        x: Math.min(this.newAnnotationStart.x, pt.x),
                        y: Math.min(this.newAnnotationStart.y, pt.y),
                    };

                    let normalizedEnd = {
                        x: Math.max(this.newAnnotationStart.x, pt.x),
                        y: Math.max(this.newAnnotationStart.y, pt.y),
                    };

                    // Calculate the dimensions of the new annotation
                    var width = normalizedEnd.x - normalizedStart.x;
                    var height = normalizedEnd.y - normalizedStart.y;

                    // Define minimum size requirements for the annotation
                    var MIN_WIDTH = this.canvas.width * 0.01; // 1% of canvas width
                    var MIN_HEIGHT = this.canvas.height * 0.01; // 1% of canvas height

                    // Check if the new annotation meets the minimum size requirements
                    if (width >= MIN_WIDTH && height >= MIN_HEIGHT) {
                        // Convert coordinates to relative (percentage) values
                        let relativ_start = {
                            x: normalizedStart.x / this.canvas.width,
                            y: normalizedStart.y / this.canvas.height,
                        };
                        let relativ_end = {
                            x: normalizedEnd.x / this.canvas.width,
                            y: normalizedEnd.y / this.canvas.height,
                        };

                        // Add the new annotation to the annotations array
                        this.annotations.push({
                            start_relativ: relativ_start,
                            end_relativ: relativ_end,
                            start: normalizedStart,
                            end: normalizedEnd,
                            name: this.currentOntology,
                            class_id: this.currentClassId,
                            annotationColor: this.annotationColor,
                            state: "unsaved",
                            ID: null,
                        });

                        // Redraw the canvas to reflect the new annotation
                        this.redraw();
                    } else {
                        // Log a message if the annotation is too small
                        console.log("Annotation is too small and was not created.");
                    }
                }

                // Dispatch an event to indicate a change in annotations
                this.dispatchAnnotationChangeEvent();

                // Reset interaction flags to their default state
                this.resetInteractionFlags();
            },
            false
        );

        // Add a 'keydown' event listener to the entire document
        document.addEventListener(
            "keydown",
            (evt) => {
                // Check if the pressed key is either 'Delete' or 'Backspace'
                if (evt.key === "Delete" || evt.key === "Backspace") {
                    // If there's an annotation currently being hovered over
                    if (this.hoveredAnnotation) {
                        // Change the state of the hovered annotation to 'deleted'
                        this.hoveredAnnotation.state = "deleted";

                        // Redraw the canvas to reflect the deletion of the annotation
                        this.redraw();

                        // Dispatch an event to indicate a change in annotations
                        this.dispatchAnnotationChangeEvent();
                    }
                }
            },
            false
        );

        this.canvas.addEventListener("DOMMouseScroll", this.handleScroll, false);
        this.canvas.addEventListener("mousewheel", this.handleScroll, false);
    }

    /**
     * Resets various interaction flags and state variables related to canvas and annotation interactions.
     * This function is typically called after completing an interaction like drawing, moving, or resizing an annotation,
     * or after completing canvas dragging. It ensures that all interaction-related states are reset to their default (inactive) values.
     *
     * @return {void} This function does not return anything.
     */
    resetInteractionFlags() {
        this.isDraggingCanvas = false; // Reset the flag indicating if the canvas is being dragged
        this.isResizingAnnotationFlag = false; // Reset the flag indicating if an annotation is being resized
        this.isMovingAnnotationFlag = false; // Reset the flag indicating if an annotation is being moved
        this.movingAnnotation = null; // Clear the reference to any annotation that was being moved
        this.isResizing = false; // Reset the flag indicating if a resizing operation is active
        this.isDrawingAnnotation = false; // Reset the flag indicating if a new annotation is being drawn
        this.newAnnotationStart = null; // Clear the starting point of a new annotation
        this.selectedHandle = null; // Clear the reference to any selected resize handle
    }

    /**
     * Calculates and returns the dimensions of a given annotation.
     * It computes the start and end coordinates, width, and height of the annotation,
     * ensuring that start coordinates are the top-left point and end coordinates are the bottom-right point.
     * This function is useful for operations that require knowledge of the exact size and position of an annotation.
     *
     * @param {Object} annotation - The annotation object to calculate dimensions for.
     *                              It should have 'start' and 'end' properties, each with 'x' and 'y' coordinates.
     * @return {Object} An object containing the start coordinates (startX, startY), end coordinates (endX, endY),
     *                  and dimensions (width, height) of the annotation.
     */
    getAnnotationDimensions(annotation) {
        var startX = Math.min(annotation.start.x, annotation.end.x);
        var endX = Math.max(annotation.start.x, annotation.end.x);
        var startY = Math.min(annotation.start.y, annotation.end.y);
        var endY = Math.max(annotation.start.y, annotation.end.y);
        var width = Math.abs(endX - startX);
        var height = Math.abs(endY - startY);
        return { startX, startY, width, height, endX, endY };
    }

    /**
     * Draws the name of a given annotation at specified coordinates on the canvas.
     * This function sets the font style and color, then renders the annotation's name
     * at the given x and y coordinates, offset slightly to ensure the text is not drawn
     * directly at the edge of the annotation.
     *
     * @param {Object} annotation - The annotation object whose name is to be drawn.
     *                              Expected to have a 'name' property.
     * @param {number} x - The x-coordinate on the canvas where the annotation name should begin.
     * @param {number} y - The y-coordinate on the canvas where the annotation name should begin.
     * @return {void} This function does not return anything.
     */
    drawAnnotationName(annotation, x, y) {
        this.ctx.font = this.font; // Set the font for the text
        this.ctx.fillStyle = this.fillStyle; // Set the text color to black
        this.ctx.fillText(
            annotation.name,
            x + Annotate.DRAW_ANNOTATION_NAME_OFFSET_X,
            y + Annotate.DRAW_ANNOTATION_NAME_OFFSET_Y
        ); // Draw the name of the annotation with an offset
    }

    /**
     * Checks whether the provided x and y coordinates are hovering over any of the annotations.
     * Iterates through the list of annotations in reverse order (to prioritize elements drawn last/on top),
     * and determines if the provided coordinates fall within the extended boundary of any annotation.
     * The function also updates the 'selected' state of the annotations based on the hover check.
     *
     * @param {number} x - The x-coordinate relative to the canvas to check for hovering.
     * @param {number} y - The y-coordinate relative to the canvas to check for hovering.
     * @return {Object|null} Returns the annotation object that is being hovered over, if any, otherwise null.
     */
    isHoveringOverAnnotation(x, y) {
        for (let annotation of this.annotations.reverse()) {
            var { startX, startY, width, height } = this.getAnnotationDimensions(annotation);

            // Check if the coordinates are within the extended boundary of the annotation
            if (
                x >= startX - this.annotationDetectionThreshold &&
                x <= startX + width + this.annotationDetectionThreshold &&
                y >= startY - this.annotationDetectionThreshold &&
                y <= startY + height + this.annotationDetectionThreshold
            ) {
                annotation.selected = true;
                return annotation;
            } else {
                annotation.selected = false;
            }
        }
        return null;
    }
    /**
     * Determines if the provided x and y coordinates are hovering over any of the resize handles of a given annotation.
     * The function checks each handle's position (top-left, top-right, bottom-left, bottom-right, top-middle, bottom-middle,
     * left-middle, right-middle) against the coordinates. It uses a predefined handle size to establish the hover area.
     *
     * @param {number} x - The x-coordinate relative to the canvas, used to check if it's over a handle.
     * @param {number} y - The y-coordinate relative to the canvas, used to check if it's over a handle.
     * @param {Object} annotation - The annotation object whose handles are being checked.
     * @return {string|null} Returns a string representing the handle being hovered over (e.g., 'top-left'), or null if none.
     */
    isHoveringOverHandle(x, y, annotation) {
        const { startX, startY, width, height } = this.getAnnotationDimensions(annotation);

        // Top-left handle
        if (
            x >= startX - Annotate.HANDLE_SIZE &&
            x <= startX + Annotate.HANDLE_SIZE &&
            y >= startY - Annotate.HANDLE_SIZE &&
            y <= startY + Annotate.HANDLE_SIZE
        ) {
            return "top-left";
        }
        // Top-right handle
        if (
            x >= startX + width - Annotate.HANDLE_SIZE &&
            x <= startX + width + Annotate.HANDLE_SIZE &&
            y >= startY - Annotate.HANDLE_SIZE &&
            y <= startY + Annotate.HANDLE_SIZE
        ) {
            return "top-right";
        }
        // Bottom-left handle
        if (
            x >= startX - Annotate.HANDLE_SIZE &&
            x <= startX + Annotate.HANDLE_SIZE &&
            y >= startY + height - Annotate.HANDLE_SIZE &&
            y <= startY + height + Annotate.HANDLE_SIZE
        ) {
            return "bottom-left";
        }
        // Bottom-right handle
        if (
            x >= startX + width - Annotate.HANDLE_SIZE &&
            x <= startX + width + Annotate.HANDLE_SIZE &&
            y >= startY + height - Annotate.HANDLE_SIZE &&
            y <= startY + height + Annotate.HANDLE_SIZE
        ) {
            return "bottom-right";
        }
        // Top-middle handle
        if (
            x >= startX + width / 2 - Annotate.HANDLE_SIZE &&
            x <= startX + width / 2 + Annotate.HANDLE_SIZE &&
            y >= startY - Annotate.HANDLE_SIZE &&
            y <= startY + Annotate.HANDLE_SIZE
        ) {
            return "top-middle";
        }
        // Bottom-middle handle
        if (
            x >= startX + width / 2 - Annotate.HANDLE_SIZE &&
            x <= startX + width / 2 + Annotate.HANDLE_SIZE &&
            y >= startY + height - Annotate.HANDLE_SIZE &&
            y <= startY + height + Annotate.HANDLE_SIZE
        ) {
            return "bottom-middle";
        }
        // Left-middle handle
        if (
            x >= startX - Annotate.HANDLE_SIZE &&
            x <= startX + Annotate.HANDLE_SIZE &&
            y >= startY + height / 2 - Annotate.HANDLE_SIZE &&
            y <= startY + height / 2 + Annotate.HANDLE_SIZE
        ) {
            return "left-middle";
        }
        // Right-middle handle
        if (
            x >= startX + width - Annotate.HANDLE_SIZE &&
            x <= startX + width + Annotate.HANDLE_SIZE &&
            y >= startY + height / 2 - Annotate.HANDLE_SIZE &&
            y <= startY + height / 2 + Annotate.HANDLE_SIZE
        ) {
            return "right-middle";
        }
        return null;
    }

    /**
     * Adjusts the zoom level of the canvas based on the number of 'clicks'.
     * A 'click' represents a discrete zoom in or out action, typically triggered by a mouse wheel movement.
     * The function calculates the new zoom level based on a predefined scale factor and applies it if within
     * allowed zoom boundaries. It ensures that the zooming is centered around the current mouse position.
     *
     * @param {number} clicks - The number of zoom 'clicks'. Positive values zoom in, negative values zoom out.
     */
    zoom = (clicks) => {
        var pt = this.ctx.transformedPoint(this.lastX, this.lastY);
        this.ctx.translate(pt.x, pt.y);
        var factor = Math.pow(Annotate.SCALE_FACTOR, clicks);

        // Calculate the potential next zoom level
        var currentScaleX = this.ctx.getTransform().a;
        var currentScaleY = this.ctx.getTransform().d;
        var potentialScaleX = currentScaleX * factor;
        var potentialScaleY = currentScaleY * factor;

        // Check if the potential zoom level is within the defined limits
        if (
            potentialScaleX > Annotate.MIN_ZOOM &&
            potentialScaleX < Annotate.MAX_ZOOM &&
            potentialScaleY > Annotate.MIN_ZOOM &&
            potentialScaleY < Annotate.MAX_ZOOM
        ) {
            this.ctx.scale(factor, factor);
        }

        this.ctx.translate(-pt.x, -pt.y);
        this.redraw();
    };

    /**
     * Handles the scroll event on the canvas for zooming purposes.
     * This function calculates the zoom direction and magnitude based on the scroll event delta and calls the `zoom` method.
     * It normalizes the scroll delta to ensure consistent behavior across different browsers. The function also prevents
     * the default scroll action to avoid scrolling the entire page instead of zooming the canvas.
     *
     * @param {Event} evt - The scroll event triggered by user interaction with the mouse wheel or trackpad.
     * @return {boolean} Returns false to prevent the default scroll behavior.
     */
    handleScroll = (evt) => {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) this.zoom(delta);
        return evt.preventDefault() && false;
    };

    /**
     * Enhances the canvas context by tracking transformations like scaling, rotation, and translation.
     * This method overrides several canvas context methods (save, restore, scale, rotate, translate, transform, and setTransform)
     * to maintain a record of transformations applied to the canvas. This is useful for operations like zooming and dragging,
     * where an understanding of the transformed state is necessary. It also adds a 'transformedPoint' method to the context
     * for converting coordinates in the transformed space.
     */
    trackTransforms() {
        // Create an SVG matrix to keep track of transformations
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var xform = svg.createSVGMatrix();

        // Override the getTransform method to return the current transformation matrix
        this.ctx.getTransform = function () {
            return xform;
        };

        // Store the original transformations to restore later
        var savedTransforms = [];
        var save = this.ctx.save;

        // Override the save method to include the current transformation matrix
        this.ctx.save = () => {
            savedTransforms.push(xform.translate(0, 0));
            return save.call(this.ctx);
        };

        // Override the restore method to revert to the last saved transformation
        var restore = this.ctx.restore;
        this.ctx.restore = () => {
            xform = savedTransforms.pop();
            return restore.call(this.ctx);
        };

        // Override the scale method to update the transformation matrix
        var scale = this.ctx.scale;
        this.ctx.scale = (sx, sy) => {
            xform = xform.scaleNonUniform(sx, sy);
            return scale.call(this.ctx, sx, sy);
        };

        // Override the rotate method to update the transformation matrix
        var rotate = this.ctx.rotate;
        this.ctx.rotate = (radians) => {
            xform = xform.rotate((radians * 180) / Math.PI);
            return rotate.call(this.ctx, radians);
        };

        // Override the translate method to update the transformation matrix
        var translate = this.ctx.translate;
        this.ctx.translate = (dx, dy) => {
            xform = xform.translate(dx, dy);
            return translate.call(this.ctx, dx, dy);
        };

        // Override the transform method to update the transformation matrix
        var transform = this.ctx.transform;
        this.ctx.transform = (a, b, c, d, e, f) => {
            var m2 = svg.createSVGMatrix();
            m2.a = a;
            m2.b = b;
            m2.c = c;
            m2.d = d;
            m2.e = e;
            m2.f = f;
            xform = xform.multiply(m2);
            return transform.call(this.ctx, a, b, c, d, e, f);
        };

        // Override the setTransform method to directly set the transformation matrix
        var setTransform = this.ctx.setTransform;
        this.ctx.setTransform = (a, b, c, d, e, f) => {
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(this.ctx, a, b, c, d, e, f);
        };

        // Create an SVG point used for transforming points in the canvas
        var pt = svg.createSVGPoint();

        // Add a method to transform a point using the current transformation matrix
        this.ctx.transformedPoint = (x, y) => {
            pt.x = x;
            pt.y = y;
            return pt.matrixTransform(xform.inverse());
        };
    }

    /**
     * Sets the cursor style on the canvas based on the specified handle.
     * The cursor style indicates the type of resizing operation that can be performed (e.g., diagonal, horizontal, vertical resizing).
     * This visual cue helps users understand how they can interact with the annotation handles.
     *
     * @param {string} handle - The handle identifier which determines the cursor style.
     *                          Possible values are 'top-left', 'bottom-right', 'top-right', 'bottom-left',
     *                          'top-middle', 'bottom-middle', 'left-middle', 'right-middle'.
     */
    setCursor(handle) {
        switch (handle) {
            case "top-left":
            case "bottom-right":
                // Set the cursor for diagonal resizing (north-west/south-east)
                this.canvas.style.cursor = "nwse-resize";
                break;
            case "top-right":
            case "bottom-left":
                // Set the cursor for diagonal resizing (north-east/south-west)
                this.canvas.style.cursor = "nesw-resize";
                break;
            case "top-middle":
            case "bottom-middle":
                // Set the cursor for vertical resizing (north/south)
                this.canvas.style.cursor = "ns-resize";
                break;
            case "left-middle":
            case "right-middle":
                // Set the cursor for horizontal resizing (east/west)
                this.canvas.style.cursor = "ew-resize";
                break;
        }
    }

    /**
     * Draws an annotation on the canvas.
     * The function fills the annotation's area with a semi-transparent color and outlines it with a solid border.
     * The color of the fill and border is taken from the annotation object, defaulting to red if not specified.
     *
     * @param {Object} annotation - The annotation object to be drawn.
     *                              It must have 'start' and 'end' properties defining the coordinates,
     *                              and an 'annotationColor' property for the color.
     */
    drawAnnotation(annotation) {
        // Fill the rectangle with a semi-transparent color
        // The color is taken from the annotation object, defaulting to semi-transparent red if not specified.
        this.ctx.fillStyle =
            annotation.annotationColor + this.transparency || Annotate.DEFAULT_COLOR + this.transparency;
        this.ctx.fillRect(
            annotation.start.x,
            annotation.start.y,
            annotation.end.x - annotation.start.x,
            annotation.end.y - annotation.start.y
        );

        // Draw the border with a solid color
        // The border color is the same as the fill but fully opaque.
        this.ctx.strokeStyle = annotation.annotationColor || Annotate.DEFAULT_COLOR;
        this.ctx.lineWidth = 4; // Set the border thickness
        this.ctx.strokeRect(
            annotation.start.x,
            annotation.start.y,
            annotation.end.x - annotation.start.x,
            annotation.end.y - annotation.start.y
        );
    }

    /**
     * Removes all annotations from the canvas.
     * This function clears the internal annotations array and then calls the redraw method to update the canvas display.
     * It effectively erases all drawn annotations, leaving the canvas blank or displaying only non-annotation graphics.
     */
    removeAnnotations() {
        // Clear the annotations array
        this.annotations = [];

        // Redraw the canvas to reflect the removal of annotations
        // This ensures that the canvas display is updated to show no annotations.
        this.redraw();
    }

    /**
     * Sets the fill color for a handle on the canvas based on whether it is currently hovered over.
     * The function changes the fill color to red if the handle is the one being hovered over,
     * and sets it to the annotation's color otherwise.
     *
     * @param {string} handleName - The name of the handle for which the color is being set.
     */
    setHandleColor(handleName) {
        // Set the fill color for the handle
        // If the handle is the one being hovered over, set its color to red.
        // Otherwise, use the color of the hovered annotation.
        this.ctx.fillStyle =
            this.hoveredHandle === handleName ? Annotate.DEFAULT_COLOR : this.hoveredAnnotation.annotationColor;
    }

    /**
     * Draws a handle on the canvas at the specified coordinates.
     * The size of the handle is adjusted based on whether it is currently being hovered over.
     * If the handle is being hovered over, it is drawn slightly larger for visual emphasis.
     *
     * @param {string} handleName - The name of the handle being drawn.
     * @param {number} x - The x-coordinate on the canvas where the handle's top-left corner should be drawn.
     * @param {number} y - The y-coordinate on the canvas where the handle's top-left corner should be drawn.
     */
    drawHandle(handleName, x, y) {
        // Check if the current handle is being hovered over
        if (this.hoveredHandle === handleName) {
            // Draw a larger handle (40x40 px) for the hovered handle for emphasis
            this.ctx.fillRect(x - 5, y - 5, this.handleDrawingSizeHovered, this.handleDrawingSizeHovered);
        } else {
            // Draw a regular handle (30x30 px) for non-hovered handles
            this.ctx.fillRect(x, y, this.handleDrawingSize, this.handleDrawingSize);
        }
    }

    /**
     * Redraws the entire canvas, including the background image (frame) and all annotations.
     * This function recalculates scaling factors based on the current canvas size, clears the canvas,
     * redraws the background frame, and then iterates through all annotations to redraw them.
     * Additionally, it handles the drawing of handles for selected annotations.
     */
    redraw() {
        // Calculate scaling factors based on the current size of the canvas
        this.scaleX = this.canvas.clientWidth / this.canvas.width;
        this.scaleY = this.canvas.clientHeight / this.canvas.height;

        // Clear the entire canvas
        var p1 = this.ctx.transformedPoint(0, 0);
        var p2 = this.ctx.transformedPoint(this.canvas.width, this.canvas.height);
        this.ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

        // Redraw the background frame
        this.ctx.drawImage(this.frame, 0, 0, this.canvas.width, this.canvas.height);

        // Iterate through all annotations to redraw them
        for (var annotation of this.annotations.reverse()) {
            if (annotation.start && annotation.end && annotation.state != "deleted") {
                var { startX, startY, width, height } = this.getAnnotationDimensions(annotation);

                // Draw the annotation
                this.drawAnnotation(annotation);

                // Draw the annotation's name if the flag is set
                if (this.shouldShowAnnotations) {
                    this.drawAnnotationName(annotation, startX, startY);
                }

                if (annotation.selected) {
                    // Top-left handle
                    this.setHandleColor("top-left");
                    this.drawHandle("top-left", startX - 25, startY - 25);

                    // Top-right handle
                    this.setHandleColor("top-right");
                    this.drawHandle("top-right", startX + width - 5, startY - 25);

                    // Bottom-left handle
                    this.setHandleColor("bottom-left");
                    this.drawHandle("bottom-left", startX - 25, startY + height - 5);

                    // Bottom-right handle
                    this.setHandleColor("bottom-right");
                    this.drawHandle("bottom-right", startX + width - 5, startY + height - 5);

                    // Top-middle handle
                    this.setHandleColor("top-middle");
                    this.drawHandle("top-middle", startX + width / 2 - 5, startY - 25);

                    // Bottom-middle handle
                    this.setHandleColor("bottom-middle");
                    this.drawHandle("bottom-middle", startX + width / 2 - 5, startY + height - 5);

                    // Left-middle handle
                    this.setHandleColor("left-middle");
                    this.drawHandle("left-middle", startX - 25, startY + height / 2 - 5);

                    // Right-middle handle
                    this.setHandleColor("right-middle");
                    this.drawHandle("right-middle", startX + width - 5, startY + height / 2 - 5);
                }
            }
        }
    }

    /**
     * Dispatches a custom event to signal that an annotation has been changed.
     * This can be used to notify other parts of the application that the annotations have been modified,
     * such as adding, deleting, or editing an annotation. The event can be listened for by other components
     * or scripts that need to react to changes in the canvas annotations.
     */
    dispatchAnnotationChangeEvent() {
        // Create a new event with the type 'annotationChanged'
        const event = new Event("annotationChanged");

        // Dispatch the event on the document, making it available to any listeners
        document.dispatchEvent(event);
    }

    /**
     * Resets the transformation matrix of the canvas context to the identity matrix.
     * This effectively removes any scaling, rotation, and translation transformations that have been applied.
     * After resetting the transformation, it calls the redraw method to update the canvas display
     * with the new (reset) transformation state.
     */
    resetTransform() {
        // Reset the transformation matrix to the identity matrix
        // The parameters (1, 0, 0, 1, 0, 0) correspond to the default state with no scaling, rotation, or translation
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Redraw the canvas to reflect the reset transformation state
        this.redraw();
    }
}
