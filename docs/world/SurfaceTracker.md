# SurfaceTracker

The `SurfaceTracker.js` script enables placement of objects on detected real-world surfaces using Lens Studio's World Tracking capabilities. It allows users to tap on surfaces to place virtual objects and provides options for aligning objects to surface normals and repositioning them.

## Features

- Place objects on detected real-world surfaces with a tap
- Align objects to surface normals for realistic placement
- Reposition placed objects by tapping on them
- Limit the number of placeable objects
- Visual surface hint to show where objects can be placed
- Scale objects based on distance from camera
- Full API for controlling functionality from other scripts

## Prerequisites

- World Tracking capability must be enabled in your Lens Studio project
- Works best with horizontal surfaces like tables, floors, etc.

## Usage

1. Add the `SurfaceTracker.js` script to your Lens Studio project
2. Create the object you want to place on surfaces
3. Add the script to a Scene Object
4. Connect the target object to the script's `targetObject` parameter
5. Configure the other parameters as needed
6. Run your lens and tap on detected surfaces to place objects

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| targetObject | SceneObject | null | The object to place on surfaces |
| maxPlacementCount | int | 10 | Maximum number of objects to place (0 for unlimited) |
| allowRepositioning | bool | true | Allow moving objects after placement |
| alignToSurfaceNormal | bool | true | Rotate object to align with surface |
| applySurfaceScale | bool | false | Scale object based on distance from camera |
| minScale | float | 0.5 | Minimum object scale |
| maxScale | float | 2.0 | Maximum object scale |
| showSurfaceHint | bool | true | Show a visual hint for trackable surfaces |
| hintMaterial | Material | null | Optional material for surface hint |
| hintScale | float | 10.0 | Size of the surface hint |

## Script API

### setEnabled(isEnabled)
Enable or disable surface tracking functionality.

```javascript
// Example: disable surface tracking
someObject.getComponent("Component.ScriptComponent").api.setEnabled(false);
```

### clearAllPlacedObjects()
Remove all placed objects from the scene.

```javascript
// Example: clear all placed objects
someObject.getComponent("Component.ScriptComponent").api.clearAllPlacedObjects();
```

### setSurfaceHintVisible(isVisible)
Show or hide the surface hint object.

```javascript
// Example: hide the surface hint
someObject.getComponent("Component.ScriptComponent").api.setSurfaceHintVisible(false);
```

## Examples

### Basic Surface Object Placement

This basic setup allows users to place a 3D model on detected surfaces:

1. Enable World Tracking in your project settings
2. Import a 3D model to use for placement
3. Add the SurfaceTracker script to a Scene Object
4. Set the 3D model as the targetObject
5. Configure the following parameters:
   - maxPlacementCount: 5
   - alignToSurfaceNormal: true
   - showSurfaceHint: true

### Interactive Surface Gallery

This advanced example creates an interactive gallery where users can place picture frames on walls:

```javascript
// In a separate controller script
var surfaceTracker = script.surfaceTrackerObject.getComponent("Component.ScriptComponent").api;
var pictureFrames = [script.frame1, script.frame2, script.frame3];
var currentFrameIndex = 0;

// Function to change which frame will be placed next
function cycleNextFrame() {
    // Hide all frames
    for (var i = 0; i < pictureFrames.length; i++) {
        pictureFrames[i].enabled = false;
    }
    
    // Update index and show next frame
    currentFrameIndex = (currentFrameIndex + 1) % pictureFrames.length;
    pictureFrames[currentFrameIndex].enabled = true;
    
    // Update the surface tracker's target object
    surfaceTracker.setTargetObject(pictureFrames[currentFrameIndex]);
}

// Create a button to cycle frames
var cycleButton = script.cycleButton;
var tapEvent = cycleButton.createEvent("TapEvent");
tapEvent.bind(cycleNextFrame);
```

### Object Scattering System

This example randomly scatters multiple objects on detected surfaces:

```javascript
// In a separate controller script
var surfaceTracker = script.surfaceTrackerObject.getComponent("Component.ScriptComponent").api;
var objectPrototypes = [script.flower1, script.flower2, script.flower3];
var scatterCount = 10;
var spacing = 20;

function scatterObjects() {
    // Clear previous objects
    surfaceTracker.clearAllPlacedObjects();
    
    // Place multiple objects in a scattered pattern
    for (var i = 0; i < scatterCount; i++) {
        // Randomly select an object prototype
        var randomIndex = Math.floor(Math.random() * objectPrototypes.length);
        surfaceTracker.setTargetObject(objectPrototypes[randomIndex]);
        
        // Place at a random offset from center
        var offsetX = (Math.random() - 0.5) * spacing;
        var offsetZ = (Math.random() - 0.5) * spacing;
        surfaceTracker.placeObjectWithOffset(new vec3(offsetX, 0, offsetZ));
    }
}

// Bind to a button tap
var scatterButton = script.scatterButton;
var tapEvent = scatterButton.createEvent("TapEvent");
tapEvent.bind(scatterObjects);
```

## Best Practices

- **Optimize Object Complexity**: Use low-poly models for better performance when placing multiple objects
- **Surface Hints**: Use a clear visual indicator to show where surfaces are detected
- **Error Handling**: Provide user feedback when no surfaces are detected
- **Object Size**: Adjust the scale of your objects based on the expected size of the surface
- **Testing**: Test on different surfaces and lighting conditions to ensure reliable tracking

## Troubleshooting

- **Objects Not Appearing**: Make sure World Tracking is enabled in your project settings
- **Unstable Placement**: Try adjusting the `alignToSurfaceNormal` setting or improve the lighting in your environment
- **Surface Not Detected**: Make sure there's good lighting and the surface has enough texture for tracking
- **Objects Too Large/Small**: Use the `applySurfaceScale` option to automatically scale based on distance 