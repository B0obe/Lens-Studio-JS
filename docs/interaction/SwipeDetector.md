# SwipeDetector

The `SwipeDetector.js` script provides an easy way to detect and respond to swipe gestures in your Lens Studio projects. It can detect swipes in four directions (up, down, left, right) and allows you to execute custom actions for each direction.

## Features

- Detect swipes in four directions: up, down, left, right
- Customizable sensitivity and timing parameters
- Individual callbacks for each swipe direction
- General swipe callback with direction information
- Option to restrict detection to specific screen regions
- Configurable to detect only horizontal or vertical swipes

## Usage

1. Add the `SwipeDetector.js` script to any Scene Object in your Lens project
2. Configure the detection parameters in the Inspector panel
3. Set up callback functions for the swipe events you want to handle
4. Optionally restrict the detection to specific screen regions

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| minSwipeDistance | float | 0.1 | Minimum distance (in screen %) to detect as swipe |
| maxSwipeTime | float | 0.5 | Maximum time (seconds) for a valid swipe gesture |
| detectHorizontal | bool | true | Whether to detect left/right swipes |
| detectVertical | bool | true | Whether to detect up/down swipes |
| screenRegionMin | vec2 | {0, 0} | Min bounds (0-1) of detection region |
| screenRegionMax | vec2 | {1, 1} | Max bounds (0-1) of detection region |
| debugMode | bool | false | Show debug messages |

## Script API

### Configuration Methods

#### setMinSwipeDistance(distance)
Sets the minimum distance required for a valid swipe detection.

```javascript
// Example: require longer swipes (as % of screen)
someObject.getComponent("Component.ScriptComponent").api.setMinSwipeDistance(0.2);
```

#### setMaxSwipeTime(time)
Sets the maximum time allowed for a valid swipe gesture.

```javascript
// Example: allow slower swipes (in seconds)
someObject.getComponent("Component.ScriptComponent").api.setMaxSwipeTime(0.8);
```

#### setDetectHorizontal(enabled)
Enables or disables horizontal (left/right) swipe detection.

```javascript
// Example: disable horizontal swipes
someObject.getComponent("Component.ScriptComponent").api.setDetectHorizontal(false);
```

#### setDetectVertical(enabled)
Enables or disables vertical (up/down) swipe detection.

```javascript
// Example: disable vertical swipes
someObject.getComponent("Component.ScriptComponent").api.setDetectVertical(false);
```

#### setScreenRegion(min, max)
Sets the screen region where swipes are detected.

```javascript
// Example: only detect swipes in the bottom half of the screen
someObject.getComponent("Component.ScriptComponent").api.setScreenRegion(
    new vec2(0, 0),    // Minimum (bottom-left)
    new vec2(1, 0.5)   // Maximum (top-right, but only half height)
);
```

### Callback Functions

You can set these callback functions to respond to swipe events:

#### onSwipe(direction, swipeDistance)
Called when any swipe is detected, with direction and distance information.

```javascript
// Example: handling any swipe
var swipeDetector = someObject.getComponent("Component.ScriptComponent").api;
swipeDetector.onSwipe = function(direction, swipeDistance) {
    print("Swipe detected in direction: " + direction);
    print("Swipe distance: " + swipeDistance.toString());
    
    // You can use the swipe distance to determine the intensity of the response
    var intensity = Math.sqrt(swipeDistance.x*swipeDistance.x + swipeDistance.y*swipeDistance.y);
    script.applyEffect(intensity);
};
```

#### onSwipeLeft()
Called when a left swipe is detected.

```javascript
// Example: handle left swipe
var swipeDetector = someObject.getComponent("Component.ScriptComponent").api;
swipeDetector.onSwipeLeft = function() {
    script.goToNextPage();
};
```

#### onSwipeRight()
Called when a right swipe is detected.

```javascript
// Example: handle right swipe
var swipeDetector = someObject.getComponent("Component.ScriptComponent").api;
swipeDetector.onSwipeRight = function() {
    script.goToPreviousPage();
};
```

#### onSwipeUp()
Called when an upward swipe is detected.

```javascript
// Example: handle up swipe
var swipeDetector = someObject.getComponent("Component.ScriptComponent").api;
swipeDetector.onSwipeUp = function() {
    script.showMenu();
};
```

#### onSwipeDown()
Called when a downward swipe is detected.

```javascript
// Example: handle down swipe
var swipeDetector = someObject.getComponent("Component.ScriptComponent").api;
swipeDetector.onSwipeDown = function() {
    script.hideMenu();
};
```

## Examples

### Photo Gallery Navigation
This example shows how to use swipe detection to navigate between photos in a gallery:

```javascript
// In a separate controller script
var swipeDetector = script.swipeDetectorObject.getComponent("Component.ScriptComponent").api;
var photoIndex = 0;
var photos = [script.photo1, script.photo2, script.photo3, script.photo4];

// Only detect horizontal swipes for gallery navigation
swipeDetector.setDetectVertical(false);

// Show the first photo
function showPhoto(index) {
    // Hide all photos first
    for (var i = 0; i < photos.length; i++) {
        photos[i].enabled = false;
    }
    
    // Show the selected photo
    photos[index].enabled = true;
}

// Initialize with first photo
showPhoto(photoIndex);

// Set up swipe handlers
swipeDetector.onSwipeLeft = function() {
    // Go to next photo (swipe left)
    photoIndex = (photoIndex + 1) % photos.length;
    showPhoto(photoIndex);
};

swipeDetector.onSwipeRight = function() {
    // Go to previous photo (swipe right)
    photoIndex = (photoIndex - 1 + photos.length) % photos.length;
    showPhoto(photoIndex);
};
```

### Menu Control System
This example demonstrates using vertical swipes to show and hide a menu:

```javascript
// In a separate controller script
var swipeDetector = script.swipeDetectorObject.getComponent("Component.ScriptComponent").api;
var menuObject = script.menuObject;
var menuVisible = false;

// Configure for vertical swipes only in the left edge of the screen
swipeDetector.setDetectHorizontal(false);
swipeDetector.setScreenRegion(new vec2(0, 0), new vec2(0.2, 1));

// Swipe up to show menu
swipeDetector.onSwipeUp = function() {
    if (!menuVisible) {
        menuObject.enabled = true;
        // Animate the menu in
        var menuAnim = menuObject.getComponent("Component.ScriptComponent").api;
        menuAnim.slideIn();
        menuVisible = true;
    }
};

// Swipe down to hide menu
swipeDetector.onSwipeDown = function() {
    if (menuVisible) {
        // Animate the menu out
        var menuAnim = menuObject.getComponent("Component.ScriptComponent").api;
        menuAnim.slideOut(function() {
            menuObject.enabled = false;
            menuVisible = false;
        });
    }
};
```

### Interactive 3D Object Rotation
This example shows how to use swipes to rotate a 3D object:

```javascript
// In a separate controller script
var swipeDetector = script.swipeDetectorObject.getComponent("Component.ScriptComponent").api;
var object3D = script.target3DObject;
var rotationSpeed = 100; // Degrees per full screen swipe

// Use the general swipe handler for more precise control
swipeDetector.onSwipe = function(direction, swipeDistance) {
    // Convert swipe distance to rotation
    var rotX = swipeDistance.y * -rotationSpeed; // Vertical swipe controls X rotation
    var rotY = swipeDistance.x * rotationSpeed;  // Horizontal swipe controls Y rotation
    
    // Get current rotation
    var currentRot = object3D.getTransform().getLocalRotation();
    var eulerAngles = currentRot.toEulerAngles();
    
    // Apply new rotation
    var newRotation = quat.fromEulerAngles(
        eulerAngles.x + rotX,
        eulerAngles.y + rotY,
        eulerAngles.z
    );
    
    // Set the new rotation
    object3D.getTransform().setLocalRotation(newRotation);
};
```

## Best Practices

- **Adjust Parameters for Your Use Case**: Different applications need different sensitivity levels. For quick actions, use shorter `maxSwipeTime` values; for more deliberate swipes, use higher `minSwipeDistance`.
- **Provide Visual Feedback**: Let users know when a swipe has been detected by providing visual or audio feedback.
- **Consider Screen Areas**: Use the screen region parameters to avoid conflicts with other interactive elements.
- **Combine with Other Interactions**: SwipeDetector works well in combination with other interaction scripts like DragObject.
- **Test on Device**: Touch interactions can feel different on a real device than in preview; always test your swipe detection on the target device.

## Performance Considerations

- The SwipeDetector script has minimal performance impact as it only processes events when touches occur.
- For performance-critical applications, disable the debug mode to prevent unnecessary console output. 