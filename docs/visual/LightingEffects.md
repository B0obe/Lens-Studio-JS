# LightingEffects

The `LightingEffects.js` script provides dynamic lighting effects to enhance scene ambiance in Lens Studio. It allows for control of light intensity, color transitions, flickering, strobing, and environment-based effects.

## Features

- Six lighting effect types: pulse, flicker, color cycle, strobe, ambient weather, and custom
- Controls for both light intensity and color
- Audio reactivity to sync lighting with music or sounds
- Customizable parameters for each effect type
- Natural-looking ambient weather effects
- Easing functions for smooth transitions
- Random generators for organic-looking variations
- Performance optimization with frame limiting

## Usage

1. Add the `LightingEffects.js` script to a Scene Object with a Light Source component
2. Choose an effect type in the Inspector panel
3. Configure effect parameters based on the desired look
4. Enable autoPlay or control via script API

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| lightSource | Component.LightSource | | Light source to control |
| effectType | string | "pulse" | Type of lighting effect |
| startColor | vec4 | {1,1,1,1} | Starting color |
| endColor | vec4 | {1,0,0,1} | End color for pulse/cycle |
| colorSequence | vec4[] | | Color sequence for color cycle |
| minIntensity | float | 0.5 | Minimum light intensity |
| maxIntensity | float | 1.5 | Maximum light intensity |
| effectSpeed | float | 1.0 | Speed of the effect (cycles per second) |
| flickerAmount | float | 0.2 | Amount of flicker (0-1) |
| strobeOnRatio | float | 0.5 | Ratio of time light is on vs off (0-1) |
| easingFunction | string | "sinusoidal" | Easing function for smooth transitions |
| controlIntensity | bool | true | Control light intensity |
| controlColor | bool | true | Control light color |
| reactToAudio | bool | false | Light reacts to audio input |
| audioReactivity | float | 1.0 | How strongly the light reacts to audio |
| audioOutput | Asset.AudioOutputAsset | | Audio output to react to |
| autoPlay | bool | true | Start effects automatically |
| looping | bool | true | Loop the effect continuously |
| randomSeed | float | 0.0 | Random seed for flicker pattern |
| ambientWeatherParams | vec3 | {0.5,0.2,2.0} | Weather parameters (wetness, cloudiness, windiness) |

## Effect Types

### Pulse
Creates smooth, periodic transitions in intensity and/or color. Great for heartbeats, breathing effects, or gentle ambient lighting.

### Flicker
Simulates organic flickering like candles, fire, or damaged lights with random intensity variations.

### Color Cycle
Transitions through a sequence of colors, useful for mood lighting, dance floors, or rainbow effects.

### Strobe
Creates rapid on/off transitions with controllable timing, simulating strobe lights or lightning.

### Ambient Weather
Simulates natural lighting conditions with subtle variations based on weather parameters:
- Wetness: Controls flicker frequency (like rainy conditions)
- Cloudiness: Affects intensity range and color temperature
- Windiness: Controls flicker speed (like wind moving through trees)

### Custom
A customizable effect that can be modified in the script to create unique lighting behaviors.

## Script API

### play()
Start or resume the lighting effect.

```javascript
// Example: start the effect
someObject.getComponent("Component.ScriptComponent").api.play();
```

### stop()
Stop the lighting effect.

```javascript
// Example: stop the effect
someObject.getComponent("Component.ScriptComponent").api.stop();
```

### reset()
Reset light to original properties.

```javascript
// Example: reset the light
someObject.getComponent("Component.ScriptComponent").api.reset();
```

### setEffectType(type)
Change the effect type.

```javascript
// Example: change to flicker effect
someObject.getComponent("Component.ScriptComponent").api.setEffectType("flicker");

// Available types: "pulse", "flicker", "colorCycle", "strobe", "ambient", "custom"
```

### setEffectSpeed(speed)
Set the effect speed in cycles per second.

```javascript
// Example: set to 0.5 cycles per second (slower)
someObject.getComponent("Component.ScriptComponent").api.setEffectSpeed(0.5);
```

### setIntensityRange(min, max)
Set the minimum and maximum light intensity.

```javascript
// Example: set intensity range from 0.2 to 1.8
someObject.getComponent("Component.ScriptComponent").api.setIntensityRange(0.2, 1.8);
```

### setReactToAudio(react)
Enable or disable audio reactivity.

```javascript
// Example: enable audio reactivity
someObject.getComponent("Component.ScriptComponent").api.setReactToAudio(true);
```

## Examples

### Candle Light
This example creates a realistic candle light flicker effect:

1. Add the LightingEffects script to a Point Light
2. Configure the following parameters:
   - effectType: "flicker"
   - startColor: orange/yellow color {1.0, 0.8, 0.5, 1.0}
   - minIntensity: 0.8
   - maxIntensity: 1.2
   - flickerAmount: 0.3
   - effectSpeed: 2.0

### Dance Floor Lights
This example creates colorful cycling lights for a party scene:

```javascript
// In a separate controller script
var lighting = script.lightObject.getComponent("Component.ScriptComponent").api;

// Configure for club lighting
lighting.setEffectType("colorCycle");
lighting.setEffectSpeed(0.8);
lighting.setReactToAudio(true);

// Connect to music beat detection
script.beatDetector.subscribe(function(beatInfo) {
    // Boost light on strong beats
    if (beatInfo.isBeat && beatInfo.confidence > 0.7) {
        script.lightObject.getComponent("Component.LightSource").intensity *= 1.5;
    }
});
```

### Horror Scene Lightning
This example creates an ominous lightning effect:

```javascript
// In a separate controller script
var lighting = script.lightObject.getComponent("Component.ScriptComponent").api;

// Configure for lightning effect
lighting.setEffectType("strobe");
lighting.setEffectSpeed(0.2); // Slow overall flash frequency

// Create random timings for realistic lightning
script.createEvent("UpdateEvent").bind(function() {
    if (Math.random() < 0.01) { // Occasional lightning storm
        // Sequence of fast flashes
        var flashSequence = function() {
            lighting.setEffectSpeed(8 + Math.random() * 5); // Fast flashes
            script.lightObject.getComponent("Component.LightSource").color = new vec4(0.9, 0.9, 1.0, 1.0); // Bluish white
            
            // Return to normal after lightning
            script.createEvent("DelayedCallbackEvent").bind(function() {
                lighting.setEffectSpeed(0.2);
            }).delay = 1.5;
        };
        
        flashSequence();
    }
});
```

## Integration with Other Scripts

### With AudioVisualizer
This example combines LightingEffects with the AudioVisualizer for sophisticated audio reactivity:

```javascript
// In a separate controller script
var lighting = script.lightObject.getComponent("Component.ScriptComponent").api;
var visualizer = script.visualizerObject.getComponent("Component.ScriptComponent").api;

// Configure audio reactivity with frequency bands
visualizer.onProcessed = function(audioData) {
    // Use bass frequency for light intensity
    var bassEnergy = audioData.getEnergy("bass");
    script.lightObject.getComponent("Component.LightSource").intensity = 
        0.8 + bassEnergy * 1.5;
    
    // Use high frequency for color temperature
    var highEnergy = audioData.getEnergy("high");
    var colorTemp = 0.5 + highEnergy * 0.5;
    script.lightObject.getComponent("Component.LightSource").color = new vec4(
        1.0,  // Red
        0.7 + colorTemp * 0.3,  // Green
        0.5 + colorTemp * 0.5,  // Blue
        1.0
    );
};
```

### With WeatherEffects
This example integrates LightingEffects with the WeatherEffects script:

```javascript
// In a separate controller script
var lighting = script.lightObject.getComponent("Component.ScriptComponent").api;
var weather = script.weatherObject.getComponent("Component.ScriptComponent").api;

// Configure ambient lighting based on weather
lighting.setEffectType("ambient");

// Update lighting when weather changes
weather.onWeatherChanged = function(weatherType, intensity) {
    switch(weatherType) {
        case "rain":
            // Rainy day lighting
            lighting.setIntensityRange(0.4, 0.8);
            script.ambientWeatherParams = new vec3(intensity, 0.7, 2.0);
            break;
            
        case "snow":
            // Snowy day lighting (brighter due to reflection)
            lighting.setIntensityRange(0.6, 1.0);
            script.ambientWeatherParams = new vec3(intensity, 0.5, 1.0);
            break;
            
        case "clear":
            // Clear day lighting
            lighting.setIntensityRange(0.8, 1.2);
            script.ambientWeatherParams = new vec3(0, 0.1, 1.0);
            break;
    }
};
```

## Best Practices

- **For Realism**: Use flicker and ambient effects with subtle settings
- **For Performance**: Disable audio reactivity when not needed
- **For Natural Light**: Use slower speeds (0.2-0.5) and gentler transitions
- **For Dramatic Effect**: Combine multiple lights with different settings
- **For Synchronization**: Use the same random seed for multiple lights to make them flicker in sync
- **For Energy Efficiency**: Lens Studio will throttle scripts when the app is in background, so consider that when designing effects

## Performance Considerations

- Using many dynamic lights can impact performance, especially on older devices
- Audio reactivity adds some CPU overhead for audio analysis
- The script automatically limits updates to 60fps to optimize performance
- Color changes are less performance-intensive than intensity changes
- Ambient weather effects use the most complex calculations 