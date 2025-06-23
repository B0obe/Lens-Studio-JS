# GyroscopeController

A script that controls objects using device gyroscope and accelerometer data.

## Overview

The GyroscopeController component allows you to control object rotation and position using the device's motion sensors. It provides customizable settings for sensitivity, axis control, and smoothing.

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `targetObject` | SceneObject | Object to control (defaults to script's object if not set) |
| `controlMode` | String | How device motion affects the object ("rotation", "position", "both") |
| `xAxisEnabled` | Boolean | Enable X-axis control |
| `yAxisEnabled` | Boolean | Enable Y-axis control |
| `zAxisEnabled` | Boolean | Enable Z-axis control |
| `rotationSensitivity` | Number | Sensitivity for rotation control |
| `positionSensitivity` | Number | Sensitivity for position control |
| `smoothing` | Number | Smoothing factor (0-1, higher = smoother) |
| `invertXAxis` | Boolean | Invert X-axis control |
| `invertYAxis` | Boolean | Invert Y-axis control |
| `invertZAxis` | Boolean | Invert Z-axis control |
| `useLocalSpace` | Boolean | Control in local space instead of world space |
| `resetOnTap` | Boolean | Reset object transform when screen is tapped |
| `isActive` | Boolean | Whether gyroscope control is currently active |
| `debugMode` | Boolean | Show debug messages in Logger panel |

## Usage

1. Add the script to the object you want to control with device motion
2. Configure the control axes and sensitivity
3. Set the control mode (rotation, position, or both)
4. Customize additional options like axis inversion and smoothing

## Control Modes

### Rotation Mode
Uses the gyroscope to rotate the object based on device orientation changes.

### Position Mode
Uses the accelerometer to move the object based on device acceleration.

### Both Mode
Combines rotation and position control for full 6-degrees-of-freedom interaction.

## API Reference

### Methods

#### resetTransform()
Resets the object to its original transform values.

#### setCurrentAsOriginal()
Sets the current transform as the new original transform.

#### setEnabled(enabled)
Enables or disables gyroscope control.
- `enabled`: Whether to enable control

#### setControlMode(mode)
Sets the control mode.
- `mode`: Control mode ("rotation", "position", or "both")

#### setRotationSensitivity(sensitivity)
Sets the rotation sensitivity.
- `sensitivity`: New sensitivity value

#### setPositionSensitivity(sensitivity)
Sets the position sensitivity.
- `sensitivity`: New sensitivity value

#### setSmoothing(smoothing)
Sets the smoothing factor for motion data.
- `smoothing`: New smoothing value (0-1)

## Example

```javascript
// Get the GyroscopeController script
var gyroController = script.getSceneObject().getComponent("Component.ScriptComponent");

// Set to position-only mode
gyroController.api.setControlMode("position");

// Increase sensitivity for more responsive movement
gyroController.api.setPositionSensitivity(0.3);

// Add more smoothing for less jittery movement
gyroController.api.setSmoothing(0.5);

// Disable when not needed
gyroController.api.setEnabled(false);

// Later, re-enable when needed
gyroController.api.setEnabled(true);
```

## Motion Data Handling

The component processes two types of device motion data:

### Gyroscope
- Measures rotation rate in radians/second
- Used for rotation control
- Generally more stable for orientation tracking

### Accelerometer
- Measures acceleration in G's (gravitational force)
- Used for position control
- More sensitive to sudden movements

## Performance Considerations

- Higher smoothing values (0.5-0.8) create more stable but less responsive control
- Limiting enabled axes can improve performance and usability
- The position control mode may require more calibration to feel natural
- Using local space mode can sometimes be more intuitive for the user 