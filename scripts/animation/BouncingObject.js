/**
 * BouncingObject.js
 * 
 * @description Adds a natural bouncing animation to an object along specified axes
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires SceneObject
 */

/**
 * BouncingObject Script Component
 * This script adds a natural bouncing effect to any object it's attached to.
 * 
 * @usage
 * 1. Add this script to any object you want to have a bouncing effect
 * 2. Configure the amplitude, frequency, and axes to affect the bounce behavior
 * 3. Use the isActive property to enable/disable the bouncing effect when needed
 */
// @input SceneObject targetObject /** Object to apply the bouncing effect to (defaults to self if not set) */
// @input bool bounceX = false /** Whether to bounce on X axis */
// @input bool bounceY = true /** Whether to bounce on Y axis */
// @input bool bounceZ = false /** Whether to bounce on Z axis */
// @input float amplitude = 10.0 /** Bounce height in scene units */
// @input float frequency = 2.0 /** Bounce frequency (bounces per second) */
// @input float phaseOffset = 0.0 /** Starting phase offset (0-1) */
// @input bool useLocalSpace = true /** Whether to apply bounce in local space */
// @input bool isActive = true /** Whether the bounce effect is active */
// @input bool randomizeStart = false /** Start at random phase in the bounce cycle */

// Script global variables
var originalPosition;
var time = 0;

/**
 * Initialize the script
 */
function initialize() {
    // If no target object specified, use the object this script is attached to
    if (!script.targetObject) {
        script.targetObject = script.getSceneObject();
    }
    
    // Store the original position
    originalPosition = script.useLocalSpace ? 
        script.targetObject.getLocalPosition() : 
        script.targetObject.getTransform().getWorldPosition();
    
    // Randomize starting phase if enabled
    if (script.randomizeStart) {
        time = Math.random() * (Math.PI * 2);
    } else {
        time = script.phaseOffset * Math.PI * 2;
    }
}

/**
 * Function called on each frame update
 */
function onUpdate(eventData) {
    if (!script.isActive) return;
    
    // Calculate elapsed time and update bounce
    time += eventData.getDeltaTime() * script.frequency * Math.PI * 2;
    updateBounce();
}

/**
 * Updates object position based on bounce settings
 */
function updateBounce() {
    // Calculate the bounce offset using sine wave
    var bounceValue = Math.sin(time) * script.amplitude;
    
    // Create the bounce position offset vector
    var bounceOffset = new vec3(
        script.bounceX ? bounceValue : 0,
        script.bounceY ? bounceValue : 0,
        script.bounceZ ? bounceValue : 0
    );
    
    // Apply the bounce offset to the original position
    if (script.useLocalSpace) {
        script.targetObject.setLocalPosition(originalPosition.add(bounceOffset));
    } else {
        script.targetObject.getTransform().setWorldPosition(originalPosition.add(bounceOffset));
    }
}

/**
 * Set the bounce amplitude
 * @param {number} newAmplitude - The new amplitude value
 */
function setAmplitude(newAmplitude) {
    script.amplitude = newAmplitude;
}

/**
 * Set the bounce frequency
 * @param {number} newFrequency - The new frequency value
 */
function setFrequency(newFrequency) {
    script.frequency = newFrequency;
}

/**
 * Enable or disable the bouncing effect
 * @param {boolean} isEnabled - Whether to enable the bouncing
 */
function setEnabled(isEnabled) {
    script.isActive = isEnabled;
    
    // Reset position when disabled
    if (!isEnabled) {
        if (script.useLocalSpace) {
            script.targetObject.setLocalPosition(originalPosition);
        } else {
            script.targetObject.getTransform().setWorldPosition(originalPosition);
        }
    }
}

// Initialize on script load
initialize();

// Bind to update event
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

// Expose public API
script.api.setAmplitude = setAmplitude;
script.api.setFrequency = setFrequency;
script.api.setEnabled = setEnabled; 