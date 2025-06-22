# CameraController

The `CameraController.js` script provides comprehensive control over camera movement, transitions, and effects in Lens Studio. It enables smooth camera animations, shake effects, orbit controls, target following, and field of view adjustments.

## Features

- Smooth transitions between camera positions and rotations
- Orbit controls for circling around a target
- Target following with adjustable smoothness
- Camera shake effect with configurable intensity and duration
- Field of view control with smooth transitions
- Look-at functionality to point camera at objects
- Support for both local and world space operations
- Debug mode for development assistance

## Prerequisites

- A Scene Object with a Camera component

## Usage

1. Add the `CameraController.js` script to a Camera object or a parent of a Camera
2. Configure camera parameters in the Inspector panel
3. Use the script API to control camera behavior during runtime

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| camera | Component.Camera | null | Camera to control (uses first found camera if not set) |
| useOrbitControls | bool | false | Enable orbit controls for the camera |
| orbitDistance | float | 10.0 | Distance from orbit center |
| orbitSpeed | float | 1.0 | Orbit rotation speed |
| lookAtTarget | SceneObject | null | Object for the camera to look at |
| smoothFollow | bool | false | Enable smooth follow for lookAtTarget |
| followSpeed | float | 5.0 | Follow speed (higher is faster) |
| enableTransitions | bool | true | Enable smooth transitions between positions |
| transitionSpeed | float | 2.0 | Transition speed (higher is faster) |
| enableShake | bool | true | Enable camera shake effect |
| shakeDamping | float | 0.9 | How quickly shake effect diminishes |
| enableFovControl | bool | true | Enable field of view control |
| defaultFov | float | 60.0 | Default field of view in degrees |
| debugMode | bool | false | Show debug messages |

## Script API

### Camera Movement

#### moveTo(position, rotation)
Move the camera to a new position and rotation with smooth transition if enabled.

```javascript
// Example: move camera to a new position and rotation
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
var newPosition = new vec3(0, 10, 20);
var newRotation = quat.fromEulerAngles(0.2, 0, 0); // Looking down slightly
cameraController.moveTo(newPosition, newRotation);
```

#### moveToLookAt(position, lookAtPos)
Move the camera to a position and automatically rotate to look at another position.

```javascript
// Example: move camera to position and look at an object
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
var cameraPosition = new vec3(0, 5, 10);
var targetPosition = script.targetObject.getTransform().getWorldPosition();
cameraController.moveToLookAt(cameraPosition, targetPosition);
```

#### lookAt(position)
Make the camera look at a specific position without moving the camera.

```javascript
// Example: look at an object
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
var targetPosition = script.targetObject.getTransform().getWorldPosition();
cameraController.lookAt(targetPosition);
```

### Camera Effects

#### shake(intensity, duration)
Apply a camera shake effect with specified intensity and optional duration.

```javascript
// Example: apply camera shake for 0.5 seconds
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
cameraController.shake(0.1, 0.5); // Intensity 0.1, duration 0.5 seconds
```

#### setFov(fov)
Set the camera's field of view with a smooth transition.

```javascript
// Example: set a narrow field of view
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
cameraController.setFov(30); // 30 degrees FOV
```

#### resetFov()
Reset the field of view to the default value.

```javascript
// Example: reset to default FOV
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
cameraController.resetFov();
```

### Orbit Controls

#### setOrbitCenter(center)
Set the center point for orbit controls.

```javascript
// Example: set orbit center to an object's position
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
var centerPosition = script.centerObject.getTransform().getWorldPosition();
cameraController.setOrbitCenter(centerPosition);
```

#### setOrbitDistance(distance)
Set the distance from the orbit center.

```javascript
// Example: set orbit distance to 15 units
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
cameraController.setOrbitDistance(15);
```

#### setOrbitSpeed(speed)
Set the speed of orbit rotation.

```javascript
// Example: set a slower orbit speed
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
cameraController.setOrbitSpeed(0.5);
```

### Utility Methods

#### getCamera()
Get the camera component being controlled.

```javascript
// Example: get camera component to modify other properties
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
var camera = cameraController.getCamera();
camera.near = 0.1;
```

#### getCameraTransform()
Get the transform component of the camera.

```javascript
// Example: get camera transform to read current position
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
var transform = cameraController.getCameraTransform();
var currentPosition = transform.getWorldPosition();
```

## Examples

### Basic Camera Movement
This example shows how to move the camera to different positions:

```javascript
// In a controller script
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
var positions = [
    new vec3(0, 5, 10),
    new vec3(10, 5, 0),
    new vec3(-10, 5, 0),
    new vec3(0, 10, 5)
];
var currentPositionIndex = 0;

// Create a tap event to cycle through positions
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(function() {
    // Move to next position
    currentPositionIndex = (currentPositionIndex + 1) % positions.length;
    var newPosition = positions[currentPositionIndex];
    
    // Look at the origin
    cameraController.moveToLookAt(newPosition, new vec3(0, 0, 0));
});
```

### Camera Shake on Collision
This example triggers a camera shake when an object collides with something:

```javascript
// In a collision handler script
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;

// Function to handle collision
function onCollision() {
    // Calculate shake intensity based on collision velocity
    var intensity = 0.1 + Math.random() * 0.1;
    var duration = 0.3 + Math.random() * 0.2;
    
    // Apply camera shake
    cameraController.shake(intensity, duration);
    
    // Also narrow FOV briefly for dramatic effect
    cameraController.setFov(40);
    
    // Reset FOV after a delay
    script.delayedCallback = script.createEvent("DelayedCallbackEvent");
    script.delayedCallback.bind(function() {
        cameraController.resetFov();
    });
    script.delayedCallback.reset(0.5);
}

// Bind to a tap event for testing
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(onCollision);
```

### Orbital Camera with Zoom
This example creates an orbital camera with zoom control:

```javascript
// In a controller script
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;

// Enable orbit controls
script.useOrbitControls = true;
script.orbitDistance = 10;
script.orbitSpeed = 0.5;

// Set orbit center
cameraController.setOrbitCenter(new vec3(0, 0, 0));

// Create pinch event for zoom control
var pinchStartDistance = 0;
var initialOrbitDistance = 10;

var pinchStartEvent = script.createEvent("PinchStartEvent");
pinchStartEvent.bind(function(eventData) {
    pinchStartDistance = eventData.getPinchDistance();
    initialOrbitDistance = script.orbitDistance;
});

var pinchMoveEvent = script.createEvent("PinchMoveEvent");
pinchMoveEvent.bind(function(eventData) {
    var currentDistance = eventData.getPinchDistance();
    var pinchRatio = pinchStartDistance / Math.max(0.1, currentDistance);
    
    // Calculate new orbit distance
    var newDistance = initialOrbitDistance * pinchRatio;
    newDistance = Math.max(2, Math.min(20, newDistance)); // Clamp between 2 and 20
    
    // Update orbit distance
    cameraController.setOrbitDistance(newDistance);
});
```

### Cinematic Camera Sequence
This example creates a cinematic sequence of camera movements:

```javascript
// In a controller script
var cameraController = script.cameraObject.getComponent("Component.ScriptComponent").api;
var sequence = [];
var currentStep = 0;
var isPlaying = false;

// Define camera sequence
function setupSequence() {
    sequence = [
        {
            position: new vec3(0, 2, 10),
            lookAt: new vec3(0, 0, 0),
            fov: 60,
            duration: 2.0
        },
        {
            position: new vec3(8, 3, 5),
            lookAt: new vec3(0, 1, 0),
            fov: 45,
            duration: 3.0
        },
        {
            position: new vec3(-5, 5, -5),
            lookAt: new vec3(0, 0, 0),
            fov: 30,
            duration: 2.5
        },
        {
            position: new vec3(0, 10, 0),
            lookAt: new vec3(0, 0, 0),
            fov: 70,
            duration: 2.0
        }
    ];
}

// Play the next step in sequence
function playNextStep() {
    if (currentStep >= sequence.length) {
        isPlaying = false;
        return;
    }
    
    var step = sequence[currentStep];
    
    // Move camera
    cameraController.moveToLookAt(step.position, step.lookAt);
    
    // Set FOV
    cameraController.setFov(step.fov);
    
    // Schedule next step
    script.delayedCallback = script.createEvent("DelayedCallbackEvent");
    script.delayedCallback.bind(function() {
        currentStep++;
        playNextStep();
    });
    script.delayedCallback.reset(step.duration);
}

// Start the sequence
function startSequence() {
    if (isPlaying) return;
    
    currentStep = 0;
    isPlaying = true;
    playNextStep();
}

// Setup and start on script initialization
setupSequence();

// Bind to tap event to start sequence
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(startSequence);
```

## Best Practices

- **Smooth Transitions**: Use smooth transitions for a more polished look, but disable them for instant camera changes when needed
- **Orbit Controls**: Use orbit controls for showcasing 3D objects or creating a rotating view
- **Camera Shake**: Use subtle camera shake for impacts or explosions; too much shake can be disorienting
- **Field of View**: Narrower FOV creates a more zoomed-in, telephoto look; wider FOV creates a more expansive, dramatic look
- **Look At Target**: Use lookAt functionality to keep important objects in frame
- **Performance**: Camera operations are generally lightweight, but avoid rapid changes that might be visually jarring

## Compatibility

- Works with all Lens Studio camera types
- Compatible with both front and rear cameras
- Can be used alongside other camera scripts and effects
