/**
 * SmileDetector.js
 * 
 * @description Detect smile expressions and trigger custom events
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires FaceTracking
 */

/**
 * SmileDetector Script Component
 * This script detects when a user smiles and can trigger custom actions.
 * It can distinguish between smile start and end, as well as provide
 * information about the smile intensity.
 * 
 * @usage
 * 1. Add this script to any object in your scene
 * 2. Set the face index to track (usually 0 for the first detected face)
 * 3. Configure the detection thresholds based on your needs
 * 4. Implement or connect functions to the smile events
 */
// @input int faceIndex = 0 /** Face to track (0 is first face) */
// @input float smileThreshold = 0.3 /** Minimum smile amount to trigger smile detection (0-1) */
// @input float stopSmileThreshold = 0.15 /** Threshold below which smile is considered stopped (0-1) */
// @input float holdDuration = 0.1 /** Time in seconds smile must remain above threshold to trigger */
// @input float cooldownTime = 0.2 /** Minimum time between smile detections (seconds) */
// @input bool debugMode = false /** Show debug messages in logger */

// Script global variables
var initialized = false;
var faceTrackingEvent = null;
var lastSmileTime = -1;

// Smile state tracking
var isSmiling = false;
var smileStartTime = -1;
var smileTriggered = false;

/**
 * Initialize the script
 */
function initialize() {
    if (initialized) return;
    
    // Check if face tracking is available
    if (!FaceTracking) {
        print("SmileDetector: ERROR - Face tracking is not available");
        return;
    }
    
    // Create face tracking event
    faceTrackingEvent = script.createEvent("FaceTrackingEvent");
    faceTrackingEvent.faceIndex = script.faceIndex;
    faceTrackingEvent.bind(onFaceTracking);
    
    initialized = true;
    
    if (script.debugMode) {
        print("SmileDetector: Initialized successfully for face index " + script.faceIndex);
    }
}

/**
 * Event handler for face tracking updates
 */
function onFaceTracking(eventData) {
    // Get face object
    var face = eventData.getFace();
    if (!face) return;
    
    // Get current time
    var currentTime = getTime();
    
    // Process smile state
    processSmileState(face, currentTime);
}

/**
 * Process smile state and detect smile events
 * @param {Object} face - The face object from face tracking
 * @param {Number} currentTime - Current time
 */
function processSmileState(face, currentTime) {
    // Get mouth smile value (0 = neutral, 1 = full smile)
    var smileAmount = getMouthSmile(face);
    
    // Track smile intensity for the API
    script.api.smileIntensity = smileAmount;
    
    // Debug mode information
    if (script.debugMode && Math.random() < 0.05) { // Only show debug info occasionally to avoid spam
        print("SmileDetector: Smile amount = " + smileAmount.toFixed(2));
    }
    
    // Detect smile state change
    if (smileAmount >= script.smileThreshold) {
        // User is smiling
        if (!isSmiling) {
            // Just started smiling
            isSmiling = true;
            smileStartTime = currentTime;
            
            if (script.debugMode) {
                print("SmileDetector: Smile started");
            }
        } else if (!smileTriggered && smileStartTime > 0 && 
                  (currentTime - smileStartTime >= script.holdDuration) && 
                  (currentTime - lastSmileTime >= script.cooldownTime)) {
            // Smile has been held for long enough and cooldown has passed
            onSmileStart(smileAmount);
            smileTriggered = true;
            lastSmileTime = currentTime;
        }
    } else if (smileAmount <= script.stopSmileThreshold) {
        // User is not smiling anymore
        if (isSmiling) {
            // Just stopped smiling
            isSmiling = false;
            
            if (smileTriggered) {
                // If a smile was triggered, now we trigger the stop event
                onSmileEnd();
                smileTriggered = false;
            }
            
            smileStartTime = -1;
            
            if (script.debugMode) {
                print("SmileDetector: Smile ended");
            }
        }
    }
}

/**
 * Get smile amount from face object
 * @param {Object} face - Face object from tracking
 * @returns {number} Smile intensity value from 0-1
 */
function getMouthSmile(face) {
    // Most of the face tracking SDKs provide a mouth smile or similar property
    // This may need adjustment based on Lens Studio's current API
    
    if (face.mouth && face.mouth.smile !== undefined) {
        return face.mouth.smile;
    }
    
    // Fallback method uses mouth width vs height ratio as an approximation
    if (face.mouth) {
        var mouthWidth = face.mouth.width !== undefined ? face.mouth.width : 0;
        var mouthHeight = face.mouth.height !== undefined ? face.mouth.height : 1;
        
        // Avoid division by zero
        if (mouthHeight > 0) {
            // Normalize the ratio to approximate a 0-1 smile value
            var ratio = mouthWidth / mouthHeight;
            return Math.max(0, Math.min(1, (ratio - 1.2) / 1.5));
        }
    }
    
    return 0;
}

/**
 * Called when a smile is detected
 * @param {number} intensity - Smile intensity (0-1)
 */
function onSmileStart(intensity) {
    if (script.debugMode) {
        print("SmileDetector: Smile detected with intensity " + intensity.toFixed(2));
    }
    
    // Forward to API for external scripts to use
    if (script.api.onSmileStart) {
        script.api.onSmileStart(intensity);
    }
}

/**
 * Called when a smile ends
 */
function onSmileEnd() {
    if (script.debugMode) {
        print("SmileDetector: Smile ended");
    }
    
    // Forward to API for external scripts to use
    if (script.api.onSmileEnd) {
        script.api.onSmileEnd();
    }
}

/**
 * Set the smile detection threshold
 * @param {number} threshold - New threshold value (0-1)
 */
function setSmileThreshold(threshold) {
    script.smileThreshold = Math.max(0, Math.min(1, threshold));
    
    // Make sure stop threshold is lower than smile threshold
    if (script.stopSmileThreshold >= script.smileThreshold) {
        script.stopSmileThreshold = script.smileThreshold - 0.05;
    }
}

/**
 * Set the stop smile threshold
 * @param {number} threshold - New threshold value (0-1)
 */
function setStopSmileThreshold(threshold) {
    script.stopSmileThreshold = Math.max(0, Math.min(1, threshold));
    
    // Make sure stop threshold is lower than smile threshold
    if (script.stopSmileThreshold >= script.smileThreshold) {
        script.stopSmileThreshold = script.smileThreshold - 0.05;
    }
}

/**
 * Set the hold duration required for smile detection
 * @param {number} duration - Duration in seconds
 */
function setHoldDuration(duration) {
    script.holdDuration = Math.max(0, duration);
}

/**
 * Set the cooldown time between smile detections
 * @param {number} time - Cooldown time in seconds
 */
function setCooldownTime(time) {
    script.cooldownTime = Math.max(0, time);
}

/**
 * Get current time in seconds
 * @returns {number} Current time
 */
function getTime() {
    return script.getTime !== undefined ? script.getTime() : getTimeInSeconds();
}

/**
 * Fallback time function in case getTime is not available
 * @returns {number} Time in seconds
 */
function getTimeInSeconds() {
    return new Date().getTime() / 1000;
}

// Initialize on script load
initialize();

// Expose public API
script.api.setSmileThreshold = setSmileThreshold;
script.api.setStopSmileThreshold = setStopSmileThreshold;
script.api.setHoldDuration = setHoldDuration;
script.api.setCooldownTime = setCooldownTime;
script.api.smileIntensity = 0;  // Current smile intensity value
script.api.onSmileStart = null;  // User can set this function
script.api.onSmileEnd = null;    // User can set this function 