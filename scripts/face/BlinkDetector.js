/**
 * BlinkDetector.js
 * 
 * @description Detects eye blinks and triggers custom events
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires FaceTracking
 */

/**
 * BlinkDetector Script Component
 * This script detects when a user blinks their eyes and can trigger custom actions.
 * It can distinguish between left eye, right eye, and both eyes blinking.
 * 
 * @usage
 * 1. Add this script to any object in your scene
 * 2. Set the face index to track (usually 0 for the first detected face)
 * 3. Configure the detection thresholds based on your needs
 * 4. Implement or connect functions to the blink events
 */
// @input int faceIndex = 0 /** Face to track (0 is first face) */
// @input bool detectLeftEye = true /** Whether to detect left eye blinks */
// @input bool detectRightEye = true /** Whether to detect right eye blinks */
// @input bool detectBothEyes = true /** Whether to detect both eyes blinking simultaneously */
// @input float blinkThreshold = 0.3 /** Eye openness threshold for blink detection (0-1) */
// @input float holdDuration = 0.1 /** Time in seconds eye must remain below threshold to trigger blink */
// @input float cooldownTime = 0.5 /** Minimum time between blink detections (seconds) */
// @input bool debugMode = false /** Show debug messages in logger */

// Script global variables
var initialized = false;
var faceTrackingEvent = null;
var lastBlinkTime = -1;

// Blink state tracking
var leftEyeOpen = true;
var rightEyeOpen = true;
var leftEyeClosedTime = -1;
var rightEyeClosedTime = -1;
var leftEyeBlinkTriggered = false;
var rightEyeBlinkTriggered = false;
var bothEyesBlinkTriggered = false;

/**
 * Initialize the script
 */
function initialize() {
    if (initialized) return;
    
    // Check if face tracking is available
    if (!FaceTracking) {
        print("BlinkDetector: ERROR - Face tracking is not available");
        return;
    }
    
    // Create face tracking event
    faceTrackingEvent = script.createEvent("FaceTrackingEvent");
    faceTrackingEvent.faceIndex = script.faceIndex;
    faceTrackingEvent.bind(onFaceTracking);
    
    initialized = true;
    
    if (script.debugMode) {
        print("BlinkDetector: Initialized successfully for face index " + script.faceIndex);
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
    
    // Process left eye
    if (script.detectLeftEye || script.detectBothEyes) {
        processEyeState(face.leftEye, currentTime, "left");
    }
    
    // Process right eye
    if (script.detectRightEye || script.detectBothEyes) {
        processEyeState(face.rightEye, currentTime, "right");
    }
    
    // Check for both eyes blinking
    if (script.detectBothEyes) {
        processBothEyesState(currentTime);
    }
}

/**
 * Process eye state and detect blinks
 * @param {Object} eye - The eye object from face tracking
 * @param {Number} currentTime - Current time
 * @param {String} eyeType - "left" or "right"
 */
function processEyeState(eye, currentTime, eyeType) {
    // Check if we can access the eye openness value
    if (!eye || eye.openness === undefined) return;
    
    // Get eye openness value (0 = closed, 1 = open)
    var openness = eye.openness;
    
    // Variables to track for the specific eye
    var isLeft = (eyeType === "left");
    var eyeOpen = isLeft ? leftEyeOpen : rightEyeOpen;
    var eyeClosedTime = isLeft ? leftEyeClosedTime : rightEyeClosedTime;
    var blinkTriggered = isLeft ? leftEyeBlinkTriggered : rightEyeBlinkTriggered;
    
    // Detect eye state change
    if (openness < script.blinkThreshold) {
        // Eye is now closed
        if (eyeOpen) {
            // Just closed
            eyeOpen = false;
            eyeClosedTime = currentTime;
            
            if (script.debugMode) {
                print("BlinkDetector: " + eyeType + " eye closed");
            }
        } else if (!blinkTriggered && eyeClosedTime > 0 && 
                  (currentTime - eyeClosedTime >= script.holdDuration) && 
                  (currentTime - lastBlinkTime >= script.cooldownTime)) {
            // Eye has been closed for enough time and cooldown has passed
            if (isLeft && script.detectLeftEye) {
                onLeftEyeBlink();
                leftEyeBlinkTriggered = true;
                lastBlinkTime = currentTime;
            } else if (!isLeft && script.detectRightEye) {
                onRightEyeBlink();
                rightEyeBlinkTriggered = true;
                lastBlinkTime = currentTime;
            }
        }
    } else {
        // Eye is open
        if (!eyeOpen) {
            // Just opened
            eyeOpen = true;
            eyeClosedTime = -1;
            blinkTriggered = false;
            
            if (script.debugMode) {
                print("BlinkDetector: " + eyeType + " eye opened");
            }
        }
    }
    
    // Update global variables
    if (isLeft) {
        leftEyeOpen = eyeOpen;
        leftEyeClosedTime = eyeClosedTime;
        leftEyeBlinkTriggered = blinkTriggered;
    } else {
        rightEyeOpen = eyeOpen;
        rightEyeClosedTime = eyeClosedTime;
        rightEyeBlinkTriggered = blinkTriggered;
    }
}

/**
 * Process both eyes state for simultaneous blink detection
 * @param {Number} currentTime - Current time
 */
function processBothEyesState(currentTime) {
    if (!script.detectBothEyes) return;
    
    // Check if both eyes are closed and have been for the hold duration
    if (!leftEyeOpen && !rightEyeOpen && 
        leftEyeClosedTime > 0 && rightEyeClosedTime > 0 &&
        !bothEyesBlinkTriggered &&
        (currentTime - Math.max(leftEyeClosedTime, rightEyeClosedTime) >= script.holdDuration) && 
        (currentTime - lastBlinkTime >= script.cooldownTime)) {
        
        // Trigger both eyes blink event
        onBothEyesBlink();
        bothEyesBlinkTriggered = true;
        lastBlinkTime = currentTime;
    } else if (leftEyeOpen && rightEyeOpen) {
        // Reset trigger when both eyes are open
        bothEyesBlinkTriggered = false;
    }
}

/**
 * Called when left eye blink is detected
 */
function onLeftEyeBlink() {
    if (script.debugMode) {
        print("BlinkDetector: Left eye blink detected");
    }
    
    // Forward to API for external scripts to use
    if (script.api.onLeftEyeBlink) {
        script.api.onLeftEyeBlink();
    }
}

/**
 * Called when right eye blink is detected
 */
function onRightEyeBlink() {
    if (script.debugMode) {
        print("BlinkDetector: Right eye blink detected");
    }
    
    // Forward to API for external scripts to use
    if (script.api.onRightEyeBlink) {
        script.api.onRightEyeBlink();
    }
}

/**
 * Called when both eyes blink simultaneously
 */
function onBothEyesBlink() {
    if (script.debugMode) {
        print("BlinkDetector: Both eyes blink detected");
    }
    
    // Forward to API for external scripts to use
    if (script.api.onBothEyesBlink) {
        script.api.onBothEyesBlink();
    }
}

/**
 * Set the blink detection threshold
 * @param {number} threshold - New threshold value (0-1)
 */
function setBlinkThreshold(threshold) {
    script.blinkThreshold = Math.max(0, Math.min(1, threshold));
}

/**
 * Set the hold duration required for blink detection
 * @param {number} duration - Duration in seconds
 */
function setHoldDuration(duration) {
    script.holdDuration = Math.max(0, duration);
}

/**
 * Set the cooldown time between blink detections
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
script.api.setBlinkThreshold = setBlinkThreshold;
script.api.setHoldDuration = setHoldDuration;
script.api.setCooldownTime = setCooldownTime;
script.api.onLeftEyeBlink = null;  // User can set this function
script.api.onRightEyeBlink = null; // User can set this function
script.api.onBothEyesBlink = null; // User can set this function 