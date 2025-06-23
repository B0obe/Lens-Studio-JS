# AudioVisualizer

A script that creates visual effects that react to audio input or playback.

## Overview

The AudioVisualizer component analyzes audio from either a playback source or microphone input and applies visual effects to scene objects based on the audio characteristics. It can modify object scale, color, and rotation in response to audio.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `audioSource` | Audio Component | Audio source to analyze |
| `visualObjects` | SceneObject[] | Objects to be affected by audio |
| `useAudioInput` | Boolean | Whether to use microphone input instead of audio playback |
| `frequencyBands` | Integer | Number of frequency bands to analyze (1-8) |
| `sensitivity` | Number | Audio detection sensitivity multiplier |
| `smoothing` | Number | Smoothing factor for transitions (0-1) |
| `responseTypes` | String[] | Types of visual responses to audio ("scale", "color", "rotation") |
| `debugMode` | Boolean | Show debug information in the Logger panel |

## Usage

1. Add the script to a Scene Object
2. Connect it to an Audio Component (audio file or microphone)
3. Assign visual objects to be affected by audio
4. Configure the response types and sensitivity parameters

## API Reference

### Methods

#### setSensitivity(newSensitivity)
Sets the audio detection sensitivity.
- `newSensitivity`: New sensitivity value (higher values create stronger reactions)

#### setSmoothing(newSmoothing)
Sets the smoothing factor for audio transitions.
- `newSmoothing`: New smoothing value (0-1, higher values create smoother transitions)

#### setAudioInputMode(useMicrophone)
Switches between audio playback and microphone input.
- `useMicrophone`: Whether to use microphone input (`true`) or audio playback (`false`)

## Frequency Analysis

The script divides the audio spectrum into frequency bands:
- Each visual object is assigned to a specific frequency band
- Lower bands correspond to bass frequencies
- Higher bands correspond to treble frequencies
- The number of bands can be adjusted (1-8) to match the desired level of detail

## Visual Responses

The component supports three types of visual responses:

### Scale
Objects will scale up/down based on audio intensity in their assigned frequency band.

### Color
Objects will change brightness based on audio intensity, enhancing their original color.

### Rotation
Objects will rotate around the Y-axis based on audio intensity.

## Example

```javascript
// Get the AudioVisualizer script
var audioVisualizer = script.getSceneObject().getComponent("Component.ScriptComponent");

// Increase sensitivity for stronger reactions
audioVisualizer.api.setSensitivity(2.0);

// Make transitions smoother
audioVisualizer.api.setSmoothing(0.6);

// Switch to microphone input for live performances
audioVisualizer.api.setAudioInputMode(true);
```

## Performance Considerations

- Reduce the number of frequency bands for better performance
- Limit the number of objects affected by audio
- Using microphone input is less performance-intensive than spectrum analysis
- Scale effects are typically more performant than color or rotation effects 