# SmileDetector

The `SmileDetector.js` script helps detect when a user smiles in your Snapchat Lens. It provides an easy way to trigger events or animations based on smile detection, with customizable sensitivity and timing parameters.

## Features

- Detect when users smile and when they stop smiling
- Measure smile intensity (from 0 to 1)
- Configure detection sensitivity with threshold values
- Set minimum hold duration to prevent accidental triggers
- Cooldown timer to prevent rapid triggers
- Support for tracking different faces (when multiple faces are detected)
- Debug mode for fine-tuning detection parameters

## Prerequisites

- Face Tracking must be enabled in your Lens Studio project

## Usage

1. Add the `SmileDetector.js` script to any Scene Object
2. Configure the detection parameters to match your needs
3. Set up callback functions to handle smile events
4. Use the API to configure the detector at runtime if needed

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| faceIndex | int | 0 | Index of the face to track (0 = first face) |
| smileThreshold | float | 0.3 | Minimum smile amount to trigger detection (0-1) |
| stopSmileThreshold | float | 0.15 | Threshold below which a smile is considered ended (0-1) |
| holdDuration | float | 0.1 | Time in seconds smile must be held to trigger event |
| cooldownTime | float | 0.2 | Minimum time between smile detections (seconds) |
| debugMode | bool | false | Enable debug messages in the Logger |

## Script API

### Properties

#### smileIntensity
Current smile intensity value (read-only, updated each frame).

```javascript
// Example: get the current smile intensity
var intensity = someObject.getComponent("Component.ScriptComponent").api.smileIntensity;
print("Current smile intensity: " + intensity.toFixed(2));
```

### Configuration Methods

#### setSmileThreshold(threshold)
Set the threshold for smile detection.

```javascript
// Example: make smile detection more sensitive
someObject.getComponent("Component.ScriptComponent").api.setSmileThreshold(0.2);
```

#### setStopSmileThreshold(threshold)
Set the threshold for determining when a smile has ended.

```javascript
// Example: make smile end detection more sensitive
someObject.getComponent("Component.ScriptComponent").api.setStopSmileThreshold(0.1);
```

#### setHoldDuration(duration)
Set how long a smile must be held before triggering.

```javascript
// Example: require smiles to be held longer
someObject.getComponent("Component.ScriptComponent").api.setHoldDuration(0.3);
```

#### setCooldownTime(time)
Set the cooldown time between smile detections.

```javascript
// Example: allow more rapid smile triggering
someObject.getComponent("Component.ScriptComponent").api.setCooldownTime(0.1);
```

### Event Callbacks

#### onSmileStart(intensity)
Function called when a smile is detected.

```javascript
// Example: setting up a smile detection callback
var smileDetector = someObject.getComponent("Component.ScriptComponent").api;
smileDetector.onSmileStart = function(intensity) {
    print("User smiled with intensity: " + intensity.toFixed(2));
    
    // Do something when the user smiles
    script.happyEffect.enabled = true;
    
    // The intensity can be used to scale an effect
    script.happyEffect.getTransform().setLocalScale(new vec3(intensity, intensity, intensity));
};
```

#### onSmileEnd()
Function called when a smile ends.

```javascript
// Example: setting up a smile end callback
var smileDetector = someObject.getComponent("Component.ScriptComponent").api;
smileDetector.onSmileEnd = function() {
    print("User stopped smiling");
    
    // Do something when the user stops smiling
    script.happyEffect.enabled = false;
};
```

## Examples

### Basic Smile Reaction
This simple example shows a confetti effect when the user smiles:

```javascript
// In a separate script that controls the effects
var smileDetector = script.smileDetectorObject.getComponent("Component.ScriptComponent").api;
var confettiEffect = script.confettiObject;

// Initially disable the effect
confettiEffect.enabled = false;

// Set up smile callbacks
smileDetector.onSmileStart = function(intensity) {
    // Show confetti when user smiles
    confettiEffect.enabled = true;
    
    // Play a celebration sound
    script.audioComponent.play(1.0);
};

smileDetector.onSmileEnd = function() {
    // Hide confetti when smile ends
    confettiEffect.enabled = false;
};
```

### Smile-Based Animation Control
This example uses the smile intensity to control an animation:

```javascript
// In a separate script that controls animations
var smileDetector = script.smileDetectorObject.getComponent("Component.ScriptComponent").api;
var characterAnimation = script.characterObject.getComponent("Component.AnimationMixer");
var happyAnimLayer = 1;  // Animation layer for the happy animation

// Create an update event
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function() {
    // Get current smile intensity
    var intensity = smileDetector.smileIntensity;
    
    // Use smile intensity to blend in the happy animation
    // The weight parameter controls how much of the animation is visible (0-1)
    characterAnimation.setLayerWeight(happyAnimLayer, intensity);
});
```

### Smile to Take Photo
This example takes a photo when the user holds a smile for a moment:

```javascript
// In a separate controller script
var smileDetector = script.smileDetectorObject.getComponent("Component.ScriptComponent").api;
var cameraControl = script.cameraObject.getComponent("Component.ScriptComponent").api;
var countdownObject = script.countdownText;

// Configure for a longer hold to ensure intentional smiles
smileDetector.setHoldDuration(1.0);  // 1 second hold

// Initially hide countdown
countdownObject.enabled = false;

// Track if we're currently in countdown mode
var isCountingDown = false;
var countdownStartTime = 0;
var countdownDuration = 3.0;  // 3 second countdown

// Create update event for countdown
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function() {
    if (isCountingDown) {
        var time = script.getTime();
        var elapsed = time - countdownStartTime;
        var remaining = Math.ceil(countdownDuration - elapsed);
        
        // Update countdown text
        script.countdownText.text = remaining.toString();
        
        // Check if countdown finished
        if (elapsed >= countdownDuration) {
            // Take photo
            cameraControl.takePhoto();
            
            // Reset countdown state
            isCountingDown = false;
            countdownObject.enabled = false;
        }
    }
});

// Set up smile detection to start countdown
smileDetector.onSmileStart = function() {
    // Start countdown if not already counting
    if (!isCountingDown) {
        isCountingDown = true;
        countdownStartTime = script.getTime();
        countdownObject.enabled = true;
        script.countdownText.text = "3";
    }
};

// If user stops smiling, cancel countdown
smileDetector.onSmileEnd = function() {
    if (isCountingDown) {
        isCountingDown = false;
        countdownObject.enabled = false;
    }
};
```

## Calibration Tips

The smile detection thresholds may need adjustment for different types of lenses:

- **For subtle detection**: Set `smileThreshold` lower (around 0.2)
- **To avoid false positives**: Set `smileThreshold` higher (around 0.4) and increase `holdDuration`
- **For rapid triggering**: Decrease `cooldownTime` to allow frequent smile events
- **For supportive use**: Keep the gap between `smileThreshold` and `stopSmileThreshold` wide

## Performance Considerations

- SmileDetector has minimal performance impact as it uses the same face tracking data already being processed by Lens Studio
- If your lens tracks multiple faces, consider using a single SmileDetector with the `faceIndex` parameter rather than creating multiple detector instances
- The debug mode adds some overhead due to logging; disable it in production lenses

## Compatibility

- The SmileDetector uses standard Lens Studio face tracking APIs
- Works on both front and rear cameras when face tracking is available
- Compatible with all devices that support Lens Studio's face tracking 