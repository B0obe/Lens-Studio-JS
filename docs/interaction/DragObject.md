# DragObject

The `DragObject.js` script makes SceneObjects draggable with touch input in Lens Studio. This script is ideal for creating interactive elements that users can move around the screen.

## Features

- Make any object draggable with touch input
- Optional constraints for X and Y axes
- Keep objects within screen bounds
- Return-to-origin functionality
- Inertia effect for natural movement
- Configurable drag speed and sensitivity
- Complete API for controlling drag behavior from other scripts

## Usage

1. Add the `DragObject.js` script to your Lens Studio project
2. Attach the script to any SceneObject that you want to make draggable
3. Configure the parameters in the Inspector panel
4. Optionally, reference the script in other scripts to control drag behavior dynamically

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| targetObject | SceneObject | null | Object to be draggable (defaults to this object if not set) |
| enableDragging | bool | true | Whether dragging is enabled |
| returnToStartPos | bool | false | Whether object should return to start position when released |
| constrainX | bool | false | Prevent horizontal movement |
| constrainY | bool | false | Prevent vertical movement |
| constrainToScreen | bool | true | Keep object within screen bounds |
| dragSpeed | float | 1.0 | Drag speed multiplier |
| returnSpeed | float | 3.0 | Speed at which object returns to start position |
| enableInertia | bool | false | Whether to add inertia when the object is released |
| inertiaFactor | float | 0.95 | How quickly inertia slows down (0-1) |

## Script API

The script exposes the following API methods that can be called from other scripts:

### setDraggingEnabled(isEnabled)
Enables or disables dragging functionality.

```javascript
// Example: disable dragging
someObject.getComponent("Component.ScriptComponent").api.setDraggingEnabled(false);
```

### resetPosition()
Resets the object to its starting position.

```javascript
// Example: reset position
someObject.getComponent("Component.ScriptComponent").api.resetPosition();
```

### setReturnToStart(shouldReturn)
Sets whether the object should return to its start position when released.

```javascript
// Example: enable return to start position
someObject.getComponent("Component.ScriptComponent").api.setReturnToStart(true);
```

## Examples

### Basic Draggable Object
This example shows how to create a simple draggable object:

1. Add an object to your scene (e.g., an Image or 3D object)
2. Attach the DragObject script to it
3. Set the following parameters:
   - enableDragging: true
   - constrainToScreen: true

### Creating Draggable UI Elements
This example shows how to create draggable UI elements that snap back when released:

1. Add a UI element to your scene
2. Attach the DragObject script to it 
3. Set the following parameters:
   - enableDragging: true
   - returnToStartPos: true
   - returnSpeed: 5.0
   - enableInertia: true
   - inertiaFactor: 0.9

### Restricted Movement Slider
This example shows how to create a slider that only moves horizontally:

1. Add a UI element to your scene to act as the slider handle
2. Attach the DragObject script to it
3. Set the following parameters:
   - enableDragging: true
   - constrainY: true
   - constrainToScreen: true

## Advanced Usage: Touch Priority

When you have multiple draggable objects that might overlap, you can control which one gets dragged when they're both touched:

```javascript
// In a separate controller script
var dragObjects = [];  // Array of all draggable objects

function registerDragObject(obj) {
    dragObjects.push(obj);
}

function onTouchStart(eventData) {
    // Get touch position
    var touchPos = eventData.getTouchPosition();
    
    // Determine which object is "on top" visually (simplified example)
    // In a real implementation, you might use z-depth or custom sorting
    for (var i = dragObjects.length - 1; i >= 0; i--) {
        var obj = dragObjects[i];
        // If this is the top object at the touch position, enable it and disable others
        if (obj.isTouched(touchPos)) {
            // Enable this object
            obj.script.api.setDraggingEnabled(true);
            
            // Disable other objects
            for (var j = 0; j < dragObjects.length; j++) {
                if (j !== i) {
                    dragObjects[j].script.api.setDraggingEnabled(false);
                }
            }
            break;
        }
    }
}

// Bind touch start event
var touchStartEvent = script.createEvent("TouchStartEvent");
touchStartEvent.bind(onTouchStart);
```

## Performance Considerations

- The script performs a simple hit test for touch detection. For complex shapes, you may need a custom hit test implementation
- When many draggable objects are in the scene, consider disabling inertia for better performance
- For best results, apply this script to parent objects rather than to each individual child object 