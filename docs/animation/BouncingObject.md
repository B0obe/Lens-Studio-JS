# BouncingObject

The `BouncingObject.js` script adds a natural bouncing animation effect to any object in Lens Studio. This script is perfect for creating playful, dynamic elements that attract attention.

## Features

- Apply bouncing animation along one or multiple axes (X, Y, Z)
- Customize bounce amplitude (height) and frequency (speed)
- Control bounce phase and starting position
- Toggle bouncing effect on/off during runtime
- Choice between local and world space for animations
- Option for randomized start positions

## Usage

1. Add the `BouncingObject.js` script to your Lens Studio project
2. Attach the script to any SceneObject that you want to bounce
3. Configure the parameters in the Inspector panel
4. Optionally, reference the script in other scripts to control it dynamically

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| targetObject | SceneObject | null | Object to apply the bouncing effect to (defaults to self if not set) |
| bounceX | bool | false | Whether to bounce on X axis |
| bounceY | bool | true | Whether to bounce on Y axis |
| bounceZ | bool | false | Whether to bounce on Z axis |
| amplitude | float | 10.0 | Bounce height in scene units |
| frequency | float | 2.0 | Bounce frequency (bounces per second) |
| phaseOffset | float | 0.0 | Starting phase offset (0-1) |
| useLocalSpace | bool | true | Whether to apply bounce in local space |
| isActive | bool | true | Whether the bounce effect is active |
| randomizeStart | bool | false | Start at random phase in the bounce cycle |

## Script API

The script exposes the following API methods that can be called from other scripts:

### setAmplitude(newAmplitude)
Sets the bounce height.

```javascript
// Example: change bounce height to 20 units
someObject.getComponent("Component.ScriptComponent").api.setAmplitude(20);
```

### setFrequency(newFrequency)
Sets the bounce speed.

```javascript
// Example: change bounce speed to 3 bounces per second
someObject.getComponent("Component.ScriptComponent").api.setFrequency(3);
```

### setEnabled(isEnabled)
Enables or disables the bouncing effect.

```javascript
// Example: disable bouncing
someObject.getComponent("Component.ScriptComponent").api.setEnabled(false);
```

## Example

### Basic Setup
This example shows how to make a 3D object bounce up and down:

1. Add the object to your scene
2. Attach the BouncingObject script to it
3. Set the following parameters:
   - bounceY: true (bounce on Y-axis)
   - amplitude: 10 (bounce 10 units high)
   - frequency: 1.5 (bounce at 1.5 cycles per second)

### Advanced: Trigger on Face Expression
This example shows how to make an object bounce only when the user smiles:

```javascript
// In a separate script
var bouncingObject = script.getSceneObject().getComponent("Component.ScriptComponent").api;

function onSmileStart() {
    bouncingObject.setEnabled(true);
}

function onSmileEnd() {
    bouncingObject.setEnabled(false);
}

// Bind to face events
var smileStartEvent = script.createEvent("FaceEvent");
smileStartEvent.faceIndex = 0;
smileStartEvent.eventType = "SmileStart";
smileStartEvent.bind(onSmileStart);

var smileEndEvent = script.createEvent("FaceEvent");
smileEndEvent.faceIndex = 0;
smileEndEvent.eventType = "SmileEnd";
smileEndEvent.bind(onSmileEnd);
```

## Performance Considerations

- For better performance, avoid applying this script to complex 3D models with many polygons
- Consider using a lower frequency for background objects to save on performance
- When using many bouncing objects, stagger their phase offsets for a more natural look 