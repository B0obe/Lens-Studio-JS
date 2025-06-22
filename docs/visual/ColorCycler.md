# ColorCycler

The `ColorCycler.js` script creates dynamic color animations for materials in your Lens Studio project. It can cycle through custom color palettes with different transition effects, allowing you to add eye-catching visual effects to any material.

## Features

- Animate colors through customizable color palettes
- Four transition types: smooth, step, pulse, and rainbow
- Apply to multiple materials simultaneously
- Control animation playback (play, pause, stop)
- Callback events when colors change
- Preserve or animate alpha channel
- Works with both base colors and emissive colors

## Usage

1. Add the `ColorCycler.js` script to your Lens Studio project
2. Attach the script to a Scene Object
3. Assign the materials you want to animate
4. Configure your color palette and animation settings
5. Use the script API to control playback if needed

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| targetMaterials | MaterialMeshVisual[] | [] | Materials to animate |
| colorPalette | vec4[] | [red, green, blue] | Color palette to cycle through |
| cycleDuration | float | 3.0 | Time in seconds to complete one full color cycle |
| colorProperty | string | "baseColor" | Material property to animate ("baseColor" or "emissiveColor") |
| transitionType | string | "smooth" | How colors transition ("smooth", "step", "pulse", "rainbow") |
| randomizeStart | bool | false | Start from a random position in the cycle |
| affectAlpha | bool | false | Whether to animate the alpha channel |
| autoPlay | bool | true | Start animation automatically |

## Script API

### play()
Start or resume the color animation.

```javascript
// Example: start playing the color animation
someObject.getComponent("Component.ScriptComponent").api.play();
```

### pause()
Pause the color animation at the current position.

```javascript
// Example: pause the color animation
someObject.getComponent("Component.ScriptComponent").api.pause();
```

### stop()
Stop the animation and reset materials to their initial colors.

```javascript
// Example: stop the color animation and reset colors
someObject.getComponent("Component.ScriptComponent").api.stop();
```

### setColorPalette(colors)
Set a new color palette to cycle through.

```javascript
// Example: change the color palette
var newPalette = [
    new vec4(1, 0, 0, 1),  // Red
    new vec4(0, 0, 1, 1),  // Blue
    new vec4(1, 1, 0, 1)   // Yellow
];
someObject.getComponent("Component.ScriptComponent").api.setColorPalette(newPalette);
```

### setCycleDuration(seconds)
Change the duration of the color cycle.

```javascript
// Example: make the cycle faster
someObject.getComponent("Component.ScriptComponent").api.setCycleDuration(1.5);
```

### setTransitionType(type)
Change the transition type for the color animation.

```javascript
// Example: switch to pulse mode
someObject.getComponent("Component.ScriptComponent").api.setTransitionType("pulse");
```

### onColorChanged
Callback function that triggers when the color changes (only in "step" transition mode).

```javascript
// Example: set up a callback for color changes
var colorCycler = someObject.getComponent("Component.ScriptComponent").api;
colorCycler.onColorChanged = function(colorIndex) {
    print("Color changed to index: " + colorIndex);
    // Trigger an action when specific colors appear
    if (colorIndex === 0) {  // Red
        script.redEffect.enabled = true;
    } else {
        script.redEffect.enabled = false;
    }
};
```

## Transition Types

### Smooth
Smoothly interpolates between colors in the palette. This creates a gradual, continuous transition from one color to the next.

### Step
Changes instantly between colors with no interpolation. Each color in the palette is displayed for an equal amount of time.

### Pulse
Creates a pulsing effect that fades between colors in the palette. The transition speeds up and slows down like a sine wave.

### Rainbow
Generates a full rainbow spectrum regardless of the color palette. This mode cycles through the HSV color space.

## Examples

### Basic Material Color Cycling
This example shows how to create a simple color cycling effect on a material:

1. Add a 3D object to your scene
2. Add the ColorCycler script to the object
3. Assign the object's material to the targetMaterials array
4. Configure a color palette with 3-5 colors
5. Set cycleDuration to 2.0 for a moderate animation speed
6. Choose "smooth" for transitionType

### Interactive Color Mode Switching
This example demonstrates how to create UI buttons that switch between color modes:

```javascript
// In a separate controller script
var colorCycler = script.colorCyclerObject.getComponent("Component.ScriptComponent").api;

// Set up button events
script.smoothButton.createEvent("TapEvent").bind(function() {
    colorCycler.setTransitionType("smooth");
});

script.stepButton.createEvent("TapEvent").bind(function() {
    colorCycler.setTransitionType("step");
});

script.pulseButton.createEvent("TapEvent").bind(function() {
    colorCycler.setTransitionType("pulse");
});

script.rainbowButton.createEvent("TapEvent").bind(function() {
    colorCycler.setTransitionType("rainbow");
});
```

### Color-Based Trigger System
This example uses the color changes to trigger different effects:

```javascript
// In a separate controller script
var colorCycler = script.colorCyclerObject.getComponent("Component.ScriptComponent").api;

// Set to step transition for discrete color changes
colorCycler.setTransitionType("step");

// Configure callback
colorCycler.onColorChanged = function(colorIndex) {
    // Disable all effects first
    script.effect1.enabled = false;
    script.effect2.enabled = false;
    script.effect3.enabled = false;
    
    // Enable effect based on color
    switch(colorIndex) {
        case 0: // First color
            script.effect1.enabled = true;
            script.playSoundEffect("sound1");
            break;
        case 1: // Second color
            script.effect2.enabled = true;
            script.playSoundEffect("sound2");
            break;
        case 2: // Third color
            script.effect3.enabled = true;
            script.playSoundEffect("sound3");
            break;
    }
};
```

## Performance Considerations

- If animating many materials, consider using a longer cycle duration to reduce the update frequency
- The "rainbow" transition is slightly more computationally intensive than the others
- For devices with lower processing power, prefer "step" or "smooth" transitions over "pulse" or "rainbow"
- Animating both base color and emissive color on the same material will increase overhead

## Compatibility

- Works with all standard Lens Studio Materials
- Compatible with both Static and Dynamic objects
- Can be used with both 3D objects and 2D UI elements 