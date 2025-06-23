# WeatherEffects

A script that creates realistic weather effects like rain, snow, fog, and wind.

## Overview

The WeatherEffects component allows you to easily add environmental effects to your scene. It provides multiple weather types with customizable parameters for creating immersive AR experiences.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `weatherType` | String | Type of weather effect ("rain", "snow", "fog", "wind") |
| `intensity` | Number | Weather effect intensity from 0 to 1 |
| `direction` | Vector3 | Direction of the weather effect (for rain, snow, wind) |
| `particleColor` | Color | Color of particles or fog |
| `particleTexture` | Texture | Custom texture for particles (optional) |
| `particleSize` | Number | Size of individual particles |
| `particleSpeed` | Number | Speed of particle movement |
| `playOnStart` | Boolean | Whether to start the effect when the Lens starts |
| `randomizeDirection` | Boolean | Add some randomness to particle directions |
| `emitterObject` | SceneObject | Optional custom emitter object (if not specified, creates one) |
| `debugMode` | Boolean | Show debug messages in the Logger panel |

## Usage

1. Add the script to a Scene Object
2. Configure the weather type and parameters
3. Optionally, provide a custom emitter object or texture
4. The effect will start automatically if `playOnStart` is enabled

## Weather Types

### Rain
Creates a rainfall effect with customizable intensity, direction, and droplet properties.

### Snow
Creates a snowfall effect with gentle, drifting snowflakes that respond to wind direction.

### Fog
Adds atmospheric fog to the scene with adjustable density and color.

### Wind
Creates a wind effect that can influence other objects in the scene (particularly objects with names containing "leaf", "branch", "flag", or "cloth").

## API Reference

### Methods

#### startWeather()
Starts the weather effect.

#### stopWeather()
Stops the weather effect.

#### setIntensity(newIntensity)
Sets the weather effect intensity.
- `newIntensity`: New intensity value (0-1)

#### setWeatherType(newType)
Changes the type of weather effect.
- `newType`: New weather type ("rain", "snow", "fog", "wind")

#### setDirection(newDirection)
Sets the direction of the weather effect.
- `newDirection`: New direction vector

#### setParticleColor(newColor)
Sets the particle color for the weather effect.
- `newColor`: New color value

## Example

```javascript
// Get the WeatherEffects script
var weatherEffects = script.getSceneObject().getComponent("Component.ScriptComponent");

// Start with snow
weatherEffects.api.setWeatherType("snow");

// Increase intensity for heavier snow
weatherEffects.api.setIntensity(0.8);

// Change wind direction to blow from right to left
weatherEffects.api.setDirection(new vec3(-1, -0.5, 0));

// Make the snow blue-tinted
weatherEffects.api.setParticleColor(new vec4(0.8, 0.9, 1.0, 0.8));

// Start the effect
weatherEffects.api.startWeather();
```

## Performance Considerations

- The Rain effect uses more particles than Snow and may have a higher performance impact
- Fog has minimal performance impact but affects the entire scene
- Wind calculations can be expensive if many objects are affected
- For better performance on lower-end devices, reduce intensity and particle count 