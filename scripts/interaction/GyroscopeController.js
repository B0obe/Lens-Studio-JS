/**
 * GyroscopeController.js
 * 
 * @description Controls objects using device gyroscope and accelerometer data
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires SceneObject
 */

/**
 * GyroscopeController Script Component
 * This script lets you control objects using the device's motion sensors.
 * 
 * @usage
 * 1. Add this script to any object you want to control with device motion
 * 2. Configure the control axes and sensitivity
 * 3. Set control mode and additional options
 */
// @input SceneObject targetObject /** Object to control (defaults to script's object if not set) */
// @input string controlMode = "rotation" {"widget":"combobox", "values":[{"label":"Rotation", "value":"rotation"}, {"label":"Position", "value":"position"}, {"label":"Both", "value":"both"}]} /** How the device motion affects the object */
// @input bool xAxisEnabled = true /** Enable X-axis control */
// @input bool yAxisEnabled = true /** Enable Y-axis control */
// @input bool zAxisEnabled = true /** Enable Z-axis control */
// @input float rotationSensitivity = 1.0 /** Sensitivity for rotation control */
// @input float positionSensitivity = 0.1 /** Sensitivity for position control */
// @input float smoothing = 0.2 /** Smoothing factor (0-1, higher = smoother) */
// @input bool invertXAxis = false /** Invert X-axis control */
// @input bool invertYAxis = false /** Invert Y-axis control */
// @input bool invertZAxis = false /** Invert Z-axis control */
// @input bool useLocalSpace = true /** Control in local space instead of world space */
// @input bool resetOnTap = true /** Reset object transform when screen is tapped */
// @input bool isActive = true /** Whether gyroscope control is currently active */
// @input bool debugMode = false /** Show debug messages in logger */

// Script global variables
var originalPosition;
var originalRotation;
var currentRotation;
var currentPosition;
var lastGyroscopeData;
var lastAccelerometerData;
var isTouching = false;
var hasInitialReading = false;

/**
 * Initialize the script
 */
function initialize() {
    // If no target object specified, use the object this script is attached to
    if (!script.targetObject) {
        script.targetObject = script.getSceneObject();
    }
    
    // Store the original transform
    if (script.useLocalSpace) {
        originalPosition = script.targetObject.getTransform().getLocalPosition();
        originalRotation = script.targetObject.getTransform().getLocalRotation();
    } else {
        originalPosition = script.targetObject.getTransform().getWorldPosition();
        originalRotation = script.targetObject.getTransform().getWorldRotation();
    }
    
    // Initialize current transform values
    currentPosition = originalPosition.clone();
    currentRotation = originalRotation.clone();
    
    // Initialize sensor data placeholders
    lastGyroscopeData = new vec3(0, 0, 0);
    lastAccelerometerData = new vec3(0, 0, 0);
    
    if (script.debugMode) {
        print("GyroscopeController: Initialized with mode: " + script.controlMode);
    }
}

/**
 * Function called on each frame update
 */
function onUpdate(eventData) {
    if (!script.isActive) return;
    
    // Process gyroscope and accelerometer data
    processMotionData();
    
    // Apply the calculated transform
    applyTransform();
}

/**
 * Process device motion sensor data
 */
function processMotionData() {
    // Get gyroscope data (rotation rate in radians/second)
    var gyroData = global.deviceInfoSystem.getGyroscopeData();
    
    // Get accelerometer data (acceleration in G's)
    var accelData = global.deviceInfoSystem.getAccelerometerData();
    
    // Check if we have valid data
    if (!gyroData || !accelData) {
        if (script.debugMode && !hasInitialReading) {
            print("GyroscopeController: Waiting for valid motion sensor data...");
        }
        return;
    }
    
    hasInitialReading = true;
    
    // Convert gyro data to our coordinate system
    var gyroX = script.invertXAxis ? -gyroData.x : gyroData.x;
    var gyroY = script.invertYAxis ? -gyroData.y : gyroData.y;
    var gyroZ = script.invertZAxis ? -gyroData.z : gyroData.z;
    
    // Convert accelerometer data to our coordinate system
    var accelX = script.invertXAxis ? -accelData.x : accelData.x;
    var accelY = script.invertYAxis ? -accelData.y : accelData.y;
    var accelZ = script.invertZAxis ? -accelData.z : accelData.z;
    
    // Apply axis enables
    if (!script.xAxisEnabled) {
        gyroX = 0;
        accelX = 0;
    }
    
    if (!script.yAxisEnabled) {
        gyroY = 0;
        accelY = 0;
    }
    
    if (!script.zAxisEnabled) {
        gyroZ = 0;
        accelZ = 0;
    }
    
    // Apply smoothing
    var smoothFactor = Math.max(0, Math.min(1, script.smoothing));
    var oneMinusSmooth = 1.0 - smoothFactor;
    
    var smoothedGyro = new vec3(
        lastGyroscopeData.x * smoothFactor + gyroX * oneMinusSmooth,
        lastGyroscopeData.y * smoothFactor + gyroY * oneMinusSmooth,
        lastGyroscopeData.z * smoothFactor + gyroZ * oneMinusSmooth
    );
    
    var smoothedAccel = new vec3(
        lastAccelerometerData.x * smoothFactor + accelX * oneMinusSmooth,
        lastAccelerometerData.y * smoothFactor + accelY * oneMinusSmooth,
        lastAccelerometerData.z * smoothFactor + accelZ * oneMinusSmooth
    );
    
    // Store smoothed values for next frame
    lastGyroscopeData = smoothedGyro;
    lastAccelerometerData = smoothedAccel;
    
    // Update rotation based on gyroscope data
    if (script.controlMode === "rotation" || script.controlMode === "both") {
        updateRotation(smoothedGyro);
    }
    
    // Update position based on accelerometer data
    if (script.controlMode === "position" || script.controlMode === "both") {
        updatePosition(smoothedAccel);
    }
}

/**
 * Update rotation based on gyroscope data
 */
function updateRotation(gyroData) {
    // Get delta time to convert rate to angle change
    var deltaTime = getDeltaTime();
    
    // Create rotation quaternion from gyro data
    var rotX = quat.angleAxis(gyroData.x * deltaTime * script.rotationSensitivity, vec3.right());
    var rotY = quat.angleAxis(gyroData.y * deltaTime * script.rotationSensitivity, vec3.up());
    var rotZ = quat.angleAxis(gyroData.z * deltaTime * script.rotationSensitivity, vec3.forward());
    
    // Combine rotations
    var deltaRotation = quat.multiply(rotZ, quat.multiply(rotY, rotX));
    
    // Apply to current rotation
    currentRotation = quat.multiply(currentRotation, deltaRotation);
}

/**
 * Update position based on accelerometer data
 */
function updatePosition(accelData) {
    // Get delta time for position integration
    var deltaTime = getDeltaTime();
    
    // Create position offset from accelerometer data
    // We use accelerometer directly for a more immediate response
    var posOffset = new vec3(
        accelData.x * deltaTime * script.positionSensitivity,
        accelData.y * deltaTime * script.positionSensitivity,
        accelData.z * deltaTime * script.positionSensitivity
    );
    
    // Apply to current position
    currentPosition = currentPosition.add(posOffset);
    
    // Optional: Add limits to keep object within certain bounds
    limitPosition();
}

/**
 * Limit position to keep object within reasonable bounds
 */
function limitPosition() {
    // Calculate offset from original position
    var offset = currentPosition.sub(originalPosition);
    
    // Apply maximum offset limit
    var maxOffset = 5.0; // Maximum distance from original position
    
    if (offset.length > maxOffset) {
        offset = offset.normalize().mult(maxOffset);
        currentPosition = originalPosition.add(offset);
    }
}

/**
 * Apply the calculated transform to the target object
 */
function applyTransform() {
    var transform = script.targetObject.getTransform();
    
    // Apply rotation
    if (script.controlMode === "rotation" || script.controlMode === "both") {
        if (script.useLocalSpace) {
            transform.setLocalRotation(currentRotation);
        } else {
            transform.setWorldRotation(currentRotation);
        }
    }
    
    // Apply position
    if (script.controlMode === "position" || script.controlMode === "both") {
        if (script.useLocalSpace) {
            transform.setLocalPosition(currentPosition);
        } else {
            transform.setWorldPosition(currentPosition);
        }
    }
}

/**
 * Handle touch events
 */
function onTouchStart(eventData) {
    isTouching = true;
    
    if (script.resetOnTap) {
        resetTransform();
    }
}

/**
 * Handle touch end events
 */
function onTouchEnd(eventData) {
    isTouching = false;
}

/**
 * Reset object transform to original values
 */
function resetTransform() {
    currentPosition = originalPosition.clone();
    currentRotation = originalRotation.clone();
    
    if (script.debugMode) {
        print("GyroscopeController: Reset transform to original values");
    }
}

/**
 * Set original transform as current transform
 */
function setCurrentAsOriginal() {
    if (script.useLocalSpace) {
        originalPosition = script.targetObject.getTransform().getLocalPosition();
        originalRotation = script.targetObject.getTransform().getLocalRotation();
    } else {
        originalPosition = script.targetObject.getTransform().getWorldPosition();
        originalRotation = script.targetObject.getTransform().getWorldRotation();
    }
    
    currentPosition = originalPosition.clone();
    currentRotation = originalRotation.clone();
    
    if (script.debugMode) {
        print("GyroscopeController: Set current transform as original");
    }
}

/**
 * Enable or disable gyroscope control
 * @param {boolean} enabled - Whether to enable control
 */
function setEnabled(enabled) {
    script.isActive = enabled;
    
    if (script.debugMode) {
        print("GyroscopeController: " + (enabled ? "Enabled" : "Disabled"));
    }
}

/**
 * Set the control mode
 * @param {string} mode - Control mode ("rotation", "position", or "both")
 */
function setControlMode(mode) {
    if (mode === "rotation" || mode === "position" || mode === "both") {
        script.controlMode = mode;
        
        if (script.debugMode) {
            print("GyroscopeController: Set control mode to " + mode);
        }
    } else {
        print("GyroscopeController: ERROR - Invalid control mode: " + mode);
    }
}

/**
 * Set the rotation sensitivity
 * @param {number} sensitivity - New sensitivity value
 */
function setRotationSensitivity(sensitivity) {
    script.rotationSensitivity = Math.max(0, sensitivity);
    
    if (script.debugMode) {
        print("GyroscopeController: Set rotation sensitivity to " + sensitivity);
    }
}

/**
 * Set the position sensitivity
 * @param {number} sensitivity - New sensitivity value
 */
function setPositionSensitivity(sensitivity) {
    script.positionSensitivity = Math.max(0, sensitivity);
    
    if (script.debugMode) {
        print("GyroscopeController: Set position sensitivity to " + sensitivity);
    }
}

/**
 * Set the smoothing factor
 * @param {number} smoothing - New smoothing value (0-1)
 */
function setSmoothing(smoothing) {
    script.smoothing = Math.max(0, Math.min(1, smoothing));
    
    if (script.debugMode) {
        print("GyroscopeController: Set smoothing to " + smoothing);
    }
}

/**
 * Helper function to get delta time
 */
function getDeltaTime() {
    return 1.0 / 30.0; // Fallback to 30fps
}

// Initialize on script load
initialize();

// Bind to update event
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

// Bind to touch events
var touchStartEvent = script.createEvent("TouchStartEvent");
touchStartEvent.bind(onTouchStart);

var touchEndEvent = script.createEvent("TouchEndEvent");
touchEndEvent.bind(onTouchEnd);

// Expose public API
script.api.resetTransform = resetTransform;
script.api.setCurrentAsOriginal = setCurrentAsOriginal;
script.api.setEnabled = setEnabled;
script.api.setControlMode = setControlMode;
script.api.setRotationSensitivity = setRotationSensitivity;
script.api.setPositionSensitivity = setPositionSensitivity;
script.api.setSmoothing = setSmoothing;