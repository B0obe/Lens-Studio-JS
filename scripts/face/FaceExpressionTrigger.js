/**
 * FaceExpressionTrigger.js
 * 
 * @description Trigger events based on facial expressions like smile, kiss, eyebrow raise, etc.
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires FaceTracking
 */

/**
 * FaceExpressionTrigger Script Component
 * This script detects various facial expressions and triggers events when they occur.
 * It supports multiple expressions and provides intensity values for each.
 * 
 * @usage
 * 1. Add this script to any Scene Object
 * 2. Configure which expressions to detect and their thresholds
 * 3. Use the onExpressionTriggered event to respond to detected expressions
 */
// @input int faceIndex = 0 /** Face to track (0 is first face) */
// @input bool detectSmile = true /** Detect smile expression */
// @input float smileThreshold = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01, "showIf":"detectSmile"} /** Threshold for smile detection */
// @input bool detectKiss = true /** Detect kiss/pucker expression */
// @input float kissThreshold = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01, "showIf":"detectKiss"} /** Threshold for kiss detection */
// @input bool detectEyebrowRaise = true /** Detect eyebrow raise expression */
// @input float eyebrowRaiseThreshold = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01, "showIf":"detectEyebrowRaise"} /** Threshold for eyebrow raise detection */
// @input bool detectEyeClose = true /** Detect eye close/blink expression */
// @input float eyeCloseThreshold = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01, "showIf":"detectEyeClose"} /** Threshold for eye close detection */
// @input bool detectJawOpen = true /** Detect jaw open/mouth open expression */
// @input float jawOpenThreshold = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01, "showIf":"detectJawOpen"} /** Threshold for jaw open detection */
// @input bool detectCheekPuff = true /** Detect cheek puff expression */
// @input float cheekPuffThreshold = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01, "showIf":"detectCheekPuff"} /** Threshold for cheek puff detection */
// @input bool detectNoseSneer = true /** Detect nose sneer expression */
// @input float noseSneerThreshold = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01, "showIf":"detectNoseSneer"} /** Threshold for nose sneer detection */
// @input float triggerCooldown = 0.5 /** Time in seconds before the same expression can trigger again */
// @input bool continuousEvents = false /** Continuously trigger events while expression is held */
// @input float continuousEventInterval = 0.1 {"showIf":"continuousEvents"} /** Interval in seconds for continuous events */
// @input bool requireFaceVisible = true /** Only trigger when face is visible */
// @input bool debugMode = false /** Show debug messages */

// Script global variables
var initialized = false;
var faceTracking = null;
var lastTriggerTimes = {};
var expressionStates = {};
var continuousEventTimers = {};
var isFaceVisible = false;

/**
 * Initialize the script
 */
function initialize() {
    if (initialized) return;
    
    // Check if face tracking is available
    if (!global.FaceTracking) {
        print("FaceExpressionTrigger: ERROR - Face tracking is not available");
        return;
    }
    
    faceTracking = global.FaceTracking;
    
    // Create update event
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
    
    // Initialize expression states and trigger times
    initializeExpressionStates();
    
    initialized = true;
    
    if (script.debugMode) {
        print("FaceExpressionTrigger: Initialized for face index " + script.faceIndex);
    }
}

/**
 * Initialize expression states and trigger times
 */
function initializeExpressionStates() {
    // Initialize expression states (false = not active)
    expressionStates = {
        smile: false,
        kiss: false,
        eyebrowRaise: false,
        eyeClose: false,
        jawOpen: false,
        cheekPuff: false,
        noseSneer: false
    };
    
    // Initialize last trigger times
    lastTriggerTimes = {
        smile: 0,
        kiss: 0,
        eyebrowRaise: 0,
        eyeClose: 0,
        jawOpen: 0,
        cheekPuff: 0,
        noseSneer: 0
    };
    
    // Initialize continuous event timers
    continuousEventTimers = {
        smile: null,
        kiss: null,
        eyebrowRaise: null,
        eyeClose: null,
        jawOpen: null,
        cheekPuff: null,
        noseSneer: null
    };
}

/**
 * Update function called every frame
 */
function onUpdate() {
    if (!initialized || !faceTracking) return;
    
    // Check if face is being tracked
    isFaceVisible = faceTracking.isTrackingSupported() && faceTracking.isTracking(script.faceIndex);
    
    if (script.requireFaceVisible && !isFaceVisible) {
        // Reset all expression states when face is not visible
        resetExpressionStates();
        return;
    }
    
    // Check each enabled expression
    if (script.detectSmile) {
        checkExpression("smile", getSmileIntensity());
    }
    
    if (script.detectKiss) {
        checkExpression("kiss", getKissIntensity());
    }
    
    if (script.detectEyebrowRaise) {
        checkExpression("eyebrowRaise", getEyebrowRaiseIntensity());
    }
    
    if (script.detectEyeClose) {
        checkExpression("eyeClose", getEyeCloseIntensity());
    }
    
    if (script.detectJawOpen) {
        checkExpression("jawOpen", getJawOpenIntensity());
    }
    
    if (script.detectCheekPuff) {
        checkExpression("cheekPuff", getCheekPuffIntensity());
    }
    
    if (script.detectNoseSneer) {
        checkExpression("noseSneer", getNoseSneerIntensity());
    }
}

/**
 * Check if an expression is active and trigger events if needed
 * @param {string} expression - Name of the expression
 * @param {number} intensity - Current intensity of the expression (0-1)
 */
function checkExpression(expression, intensity) {
    var threshold = getThresholdForExpression(expression);
    var currentTime = getTime();
    var cooldownPassed = currentTime - lastTriggerTimes[expression] >= script.triggerCooldown;
    
    if (intensity >= threshold) {
        // Expression is active
        if (!expressionStates[expression]) {
            // Expression just became active
            expressionStates[expression] = true;
            
            if (cooldownPassed) {
                // Trigger the expression event
                triggerExpression(expression, intensity, "started");
                lastTriggerTimes[expression] = currentTime;
                
                // Set up continuous events if enabled
                if (script.continuousEvents) {
                    setupContinuousEvents(expression);
                }
            }
        } else if (script.continuousEvents) {
            // Expression is still active, continuous events are handled by timers
            // We don't need to do anything here
        }
    } else {
        // Expression is not active
        if (expressionStates[expression]) {
            // Expression just became inactive
            expressionStates[expression] = false;
            
            // Trigger the expression ended event
            triggerExpression(expression, intensity, "ended");
            
            // Clear continuous event timer
            clearContinuousEvents(expression);
        }
    }
}

/**
 * Set up continuous events for an expression
 * @param {string} expression - Name of the expression
 */
function setupContinuousEvents(expression) {
    // Clear any existing timer
    clearContinuousEvents(expression);
    
    // Create a new timer
    continuousEventTimers[expression] = script.createEvent("DelayedCallbackEvent");
    continuousEventTimers[expression].bind(function() {
        if (expressionStates[expression]) {
            // Get current intensity
            var currentIntensity = getExpressionIntensity(expression);
            
            // Trigger the continuous event
            triggerExpression(expression, currentIntensity, "continuous");
            
            // Reset the timer for the next event
            continuousEventTimers[expression].reset(script.continuousEventInterval);
        }
    });
    continuousEventTimers[expression].reset(script.continuousEventInterval);
}

/**
 * Clear continuous events for an expression
 * @param {string} expression - Name of the expression
 */
function clearContinuousEvents(expression) {
    if (continuousEventTimers[expression]) {
        script.removeEvent(continuousEventTimers[expression]);
        continuousEventTimers[expression] = null;
    }
}

/**
 * Reset all expression states
 */
function resetExpressionStates() {
    for (var expression in expressionStates) {
        if (expressionStates[expression]) {
            // If expression was active, trigger ended event
            expressionStates[expression] = false;
            triggerExpression(expression, 0, "ended");
            clearContinuousEvents(expression);
        }
    }
}

/**
 * Trigger an expression event
 * @param {string} expression - Name of the expression
 * @param {number} intensity - Intensity of the expression (0-1)
 * @param {string} state - State of the expression (started, continuous, ended)
 */
function triggerExpression(expression, intensity, state) {
    // Create event data
    var eventData = {
        expression: expression,
        intensity: intensity,
        state: state,
        faceIndex: script.faceIndex,
        time: getTime()
    };
    
    // Log if debug mode is enabled
    if (script.debugMode) {
        print("FaceExpressionTrigger: " + expression + " " + state + " with intensity " + intensity.toFixed(2));
    }
    
    // Trigger the onExpressionTriggered event
    if (script.api.onExpressionTriggered) {
        script.api.onExpressionTriggered(eventData);
    }
    
    // Trigger specific expression event if it exists
    var eventName = "on" + capitalizeFirstLetter(expression) + capitalizeFirstLetter(state);
    if (script.api[eventName]) {
        script.api[eventName](intensity);
    }
}

/**
 * Get the threshold for a specific expression
 * @param {string} expression - Name of the expression
 * @returns {number} - Threshold value
 */
function getThresholdForExpression(expression) {
    switch (expression) {
        case "smile":
            return script.smileThreshold;
        case "kiss":
            return script.kissThreshold;
        case "eyebrowRaise":
            return script.eyebrowRaiseThreshold;
        case "eyeClose":
            return script.eyeCloseThreshold;
        case "jawOpen":
            return script.jawOpenThreshold;
        case "cheekPuff":
            return script.cheekPuffThreshold;
        case "noseSneer":
            return script.noseSneerThreshold;
        default:
            return 0.5;
    }
}

/**
 * Get the current intensity of a specific expression
 * @param {string} expression - Name of the expression
 * @returns {number} - Expression intensity (0-1)
 */
function getExpressionIntensity(expression) {
    switch (expression) {
        case "smile":
            return getSmileIntensity();
        case "kiss":
            return getKissIntensity();
        case "eyebrowRaise":
            return getEyebrowRaiseIntensity();
        case "eyeClose":
            return getEyeCloseIntensity();
        case "jawOpen":
            return getJawOpenIntensity();
        case "cheekPuff":
            return getCheekPuffIntensity();
        case "noseSneer":
            return getNoseSneerIntensity();
        default:
            return 0;
    }
}

/**
 * Get smile intensity
 * @returns {number} - Smile intensity (0-1)
 */
function getSmileIntensity() {
    if (!isFaceVisible) return 0;
    
    // Get smile intensity from face tracking
    return faceTracking.getBlendshapeIntensity(script.faceIndex, "mouthSmile");
}

/**
 * Get kiss/pucker intensity
 * @returns {number} - Kiss intensity (0-1)
 */
function getKissIntensity() {
    if (!isFaceVisible) return 0;
    
    // Get kiss intensity from face tracking
    return faceTracking.getBlendshapeIntensity(script.faceIndex, "mouthPucker");
}

/**
 * Get eyebrow raise intensity
 * @returns {number} - Eyebrow raise intensity (0-1)
 */
function getEyebrowRaiseIntensity() {
    if (!isFaceVisible) return 0;
    
    // Get eyebrow raise intensity from face tracking (average of inner and outer)
    var innerRaise = faceTracking.getBlendshapeIntensity(script.faceIndex, "browInnerUp");
    var leftOuterRaise = faceTracking.getBlendshapeIntensity(script.faceIndex, "browOuterUpLeft");
    var rightOuterRaise = faceTracking.getBlendshapeIntensity(script.faceIndex, "browOuterUpRight");
    
    return (innerRaise + (leftOuterRaise + rightOuterRaise) / 2) / 2;
}

/**
 * Get eye close intensity
 * @returns {number} - Eye close intensity (0-1)
 */
function getEyeCloseIntensity() {
    if (!isFaceVisible) return 0;
    
    // Get eye close intensity from face tracking (average of both eyes)
    var leftEyeClose = faceTracking.getBlendshapeIntensity(script.faceIndex, "eyeBlinkLeft");
    var rightEyeClose = faceTracking.getBlendshapeIntensity(script.faceIndex, "eyeBlinkRight");
    
    return (leftEyeClose + rightEyeClose) / 2;
}

/**
 * Get jaw open intensity
 * @returns {number} - Jaw open intensity (0-1)
 */
function getJawOpenIntensity() {
    if (!isFaceVisible) return 0;
    
    // Get jaw open intensity from face tracking
    return faceTracking.getBlendshapeIntensity(script.faceIndex, "jawOpen");
}

/**
 * Get cheek puff intensity
 * @returns {number} - Cheek puff intensity (0-1)
 */
function getCheekPuffIntensity() {
    if (!isFaceVisible) return 0;
    
    // Get cheek puff intensity from face tracking
    return faceTracking.getBlendshapeIntensity(script.faceIndex, "cheekPuff");
}

/**
 * Get nose sneer intensity
 * @returns {number} - Nose sneer intensity (0-1)
 */
function getNoseSneerIntensity() {
    if (!isFaceVisible) return 0;
    
    // Get nose sneer intensity from face tracking (average of left and right)
    var leftSneer = faceTracking.getBlendshapeIntensity(script.faceIndex, "noseSneerLeft");
    var rightSneer = faceTracking.getBlendshapeIntensity(script.faceIndex, "noseSneerRight");
    
    return (leftSneer + rightSneer) / 2;
}

/**
 * Get current time in seconds
 * @returns {number} - Current time
 */
function getTime() {
    return script.getTime !== undefined ? script.getTime() : getTimeInSeconds();
}

/**
 * Fallback time function in case getTime is not available
 * @returns {number} - Time in seconds
 */
function getTimeInSeconds() {
    return new Date().getTime() / 1000;
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - Input string
 * @returns {string} - String with first letter capitalized
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Set a callback function for expression events
 * @param {Function} callback - Function to call when an expression is triggered
 */
function setExpressionCallback(callback) {
    script.api.onExpressionTriggered = callback;
}

/**
 * Set the threshold for a specific expression
 * @param {string} expression - Name of the expression
 * @param {number} threshold - New threshold value (0-1)
 */
function setExpressionThreshold(expression, threshold) {
    threshold = Math.max(0, Math.min(1, threshold));
    
    switch (expression) {
        case "smile":
            script.smileThreshold = threshold;
            break;
        case "kiss":
            script.kissThreshold = threshold;
            break;
        case "eyebrowRaise":
            script.eyebrowRaiseThreshold = threshold;
            break;
        case "eyeClose":
            script.eyeCloseThreshold = threshold;
            break;
        case "jawOpen":
            script.jawOpenThreshold = threshold;
            break;
        case "cheekPuff":
            script.cheekPuffThreshold = threshold;
            break;
        case "noseSneer":
            script.noseSneerThreshold = threshold;
            break;
    }
}

/**
 * Enable or disable detection for a specific expression
 * @param {string} expression - Name of the expression
 * @param {boolean} enabled - Whether to enable detection
 */
function setExpressionEnabled(expression, enabled) {
    switch (expression) {
        case "smile":
            script.detectSmile = enabled;
            break;
        case "kiss":
            script.detectKiss = enabled;
            break;
        case "eyebrowRaise":
            script.detectEyebrowRaise = enabled;
            break;
        case "eyeClose":
            script.detectEyeClose = enabled;
            break;
        case "jawOpen":
            script.detectJawOpen = enabled;
            break;
        case "cheekPuff":
            script.detectCheekPuff = enabled;
            break;
        case "noseSneer":
            script.detectNoseSneer = enabled;
            break;
    }
}

/**
 * Check if an expression is currently active
 * @param {string} expression - Name of the expression
 * @returns {boolean} - Whether the expression is active
 */
function isExpressionActive(expression) {
    if (!expressionStates.hasOwnProperty(expression)) {
        return false;
    }
    
    return expressionStates[expression];
}

/**
 * Get the current intensity of all expressions
 * @returns {Object} - Object containing intensity values for all expressions
 */
function getAllExpressionIntensities() {
    return {
        smile: getSmileIntensity(),
        kiss: getKissIntensity(),
        eyebrowRaise: getEyebrowRaiseIntensity(),
        eyeClose: getEyeCloseIntensity(),
        jawOpen: getJawOpenIntensity(),
        cheekPuff: getCheekPuffIntensity(),
        noseSneer: getNoseSneerIntensity()
    };
}

// Initialize on script load
initialize();

// Expose public API
script.api.onExpressionTriggered = null; // Main callback for all expressions
script.api.setExpressionCallback = setExpressionCallback;
script.api.setExpressionThreshold = setExpressionThreshold;
script.api.setExpressionEnabled = setExpressionEnabled;
script.api.isExpressionActive = isExpressionActive;
script.api.getAllExpressionIntensities = getAllExpressionIntensities; 