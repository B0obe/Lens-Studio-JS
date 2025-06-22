/**
 * Oscillator.js
 * 
 * @description Create smooth oscillating movements along specified axes
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * Oscillator Script Component
 * This script creates smooth oscillating movements for Scene Objects.
 * It supports multiple oscillation types and can affect position, rotation, or scale.
 * 
 * @usage
 * 1. Add this script to any Scene Object
 * 2. Configure oscillation parameters
 * 3. Start the oscillation with the play() method or enable autoStart
 */
// @input string transformProperty = "position" {"widget":"combobox", "values":[{"value":"position", "label":"Position"}, {"value":"rotation", "label":"Rotation"}, {"value":"scale", "label":"Scale"}]} /** Property to oscillate */
// @input string oscillationType = "sine" {"widget":"combobox", "values":[{"value":"sine", "label":"Sine"}, {"value":"cosine", "label":"Cosine"}, {"value":"triangle", "label":"Triangle"}, {"value":"square", "label":"Square"}, {"value":"sawtooth", "label":"Sawtooth"}, {"value":"bounce", "label":"Bounce"}]} /** Type of oscillation */
// @input vec3 amplitude = {x: 0, y: 10, z: 0} /** Oscillation amplitude (distance/degrees/scale) */
// @input vec3 frequency = {x: 1, y: 1, z: 1} /** Oscillation frequency (cycles per second) */
// @input vec3 phase = {x: 0, y: 0, z: 0} /** Phase offset (0-1) */
// @input bool localSpace = true /** Use local space instead of world space */
// @input bool addToOriginal = true /** Add to original transform instead of replacing */
// @input bool autoStart = true /** Start oscillating automatically */
// @input bool useFixedSpeed = false /** Use fixed speed regardless of framerate */
// @input bool useUnscaledTime = false /** Use unscaled time (ignores time multiplier) */

// Script global variables
var isPlaying = false;
var startTime = 0;
var originalPosition = null;
var originalRotation = null;
var originalScale = null;
var transform = null;

/**
 * Initialize the script
 */
function initialize() {
    // Get the transform component
    transform = script.getSceneObject().getTransform();
    
    // Store original transform values
    storeOriginalTransform();
    
    // Start oscillating if auto-start is enabled
    if (script.autoStart) {
        play();
    }
}

/**
 * Store the original transform values
 */
function storeOriginalTransform() {
    if (script.localSpace) {
        originalPosition = transform.getLocalPosition();
        originalRotation = transform.getLocalRotation();
        originalScale = transform.getLocalScale();
    } else {
        originalPosition = transform.getWorldPosition();
        originalRotation = transform.getWorldRotation();
        originalScale = transform.getWorldScale();
    }
}

/**
 * Start oscillating
 */
function play() {
    if (isPlaying) return;
    
    isPlaying = true;
    startTime = getTime();
    
    // Create update event if needed
    if (!script.updateEvent) {
        script.updateEvent = script.createEvent("UpdateEvent");
        script.updateEvent.bind(onUpdate);
    }
}

/**
 * Stop oscillating
 */
function stop() {
    if (!isPlaying) return;
    
    isPlaying = false;
}

/**
 * Reset to original transform
 */
function reset() {
    stop();
    
    // Reset to original transform
    if (script.localSpace) {
        transform.setLocalPosition(originalPosition);
        transform.setLocalRotation(originalRotation);
        transform.setLocalScale(originalScale);
    } else {
        transform.setWorldPosition(originalPosition);
        transform.setWorldRotation(originalRotation);
        transform.setWorldScale(originalScale);
    }
}

/**
 * Update function called every frame
 */
function onUpdate(eventData) {
    if (!isPlaying) return;
    
    // Get current time
    var currentTime = getTime() - startTime;
    var deltaTime = script.useFixedSpeed ? 1/30 : eventData.getDeltaTime();
    
    // Calculate oscillation values
    var oscillationValues = calculateOscillation(currentTime);
    
    // Apply oscillation to the appropriate transform property
    applyOscillation(oscillationValues);
}

/**
 * Calculate oscillation values based on current time
 * @param {number} time - Current time in seconds
 * @returns {vec3} - Oscillation values for x, y, z
 */
function calculateOscillation(time) {
    var x = calculateOscillationForAxis(time, script.frequency.x, script.phase.x) * script.amplitude.x;
    var y = calculateOscillationForAxis(time, script.frequency.y, script.phase.y) * script.amplitude.y;
    var z = calculateOscillationForAxis(time, script.frequency.z, script.phase.z) * script.amplitude.z;
    
    return new vec3(x, y, z);
}

/**
 * Calculate oscillation value for a single axis
 * @param {number} time - Current time in seconds
 * @param {number} frequency - Oscillation frequency
 * @param {number} phase - Phase offset (0-1)
 * @returns {number} - Oscillation value (-1 to 1)
 */
function calculateOscillationForAxis(time, frequency, phase) {
    var t = (time * frequency) + phase;
    
    switch (script.oscillationType) {
        case "sine":
            return Math.sin(t * Math.PI * 2);
            
        case "cosine":
            return Math.cos(t * Math.PI * 2);
            
        case "triangle":
            var normalizedT = t % 1;
            return normalizedT < 0.5 ? 
                4 * normalizedT - 1 : 
                3 - 4 * normalizedT;
            
        case "square":
            return (t % 1) < 0.5 ? 1 : -1;
            
        case "sawtooth":
            return ((t % 1) * 2) - 1;
            
        case "bounce":
            var normalizedT = t % 1;
            return 1 - Math.abs(Math.sin(normalizedT * Math.PI * 4)) * 0.75;
            
        default:
            return Math.sin(t * Math.PI * 2);
    }
}

/**
 * Apply oscillation values to the transform
 * @param {vec3} oscillationValues - Oscillation values for x, y, z
 */
function applyOscillation(oscillationValues) {
    switch (script.transformProperty) {
        case "position":
            applyPositionOscillation(oscillationValues);
            break;
            
        case "rotation":
            applyRotationOscillation(oscillationValues);
            break;
            
        case "scale":
            applyScaleOscillation(oscillationValues);
            break;
    }
}

/**
 * Apply oscillation to position
 * @param {vec3} oscillationValues - Oscillation values for x, y, z
 */
function applyPositionOscillation(oscillationValues) {
    var newPosition;
    
    if (script.addToOriginal) {
        newPosition = originalPosition.add(oscillationValues);
    } else {
        newPosition = oscillationValues;
    }
    
    if (script.localSpace) {
        transform.setLocalPosition(newPosition);
    } else {
        transform.setWorldPosition(newPosition);
    }
}

/**
 * Apply oscillation to rotation
 * @param {vec3} oscillationValues - Oscillation values for x, y, z (in degrees)
 */
function applyRotationOscillation(oscillationValues) {
    // Convert oscillation values from degrees to radians
    var oscillationRadians = new vec3(
        oscillationValues.x * Math.PI / 180,
        oscillationValues.y * Math.PI / 180,
        oscillationValues.z * Math.PI / 180
    );
    
    var newRotation;
    
    if (script.addToOriginal) {
        // Create quaternion from euler angles
        var oscillationQuat = quat.fromEulerAngles(
            oscillationRadians.x,
            oscillationRadians.y,
            oscillationRadians.z
        );
        
        // Multiply with original rotation
        newRotation = originalRotation.multiply(oscillationQuat);
    } else {
        // Create quaternion directly from euler angles
        newRotation = quat.fromEulerAngles(
            oscillationRadians.x,
            oscillationRadians.y,
            oscillationRadians.z
        );
    }
    
    if (script.localSpace) {
        transform.setLocalRotation(newRotation);
    } else {
        transform.setWorldRotation(newRotation);
    }
}

/**
 * Apply oscillation to scale
 * @param {vec3} oscillationValues - Oscillation values for x, y, z
 */
function applyScaleOscillation(oscillationValues) {
    var newScale;
    
    if (script.addToOriginal) {
        newScale = originalScale.add(oscillationValues);
    } else {
        newScale = oscillationValues;
    }
    
    // Ensure scale doesn't go negative
    newScale.x = Math.max(0.001, newScale.x);
    newScale.y = Math.max(0.001, newScale.y);
    newScale.z = Math.max(0.001, newScale.z);
    
    if (script.localSpace) {
        transform.setLocalScale(newScale);
    } else {
        transform.setWorldScale(newScale);
    }
}

/**
 * Get current time in seconds
 * @returns {number} - Current time in seconds
 */
function getTime() {
    if (script.useUnscaledTime) {
        return script.getTime !== undefined ? script.getTime() : getTimeInSeconds();
    } else {
        return getScaledTime();
    }
}

/**
 * Get scaled time (affected by time multiplier)
 * @returns {number} - Scaled time in seconds
 */
function getScaledTime() {
    return script.getSceneTime !== undefined ? script.getSceneTime() : getTimeInSeconds();
}

/**
 * Fallback time function in case getTime is not available
 * @returns {number} - Time in seconds
 */
function getTimeInSeconds() {
    return new Date().getTime() / 1000;
}

/**
 * Set the oscillation amplitude
 * @param {vec3} newAmplitude - New amplitude values
 */
function setAmplitude(newAmplitude) {
    script.amplitude = newAmplitude;
}

/**
 * Set the oscillation frequency
 * @param {vec3} newFrequency - New frequency values
 */
function setFrequency(newFrequency) {
    script.frequency = newFrequency;
}

/**
 * Set the oscillation phase
 * @param {vec3} newPhase - New phase values
 */
function setPhase(newPhase) {
    script.phase = newPhase;
}

/**
 * Set the oscillation type
 * @param {string} type - Oscillation type (sine, cosine, triangle, square, sawtooth, bounce)
 */
function setOscillationType(type) {
    var validTypes = ["sine", "cosine", "triangle", "square", "sawtooth", "bounce"];
    
    if (validTypes.indexOf(type) !== -1) {
        script.oscillationType = type;
    } else {
        print("Oscillator: Invalid oscillation type. Using 'sine' instead.");
        script.oscillationType = "sine";
    }
}

/**
 * Set the transform property to oscillate
 * @param {string} property - Transform property (position, rotation, scale)
 */
function setTransformProperty(property) {
    var validProperties = ["position", "rotation", "scale"];
    
    if (validProperties.indexOf(property) !== -1) {
        script.transformProperty = property;
    } else {
        print("Oscillator: Invalid transform property. Using 'position' instead.");
        script.transformProperty = "position";
    }
}

// Initialize on script load
initialize();

// Expose public API
script.api.play = play;
script.api.stop = stop;
script.api.reset = reset;
script.api.setAmplitude = setAmplitude;
script.api.setFrequency = setFrequency;
script.api.setPhase = setPhase;
script.api.setOscillationType = setOscillationType;
script.api.setTransformProperty = setTransformProperty; 