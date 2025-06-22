/**
 * SmileToColorCycle.js
 * 
 * @description This example demonstrates how to use SmileDetector and ColorCycler together.
 * When the user smiles, it activates a color cycling effect on materials.
 * The smile intensity controls the speed of the color cycling.
 * 
 * @requires SmileDetector.js
 * @requires ColorCycler.js
 * 
 * @usage
 * 1. Add this script to a Scene Object
 * 2. Add SmileDetector and ColorCycler scripts to the same Scene Object
 * 3. Configure the script references and settings
 */

// @input Component.ScriptComponent smileDetector /** Reference to the SmileDetector script */
// @input Component.ScriptComponent colorCycler /** Reference to the ColorCycler script */
// @input SceneObject feedbackText /** Optional text object to show status */
// @input float minCycleSpeed = 0.5 /** Minimum cycle speed */
// @input float maxCycleSpeed = 5.0 /** Maximum cycle speed */
// @input bool autoStart = true /** Start detecting smiles automatically */

// Script global variables
var isColorCycling = false;
var defaultCycleDuration = 0;
var smileIntensityThreshold = 0.1;  // Minimum smile intensity to maintain color cycling

/**
 * Initialize the script
 */
function initialize() {
    // Check required script references
    if (!script.smileDetector) {
        print("Error: SmileDetector reference not set");
        return;
    }
    
    if (!script.colorCycler) {
        print("Error: ColorCycler reference not set");
        return;
    }
    
    // Store the default cycle duration
    defaultCycleDuration = script.colorCycler.api.cycleDuration || 3.0;
    
    // Initially stop the color cycler
    script.colorCycler.api.stop();
    
    // Set up the smile detector callbacks
    setupSmileCallbacks();
    
    // Create update event for continuous monitoring
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
    
    // Set up feedback text if available
    updateFeedbackText("Smile to start color cycling!");
    
    // Start if autoStart is enabled
    if (script.autoStart) {
        print("SmileToColorCycle: Ready - smile to start color cycling!");
    }
}

/**
 * Set up callbacks for the smile detector
 */
function setupSmileCallbacks() {
    // When the user starts smiling
    script.smileDetector.api.onSmileStart = function(intensity) {
        startColorCycling(intensity);
    };
    
    // When the user stops smiling
    script.smileDetector.api.onSmileEnd = function() {
        stopColorCycling();
    };
}

/**
 * Start the color cycling effect
 */
function startColorCycling(intensity) {
    if (isColorCycling) return;
    
    isColorCycling = true;
    
    // Start the color cycler
    script.colorCycler.api.play();
    
    // Update the cycle speed based on smile intensity
    updateCycleSpeed(intensity);
    
    // Update feedback
    updateFeedbackText("Color cycling active!");
    
    print("SmileToColorCycle: Started color cycling with intensity " + intensity.toFixed(2));
}

/**
 * Stop the color cycling effect
 */
function stopColorCycling() {
    if (!isColorCycling) return;
    
    isColorCycling = false;
    
    // Stop the color cycler
    script.colorCycler.api.stop();
    
    // Update feedback
    updateFeedbackText("Smile to start color cycling!");
    
    print("SmileToColorCycle: Stopped color cycling");
}

/**
 * Update function called every frame
 */
function onUpdate() {
    // If color cycling is active, adjust the speed based on current smile intensity
    if (isColorCycling) {
        var currentIntensity = script.smileDetector.api.smileIntensity;
        
        if (currentIntensity >= smileIntensityThreshold) {
            // Update cycle speed based on current intensity
            updateCycleSpeed(currentIntensity);
        } else {
            // If smile intensity has dropped too low, stop color cycling
            stopColorCycling();
        }
    }
}

/**
 * Update the color cycle speed based on smile intensity
 */
function updateCycleSpeed(intensity) {
    // Map the smile intensity to the cycle duration (inverse relationship)
    // Higher intensity = faster cycling = lower duration
    var newDuration = mapRange(
        intensity,
        0.0, 1.0,
        script.maxCycleSpeed, script.minCycleSpeed
    );
    
    // Update the cycle speed
    script.colorCycler.api.setCycleDuration(newDuration);
}

/**
 * Update the feedback text if available
 */
function updateFeedbackText(message) {
    if (script.feedbackText) {
        var textComponent = script.feedbackText.getComponent("Component.Text");
        if (textComponent) {
            textComponent.text = message;
        }
    }
}

/**
 * Map a value from one range to another
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin) / (inMax - inMin)) + outMin;
}

/**
 * Set whether the controller is enabled
 */
function setEnabled(enabled) {
    if (enabled) {
        print("SmileToColorCycle: Enabled");
        updateFeedbackText("Smile to start color cycling!");
    } else {
        stopColorCycling();
        print("SmileToColorCycle: Disabled");
        updateFeedbackText("Color cycling disabled");
    }
}

// Initialize the script
initialize();

// Expose public API
script.api.setEnabled = setEnabled; 