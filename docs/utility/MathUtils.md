# MathUtils

The `MathUtils.js` script provides a comprehensive collection of mathematical utility functions to simplify common calculations in Lens Studio projects. This utility module extends Lens Studio's built-in math capabilities with functions for interpolation, randomization, angle conversions, and more.

## Features

- Value mapping between different ranges
- Linear and smooth interpolation functions
- Vector math helpers
- Angle conversion utilities
- Random number generation with constraints
- Easing functions for animations
- Spatial relationship checks (point in rectangle, etc.)

## Usage

The MathUtils script is designed as a module that you can import in your other scripts:

```javascript
// Import the MathUtils module
var MathUtils = require('./MathUtils.js');

// Now you can use any of the functions
var mappedValue = MathUtils.map(50, 0, 100, 0, 1); // Returns 0.5
var lerpedValue = MathUtils.lerp(10, 20, 0.5); // Returns 15
```

## Available Functions

### map(value, inMin, inMax, outMin, outMax, clamp)
Maps a value from one range to another.

**Parameters:**
- `value` (number): The value to map
- `inMin` (number): Input range minimum
- `inMax` (number): Input range maximum
- `outMin` (number): Output range minimum
- `outMax` (number): Output range maximum
- `clamp` (boolean): Whether to clamp the output to the output range

**Example:**
```javascript
// Map a value from 0-100 to 0-1
var normalizedValue = MathUtils.map(75, 0, 100, 0, 1); // Returns 0.75

// Map and clamp a value
var clampedValue = MathUtils.map(150, 0, 100, 0, 1, true); // Returns 1
```

### lerp(start, end, t)
Linearly interpolates between two values.

**Parameters:**
- `start` (number): Start value
- `end` (number): End value
- `t` (number): Interpolation factor (0-1)

**Example:**
```javascript
var halfway = MathUtils.lerp(10, 20, 0.5); // Returns 15
```

### lerpVec(start, end, t)
Linearly interpolates between two vectors.

**Parameters:**
- `start` (vec2/vec3/vec4): Start vector
- `end` (vec2/vec3/vec4): End vector
- `t` (number): Interpolation factor (0-1)

**Example:**
```javascript
var startPos = new vec3(0, 0, 0);
var endPos = new vec3(10, 20, 30);
var midPos = MathUtils.lerpVec(startPos, endPos, 0.5); // Returns vec3(5, 10, 15)
```

### smoothStep(start, end, t)
Smoothly interpolates between two values using the Smoothstep function.

**Parameters:**
- `start` (number): Start value
- `end` (number): End value
- `t` (number): Interpolation factor (0-1)

**Example:**
```javascript
var smoothValue = MathUtils.smoothStep(0, 10, 0.5); // Returns 5, but with smoothed acceleration
```

### distance(a, b)
Calculates the distance between two points.

**Parameters:**
- `a` (vec2/vec3): First point
- `b` (vec2/vec3): Second point

**Example:**
```javascript
var dist = MathUtils.distance(new vec2(0, 0), new vec2(3, 4)); // Returns 5
```

### angleBetween(a, b)
Calculates the angle between two 2D vectors in radians.

**Parameters:**
- `a` (vec2): First vector
- `b` (vec2): Second vector

**Example:**
```javascript
var angle = MathUtils.angleBetween(new vec2(1, 0), new vec2(0, 1)); // Returns approximately 1.57 radians (90 degrees)
```

### degreesToRadians(degrees)
Converts degrees to radians.

**Parameters:**
- `degrees` (number): Angle in degrees

**Example:**
```javascript
var radians = MathUtils.degreesToRadians(90); // Returns approximately 1.57
```

### radiansToDegrees(radians)
Converts radians to degrees.

**Parameters:**
- `radians` (number): Angle in radians

**Example:**
```javascript
var degrees = MathUtils.radiansToDegrees(Math.PI); // Returns 180
```

### pointInRect(point, rectMin, rectMax)
Checks if a point is inside a rectangle.

**Parameters:**
- `point` (vec2): The point to check
- `rectMin` (vec2): Rectangle minimum point (top-left)
- `rectMax` (vec2): Rectangle maximum point (bottom-right)

**Example:**
```javascript
var isInside = MathUtils.pointInRect(
    new vec2(0.5, 0.5), // Point to check
    new vec2(0, 0),     // Rectangle min
    new vec2(1, 1)      // Rectangle max
); // Returns true
```

### random(min, max)
Returns a random number between min and max.

**Parameters:**
- `min` (number): Minimum value
- `max` (number): Maximum value

**Example:**
```javascript
var randomValue = MathUtils.random(10, 20); // Returns a number between 10 and 20
```

### randomInt(min, max)
Returns a random integer between min and max (inclusive).

**Parameters:**
- `min` (number): Minimum value
- `max` (number): Maximum value

**Example:**
```javascript
var diceRoll = MathUtils.randomInt(1, 6); // Returns 1, 2, 3, 4, 5, or 6
```

### randomItem(array)
Returns a random item from an array.

**Parameters:**
- `array` (Array): The array to pick from

**Example:**
```javascript
var colors = ["red", "green", "blue"];
var randomColor = MathUtils.randomItem(colors); // Returns one of the colors
```

### clamp(value, min, max)
Clamps a value between min and max.

**Parameters:**
- `value` (number): Value to clamp
- `min` (number): Minimum value
- `max` (number): Maximum value

**Example:**
```javascript
var clampedValue = MathUtils.clamp(150, 0, 100); // Returns 100
```

### ease(t, easingType)
Calculates eased value using various easing functions.

**Parameters:**
- `t` (number): Input value (0-1)
- `easingType` (string): Type of easing

**Supported Easing Types:**
- "linear" - Linear interpolation (no easing)
- "easeInQuad" - Quadratic easing in
- "easeOutQuad" - Quadratic easing out
- "easeInOutQuad" - Quadratic easing in/out
- "easeInCubic" - Cubic easing in
- "easeOutCubic" - Cubic easing out
- "easeInOutCubic" - Cubic easing in/out
- "easeInExpo" - Exponential easing in
- "easeOutExpo" - Exponential easing out
- "easeInOutExpo" - Exponential easing in/out

**Example:**
```javascript
var easedValue = MathUtils.ease(0.5, "easeOutQuad"); // Returns eased value at 50%
```

## Practical Examples

### Animating an Object's Position
```javascript
var MathUtils = require('./MathUtils.js');

// Starting and ending positions
var startPos = new vec3(0, 0, 0);
var endPos = new vec3(0, 10, 0);
var duration = 2.0; // seconds
var timer = 0;

// In the update function
function onUpdate(eventData) {
    timer += eventData.getDeltaTime();
    var t = MathUtils.clamp(timer / duration, 0, 1);
    
    // Apply easing for a smoother animation
    var easedT = MathUtils.ease(t, "easeOutCubic");
    
    // Calculate the new position
    var newPos = MathUtils.lerpVec(startPos, endPos, easedT);
    
    // Apply the position
    script.getSceneObject().getTransform().setLocalPosition(newPos);
}
```

### Creating a Camera Shake Effect
```javascript
var MathUtils = require('./MathUtils.js');

// Camera shake parameters
var shakeDuration = 0.5;
var shakeIntensity = 0.1;
var shakeTimer = 0;
var originalCameraPos = script.camera.getTransform().getLocalPosition();
var isShaking = false;

// Function to start the shake
function startCameraShake() {
    shakeTimer = 0;
    isShaking = true;
}

// Update function
function onUpdate(eventData) {
    if (!isShaking) return;
    
    shakeTimer += eventData.getDeltaTime();
    
    if (shakeTimer >= shakeDuration) {
        // Reset camera position when done
        script.camera.getTransform().setLocalPosition(originalCameraPos);
        isShaking = false;
        return;
    }
    
    // Calculate shake amount based on remaining time
    var shakeAmount = shakeIntensity * (1 - (shakeTimer / shakeDuration));
    
    // Generate random offset
    var offsetX = MathUtils.random(-shakeAmount, shakeAmount);
    var offsetY = MathUtils.random(-shakeAmount, shakeAmount);
    
    // Apply to camera
    var shakePos = new vec3(
        originalCameraPos.x + offsetX,
        originalCameraPos.y + offsetY,
        originalCameraPos.z
    );
    
    script.camera.getTransform().setLocalPosition(shakePos);
}
```

## Performance Considerations

- For performance-critical code, consider caching results of repetitive calculations
- The `ease` function has a small overhead from the switch statement; if you're using a specific easing function repeatedly, consider extracting just that function
- For very simple operations, Lens Studio's built-in math functions might be marginally faster