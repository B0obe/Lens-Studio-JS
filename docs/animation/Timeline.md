# Timeline

A script for sequencing and coordinating multiple animations with precise timing.

## Overview

The Timeline component allows you to create time-based sequences of events and animations. It provides a simple API for adding keyframes at specific times and triggering actions when those times are reached.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `playOnStart` | Boolean | Whether to play the timeline automatically when the Lens starts |
| `loop` | Boolean | Whether to loop the timeline once it completes |
| `duration` | Number | Total duration of the timeline in seconds |
| `debugMode` | Boolean | Show debug messages in the Logger panel |

## Usage

1. Add the script to a Scene Object
2. Configure the parameters in the Inspector panel
3. Add keyframes using the script API
4. Control playback using the provided methods

## API Reference

### Methods

#### addKeyframe(time, action)
Adds a new keyframe to the timeline.
- `time`: Time in seconds when the action should trigger
- `action`: Function to call when this keyframe is reached
- Returns: Index of the added keyframe or -1 if failed

#### removeKeyframe(index)
Removes a keyframe from the timeline.
- `index`: Index of the keyframe to remove
- Returns: `true` if successful, `false` otherwise

#### clearKeyframes()
Removes all keyframes from the timeline.

#### play()
Starts playing the timeline from the beginning.

#### pause()
Pauses the timeline at the current position.

#### resume()
Resumes playing from the current position.

#### stop()
Stops the timeline and resets to the beginning.

#### seekTo(time)
Jumps to a specific time in the timeline.
- `time`: Time in seconds to seek to

#### setDuration(newDuration)
Sets the total duration of the timeline.
- `newDuration`: New duration in seconds

#### getCurrentTime()
Gets the current playback time of the timeline.
- Returns: Current time in seconds

## Example

```javascript
// Get the Timeline script from the scene
var timeline = script.getSceneObject().getComponent("Component.ScriptComponent");

// Add keyframes to trigger actions at specific times
timeline.api.addKeyframe(1.0, function() {
    // Show an object at 1 second
    myObject.enabled = true;
});

timeline.api.addKeyframe(2.5, function() {
    // Change color at 2.5 seconds
    myMaterial.mainPass.baseColor = new vec4(1, 0, 0, 1);
});

timeline.api.addKeyframe(4.0, function() {
    // Hide an object at 4 seconds
    myObject.enabled = false;
});

// Start the timeline
timeline.api.play();
```

## Performance Considerations

- Add only as many keyframes as needed
- Keep keyframe actions short and efficient
- For complex animations, consider splitting across multiple timelines 