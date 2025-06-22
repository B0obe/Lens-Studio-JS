# Lens Studio JS

A collection of reusable JavaScript scripts for Snapchat's Lens Studio.

## Overview

This library provides a set of modular, customizable scripts to help Lens Studio developers create engaging AR experiences more efficiently. Each script is designed to be easy to use, well-documented, and optimized for performance.

## Categories

### Animation
- **BouncingObject**: Create realistic bouncing animations for objects
- **Oscillator**: Generate smooth oscillating movements along specified axes

### Face
- **BlinkDetector**: Detect eye blinks and trigger events
- **FaceEffects**: Apply various effects to tracked faces
- **SmileDetector**: Detect smile expressions and trigger events
- **FaceDistortion**: Create dynamic face distortion effects with customizable parameters
- **FaceExpressionTrigger**: Trigger events based on facial expressions like smile, kiss, eyebrow raise, etc.

### Interaction
- **DragObject**: Make objects draggable with touch
- **SwipeDetector**: Detect swipe gestures in four directions
- **TouchGesture**: Detect and handle various touch gestures like tap, double tap, long press, swipe, pinch, and rotate

### Utility
- **MathUtils**: Common math utilities and helper functions
- **CameraController**: Control camera movement, transitions, and effects

### Visual
- **ColorCycler**: Animate colors through custom sequences
- **ParticleEmitter**: Create customizable particle effects

### World
- **SurfaceTracker**: Track surfaces and place objects in AR

## Installation

1. Clone or download this repository
2. Copy the scripts you need into your Lens Studio project
3. Import the scripts in your project

## Usage

Each script includes detailed documentation on how to use it. Generally, you'll need to:

1. Add the script to a Scene Object
2. Configure the script parameters in the Inspector
3. Use the script's API to control its behavior

Example:

```javascript
// Get a reference to the script component
var bouncingObject = script.getSceneObject().getComponent("Component.ScriptComponent");

// Use the script's API
bouncingObject.api.bounce();
```

## Examples

Check out the `examples` folder for sample projects demonstrating how to use these scripts:

- **BlinkToBounce**: Makes an object bounce when the user blinks
- **SmileToColorCycle**: Changes object colors when the user smiles

## Documentation

Detailed documentation for each script can be found in the `docs` folder.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Bandar Al-Otibie - [Portfolio](https://bento.me/b0obe)

## Acknowledgements

- Snapchat's Lens Studio team for creating an amazing platform
- The Lens Creator community for inspiration and support 