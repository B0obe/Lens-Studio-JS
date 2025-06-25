# VoiceController

The `VoiceController.js` script enables voice command recognition for controlling Lens experiences. It uses Lens Studio's VoiceML capabilities to detect spoken commands and trigger corresponding actions.

## Features

- Voice command recognition with configurable confidence threshold
- Support for multiple commands in different languages
- Command-specific and global callback system
- Cooldown time to prevent accidental multiple activations
- Optional visual feedback with text and indicators
- Optional audio feedback for command recognition
- Debugging tools for voice detection development
- Runtime command management (add/remove)

## Usage

1. Add the `VoiceController.js` script to a Scene Object
2. Configure the commands to recognize in the Inspector panel
3. Use the script API to add callbacks for handling detected commands
4. Optionally add visual or audio feedback elements

## Requirements

- This script requires Lens Studio's VoiceML feature, which may not be available in all versions
- Voice recognition requires microphone permissions from the user
- For best results, use in environments with minimal background noise

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| commands | string[] | ["start","stop","next","back","reset"] | Voice commands to recognize |
| language | string | "en" | Language for voice recognition |
| detectionThreshold | float | 0.7 | Confidence threshold for detection (0-1) |
| cooldownTime | float | 1.0 | Cooldown between commands (seconds) |
| showDebugging | bool | false | Show debug messages |
| autoStart | bool | true | Start listening automatically |
| useVisualFeedback | bool | false | Show visual feedback for voice detection |
| feedbackTextComponent | Component.Text | | Text component for feedback |
| micIndicator | SceneObject | | Visual indicator that mic is active |
| useSoundFeedback | bool | false | Play sounds for feedback |
| commandRecognizedSound | Asset.AudioTrackAsset | | Sound to play when command is recognized |
| activationSound | Asset.AudioTrackAsset | | Sound to play when voice detection starts |

## Script API

### startListening()
Start listening for voice commands.

```javascript
// Example: start voice recognition
someObject.getComponent("Component.ScriptComponent").api.startListening();
```

### stopListening()
Stop listening for voice commands.

```javascript
// Example: stop voice recognition
someObject.getComponent("Component.ScriptComponent").api.stopListening();
```

### addCommand(command)
Add a new command to the recognition system.

```javascript
// Example: add a new command
someObject.getComponent("Component.ScriptComponent").api.addCommand("jump");
```

### removeCommand(command)
Remove a command from the recognition system.

```javascript
// Example: remove a command
someObject.getComponent("Component.ScriptComponent").api.removeCommand("stop");
```

### addCommandCallback(command, callback)
Add a callback function for a specific command.

```javascript
// Example: add callback for a specific command
someObject.getComponent("Component.ScriptComponent").api.addCommandCallback("start", function(command, confidence) {
    print("Start command detected with confidence: " + confidence);
    // Perform action for "start" command
});
```

### addGlobalCallback(callback)
Add a callback function that will be called for any recognized command.

```javascript
// Example: add global callback for all commands
someObject.getComponent("Component.ScriptComponent").api.addGlobalCallback(function(command, confidence) {
    print("Command detected: " + command + " with confidence: " + confidence);
    // Handle any command
});
```

### setDetectionThreshold(threshold)
Set the confidence threshold for command detection.

```javascript
// Example: set higher threshold for more accurate detection
someObject.getComponent("Component.ScriptComponent").api.setDetectionThreshold(0.85);
```

### setCooldownTime(seconds)
Set the cooldown time between command recognitions.

```javascript
// Example: set shorter cooldown for faster response
someObject.getComponent("Component.ScriptComponent").api.setCooldownTime(0.5);
```

### isListening()
Check if voice recognition is currently active.

```javascript
// Example: check if listening
if (someObject.getComponent("Component.ScriptComponent").api.isListening()) {
    print("Voice recognition is active");
}
```

## Examples

### Basic Voice Control
This example sets up basic voice commands for controlling a character:

```javascript
// In a separate controller script
var voiceController = script.voiceObject.getComponent("Component.ScriptComponent").api;

// Add command callbacks
voiceController.addCommandCallback("jump", function() {
    script.character.jump();
});

voiceController.addCommandCallback("run", function() {
    script.character.startRunning();
});

voiceController.addCommandCallback("stop", function() {
    script.character.stopRunning();
});
```

### Voice Command UI Navigation
This example uses voice commands for UI navigation:

```javascript
// In a separate controller script
var voiceController = script.voiceObject.getComponent("Component.ScriptComponent").api;
var uiManager = script.uiManager.api;

// Add navigation commands
voiceController.addCommandCallback("next", function() {
    uiManager.nextScreen();
});

voiceController.addCommandCallback("back", function() {
    uiManager.previousScreen();
});

voiceController.addCommandCallback("select", function() {
    uiManager.selectCurrentOption();
});

// Create visual indicator that voice control is available
script.createEvent("TapEvent").bind(function() {
    voiceController.isListening() ? voiceController.stopListening() : voiceController.startListening();
});
```

### Voice Command Game Control
This example implements voice controls for a simple game:

```javascript
// In a separate controller script
var voiceController = script.voiceObject.getComponent("Component.ScriptComponent").api;
var game = script.gameController.api;

// Start with voice detection disabled until game starts
voiceController.stopListening();

// Add game control commands
function setupVoiceCommands() {
    voiceController.addCommandCallback("start", function() {
        if (game.getState() === "ready") {
            game.start();
        }
    });
    
    voiceController.addCommandCallback("jump", function() {
        game.playerJump();
    });
    
    voiceController.addCommandCallback("duck", function() {
        game.playerDuck();
    });
    
    voiceController.addCommandCallback("pause", function() {
        game.togglePause();
    });
    
    voiceController.addCommandCallback("restart", function() {
        if (game.getState() === "gameover") {
            game.restart();
        }
    });
}

// Enable voice commands when game is ready
game.onStateChanged = function(newState) {
    if (newState === "ready") {
        setupVoiceCommands();
        voiceController.startListening();
    } else if (newState === "gameover") {
        // Only listen for "restart" command
        voiceController.stopListening();
        voiceController.startListening();
        voiceController.addCommand("restart");
    }
};
```

## Integration with Other Scripts

### With FaceExpressionTrigger
This example combines voice commands with facial expressions:

```javascript
// In a separate controller script
var voiceController = script.voiceObject.getComponent("Component.ScriptComponent").api;
var faceTrigger = script.faceObject.getComponent("Component.ScriptComponent").api;

// Action requires both voice command and facial expression
var voiceActivated = false;
var smileDetected = false;

voiceController.addCommandCallback("activate", function() {
    voiceActivated = true;
    
    // Reset after delay if no smile detected
    script.createEvent("DelayedCallbackEvent").bind(function() {
        voiceActivated = false;
    }).delay = 2.0;
    
    // Check if smile already detected
    checkActivation();
});

faceTrigger.setExpressionCallback("smile", function(intensity) {
    if (intensity > 0.7) {
        smileDetected = true;
        
        // Reset after delay if no voice command
        script.createEvent("DelayedCallbackEvent").bind(function() {
            smileDetected = false;
        }).delay = 2.0;
        
        // Check if voice already activated
        checkActivation();
    }
});

function checkActivation() {
    if (voiceActivated && smileDetected) {
        // Both conditions met, trigger the special effect
        script.specialEffect.api.trigger();
        
        // Reset states
        voiceActivated = false;
        smileDetected = false;
    }
}
```

### With Timeline
This example uses voice commands to control a Timeline sequence:

```javascript
// In a separate controller script
var voiceController = script.voiceObject.getComponent("Component.ScriptComponent").api;
var timeline = script.timelineObject.getComponent("Component.ScriptComponent").api;

// Add playback control commands
voiceController.addCommandCallback("play", function() {
    timeline.play();
});

voiceController.addCommandCallback("pause", function() {
    timeline.pause();
});

voiceController.addCommandCallback("restart", function() {
    timeline.stop();
    timeline.play();
});

// Add marker navigation commands
voiceController.addCommandCallback("next", function() {
    timeline.nextMarker();
});

voiceController.addCommandCallback("previous", function() {
    timeline.previousMarker();
});
```

## Best Practices

- **For Better Accuracy**: Use distinct command words that don't sound similar
- **For Global Usage**: Consider adding commands in multiple languages
- **For User Experience**: Always provide visual feedback that voice control is active
- **For Robustness**: Set appropriate confidence thresholds based on your testing
- **For Performance**: Stop listening when voice commands aren't needed
- **For User Guidance**: Show available voice commands to users
- **For Development**: Use the debugging option to see detection confidence levels

## Performance Considerations

- Voice recognition uses significant processing power and battery
- Limiting the number of active commands improves recognition accuracy
- Using a cooldown period prevents accidental multiple activations
- Visual feedback should be lightweight to maintain good performance
- The script automatically optimizes by only processing confident detections 