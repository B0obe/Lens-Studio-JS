# BlinkDetector

The `BlinkDetector.js` script detects eye blinks and can trigger custom events when a user blinks. It can distinguish between left eye blinks, right eye blinks, and both eyes blinking simultaneously, making it ideal for creating interactive face effects.

## Features

- Detect left eye, right eye, or both eyes blinking
- Configurable blink detection thresholds for sensitivity adjustment
- Adjustable hold duration for distinguishing between blinks and longer eye closures
- Cooldown timer to prevent accidental double-triggers
- Debug mode for easier development
- Custom event callbacks for each type of blink

## Usage

1. Add the `BlinkDetector.js` script to your Lens Studio project
2. Attach the script to any SceneObject in your scene
3. Configure the parameters in the Inspector panel
4. Set up callback functions to respond to blink events

## Prerequisites

- Face tracking capability must be enabled in your project

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| faceIndex | int | 0 | Face to track (0 is first face) |
| detectLeftEye | bool | true | Whether to detect left eye blinks |
| detectRightEye | bool | true | Whether to detect right eye blinks |
| detectBothEyes | bool | true | Whether to detect both eyes blinking simultaneously |
| blinkThreshold | float | 0.3 | Eye openness threshold for blink detection (0-1) |
| holdDuration | float | 0.1 | Time in seconds eye must remain below threshold to trigger blink |
| cooldownTime | float | 0.5 | Minimum time between blink detections (seconds) |
| debugMode | bool | false | Show debug messages in logger |

## Script API

The script exposes the following API methods and callback hooks:

### Methods

#### setBlinkThreshold(threshold)
Sets the blink detection threshold (0-1).

```javascript
// Example: make blink detection more sensitive
someObject.getComponent("Component.ScriptComponent").api.setBlinkThreshold(0.2);
```

#### setHoldDuration(duration)
Sets the required eye closure duration for blink detection.

```javascript
// Example: require longer eye closure (0.2 seconds)
someObject.getComponent("Component.ScriptComponent").api.setHoldDuration(0.2);
```

#### setCooldownTime(time)
Sets the cooldown time between blink detections.

```javascript
// Example: allow more frequent blink detection
someObject.getComponent("Component.ScriptComponent").api.setCooldownTime(0.3);
```

### Callbacks

You can set these callback functions to respond to blink events:

#### onLeftEyeBlink
Called when a left eye blink is detected.

```javascript
// Example: setting up a left eye blink callback
var blinkDetector = someObject.getComponent("Component.ScriptComponent").api;
blinkDetector.onLeftEyeBlink = function() {
    // Do something when left eye blinks
    print("Left eye blinked!");
    showLeftEyeEffect();
};
```

#### onRightEyeBlink
Called when a right eye blink is detected.

```javascript
// Example: setting up a right eye blink callback
var blinkDetector = someObject.getComponent("Component.ScriptComponent").api;
blinkDetector.onRightEyeBlink = function() {
    // Do something when right eye blinks
    print("Right eye blinked!");
    showRightEyeEffect();
};
```

#### onBothEyesBlink
Called when both eyes blink simultaneously.

```javascript
// Example: setting up a both eyes blink callback
var blinkDetector = someObject.getComponent("Component.ScriptComponent").api;
blinkDetector.onBothEyesBlink = function() {
    // Do something when both eyes blink
    print("Both eyes blinked!");
    takeSnapPhoto();
};
```

## Examples

### Basic Blink Detection
This example shows how to show/hide an object when the user blinks both eyes:

```javascript
// In a separate script
// Get references to BlinkDetector and the object to toggle
var blinkDetector = script.blinkDetectorObject.getComponent("Component.ScriptComponent").api;
var objectToToggle = script.toggleObject;
var isVisible = true;

// Set up the blink callback
blinkDetector.onBothEyesBlink = function() {
    // Toggle visibility
    isVisible = !isVisible;
    objectToToggle.enabled = isVisible;
};
```

### Advanced: Different Actions for Each Eye
This example shows how to trigger different effects based on which eye is blinking:

```javascript
// In a separate script
var blinkDetector = script.blinkDetectorObject.getComponent("Component.ScriptComponent").api;

// Effect for left eye blink
blinkDetector.onLeftEyeBlink = function() {
    // Show an effect on the left side of the screen
    script.leftEffect.enabled = true;
    script.leftEffect.getTransform().setPosition(new vec3(-2, 0, 0));
    
    // Hide after 2 seconds
    script.api.delayedCall(function() {
        script.leftEffect.enabled = false;
    }, 2);
};

// Effect for right eye blink
blinkDetector.onRightEyeBlink = function() {
    // Show an effect on the right side of the screen
    script.rightEffect.enabled = true;
    script.rightEffect.getTransform().setPosition(new vec3(2, 0, 0));
    
    // Hide after 2 seconds
    script.api.delayedCall(function() {
        script.rightEffect.enabled = false;
    }, 2);
};

// Effect for both eyes blinking
blinkDetector.onBothEyesBlink = function() {
    // Show a special effect
    script.specialEffect.enabled = true;
    
    // Play an animation
    if (script.specialEffect.animationComponent) {
        script.specialEffect.animationComponent.start();
    }
};
```

## Calibration Tips

- The default `blinkThreshold` of 0.3 works well for most faces, but you might need to adjust based on your specific effect
- For more reliable detection, increase the `holdDuration` slightly, but be aware this might make the effect feel less responsive
- Set `debugMode` to true during development to see blink detection events in the Logger
- Test with different lighting conditions, as this can affect face tracking quality

## Performance Considerations

- Face tracking is already performance-intensive, so keep your blink reaction code simple
- If you're only interested in both eyes blinking, set `detectLeftEye` and `detectRightEye` to false
- Consider using a higher `cooldownTime` for less frequent but more reliable detections 