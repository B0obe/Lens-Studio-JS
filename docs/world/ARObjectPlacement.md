# ARObjectPlacement

The `ARObjectPlacement.js` script allows users to place objects in AR with tap gestures, surface detection, or world tracking. It provides an easy way to implement object placement functionality in Lens Studio projects.

## Features

- Three placement modes: tap to place, surface detection, and world tracking
- Visual placement marker to show where objects will be placed
- Align objects to surface normals for realistic placement
- Multiple object placement with minimum distance control
- Optional drag functionality after placement
- API for controlling placement behavior from other scripts

## Usage

1. Add the `ARObjectPlacement.js` script to a Scene Object
2. Assign the object to place in the `placementObject` parameter
3. Configure placement options in the Inspector panel
4. The script will automatically start the AR session and handle placement

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| placementObject | SceneObject | | Object to place in AR |
| additionalObjects | SceneObject[] | | Additional objects to place with the main object |
| placementMode | string | "tap" | How objects are placed in AR ("tap", "surface", or "worldTracking") |
| alignToSurface | bool | true | Align placed objects to surface normals |
| useHitTest | bool | true | Use hit test for more accurate placement |
| showPlacementMarker | bool | true | Show a placement marker before placing objects |
| placementMarkerMaterial | Asset.Material | | Material for the placement marker |
| allowMultiplePlacements | bool | true | Allow placing multiple objects |
| minPlacementDistance | float | 30 | Minimum distance between placed objects (cm) |
| enableDragAfterPlacement | bool | false | Allow objects to be dragged after placement |
| showAdvanced | bool | false | Show advanced options in the Inspector |

## Placement Modes

### Tap to Place
The default mode. Objects are placed wherever the user taps on the screen. If `useHitTest` is enabled, the script will attempt to place objects on detected surfaces.

### Surface Detection
Requires a Surface Tracker in the scene. Objects are placed on detected surfaces, and the placement marker follows the surface in real-time.

### World Tracking
Requires World Tracking in the scene. Objects are placed in world space, allowing for stable positioning relative to the real world.

## Script API

### startARSession()
Start the AR session and enable object placement.

```javascript
// Example: start AR session
someObject.getComponent("Component.ScriptComponent").api.startARSession();
```

### stopARSession()
Stop the AR session and disable object placement.

```javascript
// Example: stop AR session
someObject.getComponent("Component.ScriptComponent").api.stopARSession();
```

### clearPlacedObjects()
Remove all placed objects from the scene.

```javascript
// Example: clear all placed objects
someObject.getComponent("Component.ScriptComponent").api.clearPlacedObjects();
```

### setAllowMultiplePlacements(allow)
Set whether multiple objects can be placed or just one.

```javascript
// Example: allow only one placement
someObject.getComponent("Component.ScriptComponent").api.setAllowMultiplePlacements(false);
```

### setMinPlacementDistance(distance)
Set the minimum distance required between placed objects (in centimeters).

```javascript
// Example: require 50cm between objects
someObject.getComponent("Component.ScriptComponent").api.setMinPlacementDistance(50);
```

### setPlacementMode(mode)
Change the placement mode during runtime.

```javascript
// Example: switch to surface tracking mode
someObject.getComponent("Component.ScriptComponent").api.setPlacementMode("surface");
```

## Examples

### Basic Object Placement
This example sets up a simple object placement system:

1. Add the ARObjectPlacement script to an empty Scene Object
2. Create a 3D model to place in AR
3. Set the 3D model as the `placementObject` in the Inspector
4. Enable `alignToSurface` for realistic placement
5. Run the Lens and tap to place the model in AR

### Advanced Placement with Constraints
This example shows how to control placement with additional constraints:

```javascript
// In a separate controller script
var arPlacement = script.getSceneObject().getComponent("Component.ScriptComponent").api;

// Only allow a single object placement
arPlacement.setAllowMultiplePlacements(false);

// Create a UI button for clearing the scene
var clearButton = script.createEvent("TapEvent");
clearButton.bind(function(eventData) {
    arPlacement.clearPlacedObjects();
    // Now allow placement again
    arPlacement.setAllowMultiplePlacements(true);
});
```

### Dynamic Placement Mode Switching
This example demonstrates switching between placement modes based on user interaction:

```javascript
// In a separate controller script
var arPlacement = script.getSceneObject().getComponent("Component.ScriptComponent").api;

// Create UI buttons for each mode
script.tapModeButton.getTouchComponent().addMeshVisual(function() {
    arPlacement.setPlacementMode("tap");
});

script.surfaceModeButton.getTouchComponent().addMeshVisual(function() {
    arPlacement.setPlacementMode("surface");
});

script.worldModeButton.getTouchComponent().addMeshVisual(function() {
    arPlacement.setPlacementMode("worldTracking");
});
```

## Integration with Other Scripts

### With DragObject
The ARObjectPlacement script can automatically add the DragObject script to placed objects if `enableDragAfterPlacement` is set to true. This allows users to reposition objects after placement.

### With Surface Tracker
When using "surface" placement mode, the script works with the SurfaceTracker script to place objects on detected surfaces. Make sure you have a SurfaceTracker component in your scene.

## Best Practices

- **For Better User Experience**: Enable the placement marker to give visual feedback
- **For Stable Positioning**: Use "worldTracking" mode when available
- **For Realistic Placement**: Keep `alignToSurface` enabled
- **For Performance**: Limit the number of objects that can be placed if using complex models
- **For AR Stability**: Use `minPlacementDistance` to prevent objects from being placed too close together
- **For Better Hit Testing**: Set `useHitTest` to true for more accurate placement

## Performance Considerations

- Showing the placement marker has minimal performance impact
- Limiting the number of objects that can be placed helps maintain performance
- Using simpler meshes for placed objects will improve performance
- The script automatically optimizes by not running unnecessary calculations when the AR session is inactive 