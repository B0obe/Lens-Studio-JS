/**
 * Timeline.js
 * 
 * @description Sequences and coordinates multiple animations with precise timing
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires SceneObject
 */

/**
 * Timeline Script Component
 * This script creates a timeline for sequencing animations and events.
 * 
 * @usage
 * 1. Add this script to any object in your scene
 * 2. Add keyframes using the API
 * 3. Start the timeline when ready
 */
// @input bool playOnStart = false /** Whether to play the timeline automatically on start */
// @input bool loop = false /** Whether to loop the timeline */
// @input float duration = 5.0 /** Total duration of the timeline in seconds */
// @input bool debugMode = false /** Show debug messages in logger */

// Script global variables
var keyframes = [];
var isPlaying = false;
var currentTime = 0;
var startTime = 0;

/**
 * Initialize the script
 */
function initialize() {
    if (script.debugMode) {
        print("Timeline: Initialized with duration " + script.duration);
    }
    
    if (script.playOnStart) {
        play();
    }
}

/**
 * Function called on each frame update
 */
function onUpdate(eventData) {
    if (!isPlaying) return;
    
    var deltaTime = eventData.getDeltaTime();
    currentTime = getTime() - startTime;
    
    // Check if timeline completed
    if (currentTime >= script.duration) {
        if (script.loop) {
            // Reset and continue
            startTime = getTime();
            currentTime = 0;
            if (script.debugMode) {
                print("Timeline: Looping");
            }
        } else {
            // Stop timeline
            isPlaying = false;
            if (script.debugMode) {
                print("Timeline: Completed");
            }
            return;
        }
    }
    
    // Process keyframes for current time
    processKeyframes();
}

/**
 * Process all keyframes for the current time
 */
function processKeyframes() {
    for (var i = 0; i < keyframes.length; i++) {
        var keyframe = keyframes[i];
        
        // Check if keyframe should be triggered
        if (!keyframe.triggered && currentTime >= keyframe.time) {
            // Trigger keyframe action
            keyframe.action();
            keyframe.triggered = true;
            
            if (script.debugMode) {
                print("Timeline: Triggered keyframe at " + keyframe.time + "s");
            }
        } else if (keyframe.triggered && script.loop && currentTime < keyframe.time) {
            // Reset triggered state when looping
            keyframe.triggered = false;
        }
    }
}

/**
 * Add a keyframe to the timeline
 * @param {number} time - Time in seconds when the action should trigger
 * @param {function} action - Function to call when this keyframe is reached
 * @returns {number} Index of the added keyframe
 */
function addKeyframe(time, action) {
    if (time < 0 || time > script.duration) {
        print("Timeline: ERROR - Keyframe time must be between 0 and " + script.duration);
        return -1;
    }
    
    var keyframe = {
        time: time,
        action: action,
        triggered: false
    };
    
    keyframes.push(keyframe);
    
    // Sort keyframes by time for efficient processing
    keyframes.sort(function(a, b) {
        return a.time - b.time;
    });
    
    if (script.debugMode) {
        print("Timeline: Added keyframe at " + time + "s");
    }
    
    return keyframes.length - 1;
}

/**
 * Remove a keyframe from the timeline
 * @param {number} index - Index of the keyframe to remove
 * @returns {boolean} True if successful, false otherwise
 */
function removeKeyframe(index) {
    if (index < 0 || index >= keyframes.length) {
        print("Timeline: ERROR - Invalid keyframe index");
        return false;
    }
    
    keyframes.splice(index, 1);
    
    if (script.debugMode) {
        print("Timeline: Removed keyframe at index " + index);
    }
    
    return true;
}

/**
 * Clear all keyframes from the timeline
 */
function clearKeyframes() {
    keyframes = [];
    
    if (script.debugMode) {
        print("Timeline: Cleared all keyframes");
    }
}

/**
 * Play the timeline from the beginning
 */
function play() {
    startTime = getTime();
    currentTime = 0;
    isPlaying = true;
    
    // Reset all keyframe triggers
    for (var i = 0; i < keyframes.length; i++) {
        keyframes[i].triggered = false;
    }
    
    if (script.debugMode) {
        print("Timeline: Started playing");
    }
}

/**
 * Pause the timeline at current position
 */
function pause() {
    isPlaying = false;
    
    if (script.debugMode) {
        print("Timeline: Paused at " + currentTime + "s");
    }
}

/**
 * Resume the timeline from current position
 */
function resume() {
    if (!isPlaying) {
        startTime = getTime() - currentTime;
        isPlaying = true;
        
        if (script.debugMode) {
            print("Timeline: Resumed from " + currentTime + "s");
        }
    }
}

/**
 * Stop the timeline and reset to beginning
 */
function stop() {
    isPlaying = false;
    currentTime = 0;
    
    // Reset all keyframe triggers
    for (var i = 0; i < keyframes.length; i++) {
        keyframes[i].triggered = false;
    }
    
    if (script.debugMode) {
        print("Timeline: Stopped");
    }
}

/**
 * Seek to a specific time in the timeline
 * @param {number} time - Time in seconds to seek to
 */
function seekTo(time) {
    if (time < 0 || time > script.duration) {
        print("Timeline: ERROR - Seek time must be between 0 and " + script.duration);
        return;
    }
    
    currentTime = time;
    startTime = getTime() - currentTime;
    
    // Reset triggered state based on new time
    for (var i = 0; i < keyframes.length; i++) {
        keyframes[i].triggered = (keyframes[i].time <= currentTime);
    }
    
    if (script.debugMode) {
        print("Timeline: Seeked to " + time + "s");
    }
}

/**
 * Set the total duration of the timeline
 * @param {number} newDuration - New duration in seconds
 */
function setDuration(newDuration) {
    if (newDuration <= 0) {
        print("Timeline: ERROR - Duration must be greater than 0");
        return;
    }
    
    script.duration = newDuration;
    
    if (script.debugMode) {
        print("Timeline: Set duration to " + newDuration + "s");
    }
}

/**
 * Get the current time of the timeline
 * @returns {number} Current time in seconds
 */
function getCurrentTime() {
    return currentTime;
}

/**
 * Helper function to get current time
 */
function getTime() {
    return getTimeInSeconds();
}

/**
 * Helper function to get current time in seconds
 */
function getTimeInSeconds() {
    return new Date().getTime() / 1000;
}

// Initialize on script load
initialize();

// Bind to update event
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

// Expose public API
script.api.addKeyframe = addKeyframe;
script.api.removeKeyframe = removeKeyframe;
script.api.clearKeyframes = clearKeyframes;
script.api.play = play;
script.api.pause = pause;
script.api.resume = resume;
script.api.stop = stop;
script.api.seekTo = seekTo;
script.api.setDuration = setDuration;
script.api.getCurrentTime = getCurrentTime;