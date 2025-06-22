# FaceDistortion

The `FaceDistortion.js` script provides an easy way to create and control face distortion effects in Lens Studio. It allows for dynamic manipulation of various face mesh deformations through blend shapes, enabling creators to make fun and engaging face effects.

## Features

- Control multiple face distortion parameters (cheek puff, jaw open, eye open, brow raise, smile, nose sneer)
- Apply preset distortion configurations for common expressions
- Animate distortions over time
- Support for multiple faces with face index selection
- Auto-apply mode for continuous updates
- Debug mode for development

## Prerequisites

- Face Tracking must be enabled in your Lens Studio project
- A Scene Object with a Face Mesh Visual component

## Usage

1. Add the `FaceDistortion.js` script to a Scene Object with a Face Mesh Visual component
2. Configure the distortion parameters in the Inspector panel
3. Use the script API to animate distortions during runtime
4. Optionally apply preset distortion configurations

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| faceIndex | int | 0 | Face to track (0 is first face) |
| enableCheekPuff | bool | true | Enable cheek puff distortion |
| cheekPuffAmount | float | 0.0 | Cheek puff amount (0-1) |
| enableJawOpen | bool | true | Enable jaw open distortion |
| jawOpenAmount | float | 0.0 | Jaw open amount (0-1) |
| enableEyeOpen | bool | true | Enable eye open distortion |
| eyeOpenAmount | float | 0.0 | Eye open amount (0-1) |
| enableBrowRaise | bool | true | Enable brow raise distortion |
| browRaiseAmount | float | 0.0 | Brow raise amount (0-1) |
| enableSmile | bool | true | Enable smile distortion |
| smileAmount | float | 0.0 | Smile amount (0-1) |
| enableNoseSneer | bool | true | Enable nose sneer distortion |
| noseSneerAmount | float | 0.0 | Nose sneer amount (0-1) |
| autoApply | bool | true | Apply distortion values automatically |
| debugMode | bool | false | Show debug messages |

## Script API

### Individual Distortion Controls

#### setCheekPuff(amount)
Set the cheek puff distortion amount.

```javascript
// Example: make cheeks puffed
someObject.getComponent("Component.ScriptComponent").api.setCheekPuff(0.8);
```

#### setJawOpen(amount)
Set the jaw open distortion amount.

```javascript
// Example: open jaw halfway
someObject.getComponent("Component.ScriptComponent").api.setJawOpen(0.5);
```

#### setEyeOpen(amount)
Set the eye open distortion amount.

```javascript
// Example: make eyes wide open
someObject.getComponent("Component.ScriptComponent").api.setEyeOpen(1.0);
```

#### setBrowRaise(amount)
Set the brow raise distortion amount.

```javascript
// Example: raise eyebrows slightly
someObject.getComponent("Component.ScriptComponent").api.setBrowRaise(0.3);
```

#### setSmile(amount)
Set the smile distortion amount.

```javascript
// Example: make a big smile
someObject.getComponent("Component.ScriptComponent").api.setSmile(0.9);
```

#### setNoseSneer(amount)
Set the nose sneer distortion amount.

```javascript
// Example: add a slight sneer
someObject.getComponent("Component.ScriptComponent").api.setNoseSneer(0.4);
```

### Preset Controls

#### applyPreset(presetName)
Apply a preset distortion configuration.

Available presets: "surprised", "angry", "happy", "sad", "silly", "reset"

```javascript
// Example: apply the surprised preset
someObject.getComponent("Component.ScriptComponent").api.applyPreset("surprised");
```

#### resetDistortions()
Reset all distortions to zero.

```javascript
// Example: reset all distortions
someObject.getComponent("Component.ScriptComponent").api.resetDistortions();
```

### Configuration

#### setAutoApply(enabled)
Enable or disable auto-apply mode.

```javascript
// Example: disable auto-apply for manual control
someObject.getComponent("Component.ScriptComponent").api.setAutoApply(false);
```

## Examples

### Basic Face Distortion
This example shows how to create a simple face distortion effect:

1. Add a Face Mesh Visual to your scene
2. Add the FaceDistortion script to the same object
3. Configure the following parameters:
   - enableCheekPuff: true
   - cheekPuffAmount: 0.5
   - enableSmile: true
   - smileAmount: 0.7

### Animated Face Distortion
This example shows how to animate face distortions over time:

```javascript
// In a separate controller script
var faceDistortion = script.faceDistortionObject.getComponent("Component.ScriptComponent").api;
var distortionPhase = 0;

// Create an update event for animation
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function() {
    // Calculate distortion values using sine waves for smooth animation
    var time = getTime();
    
    // Animate cheek puff
    var cheekPuffValue = (Math.sin(time * 2) + 1) * 0.5; // Range 0-1
    faceDistortion.setCheekPuff(cheekPuffValue);
    
    // Animate jaw with a different frequency
    var jawValue = (Math.sin(time * 1.5) + 1) * 0.3; // Range 0-0.6
    faceDistortion.setJawOpen(jawValue);
    
    // Animate eyebrows
    var browValue = (Math.sin(time * 3) + 1) * 0.4; // Range 0-0.8
    faceDistortion.setBrowRaise(browValue);
});
```

### Expression Cycle
This example cycles through different expression presets:

```javascript
// In a separate controller script
var faceDistortion = script.faceDistortionObject.getComponent("Component.ScriptComponent").api;
var expressions = ["happy", "surprised", "angry", "sad", "silly"];
var currentExpressionIndex = 0;
var expressionDuration = 2.0; // Seconds per expression
var lastChangeTime = 0;

// Create an update event for cycling expressions
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function() {
    var currentTime = getTime();
    
    // Check if it's time to change expression
    if (currentTime - lastChangeTime >= expressionDuration) {
        // Move to next expression
        currentExpressionIndex = (currentExpressionIndex + 1) % expressions.length;
        
        // Apply the new expression
        var expressionName = expressions[currentExpressionIndex];
        faceDistortion.applyPreset(expressionName);
        
        // Update last change time
        lastChangeTime = currentTime;
        
        // Show expression name on screen if text component exists
        if (script.expressionText) {
            script.expressionText.text = expressionName.toUpperCase();
        }
    }
});
```

### Tap to Change Expression
This example allows users to tap the screen to cycle through expressions:

```javascript
// In a separate controller script
var faceDistortion = script.faceDistortionObject.getComponent("Component.ScriptComponent").api;
var expressions = ["happy", "surprised", "angry", "sad", "silly", "reset"];
var currentExpressionIndex = 0;

// Create tap event
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(function() {
    // Move to next expression
    currentExpressionIndex = (currentExpressionIndex + 1) % expressions.length;
    
    // Apply the new expression
    var expressionName = expressions[currentExpressionIndex];
    faceDistortion.applyPreset(expressionName);
    
    // Show expression name on screen if text component exists
    if (script.expressionText) {
        script.expressionText.text = expressionName.toUpperCase();
    }
});
```

## Performance Considerations

- Disable any distortion types you aren't using via the enable* parameters
- For performance-critical applications, consider using fewer distortion types simultaneously
- The script has minimal performance impact as it uses Lens Studio's built-in blend shape system

## Compatibility

- Works with Lens Studio's face tracking system
- Compatible with both front and rear cameras
- Can be used alongside other face effects 