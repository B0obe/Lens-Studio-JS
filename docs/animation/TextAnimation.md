# TextAnimation

The `TextAnimation.js` script provides various text animation effects for Lens Studio Text Components. It enables dynamic text effects like typewriter, fading, color cycling, wave effects, bounce, and glitch.

## Features

- Six animation types: typewriter, fade, color cycle, wave effect, bounce, and glitch
- Customizable animation duration and delay
- Multiple easing functions for smooth animations
- Support for looping animations with optional reverse direction
- Color transitioning with full control over opacity
- Character-by-character effects with wave and bounce animations
- Random glitch effect with controllable intensity
- Optional sound effect synchronized with animations
- API for controlling animations from other scripts

## Usage

1. Add the `TextAnimation.js` script to a Scene Object that has a Text Component
2. Choose an animation type in the Inspector panel
3. Configure animation parameters
4. Enable autoPlay or call the play() method from another script

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| textComponent | Component.Text | | The Text Component to animate |
| animationType | string | "typewriter" | Type of animation to apply |
| duration | float | 2.0 | Animation duration in seconds |
| delay | float | 0.0 | Delay before animation starts |
| startColor | vec4 | {1,1,1,0} | Starting color and opacity (for fade) |
| endColor | vec4 | {1,1,1,1} | Ending color and opacity (for fade) |
| colorSequence | vec4[] | | Colors for the color cycle animation |
| easingFunction | string | "linear" | Easing function to apply |
| looping | bool | false | Whether the animation should loop |
| loopDelay | float | 0.5 | Delay between loops |
| autoPlay | bool | true | Start animation automatically |
| reverseOnLoop | bool | false | Reverse animation direction when looping |
| waveAmplitude | float | 5.0 | Amplitude of the wave effect |
| waveFrequency | float | 2.0 | Frequency of the wave effect |
| bounceHeight | float | 10.0 | Height of the bounce effect |
| glitchFrequency | int | 5 | Frequency of glitch effect (times per second) |
| glitchIntensity | float | 0.5 | Intensity of glitch effect |
| playSound | bool | false | Play sound during animation |
| sound | Asset.AudioTrackAsset | | Sound to play |

## Animation Types

### Typewriter
Characters appear one by one as if being typed in real-time. Great for dialog or instructional text.

### Fade
Text gradually fades in or out with customizable start and end colors.

### Color Cycle
Text cycles through a sequence of colors. Define as many colors as needed for complex gradient effects.

### Wave Effect
Characters move up and down in a wave-like pattern. Amplitude and frequency are customizable.

### Bounce
Characters bounce up and down with a slight delay between each character, creating a fun, dynamic effect.

### Glitch
Text randomly glitches by replacing characters with random symbols. Intensity and frequency control the glitch behavior.

## Easing Functions

- **Linear**: Constant speed throughout the animation
- **Ease In/Out**: Starts slow, speeds up in the middle, and slows down at the end
- **Ease In**: Starts slow and speeds up toward the end
- **Ease Out**: Starts fast and slows down toward the end
- **Bounce**: Creates a bouncing effect at the end of the animation
- **Elastic**: Creates an elastic or spring-like effect

## Script API

### play()
Start or restart the text animation.

```javascript
// Example: play animation
someObject.getComponent("Component.ScriptComponent").api.play();
```

### stop()
Stop the animation at its current state.

```javascript
// Example: stop animation
someObject.getComponent("Component.ScriptComponent").api.stop();
```

### reset()
Reset text to its original state.

```javascript
// Example: reset animation
someObject.getComponent("Component.ScriptComponent").api.reset();
```

### setAnimationType(type)
Change the animation type.

```javascript
// Example: change to fade animation
someObject.getComponent("Component.ScriptComponent").api.setAnimationType("fade");

// Available types: "typewriter", "fade", "colorCycle", "waveEffect", "bounce", "glitch"
```

### setDuration(seconds)
Set the animation duration.

```javascript
// Example: set 1.5 seconds duration
someObject.getComponent("Component.ScriptComponent").api.setDuration(1.5);
```

### setLooping(shouldLoop)
Enable or disable animation looping.

```javascript
// Example: enable looping
someObject.getComponent("Component.ScriptComponent").api.setLooping(true);
```

### setText(text)
Change the text to be animated.

```javascript
// Example: change text content
someObject.getComponent("Component.ScriptComponent").api.setText("New animated text!");
```

## Examples

### Simple Typewriter Effect
This example sets up a basic typewriter animation:

1. Add the TextAnimation script to a Scene Object with a Text Component
2. Set animationType to "typewriter"
3. Set duration to 2.0 seconds
4. Enable autoPlay

### Blinking Text Warning
This example creates a looping fade animation for a warning message:

```javascript
// In a separate controller script
var textAnim = script.warningText.getComponent("Component.ScriptComponent").api;

// Configure for blinking warning
textAnim.setAnimationType("fade");
textAnim.setDuration(0.5);
textAnim.setLooping(true);

// When the warning should appear
function showWarning() {
    textAnim.setText("WARNING!");
    textAnim.play();
}

// When the warning should disappear
function hideWarning() {
    textAnim.stop();
    textAnim.reset();
}
```

### Interactive Text Effect
This example changes text animation based on user interaction:

```javascript
// In a separate controller script
var textAnim = script.textObject.getComponent("Component.ScriptComponent").api;

// Set up tap event
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(function() {
    // Change animation type on tap
    currentEffect = (currentEffect + 1) % effects.length;
    textAnim.setAnimationType(effects[currentEffect]);
    textAnim.play();
});

// Available effects
var effects = ["typewriter", "fade", "waveEffect", "bounce", "glitch"];
var currentEffect = 0;
```

### Animated Score Counter
This example uses a typewriter effect for incrementing score:

```javascript
// In a separate controller script
var textAnim = script.scoreText.getComponent("Component.ScriptComponent").api;
var currentScore = 0;

function addPoints(points) {
    var newScore = currentScore + points;
    
    // Animate to new score
    textAnim.setText("Score: " + newScore);
    textAnim.setDuration(0.5);
    textAnim.setAnimationType("typewriter");
    textAnim.play();
    
    // Update current score
    currentScore = newScore;
}
```

## Integration with Other Scripts

### With Timeline
This example uses the Timeline script to coordinate text animations with other effects:

```javascript
// In a separate controller script
var timeline = script.getSceneObject().getComponent("Component.ScriptComponent").api;
var textAnim = script.dialogText.getComponent("Component.ScriptComponent").api;

// Add dialog sequence to timeline
timeline.addEvent(0, function() {
    textAnim.setText("Hello!");
    textAnim.play();
});

timeline.addEvent(2, function() {
    textAnim.setText("Welcome to our Lens!");
    textAnim.play();
});

timeline.addEvent(5, function() {
    textAnim.setText("Try it out!");
    textAnim.play();
});

// Start the sequence
timeline.play();
```

## Best Practices

- **For User Interface**: Use shorter durations (0.3-0.5s) for responsive UI elements
- **For Dialog**: Use typewriter effect with slightly longer durations (1-2s) to create natural reading pace
- **For Attention**: Use fade or color cycle for important information
- **For Fun Effects**: Use bounce or wave for playful, engaging content
- **For Horror/Sci-Fi**: Use glitch effect with sound for an edgy, technological feel
- **For Performance**: Be mindful of using complex effects like wave or bounce with very long text strings

## Performance Considerations

- Wave and bounce animations are more processor-intensive than simple fade or typewriter effects
- Glitch effects randomly change text content, which may impact performance if updated too frequently
- For optimal performance, use the simplest animation type that achieves your desired effect
- Looping animations continue to use resources; disable them when not needed
- If you're experiencing performance issues, increase the animation duration to reduce update frequency 