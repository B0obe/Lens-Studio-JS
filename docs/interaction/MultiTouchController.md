# MultiTouchController

The `MultiTouchController.js` script provides multi-touch control capabilities for objects in Lens Studio, allowing users to move, rotate, and scale objects with intuitive touch gestures.

## Features

- Control position, rotation, and scale of any Scene Object with touch gestures
- Two-finger pinch gesture for scaling (with aspect ratio preservation)
- Two-finger rotate gesture for rotation
- Two-finger drag gesture for translation
- Individual axis constraints for translation and rotation
- Screen boundary constraints to keep objects visible
- Sensitivity controls for each transformation type
- Scale limits to prevent objects from becoming too small or too large
- Option to reset transformations when touch ends
- Support for both local and world transforms

## Usage

1. Add the `MultiTouchController.js` script to any Scene Object you want to control with touch
2. Configure which transformations to enable (position, rotation, scale)
3. Adjust sensitivity and constraints as needed
4. Run the Lens and use two-finger gestures to manipulate the object

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| enableTranslation | bool | true | Allow moving the object |
| enableRotation | bool | true | Allow rotating the object |
| enableScaling | bool | true | Allow scaling the object |
| localTransform | bool | true | Use local transform instead of world transform |
| maintainAspectRatio | bool | true | Maintain aspect ratio when scaling |
| targetObject | SceneObject | null | Object to control (uses this object if null) |
| translationSensitivity | float | 1.0 | Movement sensitivity |
| rotationSensitivity | float | 1.0 | Rotation sensitivity |
| scalingSensitivity | float | 1.0 | Scaling sensitivity |
| minScale | float | 0.1 | Minimum scale allowed |
| maxScale | float | 10.0 | Maximum scale allowed |
| constrainToScreen | bool | false | Keep object visible on screen |
| resetOnRelease | bool | false | Reset transform when touch ends |
| translationAxis | vec3 | {1,1,0} | Axes to allow translation on |
| rotationAxis | vec3 | {0,0,1} | Axes to allow rotation around |

## Touch Gestures

### Translation (Moving)
Use two fingers to drag the object across the screen. The object will move in the direction of the drag.

### Rotation
Place two fingers on the screen and rotate them around a center point. The object will rotate accordingly.

### Scaling
Place two fingers on the screen and pinch in or out to decrease or increase the size of the object.

## Script API

### enableControl(type)
Enable a specific type of transform control.

```javascript
// Example: enable only translation
someObject.getComponent("Component.ScriptComponent").api.enableControl("translation");

// Available types: "translation", "rotation", "scaling", "all"
```

### disableControl(type)
Disable a specific type of transform control.

```javascript
// Example: disable rotation
someObject.getComponent("Component.ScriptComponent").api.disableControl("rotation");

// Available types: "translation", "rotation", "scaling", "all"
```

### setTranslationSensitivity(sensitivity)
Set the sensitivity for translation movements.

```javascript
// Example: make translation more sensitive
someObject.getComponent("Component.ScriptComponent").api.setTranslationSensitivity(2.0);
```

### setRotationSensitivity(sensitivity)
Set the sensitivity for rotation movements.

```javascript
// Example: make rotation less sensitive
someObject.getComponent("Component.ScriptComponent").api.setRotationSensitivity(0.5);
```

### setScalingSensitivity(sensitivity)
Set the sensitivity for scaling.

```javascript
// Example: make scaling more sensitive
someObject.getComponent("Component.ScriptComponent").api.setScalingSensitivity(1.5);
```

### setMinScale(min)
Set the minimum allowed scale value.

```javascript
// Example: prevent object from getting smaller than 0.3x original size
someObject.getComponent("Component.ScriptComponent").api.setMinScale(0.3);
```

### setMaxScale(max)
Set the maximum allowed scale value.

```javascript
// Example: prevent object from getting larger than 5x original size
someObject.getComponent("Component.ScriptComponent").api.setMaxScale(5.0);
```

### setConstrainToScreen(constrain)
Set whether the object should be constrained to screen boundaries.

```javascript
// Example: keep object on screen
someObject.getComponent("Component.ScriptComponent").api.setConstrainToScreen(true);
```

### setResetOnRelease(reset)
Set whether the object should reset to its original transform when touch ends.

```javascript
// Example: enable reset on release
someObject.getComponent("Component.ScriptComponent").api.setResetOnRelease(true);
```

### isActive()
Check if multi-touch interaction is currently active.

```javascript
// Example: check if user is currently manipulating the object
if (someObject.getComponent("Component.ScriptComponent").api.isActive()) {
    // Do something while user is interacting
}
```

### resetTransform()
Reset the object to its initial transform.

```javascript
// Example: reset the object to its starting position, rotation, and scale
someObject.getComponent("Component.ScriptComponent").api.resetTransform();
```

## Examples

### Basic Object Manipulation
This example sets up basic multi-touch controls for an object:

1. Add the MultiTouchController script to a 3D object
2. Configure the following parameters:
   - enableTranslation: true
   - enableRotation: true
   - enableScaling: true
   - constrainToScreen: true

### Camera Controls
This example uses MultiTouchController to create camera controls:

```javascript
// In a separate controller script
var multiTouch = script.getSceneObject().getComponent("Component.ScriptComponent").api;

// Configure for camera controls
multiTouch.disableControl("translation"); // Disable translation
multiTouch.enableControl("rotation");     // Enable rotation
multiTouch.setRotationSensitivity(0.5);   // Reduce rotation sensitivity
```

### Object Placement Tool
This example creates an object placement tool with constraints:

```javascript
// In a separate controller script
var multiTouch = script.getSceneObject().getComponent("Component.ScriptComponent").api;

// Configure for placement tool
multiTouch.enableControl("translation");   // Enable moving
multiTouch.enableControl("scaling");       // Enable scaling
multiTouch.disableControl("rotation");     // Disable rotation
multiTouch.setMinScale(0.5);               // Minimum scale 50%
multiTouch.setMaxScale(3.0);               // Maximum scale 300%
multiTouch.setConstrainToScreen(true);     // Keep on screen

// Create a "reset" button
script.resetButton.getTouchComponent().addMeshVisual(function() {
    multiTouch.resetTransform();
});
```

## Integration with Other Scripts

### With FaceEffects
This example integrates MultiTouchController with FaceEffects to allow manual adjustment of face effects:

```javascript
// In a separate controller script
var multiTouch = script.object.getComponent("Component.ScriptComponent").api;
var faceEffects = script.faceObject.getComponent("Component.ScriptComponent").api;

// Toggle between automatic and manual control
script.toggleButton.getTouchComponent().addMeshVisual(function() {
    var isAuto = !faceEffects.isAutoMode();
    faceEffects.setAutoMode(isAuto);
    
    if (isAuto) {
        // Disable manual control
        multiTouch.disableControl("all");
    } else {
        // Enable manual control
        multiTouch.enableControl("all");
    }
});
```

## Best Practices

- **For Moving Objects**: Enable translation and disable rotation/scaling when implementing draggable objects
- **For Precise Control**: Reduce sensitivity values for more precise control
- **For Better UX**: Enable constrainToScreen to prevent objects from going off-screen
- **For Reset Functionality**: Provide a separate UI button to call resetTransform() rather than enabling automatic resetOnRelease
- **For Multiple Objects**: Add MultiTouchController to a parent object rather than individual children
- **For Performance**: Disable the script when not needed using script.enabled = false

## Performance Considerations

- The script has minimal performance impact for most use cases
- Using local transforms is slightly more efficient than world transforms
- Constraints like constrainToScreen add some overhead, only enable when needed
- The script automatically optimizes by not performing calculations when no touches are detected 