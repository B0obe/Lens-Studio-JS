/**
 * BlinkToBounce.js
 * 
 * @description Example script that uses BlinkDetector to trigger object bouncing
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * BlinkToBounce Example 
 * This script connects BlinkDetector and BouncingObject to make objects bounce when the user blinks.
 * It demonstrates how to use the APIs of both scripts together to create an interactive effect.
 * 
 * @usage
 * 1. Add this script to any object in your scene
 * 2. Add BlinkDetector.js and BouncingObject.js scripts to your project
 * 3. Configure the parameters to reference your scripts and objects
 */
 
// @input SceneObject blinkDetectorObject /** The object with the BlinkDetector script */
// @input SceneObject leftEyeBouncingObject /** The object that bounces when left eye blinks */
// @input SceneObject rightEyeBouncingObject /** The object that bounces when right eye blinks */
// @input SceneObject bothEyesBouncingObject /** The object that bounces when both eyes blink */
// @input float bounceDuration = 2.0 /** How long the bouncing lasts (seconds) */
// @input float bounceAmplitude = 15.0 /** How high objects bounce */
// @input float bounceFrequency = 3.0 /** How fast objects bounce */

// Store script references
var blinkDetector = null;
var leftEyeBouncer = null;
var rightEyeBouncer = null;
var bothEyesBouncer = null;

/**
 * Initialize the script
 */
function initialize() {
    // Get the BlinkDetector script
    if (script.blinkDetectorObject) {
        blinkDetector = script.blinkDetectorObject.getComponent("Component.ScriptComponent").api;
        if (!blinkDetector) {
            print("BlinkToBounce: ERROR - BlinkDetector script not found");
            return;
        }
    } else {
        print("BlinkToBounce: ERROR - BlinkDetector object not assigned");
        return;
    }
    
    // Get the BouncingObject scripts
    setupBouncer(script.leftEyeBouncingObject, function(api) { leftEyeBouncer = api; });
    setupBouncer(script.rightEyeBouncingObject, function(api) { rightEyeBouncer = api; });
    setupBouncer(script.bothEyesBouncingObject, function(api) { bothEyesBouncer = api; });
    
    // Set up the blink event handlers
    setupBlinkHandlers();
}

/**
 * Set up a bouncing object
 */
function setupBouncer(bouncingObj, callback) {
    if (bouncingObj) {
        var api = bouncingObj.getComponent("Component.ScriptComponent").api;
        if (api) {
            // Initialize with our settings
            api.setAmplitude(script.bounceAmplitude);
            api.setFrequency(script.bounceFrequency);
            api.setEnabled(false); // Start disabled
            callback(api);
        } else {
            print("BlinkToBounce: WARNING - BouncingObject script not found on " + bouncingObj.name);
        }
    }
}

/**
 * Set up blink event handlers
 */
function setupBlinkHandlers() {
    // Left eye blink handler
    if (leftEyeBouncer) {
        blinkDetector.onLeftEyeBlink = function() {
            print("Left eye blinked! Starting bounce effect.");
            triggerBounce(leftEyeBouncer);
        };
    }
    
    // Right eye blink handler
    if (rightEyeBouncer) {
        blinkDetector.onRightEyeBlink = function() {
            print("Right eye blinked! Starting bounce effect.");
            triggerBounce(rightEyeBouncer);
        };
    }
    
    // Both eyes blink handler
    if (bothEyesBouncer) {
        blinkDetector.onBothEyesBlink = function() {
            print("Both eyes blinked! Starting bounce effect.");
            triggerBounce(bothEyesBouncer);
        };
    }
}

/**
 * Trigger bouncing for a specific duration
 */
function triggerBounce(bouncer) {
    // Enable bouncing
    bouncer.setEnabled(true);
    
    // Schedule disabling after the duration
    delayedCall(function() {
        bouncer.setEnabled(false);
    }, script.bounceDuration);
}

/**
 * Helper function to schedule delayed calls
 */
function delayedCall(callback, delayInSeconds) {
    var delayedEvent = script.createEvent("DelayedCallbackEvent");
    delayedEvent.bind(callback);
    delayedEvent.reset(delayInSeconds);
}

// Initialize the script
initialize(); 