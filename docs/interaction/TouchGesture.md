# TouchGesture

The `TouchGesture.js` script provides comprehensive touch gesture detection for Lens Studio projects. It can recognize and respond to a variety of common touch gestures including tap, double tap, long press, swipe, pinch, and rotate.

## Features

- Detect single tap gestures
- Detect double tap gestures with customizable timing
- Detect long press gestures with configurable duration
- Detect swipe gestures with direction recognition (up, down, left, right)
- Detect pinch gestures for zoom functionality
- Detect rotation gestures
- Customizable sensitivity parameters for each gesture type
- Option to prevent multiple gestures from triggering simultaneously
- Detailed information about each detected gesture
- Debug mode for development assistance

## Usage

1. Add the `TouchGesture.js` script to any Scene Object in your Lens Studio project
2. Configure gesture detection parameters in the Inspector panel
3. Set a callback function to handle detected gestures using `setGestureCallback`
4. Respond to gestures in your callback function

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| enableTap | bool | true | Enable tap gesture detection |
| tapMaxTime | float | 0.3 | Maximum time for a tap in seconds |
| tapMaxDistance | float | 20 | Maximum movement distance for a tap in screen units |
| enableDoubleTap | bool | true | Enable double tap gesture detection |
| doubleTapMaxTime | float | 0.5 | Maximum time between taps for double tap in seconds |
| doubleTapMaxDistance | float | 50 | Maximum distance between taps for double tap in screen units |
| enableLongPress | bool | true | Enable long press gesture detection |
| longPressMinTime | float | 0.5 | Minimum time for a long press in seconds |
| longPressMaxMovement | float | 10 | Maximum movement allowed during long press in screen units |
| enableSwipe | bool | true | Enable swipe gesture detection |
| swipeMinDistance | float | 100 | Minimum distance for a swipe in screen units |
| swipeMaxTime | float | 0.5 | Maximum time for a swipe in seconds |
| enablePinch | bool | true | Enable pinch gesture detection |
| pinchMinChange | float | 40 | Minimum distance change for pinch in screen units |
| enableRotate | bool | true | Enable rotation gesture detection |
| rotateMinAngle | float | 15 | Minimum angle for rotation in degrees |
| preventMultipleGestures | bool | true | Prevent multiple gestures from triggering simultaneously |
| debugMode | bool | false | Show debug messages |

## Script API

### Callbacks

#### setGestureCallback(callback)
Set a callback function that will be called when a gesture is detected.

```javascript
// Example: set a gesture callback
var touchGesture = script.gestureObject.getComponent("Component.ScriptComponent").api;
touchGesture.setGestureCallback(function(gestureData) {
    // Handle gesture based on gestureData.type
    if (gestureData.type === "tap") {
        print("Tap detected at: " + gestureData.position.x + ", " + gestureData.position.y);
    } else if (gestureData.type === "swipe") {
        print("Swipe detected in direction: " + gestureData.direction);
    }
});
```

### Configuration

#### setGestureEnabled(gestureType, enabled)
Enable or disable a specific gesture type.

```javascript
// Example: disable double tap detection
var touchGesture = script.gestureObject.getComponent("Component.ScriptComponent").api;
touchGesture.setGestureEnabled("doubleTap", false);

// Example: enable only swipe detection
touchGesture.setGestureEnabled("tap", false);
touchGesture.setGestureEnabled("doubleTap", false);
touchGesture.setGestureEnabled("longPress", false);
touchGesture.setGestureEnabled("swipe", true);
touchGesture.setGestureEnabled("pinch", false);
touchGesture.setGestureEnabled("rotate", false);
```

## Gesture Data

When a gesture is detected, the callback function receives a `gestureData` object with information about the detected gesture. The structure of this object depends on the type of gesture:

### Tap Gesture
```javascript
{
    type: "tap",
    position: {x: 0.5, y: 0.5} // Screen position of the tap
}
```

### Double Tap Gesture
```javascript
{
    type: "doubleTap",
    position: {x: 0.5, y: 0.5}, // Screen position of the second tap
    timeBetweenTaps: 0.3 // Time between first and second tap in seconds
}
```

### Long Press Gesture
```javascript
{
    type: "longPress",
    position: {x: 0.5, y: 0.5}, // Screen position of the long press
    duration: 0.5 // Duration of the long press in seconds
}
```

### Long Press Move Gesture
```javascript
{
    type: "longPressMove",
    position: {x: 0.6, y: 0.6}, // Current position
    startPosition: {x: 0.5, y: 0.5}, // Initial position where long press started
    movement: {x: 0.1, y: 0.1} // Movement delta from start position
}
```

### Long Press End Gesture
```javascript
{
    type: "longPressEnd",
    position: {x: 0.6, y: 0.6}, // Final position
    startPosition: {x: 0.5, y: 0.5}, // Initial position where long press started
    duration: 1.2 // Total duration of the long press in seconds
}
```

### Swipe Gesture
```javascript
{
    type: "swipe",
    direction: "right", // One of: "up", "down", "left", "right"
    distance: 150, // Swipe distance in screen units
    duration: 0.2, // Swipe duration in seconds
    startPosition: {x: 0.2, y: 0.5}, // Starting position
    endPosition: {x: 0.7, y: 0.5}, // Ending position
    velocity: 750 // Swipe velocity in screen units per second
}
```

### Pinch Gesture
```javascript
{
    type: "pinch",
    scale: 1.5, // Scale factor (>1 for zoom in, <1 for zoom out)
    distance: 300, // Current distance between fingers in screen units
    startDistance: 200, // Initial distance between fingers in screen units
    center: {x: 0.5, y: 0.5}, // Current center point of the pinch
    startCenter: {x: 0.5, y: 0.5} // Initial center point of the pinch
}
```

### Rotate Gesture
```javascript
{
    type: "rotate",
    angle: 45, // Rotation angle in degrees
    center: {x: 0.5, y: 0.5} // Center point of the rotation
}
```

## Examples

### Basic Gesture Detection
This example shows how to detect and respond to basic gestures:

```javascript
// In a controller script
var touchGesture = script.gestureObject.getComponent("Component.ScriptComponent").api;

// Set up gesture callback
touchGesture.setGestureCallback(function(gestureData) {
    switch(gestureData.type) {
        case "tap":
            print("Tap detected at: " + gestureData.position.x + ", " + gestureData.position.y);
            // Show a visual feedback at tap position
            script.tapIndicator.enabled = true;
            script.tapIndicator.getTransform().setWorldPosition(new vec3(gestureData.position.x, gestureData.position.y, 0));
            break;
            
        case "doubleTap":
            print("Double tap detected!");
            // Toggle some feature
            script.toggleFeature();
            break;
            
        case "swipe":
            print("Swipe detected in direction: " + gestureData.direction);
            // Handle different swipe directions
            if (gestureData.direction === "left" || gestureData.direction === "right") {
                script.handleHorizontalSwipe(gestureData.direction);
            } else {
                script.handleVerticalSwipe(gestureData.direction);
            }
            break;
    }
});
```

### Object Manipulation with Gestures
This example shows how to manipulate a 3D object using gestures:

```javascript
// In a controller script
var touchGesture = script.gestureObject.getComponent("Component.ScriptComponent").api;
var objectTransform = script.targetObject.getTransform();
var initialScale = objectTransform.getLocalScale();
var initialRotation = objectTransform.getLocalRotation();

// Set up gesture callback
touchGesture.setGestureCallback(function(gestureData) {
    switch(gestureData.type) {
        case "pinch":
            // Scale the object based on pinch gesture
            var newScale = initialScale.mult(gestureData.scale);
            objectTransform.setLocalScale(newScale);
            break;
            
        case "rotate":
            // Rotate the object based on rotation gesture
            var rotationDelta = quat.fromEulerAngles(0, 0, gestureData.angle * Math.PI / 180);
            var newRotation = initialRotation.multiply(rotationDelta);
            objectTransform.setLocalRotation(newRotation);
            initialRotation = newRotation; // Update for continuous rotation
            break;
            
        case "longPress":
            // Reset object to original state
            objectTransform.setLocalScale(initialScale);
            objectTransform.setLocalRotation(initialRotation);
            break;
    }
});
```

### Camera Control with Gestures
This example shows how to control a camera using gestures:

```javascript
// In a controller script
var touchGesture = script.gestureObject.getComponent("Component.ScriptComponent").api;
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;

// Set up gesture callback
touchGesture.setGestureCallback(function(gestureData) {
    switch(gestureData.type) {
        case "pinch":
            // Adjust camera FOV based on pinch
            var currentFov = cameraController.getCamera().fov;
            var newFov = currentFov / gestureData.scale;
            newFov = Math.max(30, Math.min(90, newFov)); // Clamp between 30 and 90 degrees
            cameraController.setFov(newFov);
            break;
            
        case "swipe":
            // Shake camera on swipe
            if (gestureData.velocity > 1000) { // Only for fast swipes
                var intensity = Math.min(0.2, gestureData.velocity / 10000);
                cameraController.shake(intensity, 0.3);
            }
            break;
            
        case "doubleTap":
            // Reset camera on double tap
            cameraController.resetFov();
            break;
    }
});
```

### Interactive UI Navigation
This example shows how to navigate through UI elements using gestures:

```javascript
// In a UI controller script
var touchGesture = script.gestureObject.getComponent("Component.ScriptComponent").api;
var currentPage = 0;
var totalPages = 5;

// Set up gesture callback
touchGesture.setGestureCallback(function(gestureData) {
    if (gestureData.type === "swipe") {
        if (gestureData.direction === "left") {
            // Navigate to next page
            currentPage = Math.min(currentPage + 1, totalPages - 1);
            showPage(currentPage);
        } else if (gestureData.direction === "right") {
            // Navigate to previous page
            currentPage = Math.max(currentPage - 1, 0);
            showPage(currentPage);
        }
    }
});

// Function to show a specific page
function showPage(pageIndex) {
    // Hide all pages
    for (var i = 0; i < totalPages; i++) {
        script["page" + i].enabled = false;
    }
    
    // Show current page
    script["page" + pageIndex].enabled = true;
    
    // Update page indicators
    updatePageIndicators(pageIndex);
}

// Function to update page indicators
function updatePageIndicators(activeIndex) {
    for (var i = 0; i < totalPages; i++) {
        var indicator = script["indicator" + i];
        indicator.mainPass.baseColor = i === activeIndex ? 
            new vec4(1, 1, 1, 1) : // Active color
            new vec4(0.5, 0.5, 0.5, 0.5); // Inactive color
    }
}
```

## Best Practices

- **Gesture Sensitivity**: Adjust sensitivity parameters based on your specific use case and target devices
- **Prevent Multiple Gestures**: Keep `preventMultipleGestures` enabled to avoid conflicting gesture detections
- **Visual Feedback**: Always provide visual feedback when a gesture is detected
- **Gesture Combinations**: Use gesture combinations thoughtfully to create intuitive interactions
- **Performance**: Touch gesture detection is lightweight, but avoid performing heavy operations in gesture callbacks
- **Testing**: Test gestures on actual devices, as touch behavior can differ from the Lens Studio preview

## Compatibility

- Works on all devices that support Lens Studio
- Compatible with both front and rear cameras
- Can be used alongside other interaction scripts 