# Examples

This folder contains example scripts that demonstrate how to use the components in the Lens Studio JS library.

## Available Examples

### BlinkToBounce.js

This example demonstrates how to use the `BlinkDetector.js` script together with the `BouncingObject.js` script to create an interactive effect where objects bounce when the user blinks.

**Features:**
- Detects left eye, right eye, and both eyes blinking separately
- Makes different objects bounce based on which eye(s) blinked
- Configurable bounce duration, amplitude, and frequency
- Shows how to connect script APIs together

**Setup Instructions:**
1. Add the `BlinkDetector.js` script to an object in your scene
2. Add the `BouncingObject.js` script to three different objects you want to bounce
3. Add the `BlinkToBounce.js` script to any object in your scene
4. Configure the parameters to reference your BlinkDetector and BouncingObject objects
5. Run your lens and try blinking each eye separately or both eyes together

**Learn about:**
- How to get script APIs from other scripts
- How to set up callbacks for events
- How to schedule delayed actions
- How to conditionally trigger effects

### SmileToColorCycle.js
Shows how to use `SmileDetector` with `ColorCycler` to create materials that change color when the user smiles. The intensity of the smile controls how fast the colors cycle.

### TweenExample.js
Shows how to use the `TweenUtils` script to create various animations with different easing functions. Demonstrates scale, position, and rotation animations as well as how to chain multiple animations together.

**Features:**
- Multiple animation types (scale, position, rotation)
- Different easing functions for each animation
- Ping-pong (yoyo) animations
- Chained animations using callbacks
- Tap to restart all animations

**Setup Instructions:**
1. Add the `TweenUtils.js` script to an object in your scene
2. Add the `TweenExample.js` script to any object in your scene
3. Create three objects (cube, sphere, cylinder) to animate
4. Configure the script parameters to reference the TweenUtils script and the objects
5. Run your lens and tap the screen to see the animations

**Learn about:**
- How to use different easing functions
- How to animate different properties (position, scale, rotation)
- How to chain multiple animations
- How to create looping and ping-pong animations

## Setting up Examples

To use these examples:

1. Add the required script components to your scene (mentioned in each example's header comments)
2. Add the example script to your scene
3. Connect the required script references in the Inspector panel
4. Configure any additional parameters

## Creating Your Own

These examples are designed to show how multiple components can work together. Feel free to modify them or create your own combinations using the components provided in this library!

## How to Use

1. Create a new Lens Studio project
2. Import the necessary scripts from the `scripts` folder
3. Copy the example script you want to use into your project
4. Set up the required Scene Objects as described in the example comments
5. Configure the script parameters in the Inspector panel
6. Test the Lens to see the script in action

## Creating Your Own Examples

If you create an interesting example using these scripts, consider contributing it back to the project. See the [CONTRIBUTING.md](../CONTRIBUTING.md) file for guidelines on how to contribute. 