# FaceExpressionTrigger

The `FaceExpressionTrigger.js` script provides a comprehensive system for detecting and responding to facial expressions in Lens Studio. It can recognize various expressions such as smiles, kisses, eyebrow raises, eye blinks, jaw movements, and more, allowing you to trigger events based on the user's facial expressions.

## Features

- Detect multiple facial expressions simultaneously
- Configurable threshold for each expression type
- Event-based system for responding to expressions
- Support for expression start, continuous, and end events
- Adjustable cooldown between triggers
- Optional continuous event mode for sustained expressions
- Face visibility detection
- Detailed expression intensity information
- Runtime control of expression detection parameters

## Prerequisites

- Face Tracking must be enabled in your Lens Studio project

## Usage

1. Add the `FaceExpressionTrigger.js` script to any Scene Object in your Lens Studio project
2. Configure which expressions to detect and their thresholds in the Inspector panel
3. Set a callback function to handle expression events using `setExpressionCallback`
4. Respond to expressions in your callback function

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| faceIndex | int | 0 | Face to track (0 is first face) |
| detectSmile | bool | true | Detect smile expression |
| smileThreshold | float | 0.5 | Threshold for smile detection |
| detectKiss | bool | true | Detect kiss/pucker expression |
| kissThreshold | float | 0.5 | Threshold for kiss detection |
| detectEyebrowRaise | bool | true | Detect eyebrow raise expression |
| eyebrowRaiseThreshold | float | 0.5 | Threshold for eyebrow raise detection |
| detectEyeClose | bool | true | Detect eye close/blink expression |
| eyeCloseThreshold | float | 0.5 | Threshold for eye close detection |
| detectJawOpen | bool | true | Detect jaw open/mouth open expression |
| jawOpenThreshold | float | 0.5 | Threshold for jaw open detection |
| detectCheekPuff | bool | true | Detect cheek puff expression |
| cheekPuffThreshold | float | 0.5 | Threshold for cheek puff detection |
| detectNoseSneer | bool | true | Detect nose sneer expression |
| noseSneerThreshold | float | 0.5 | Threshold for nose sneer detection |
| triggerCooldown | float | 0.5 | Time in seconds before the same expression can trigger again |
| continuousEvents | bool | false | Continuously trigger events while expression is held |
| continuousEventInterval | float | 0.1 | Interval in seconds for continuous events |
| requireFaceVisible | bool | true | Only trigger when face is visible |
| debugMode | bool | false | Show debug messages |

## Script API

### Callbacks

#### setExpressionCallback(callback)
Set a callback function that will be called when an expression is detected.

```javascript
// Example: set an expression callback
var expressionTrigger = script.triggerObject.getComponent("Component.ScriptComponent").api;
expressionTrigger.setExpressionCallback(function(eventData) {
    // Handle expression based on eventData
    if (eventData.expression === "smile" && eventData.state === "started") {
        print("User started smiling with intensity: " + eventData.intensity);
    }
});
```

### Configuration

#### setExpressionThreshold(expression, threshold)
Set the detection threshold for a specific expression.

```javascript
// Example: make smile detection more sensitive
var expressionTrigger = script.triggerObject.getComponent("Component.ScriptComponent").api;
expressionTrigger.setExpressionThreshold("smile", 0.3); // Lower threshold = more sensitive
```

#### setExpressionEnabled(expression, enabled)
Enable or disable detection for a specific expression.

```javascript
// Example: disable kiss detection
var expressionTrigger = script.triggerObject.getComponent("Component.ScriptComponent").api;
expressionTrigger.setExpressionEnabled("kiss", false);
```

### State Queries

#### isExpressionActive(expression)
Check if an expression is currently active.

```javascript
// Example: check if smile is active
var expressionTrigger = script.triggerObject.getComponent("Component.ScriptComponent").api;
if (expressionTrigger.isExpressionActive("smile")) {
    print("User is currently smiling");
}
```

#### getAllExpressionIntensities()
Get the current intensity values for all expressions.

```javascript
// Example: get all expression intensities
var expressionTrigger = script.triggerObject.getComponent("Component.ScriptComponent").api;
var intensities = expressionTrigger.getAllExpressionIntensities();
print("Smile intensity: " + intensities.smile);
print("Eyebrow raise intensity: " + intensities.eyebrowRaise);
```

## Expression Event Data

When an expression is detected, the callback function receives an `eventData` object with information about the detected expression:

```javascript
{
    expression: "smile", // Type of expression detected
    intensity: 0.75, // Intensity of the expression (0-1)
    state: "started", // State of the expression: "started", "continuous", or "ended"
    faceIndex: 0, // Index of the face that triggered the expression
    time: 123.45 // Time when the expression was detected
}
```

## Supported Expressions

The script can detect the following facial expressions:

- **smile**: Smile/happy expression
- **kiss**: Kiss/pucker expression (lips pushed forward)
- **eyebrowRaise**: Eyebrows raised up
- **eyeClose**: Eyes closed or blinking
- **jawOpen**: Mouth/jaw open
- **cheekPuff**: Cheeks puffed out
- **noseSneer**: Nose wrinkling/sneering

## Examples

### Basic Expression Detection
This example shows how to detect and respond to basic expressions:

```javascript
// In a controller script
var expressionTrigger = script.triggerObject.getComponent("Component.ScriptComponent").api;

// Set up expression callback
expressionTrigger.setExpressionCallback(function(eventData) {
    // Handle different expressions
    switch(eventData.expression) {
        case "smile":
            if (eventData.state === "started") {
                // Show happy effect
                script.happyEffect.enabled = true;
            } else if (eventData.state === "ended") {
                // Hide happy effect
                script.happyEffect.enabled = false;
            }
            break;
            
        case "eyebrowRaise":
            if (eventData.state === "started") {
                // Show surprised effect
                script.surprisedEffect.enabled = true;
            } else if (eventData.state === "ended") {
                // Hide surprised effect
                script.surprisedEffect.enabled = false;
            }
            break;
            
        case "jawOpen":
            if (eventData.state === "started") {
                // Emit particles from mouth
                script.mouthParticles.api.burst(20);
            }
            break;
    }
});
```

### Expression-Controlled Animation
This example shows how to control animations based on facial expressions:

```javascript
// In a controller script
var expressionTrigger = script.triggerObject.getComponent("Component.ScriptComponent").api;
var animator = script.characterObject.getComponent("Component.AnimationMixer");

// Set up expression callback
expressionTrigger.setExpressionCallback(function(eventData) {
    if (eventData.expression === "smile") {
        if (eventData.state === "started") {
            // Play happy animation
            animator.start("Happy_Animation", 0, 0);
            animator.setSpeed("Happy_Animation", 1.0);
        } else if (eventData.state === "ended") {
            // Transition back to idle
            animator.startWithBlending("Idle_Animation", 0, 0, 0.5);
        }
    } else if (eventData.expression === "eyebrowRaise") {
        if (eventData.state === "started") {
            // Play surprised animation
            animator.start("Surprised_Animation", 0, 0);
            animator.setSpeed("Surprised_Animation", 1.0);
        } else if (eventData.state === "ended") {
            // Transition back to idle
            animator.startWithBlending("Idle_Animation", 0, 0, 0.5);
        }
    }
});
```

### Expression Intensity Mapping
This example shows how to map expression intensity to visual effects:

```javascript
// In a controller script
var expressionTrigger = script.triggerObject.getComponent("Component.ScriptComponent").api;
var updateEvent = script.createEvent("UpdateEvent");

updateEvent.bind(function() {
    // Get all expression intensities
    var intensities = expressionTrigger.getAllExpressionIntensities();
    
    // Map smile intensity to material color
    var smileColor = script.happyMaterial.mainPass.baseColor;
    smileColor.a = intensities.smile; // Change opacity based on smile intensity
    script.happyMaterial.mainPass.baseColor = smileColor;
    
    // Map eyebrow raise to object scale
    var baseScale = 1.0;
    var maxScaleIncrease = 0.5;
    var newScale = baseScale + (intensities.eyebrowRaise * maxScaleIncrease);
    script.scaleObject.getTransform().setLocalScale(new vec3(newScale, newScale, newScale));
    
    // Map jaw open to particle emission rate
    var baseEmissionRate = 5;
    var maxEmissionRate = 30;
    var newEmissionRate = baseEmissionRate + (intensities.jawOpen * (maxEmissionRate - baseEmissionRate));
    script.particleEmitter.api.setEmissionRate(newEmissionRate);
});
```

### Expression Combo Detection
This example shows how to detect combinations of expressions:

```javascript
// In a controller script
var expressionTrigger = script.triggerObject.getComponent("Component.ScriptComponent").api;
var isSmiling = false;
var isEyebrowRaised = false;

// Set up expression callback
expressionTrigger.setExpressionCallback(function(eventData) {
    if (eventData.expression === "smile") {
        isSmiling = (eventData.state === "started" || eventData.state === "continuous");
    } else if (eventData.expression === "eyebrowRaise") {
        isEyebrowRaised = (eventData.state === "started" || eventData.state === "continuous");
    }
    
    // Check for combo (smile + eyebrow raise)
    checkForCombo();
});

function checkForCombo() {
    if (isSmiling && isEyebrowRaised) {
        // Combo detected!
        script.comboEffect.enabled = true;
        
        // Create a delayed event to hide the effect
        var delayedEvent = script.createEvent("DelayedCallbackEvent");
        delayedEvent.bind(function() {
            script.comboEffect.enabled = false;
        });
        delayedEvent.reset(1.0); // Hide after 1 second
    }
}
```

### Expression-Based Game Control
This example shows how to use expressions to control a simple game:

```javascript
// In a controller script
var expressionTrigger = script.triggerObject.getComponent("Component.ScriptComponent").api;
var gameController = script.gameObject.api;

// Set up expression callback
expressionTrigger.setExpressionCallback(function(eventData) {
    if (!gameController.isGameActive()) return;
    
    if (eventData.expression === "smile" && eventData.state === "started") {
        // Jump action
        gameController.jump();
    } else if (eventData.expression === "eyebrowRaise" && eventData.state === "started") {
        // Power-up action
        gameController.activatePowerup();
    } else if (eventData.expression === "jawOpen") {
        // Continuous action while mouth is open
        if (eventData.state === "started" || eventData.state === "continuous") {
            gameController.startCollecting();
        } else if (eventData.state === "ended") {
            gameController.stopCollecting();
        }
    }
});

// Make game more challenging by adjusting thresholds
function setDifficulty(level) {
    if (level === "easy") {
        expressionTrigger.setExpressionThreshold("smile", 0.3);
        expressionTrigger.setExpressionThreshold("eyebrowRaise", 0.3);
        expressionTrigger.setExpressionThreshold("jawOpen", 0.3);
    } else if (level === "hard") {
        expressionTrigger.setExpressionThreshold("smile", 0.7);
        expressionTrigger.setExpressionThreshold("eyebrowRaise", 0.7);
        expressionTrigger.setExpressionThreshold("jawOpen", 0.7);
    }
}
```

## Best Practices

- **Threshold Tuning**: Adjust expression thresholds based on testing with different users
- **Cooldown Periods**: Use appropriate cooldown times to prevent accidental triggers
- **Continuous Events**: Use continuous events for sustained actions, but be mindful of performance
- **Visual Feedback**: Always provide clear visual feedback when an expression is detected
- **Face Visibility**: Keep the `requireFaceVisible` option enabled to prevent false triggers
- **Testing**: Test with different lighting conditions and users to ensure reliable detection
- **Performance**: Expression detection is generally lightweight, but avoid performing heavy operations in expression callbacks

## Compatibility

- Works with Lens Studio's face tracking system
- Compatible with both front and rear cameras
- Can be used alongside other face-related scripts
- Works best with good lighting conditions 