# Oscillator

The `Oscillator.js` script creates smooth oscillating movements for Scene Objects in Lens Studio. It can be used to create a variety of animation effects like floating, bobbing, swinging, pulsing, and more.

## Features

- Oscillate position, rotation, or scale of any Scene Object
- Six oscillation types: sine, cosine, triangle, square, sawtooth, and bounce
- Independent control of amplitude, frequency, and phase for each axis (X, Y, Z)
- Option to use local or world space
- Add to original transform or replace it completely
- Control playback with play, stop, and reset functions
- Option for fixed speed oscillation regardless of framerate
- Support for unscaled time (ignores time multiplier)

## Usage

1. Add the `Oscillator.js` script to any Scene Object you want to animate
2. Configure the oscillation parameters in the Inspector panel
3. The oscillation will start automatically if autoStart is enabled
4. Use the script API to control the oscillation during runtime

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| transformProperty | string | "position" | Property to oscillate (position, rotation, scale) |
| oscillationType | string | "sine" | Type of oscillation (sine, cosine, triangle, square, sawtooth, bounce) |
| amplitude | vec3 | {0, 10, 0} | Oscillation amplitude (distance/degrees/scale) |
| frequency | vec3 | {1, 1, 1} | Oscillation frequency (cycles per second) |
| phase | vec3 | {0, 0, 0} | Phase offset (0-1) |
| localSpace | bool | true | Use local space instead of world space |
| addToOriginal | bool | true | Add to original transform instead of replacing |
| autoStart | bool | true | Start oscillating automatically |
| useFixedSpeed | bool | false | Use fixed speed regardless of framerate |
| useUnscaledTime | bool | false | Use unscaled time (ignores time multiplier) |

## Oscillation Types

- **Sine**: Smooth, gradual oscillation that eases in and out (default)
- **Cosine**: Similar to sine but starts at maximum amplitude
- **Triangle**: Linear transitions between min and max values
- **Square**: Abrupt transitions between min and max values
- **Sawtooth**: Gradual increase followed by sudden drop
- **Bounce**: Simulates a bouncing effect with gravity

## Script API

### Playback Control

#### play()
Start or resume the oscillation.

```javascript
// Example: start oscillating
someObject.getComponent("Component.ScriptComponent").api.play();
```

#### stop()
Stop the oscillation at the current position.

```javascript
// Example: stop oscillating
someObject.getComponent("Component.ScriptComponent").api.stop();
```

#### reset()
Stop oscillating and reset to the original transform.

```javascript
// Example: reset to original transform
someObject.getComponent("Component.ScriptComponent").api.reset();
```

### Parameter Control

#### setAmplitude(newAmplitude)
Set the oscillation amplitude for all axes.

```javascript
// Example: change amplitude
someObject.getComponent("Component.ScriptComponent").api.setAmplitude(new vec3(5, 0, 5));
```

#### setFrequency(newFrequency)
Set the oscillation frequency for all axes.

```javascript
// Example: change frequency
someObject.getComponent("Component.ScriptComponent").api.setFrequency(new vec3(2, 2, 2));
```

#### setPhase(newPhase)
Set the oscillation phase for all axes.

```javascript
// Example: change phase
someObject.getComponent("Component.ScriptComponent").api.setPhase(new vec3(0, 0.5, 0.25));
```

#### setOscillationType(type)
Set the oscillation type.

```javascript
// Example: change to bounce oscillation
someObject.getComponent("Component.ScriptComponent").api.setOscillationType("bounce");
```

#### setTransformProperty(property)
Set which transform property to oscillate.

```javascript
// Example: change to rotate instead of move
someObject.getComponent("Component.ScriptComponent").api.setTransformProperty("rotation");
```

## Examples

### Floating Object
This example creates a gentle floating effect for an object:

1. Add the Oscillator script to an object
2. Configure the following parameters:
   - transformProperty: "position"
   - oscillationType: "sine"
   - amplitude: {0, 5, 0} (only moves up and down)
   - frequency: {0, 0.5, 0} (slow oscillation)
   - addToOriginal: true

### Breathing Effect
This example creates a breathing effect by scaling an object:

```javascript
// In a separate controller script
var oscillator = script.oscillatorObject.getComponent("Component.ScriptComponent").api;

// Configure for a breathing effect
oscillator.setTransformProperty("scale");
oscillator.setOscillationType("sine");
oscillator.setAmplitude(new vec3(0.05, 0.05, 0.05)); // Subtle scale change
oscillator.setFrequency(new vec3(0.3, 0.3, 0.3)); // Slow frequency like breathing
```

### Multiple Oscillators
This example combines multiple oscillators for a complex effect:

```javascript
// In a separate controller script
// Assume we have two oscillators attached to the same object

// Position oscillator
var posOscillator = script.positionOscillator.getComponent("Component.ScriptComponent").api;
posOscillator.setTransformProperty("position");
posOscillator.setOscillationType("sine");
posOscillator.setAmplitude(new vec3(0, 10, 0));
posOscillator.setFrequency(new vec3(0, 0.5, 0));

// Rotation oscillator
var rotOscillator = script.rotationOscillator.getComponent("Component.ScriptComponent").api;
rotOscillator.setTransformProperty("rotation");
rotOscillator.setOscillationType("sine");
rotOscillator.setAmplitude(new vec3(0, 0, 15)); // 15 degree rotation on Z axis
rotOscillator.setFrequency(new vec3(0, 0, 0.7));
```

### Interactive Oscillation Control
This example allows users to control oscillation with touch:

```javascript
// In a separate controller script
var oscillator = script.oscillatorObject.getComponent("Component.ScriptComponent").api;
var isDragging = false;
var startY = 0;
var originalFrequency = new vec3(1, 1, 1);

// Create touch events
var touchStartEvent = script.createEvent("TouchStartEvent");
touchStartEvent.bind(function(eventData) {
    isDragging = true;
    startY = eventData.getTouchPosition().y;
});

var touchMoveEvent = script.createEvent("TouchMoveEvent");
touchMoveEvent.bind(function(eventData) {
    if (isDragging) {
        // Calculate vertical movement
        var currentY = eventData.getTouchPosition().y;
        var deltaY = currentY - startY;
        
        // Map vertical movement to oscillation frequency
        var newFrequency = originalFrequency.mult(1 + deltaY * 2);
        oscillator.setFrequency(newFrequency);
    }
});

var touchEndEvent = script.createEvent("TouchEndEvent");
touchEndEvent.bind(function(eventData) {
    isDragging = false;
});
```

## Best Practices

- **For Smooth Movement**: Use sine or cosine oscillation types
- **For Bouncy Effects**: Use the bounce oscillation type
- **For Sharp Transitions**: Use square or sawtooth oscillation types
- **For Performance**: Keep the number of oscillating objects reasonable
- **For Variety**: Use different frequencies and phases for each axis
- **For Realism**: Add a small amount of oscillation to multiple properties

## Performance Considerations

- The script has minimal performance impact for most use cases
- For many oscillating objects, consider using lower frequencies
- Disable any axes you're not using by setting their amplitude to 0
- The square and sawtooth oscillation types are slightly more efficient than sine/cosine 