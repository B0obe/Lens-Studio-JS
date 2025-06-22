# FaceEffects

The `FaceEffects.js` script provides a collection of common face effects with easy configuration. It includes color overlays, face deformation, and texture effects that can be applied to any face mesh.

## Features

- Color overlay with customizable color and opacity
- Face deformation with different types (bulge, squeeze, stretch)
- Texture effects with various blend modes
- Animation options for dynamic effects
- Simple API for controlling effects at runtime

## Usage

1. Add the `FaceEffects.js` script to a Scene Object
2. Assign a Face Mesh component to the "faceMesh" input
3. Configure the desired effects in the Inspector panel
4. Use the API to control effects dynamically at runtime

## Parameters

### Color Overlay

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| colorOverlayEnabled | bool | false | Enable color overlay effect |
| overlayColor | vec4 | {1.0, 0.5, 0.5, 0.5} | Color for the overlay (RGBA) |
| pulseOverlayColor | bool | false | Pulse the overlay color |
| pulseDuration | float | 1.0 | Duration of each pulse cycle in seconds |

### Deformation

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| deformationEnabled | bool | false | Enable face deformation |
| deformationType | string | "bulge" | Type of deformation ("bulge", "squeeze", "stretch") |
| deformationStrength | float | 0.5 | Strength of the deformation (0-1) |
| deformationFeature | int | 0 | Feature to deform (0: Entire Face, 1: Eyes, 2: Nose, 3: Mouth, 4: Cheeks) |

### Texture Effect

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| textureEffectEnabled | bool | false | Enable texture effect |
| effectTexture | Texture | null | Texture to use for the effect |
| blendMode | string | "normal" | Blend mode for the texture ("normal", "add", "multiply", "screen") |
| textureOpacity | float | 1.0 | Opacity of the texture effect (0-1) |

### Animation

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| animateEffects | bool | false | Animate effects over time |
| animationSpeed | float | 1.0 | Speed of the animation |

## Script API

### Color Overlay

#### setOverlayColor(color)
Set the color for the overlay effect.

```javascript
// Example: set overlay to blue with 50% opacity
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
faceEffects.setOverlayColor(vec4.create(0.0, 0.0, 1.0, 0.5));
```

#### setOverlayOpacity(opacity)
Set just the opacity of the color overlay.

```javascript
// Example: set overlay opacity to 30%
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
faceEffects.setOverlayOpacity(0.3);
```

#### setOverlayEnabled(enabled)
Enable or disable the color overlay effect.

```javascript
// Example: disable color overlay
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
faceEffects.setOverlayEnabled(false);
```

### Deformation

#### setDeformationStrength(strength)
Set the strength of the deformation effect (0-1).

```javascript
// Example: set deformation strength to 75%
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
faceEffects.setDeformationStrength(0.75);
```

#### setDeformationFeature(featureIndex)
Set which facial feature to deform.

```javascript
// Example: deform only the eyes (index 1)
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
faceEffects.setDeformationFeature(1);
```

#### setDeformationEnabled(enabled)
Enable or disable the deformation effect.

```javascript
// Example: enable deformation
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
faceEffects.setDeformationEnabled(true);
```

### Texture Effect

#### setTextureOpacity(opacity)
Set the opacity of the texture effect (0-1).

```javascript
// Example: set texture effect to 80% opacity
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
faceEffects.setTextureOpacity(0.8);
```

#### setTextureEffectEnabled(enabled)
Enable or disable the texture effect.

```javascript
// Example: enable texture effect
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
faceEffects.setTextureEffectEnabled(true);
```

### General

#### resetEffects()
Reset all effects to their default state.

```javascript
// Example: reset all effects
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
faceEffects.resetEffects();
```

## Examples

### Emotion-Based Face Effects

This example changes face effects based on detected emotions:

```javascript
// In a separate controller script
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
var smileDetector = script.smileDetectorObject.getComponent("Component.ScriptComponent").api;

// Set up smile detection callback
smileDetector.onSmileChanged = function(isSmiling) {
    if (isSmiling) {
        // Happy effect: yellow glow
        faceEffects.setOverlayColor(vec4.create(1.0, 1.0, 0.0, 0.3));
        faceEffects.setOverlayEnabled(true);
        faceEffects.setDeformationEnabled(false);
    } else {
        // Neutral effect: no overlay
        faceEffects.setOverlayEnabled(false);
    }
};
```

### Interactive Face Deformation

This example allows the user to control face deformation with touch:

```javascript
// In a separate controller script
var faceEffects = script.faceEffectsObject.getComponent("Component.ScriptComponent").api;
var touchEvent = script.createEvent("TouchMoveEvent");

touchEvent.bind(function(eventData) {
    // Get touch position (normalized 0-1)
    var touchPos = eventData.getTouchPosition();
    
    // Map X position to deformation strength
    var strength = touchPos.x;
    faceEffects.setDeformationStrength(strength);
    
    // Map Y position to feature selection (0-4)
    var featureIndex = Math.floor(touchPos.y * 5);
    faceEffects.setDeformationFeature(featureIndex);
});

// Enable deformation
faceEffects.setDeformationEnabled(true);
```

## Best Practices

- **Performance**: Face effects can be performance-intensive, especially when animated. Test on target devices to ensure good performance.
- **Subtlety**: For most effects, subtle changes often look better than extreme deformations.
- **Compatibility**: Not all materials support all effect types. Check for warnings in the console.
- **Texture Size**: Keep effect textures reasonably sized for better performance.
- **Animation**: Use animation sparingly and with appropriate timing for the best user experience.
