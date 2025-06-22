/**
 * SwipeDetector.js
 * 
 * @description Detect swipe gestures and their directions
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * SwipeDetector Script Component
 * This script detects swipe gestures in up, down, left, and right directions.
 * It provides callbacks for each swipe direction and can be customized with
 * sensitivity and recognition parameters.
 * 
 * @usage
 * 1. Add this script to any Scene Object
 * 2. Configure the detection parameters
 * 3. Set up callback functions for swipe events
 * 4. Optionally restrict detection to specific screen regions
 */
// @input float minSwipeDistance = 0.1 /** Minimum distance (in screen %) to detect as swipe */
// @input float maxSwipeTime = 0.5 /** Maximum time (seconds) for a valid swipe gesture */
// @input bool detectHorizontal = true /** Whether to detect left/right swipes */
// @input bool detectVertical = true /** Whether to detect up/down swipes */
// @input vec2 screenRegionMin = {x: 0.0, y: 0.0} /** Min bounds (0-1) of detection region */
// @input vec2 screenRegionMax = {x: 1.0, y: 1.0} /** Max bounds (0-1) of detection region */
// @input bool debugMode = false /** Show debug messages */

// Script global variables
var isTouching = false;
var touchStartPosition = new vec2(0, 0);
var touchStartTime = 0;
var lastSwipeTime = 0;
var swipeCooldownTime = 0.1; // Prevent multiple swipes from one gesture

/**
 * Initialize the script
 */
function initialize() {
    // Create touch events
    createEvents();
}

/**
 * Create events for touch handling
 */
function createEvents() {
    // Create event for touch start
    var touchStartEvent = script.createEvent("TouchStartEvent");
    touchStartEvent.bind(onTouchStart);
    
    // Create event for touch end
    var touchEndEvent = script.createEvent("TouchEndEvent");
    touchEndEvent.bind(onTouchEnd);
}

/**
 * Handle touch start event
 */
function onTouchStart(eventData) {
    // Get touch position
    var touchPos = eventData.getTouchPosition();
    
    // Check if the touch is within the defined region
    if (isInScreenRegion(touchPos)) {
        isTouching = true;
        touchStartPosition.x = touchPos.x;
        touchStartPosition.y = touchPos.y;
        touchStartTime = getTime();
        
        if (script.debugMode) {
            print("SwipeDetector: Touch started at " + touchStartPosition.toString());
        }
    }
}

/**
 * Handle touch end event
 */
function onTouchEnd(eventData) {
    if (!isTouching) return;
    
    isTouching = false;
    
    // Get touch position
    var touchEndPosition = eventData.getTouchPosition();
    var touchEndTime = getTime();
    
    // Calculate swipe properties
    var swipeTime = touchEndTime - touchStartTime;
    var swipeDistance = new vec2(
        touchEndPosition.x - touchStartPosition.x,
        touchEndPosition.y - touchStartPosition.y
    );
    
    // Check if this is a valid swipe
    if (swipeTime <= script.maxSwipeTime &&
        (Math.abs(swipeDistance.x) > script.minSwipeDistance || 
         Math.abs(swipeDistance.y) > script.minSwipeDistance) &&
        touchEndTime - lastSwipeTime >= swipeCooldownTime) {
        
        // Determine swipe direction
        detectSwipeDirection(swipeDistance);
        
        lastSwipeTime = touchEndTime;
    }
}

/**
 * Detect the swipe direction and trigger appropriate callback
 */
function detectSwipeDirection(swipeDist) {
    var absX = Math.abs(swipeDist.x);
    var absY = Math.abs(swipeDist.y);
    var direction;
    
    // Determine if the swipe is more horizontal or vertical
    if (absX > absY) {
        // Horizontal swipe
        if (!script.detectHorizontal) return;
        
        if (swipeDist.x > 0) {
            direction = "right";
            if (script.debugMode) print("SwipeDetector: Right swipe detected");
            
            // Trigger right swipe callback
            if (script.api.onSwipeRight) {
                script.api.onSwipeRight();
            }
        } else {
            direction = "left";
            if (script.debugMode) print("SwipeDetector: Left swipe detected");
            
            // Trigger left swipe callback
            if (script.api.onSwipeLeft) {
                script.api.onSwipeLeft();
            }
        }
    } else {
        // Vertical swipe
        if (!script.detectVertical) return;
        
        if (swipeDist.y > 0) {
            direction = "up";
            if (script.debugMode) print("SwipeDetector: Up swipe detected");
            
            // Trigger up swipe callback
            if (script.api.onSwipeUp) {
                script.api.onSwipeUp();
            }
        } else {
            direction = "down";
            if (script.debugMode) print("SwipeDetector: Down swipe detected");
            
            // Trigger down swipe callback
            if (script.api.onSwipeDown) {
                script.api.onSwipeDown();
            }
        }
    }
    
    // Trigger general swipe callback
    if (script.api.onSwipe) {
        script.api.onSwipe(direction, swipeDist);
    }
}

/**
 * Check if a screen position is within the defined detection region
 */
function isInScreenRegion(position) {
    return position.x >= script.screenRegionMin.x && position.x <= script.screenRegionMax.x &&
           position.y >= script.screenRegionMin.y && position.y <= script.screenRegionMax.y;
}

/**
 * Get the current time in seconds
 */
function getTime() {
    return script.getTime !== undefined ? script.getTime() : getTimeInSeconds();
}

/**
 * Fallback time function in case getTime is not available
 */
function getTimeInSeconds() {
    return new Date().getTime() / 1000;
}

/**
 * Set the minimum swipe distance required for detection
 * @param {number} distance - Distance as percentage of screen (0.0-1.0)
 */
function setMinSwipeDistance(distance) {
    script.minSwipeDistance = Math.max(0.01, Math.min(1.0, distance));
}

/**
 * Set the maximum time for a valid swipe
 * @param {number} time - Time in seconds
 */
function setMaxSwipeTime(time) {
    script.maxSwipeTime = Math.max(0.05, time);
}

/**
 * Set whether horizontal swipes are detected
 * @param {boolean} enabled - Whether to detect horizontal swipes
 */
function setDetectHorizontal(enabled) {
    script.detectHorizontal = enabled;
}

/**
 * Set whether vertical swipes are detected
 * @param {boolean} enabled - Whether to detect vertical swipes
 */
function setDetectVertical(enabled) {
    script.detectVertical = enabled;
}

/**
 * Set the screen region where swipes are detected
 * @param {vec2} min - Minimum screen coordinates (0-1, 0-1)
 * @param {vec2} max - Maximum screen coordinates (0-1, 0-1)
 */
function setScreenRegion(min, max) {
    script.screenRegionMin = min;
    script.screenRegionMax = max;
}

// Initialize on script load
initialize();

// Expose public API
script.api.setMinSwipeDistance = setMinSwipeDistance;
script.api.setMaxSwipeTime = setMaxSwipeTime;
script.api.setDetectHorizontal = setDetectHorizontal;
script.api.setDetectVertical = setDetectVertical;
script.api.setScreenRegion = setScreenRegion;
script.api.onSwipe = null; // User can set this callback
script.api.onSwipeLeft = null; // User can set this callback
script.api.onSwipeRight = null; // User can set this callback
script.api.onSwipeUp = null; // User can set this callback
script.api.onSwipeDown = null; // User can set this callback 