# TweenUtils

The `TweenUtils.js` script provides a lightweight, memory-efficient tweening utility for animating values over time in Lens Studio. It allows you to smoothly interpolate between values using various easing functions without creating unnecessary objects.

## Features

- Animate values with precise control over duration and easing
- Support for single values or arrays of values (for position, scale, etc.)
- Multiple easing functions for different animation styles
- Optional callbacks for animation updates and completion
- Support for delayed start, repeat, and yoyo (ping-pong) effects
- Memory-efficient implementation using deltaTime
- No object instances created, avoiding garbage collection issues

## Usage

1. Add the `TweenUtils.js` script to your Lens Studio project
2. Import the script in your main script
3. Use the `tweenTo` function to animate values
4. Apply the animated values in the `onUpdate` callback

## API

### tweenTo

The main function for creating animations. Supports two calling styles:

#### Object Style

```javascript
// Object style with all options
script.api.tweenTo({
    start: 0,
    end: 1,
    duration: 1.0,
    ease: script.api.Easing.easeOutQuad,
    onUpdate: function(value) {
        // Apply the value
        myObject.getTransform().setLocalScale(new vec3(value, value, value));
    },
    onComplete: function() {
        // Animation complete
        print("Animation complete!");
    },
    delay: 0.5,
    yoyo: true,
    repeat: 3
});
```

#### Parameter Style

```javascript
// Parameter style (simpler)
script.api.tweenTo(
    0,                           // start
    1,                           // end
    1.0,                         // duration (seconds)
    script.api.Easing.easeOutQuad, // easing function
    function(value) {            // onUpdate
        myObject.getTransform().setLocalScale(new vec3(value, value, value));
    },
    function() {                 // onComplete
        print("Animation complete!");
    }
);
```

### Easing Functions

The script provides many easing functions through the `Easing` object:

- `linear`: Constant speed
- Quadratic: `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- Cubic: `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- Quartic: `easeInQuart`, `easeOutQuart`, `easeInOutQuart`
- Quintic: `easeInQuint`, `easeOutQuint`, `easeInOutQuint`
- Sinusoidal: `easeInSine`, `easeOutSine`, `easeInOutSine`
- Exponential: `easeInExpo`, `easeOutExpo`, `easeInOutExpo`
- Circular: `easeInCirc`, `easeOutCirc`, `easeInOutCirc`
- Elastic: `easeInElastic`, `easeOutElastic`, `easeInOutElastic`
- Back: `easeInBack`, `easeOutBack`, `easeInOutBack`
- Bounce: `easeInBounce`, `easeOutBounce`, `easeInOutBounce`

### Control Methods

The `tweenTo` function returns a control object with the following methods:

```javascript
const tween = script.api.tweenTo(0, 1, 1.0);

tween.stop();      // Stop the animation and clean up
tween.pause();     // Pause the animation
tween.resume();    // Resume a paused animation
tween.restart();   // Restart the animation from the beginning
tween.isActive();  // Check if the animation is active
tween.getValue();  // Get the current value
```

### Utility Functions

```javascript
// Stop all active tweens
script.api.stopAllTweens();

// Stop tweens affecting a specific target
script.api.stopTweensByTarget("myObjectId");
```

## Examples

### Basic Animation

This example shows how to animate an object's scale over 1 second:

```javascript
script.api.tweenTo(0.5, 1.5, 1.0, script.api.Easing.easeOutElastic, function(value) {
    myObject.getTransform().setLocalScale(new vec3(value, value, value));
});
```

### Position Animation with Array Values

This example shows how to animate an object's position:

```javascript
const startPos = [0, 0, 0];
const endPos = [0, 10, 0];

script.api.tweenTo({
    start: startPos,
    end: endPos,
    duration: 2.0,
    ease: script.api.Easing.easeInOutQuad,
    onUpdate: function(value) {
        myObject.getTransform().setLocalPosition(new vec3(value[0], value[1], value[2]));
    }
});
```

### Chaining Animations

This example shows how to chain multiple animations:

```javascript
// First animation
script.api.tweenTo({
    start: 0,
    end: 1,
    duration: 1.0,
    onUpdate: function(value) {
        myObject.getTransform().setLocalScale(new vec3(value, value, value));
    },
    onComplete: function() {
        // Start second animation when first completes
        script.api.tweenTo({
            start: [0, 0, 0],
            end: [0, 10, 0],
            duration: 1.0,
            onUpdate: function(value) {
                myObject.getTransform().setLocalPosition(new vec3(value[0], value[1], value[2]));
            }
        });
    }
});
```

### Ping-Pong Animation

This example shows how to create a ping-pong (yoyo) animation:

```javascript
script.api.tweenTo({
    start: 0,
    end: 1,
    duration: 0.5,
    yoyo: true,
    repeat: -1, // Infinite repeat
    ease: script.api.Easing.easeInOutQuad,
    onUpdate: function(value) {
        myObject.getTransform().setLocalScale(new vec3(value, value, value));
    }
});
```

## Performance Considerations

- The implementation is designed to be memory-efficient by avoiding object creation
- For best performance, avoid creating many simultaneous tweens
- When animating many objects with similar animations, consider using a single tween and applying the value to multiple objects in the onUpdate callback 