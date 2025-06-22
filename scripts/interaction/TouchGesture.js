/**
 * TouchGesture.js
 * 
 * @description Detect and handle various touch gestures like tap, double tap, long press, swipe, pinch, and rotate
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * TouchGesture Script Component
 * This script provides detection for various touch gestures including tap, double tap,
 * long press, swipe, pinch, and rotate. It allows for customizable sensitivity and
 * provides detailed information about each gesture.
 * 
 * @usage
 * 1. Add this script to any Scene Object
 * 2. Configure gesture detection parameters
 * 3. Use the onGesture event to respond to detected gestures
 */
// @input bool enableTap = true /** Enable tap gesture detection */
// @input float tapMaxTime = 0.3 {"showIf":"enableTap"} /** Maximum time for a tap in seconds */
// @input float tapMaxDistance = 20 {"showIf":"enableTap"} /** Maximum movement distance for a tap in screen units */
// @input bool enableDoubleTap = true /** Enable double tap gesture detection */
// @input float doubleTapMaxTime = 0.5 {"showIf":"enableDoubleTap"} /** Maximum time between taps for double tap in seconds */
// @input float doubleTapMaxDistance = 50 {"showIf":"enableDoubleTap"} /** Maximum distance between taps for double tap in screen units */
// @input bool enableLongPress = true /** Enable long press gesture detection */
// @input float longPressMinTime = 0.5 {"showIf":"enableLongPress"} /** Minimum time for a long press in seconds */
// @input float longPressMaxMovement = 10 {"showIf":"enableLongPress"} /** Maximum movement allowed during long press in screen units */
// @input bool enableSwipe = true /** Enable swipe gesture detection */
// @input float swipeMinDistance = 100 {"showIf":"enableSwipe"} /** Minimum distance for a swipe in screen units */
// @input float swipeMaxTime = 0.5 {"showIf":"enableSwipe"} /** Maximum time for a swipe in seconds */
// @input bool enablePinch = true /** Enable pinch gesture detection */
// @input float pinchMinChange = 40 {"showIf":"enablePinch"} /** Minimum distance change for pinch in screen units */
// @input bool enableRotate = true /** Enable rotation gesture detection */
// @input float rotateMinAngle = 15 {"showIf":"enableRotate"} /** Minimum angle for rotation in degrees */
// @input bool preventMultipleGestures = true /** Prevent multiple gestures from triggering simultaneously */
// @input bool debugMode = false /** Show debug messages */

// Script global variables
var touchStartTime = 0;
var touchStartPos = null;
var touchEndPos = null;
var lastTapTime = 0;
var lastTapPos = null;
var isLongPressing = false;
var longPressTimeout = null;
var isTouching = false;
var lastGestureTime = 0;
var gesturePreventionTime = 0.5; // Time to prevent other gestures after one is detected
var pinchStartDistance = 0;
var pinchStartCenter = null;
var rotateStartAngle = 0;
var multiTouchStartPositions = [];
var activeGesture = null;

/**
 * Initialize the script
 */
function initialize() {
    // Create touch events
    createTouchEvents();
    
    if (script.debugMode) {
        print("TouchGesture: Initialized");
    }
}

/**
 * Create touch events for gesture detection
 */
function createTouchEvents() {
    // Touch start event
    var touchStartEvent = script.createEvent("TouchStartEvent");
    touchStartEvent.bind(onTouchStart);
    
    // Touch move event
    var touchMoveEvent = script.createEvent("TouchMoveEvent");
    touchMoveEvent.bind(onTouchMove);
    
    // Touch end event
    var touchEndEvent = script.createEvent("TouchEndEvent");
    touchEndEvent.bind(onTouchEnd);
    
    // Multi touch start event
    if (script.enablePinch || script.enableRotate) {
        var multiTouchStartEvent = script.createEvent("MultiTouchStartEvent");
        multiTouchStartEvent.bind(onMultiTouchStart);
        
        // Multi touch move event
        var multiTouchMoveEvent = script.createEvent("MultiTouchMoveEvent");
        multiTouchMoveEvent.bind(onMultiTouchMove);
        
        // Multi touch end event
        var multiTouchEndEvent = script.createEvent("MultiTouchEndEvent");
        multiTouchEndEvent.bind(onMultiTouchEnd);
    }
}

/**
 * Handle touch start event
 */
function onTouchStart(eventData) {
    // Store touch start information
    touchStartTime = getTime();
    touchStartPos = eventData.getTouchPosition();
    isTouching = true;
    
    // Start long press detection
    if (script.enableLongPress) {
        if (longPressTimeout) {
            clearTimeout(longPressTimeout);
        }
        
        longPressTimeout = setTimeout(function() {
            if (isTouching && !activeGesture) {
                // Check if touch hasn't moved too much
                var currentPos = touchStartPos; // Use last known position
                var distance = getDistance(touchStartPos, currentPos);
                
                if (distance <= script.longPressMaxMovement) {
                    isLongPressing = true;
                    var gestureData = {
                        type: "longPress",
                        position: currentPos,
                        duration: script.longPressMinTime
                    };
                    
                    triggerGesture(gestureData);
                }
            }
        }, script.longPressMinTime * 1000);
    }
    
    if (script.debugMode) {
        print("TouchGesture: Touch start at " + touchStartPos.x + ", " + touchStartPos.y);
    }
}

/**
 * Handle touch move event
 */
function onTouchMove(eventData) {
    if (!isTouching) return;
    
    // Update current touch position
    var currentPos = eventData.getTouchPosition();
    
    // Check if we're already in a gesture
    if (activeGesture === "longPress") {
        // For long press, we continue the gesture while touch is held
        var gestureData = {
            type: "longPressMove",
            position: currentPos,
            startPosition: touchStartPos,
            movement: {
                x: currentPos.x - touchStartPos.x,
                y: currentPos.y - touchStartPos.y
            }
        };
        
        triggerGesture(gestureData);
        return;
    }
    
    // If touch has moved too much, cancel long press
    if (isLongPressing) {
        var distance = getDistance(touchStartPos, currentPos);
        if (distance > script.longPressMaxMovement) {
            isLongPressing = false;
            if (longPressTimeout) {
                clearTimeout(longPressTimeout);
                longPressTimeout = null;
            }
        }
    }
}

/**
 * Handle touch end event
 */
function onTouchEnd(eventData) {
    if (!isTouching) return;
    
    // Store touch end information
    var touchEndTime = getTime();
    touchEndPos = eventData.getTouchPosition();
    isTouching = false;
    
    // Cancel long press detection
    if (longPressTimeout) {
        clearTimeout(longPressTimeout);
        longPressTimeout = null;
    }
    
    // If we're in a long press, end it
    if (isLongPressing) {
        var gestureData = {
            type: "longPressEnd",
            position: touchEndPos,
            startPosition: touchStartPos,
            duration: touchEndTime - touchStartTime
        };
        
        triggerGesture(gestureData);
        isLongPressing = false;
        return;
    }
    
    // Don't process other gestures if we're in gesture prevention time
    if (script.preventMultipleGestures && activeGesture) {
        return;
    }
    
    // Check for swipe
    if (script.enableSwipe) {
        var touchDuration = touchEndTime - touchStartTime;
        var touchDistance = getDistance(touchStartPos, touchEndPos);
        
        if (touchDuration <= script.swipeMaxTime && touchDistance >= script.swipeMinDistance) {
            // Determine swipe direction
            var dx = touchEndPos.x - touchStartPos.x;
            var dy = touchEndPos.y - touchStartPos.y;
            var direction = "";
            
            // Check if horizontal or vertical swipe
            if (Math.abs(dx) > Math.abs(dy)) {
                direction = dx > 0 ? "right" : "left";
            } else {
                direction = dy > 0 ? "up" : "down";
            }
            
            var gestureData = {
                type: "swipe",
                direction: direction,
                distance: touchDistance,
                duration: touchDuration,
                startPosition: touchStartPos,
                endPosition: touchEndPos,
                velocity: touchDistance / touchDuration
            };
            
            triggerGesture(gestureData);
            return;
        }
    }
    
    // Check for tap
    if (script.enableTap) {
        var tapDuration = touchEndTime - touchStartTime;
        var tapDistance = getDistance(touchStartPos, touchEndPos);
        
        if (tapDuration <= script.tapMaxTime && tapDistance <= script.tapMaxDistance) {
            // Check for double tap
            if (script.enableDoubleTap && lastTapTime > 0) {
                var timeBetweenTaps = touchEndTime - lastTapTime;
                var distanceBetweenTaps = lastTapPos ? getDistance(lastTapPos, touchEndPos) : 0;
                
                if (timeBetweenTaps <= script.doubleTapMaxTime && distanceBetweenTaps <= script.doubleTapMaxDistance) {
                    var gestureData = {
                        type: "doubleTap",
                        position: touchEndPos,
                        timeBetweenTaps: timeBetweenTaps
                    };
                    
                    triggerGesture(gestureData);
                    lastTapTime = 0; // Reset to prevent triple tap detection
                    lastTapPos = null;
                    return;
                }
            }
            
            // Single tap
            var gestureData = {
                type: "tap",
                position: touchEndPos
            };
            
            triggerGesture(gestureData);
            
            // Store for double tap detection
            lastTapTime = touchEndTime;
            lastTapPos = touchEndPos;
            return;
        }
    }
    
    // Reset tap tracking if not a tap
    lastTapTime = 0;
    lastTapPos = null;
}

/**
 * Handle multi-touch start event
 */
function onMultiTouchStart(eventData) {
    if (script.preventMultipleGestures && activeGesture) {
        return;
    }
    
    // Store multi-touch start information
    var touchCount = eventData.getTouchCount();
    
    if (touchCount >= 2) {
        // Get touch positions
        multiTouchStartPositions = [];
        for (var i = 0; i < touchCount; i++) {
            multiTouchStartPositions.push(eventData.getTouchPosition(i));
        }
        
        // Calculate initial pinch distance and center
        if (script.enablePinch && touchCount >= 2) {
            pinchStartDistance = getDistance(multiTouchStartPositions[0], multiTouchStartPositions[1]);
            pinchStartCenter = getMidpoint(multiTouchStartPositions[0], multiTouchStartPositions[1]);
        }
        
        // Calculate initial rotation angle
        if (script.enableRotate && touchCount >= 2) {
            rotateStartAngle = getAngle(multiTouchStartPositions[0], multiTouchStartPositions[1]);
        }
    }
}

/**
 * Handle multi-touch move event
 */
function onMultiTouchMove(eventData) {
    if (script.preventMultipleGestures && activeGesture) {
        return;
    }
    
    var touchCount = eventData.getTouchCount();
    
    if (touchCount >= 2) {
        // Get current touch positions
        var currentPositions = [];
        for (var i = 0; i < touchCount; i++) {
            currentPositions.push(eventData.getTouchPosition(i));
        }
        
        // Check for pinch gesture
        if (script.enablePinch) {
            var currentPinchDistance = getDistance(currentPositions[0], currentPositions[1]);
            var pinchChange = Math.abs(currentPinchDistance - pinchStartDistance);
            
            if (pinchChange >= script.pinchMinChange) {
                var pinchCenter = getMidpoint(currentPositions[0], currentPositions[1]);
                var scale = currentPinchDistance / Math.max(0.1, pinchStartDistance);
                
                var gestureData = {
                    type: "pinch",
                    scale: scale,
                    distance: currentPinchDistance,
                    startDistance: pinchStartDistance,
                    center: pinchCenter,
                    startCenter: pinchStartCenter
                };
                
                triggerGesture(gestureData);
                
                // Update pinch start values for continuous detection
                pinchStartDistance = currentPinchDistance;
                pinchStartCenter = pinchCenter;
                return;
            }
        }
        
        // Check for rotation gesture
        if (script.enableRotate) {
            var currentRotateAngle = getAngle(currentPositions[0], currentPositions[1]);
            var rotationChange = getAngleDifference(rotateStartAngle, currentRotateAngle);
            
            if (Math.abs(rotationChange) >= script.rotateMinAngle) {
                var rotationCenter = getMidpoint(currentPositions[0], currentPositions[1]);
                
                var gestureData = {
                    type: "rotate",
                    angle: rotationChange,
                    center: rotationCenter
                };
                
                triggerGesture(gestureData);
                
                // Update rotation start angle for continuous detection
                rotateStartAngle = currentRotateAngle;
                return;
            }
        }
    }
}

/**
 * Handle multi-touch end event
 */
function onMultiTouchEnd(eventData) {
    // Reset multi-touch tracking
    multiTouchStartPositions = [];
}

/**
 * Trigger a gesture event
 * @param {Object} gestureData - Data about the detected gesture
 */
function triggerGesture(gestureData) {
    // Set active gesture for prevention
    if (script.preventMultipleGestures) {
        if (gestureData.type !== "longPressMove" && gestureData.type !== "longPressEnd") {
            activeGesture = gestureData.type;
            
            // Clear active gesture after prevention time
            setTimeout(function() {
                activeGesture = null;
            }, gesturePreventionTime * 1000);
        }
    }
    
    // Log gesture if debug mode is enabled
    if (script.debugMode) {
        print("TouchGesture: Detected " + gestureData.type + " gesture");
    }
    
    // Trigger the onGesture event
    if (script.api.onGesture) {
        script.api.onGesture(gestureData);
    }
}

/**
 * Calculate distance between two points
 * @param {vec2} point1 - First point
 * @param {vec2} point2 - Second point
 * @returns {number} - Distance between points
 */
function getDistance(point1, point2) {
    var dx = point2.x - point1.x;
    var dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate midpoint between two points
 * @param {vec2} point1 - First point
 * @param {vec2} point2 - Second point
 * @returns {vec2} - Midpoint
 */
function getMidpoint(point1, point2) {
    return new vec2(
        (point1.x + point2.x) / 2,
        (point1.y + point2.y) / 2
    );
}

/**
 * Calculate angle between two points (in degrees)
 * @param {vec2} point1 - First point
 * @param {vec2} point2 - Second point
 * @returns {number} - Angle in degrees
 */
function getAngle(point1, point2) {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI;
}

/**
 * Calculate the difference between two angles accounting for 360 wrap-around
 * @param {number} angle1 - First angle in degrees
 * @param {number} angle2 - Second angle in degrees
 * @returns {number} - Angle difference in degrees
 */
function getAngleDifference(angle1, angle2) {
    var diff = (angle2 - angle1) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
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
 * Create a timeout that runs after a specified delay
 * @param {Function} callback - Function to call
 * @param {number} delay - Delay in milliseconds
 * @returns {Object} - Timeout object
 */
function setTimeout(callback, delay) {
    var event = script.createEvent("DelayedCallbackEvent");
    event.bind(callback);
    event.reset(delay / 1000);
    return event;
}

/**
 * Clear a timeout created with setTimeout
 * @param {Object} timeoutEvent - Timeout event to clear
 */
function clearTimeout(timeoutEvent) {
    if (timeoutEvent) {
        script.removeEvent(timeoutEvent);
    }
}

/**
 * Set a callback function for gesture events
 * @param {Function} callback - Function to call when a gesture is detected
 */
function setGestureCallback(callback) {
    script.api.onGesture = callback;
}

/**
 * Enable or disable a specific gesture type
 * @param {string} gestureType - Type of gesture (tap, doubleTap, longPress, swipe, pinch, rotate)
 * @param {boolean} enabled - Whether to enable the gesture
 */
function setGestureEnabled(gestureType, enabled) {
    switch (gestureType) {
        case "tap":
            script.enableTap = enabled;
            break;
        case "doubleTap":
            script.enableDoubleTap = enabled;
            break;
        case "longPress":
            script.enableLongPress = enabled;
            break;
        case "swipe":
            script.enableSwipe = enabled;
            break;
        case "pinch":
            script.enablePinch = enabled;
            break;
        case "rotate":
            script.enableRotate = enabled;
            break;
    }
}

// Initialize on script load
initialize();

// Expose public API
script.api.onGesture = null; // Callback function for gesture events
script.api.setGestureCallback = setGestureCallback;
script.api.setGestureEnabled = setGestureEnabled; 