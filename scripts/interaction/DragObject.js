/**
 * DragObject.js
 * 
 * @description Makes objects draggable with touch input in Lens Studio
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires SceneObject
 */

/**
 * DragObject Script Component
 * This script allows users to drag objects around the screen with touch input.
 * 
 * @usage
 * 1. Add this script to any object you want to make draggable
 * 2. Configure the constraints and sensitivity parameters
 * 3. Customize the drag behavior with the available options
 */
// @input SceneObject targetObject /** Object to be draggable (defaults to this object if not set) */
// @input bool enableDragging = true /** Whether dragging is enabled */
// @input bool returnToStartPos = false /** Whether object should return to start position when released */
// @input bool constrainX = false /** Prevent horizontal movement */
// @input bool constrainY = false /** Prevent vertical movement */
// @input bool constrainToScreen = true /** Keep object within screen bounds */
// @input float dragSpeed = 1.0 /** Drag speed multiplier */
// @input float returnSpeed = 3.0 /** Speed at which object returns to start position */
// @input bool enableInertia = false /** Whether to add inertia when the object is released */
// @input float inertiaFactor = 0.95 /** How quickly inertia slows down (0-1) */

// Script global variables
var isDragging = false;
var touchPosition = new vec2(0, 0);
var lastTouchPosition = new vec2(0, 0);
var dragVelocity = new vec2(0, 0);
var startScreenPos = new vec2(0, 0);
var startObjectPos = new vec3(0, 0, 0);
var objectScreenPos = new vec2(0, 0);
var camera = null;

/**
 * Initialize the script
 */
function initialize() {
    // If no target object specified, use the object this script is attached to
    if (!script.targetObject) {
        script.targetObject = script.getSceneObject();
    }

    // Store original positions
    startObjectPos = script.targetObject.getTransform().getLocalPosition();
    
    // Get the main camera
    camera = getCameraObject();
    if (camera) {
        // Calculate screen position
        startScreenPos = camera.worldPointToScreenPoint(script.targetObject.getTransform().getWorldPosition());
    }
}

/**
 * Find the scene camera
 */
function getCameraObject() {
    // Try to find the scene's main camera
    var camera = scene.getCameraByIndex(0);
    if (!camera) {
        print("DragObject: Warning - No camera found in the scene");
    }
    return camera;
}

/**
 * Event handler for when a touch starts
 */
function onTouchStart(eventData) {
    if (!script.enableDragging) return;
    
    // Get touch position
    var touchPos = eventData.getTouchPosition();
    touchPosition.x = touchPos.x;
    touchPosition.y = touchPos.y;
    lastTouchPosition.x = touchPos.x;
    lastTouchPosition.y = touchPos.y;
    
    // Check if the touch is on the object
    if (camera) {
        objectScreenPos = camera.worldPointToScreenPoint(script.targetObject.getTransform().getWorldPosition());
        
        // Simple hit test - if touch is close enough to the object, start dragging
        var distanceToObject = vec2.distance(objectScreenPos, touchPosition);
        
        // Adjust the hit size based on the object's size (simplified)
        var hitSize = 0.1; // This is a simplified hit test - in a real scenario you'd use the object's bounds
        
        if (distanceToObject < hitSize) {
            isDragging = true;
            dragVelocity = new vec2(0, 0);
        }
    }
}

/**
 * Event handler for when a touch moves
 */
function onTouchMove(eventData) {
    if (!isDragging) return;
    
    // Get new touch position
    var touchPos = eventData.getTouchPosition();
    lastTouchPosition.x = touchPosition.x;
    lastTouchPosition.y = touchPosition.y;
    touchPosition.x = touchPos.x;
    touchPosition.y = touchPos.y;
    
    // Calculate delta movement
    var delta = new vec2(
        touchPosition.x - lastTouchPosition.x,
        touchPosition.y - lastTouchPosition.y
    );
    
    // Apply constraints
    if (script.constrainX) {
        delta.x = 0;
    }
    
    if (script.constrainY) {
        delta.y = 0;
    }
    
    // Move the object based on touch movement
    moveObject(delta);
    
    // Calculate velocity for inertia
    dragVelocity = delta.uniformScale(script.dragSpeed);
}

/**
 * Event handler for when a touch ends
 */
function onTouchEnd(eventData) {
    if (!isDragging) return;
    isDragging = false;
    
    if (script.returnToStartPos) {
        // Will be handled in update
    } else if (!script.enableInertia) {
        dragVelocity = new vec2(0, 0);
    }
}

/**
 * Move the object based on screen movement
 */
function moveObject(screenDelta) {
    if (!camera) return;
    
    // Get current world position
    var worldPos = script.targetObject.getTransform().getWorldPosition();
    
    // Project screen movement to world space
    var screenPos = camera.worldPointToScreenPoint(worldPos);
    var newScreenPos = new vec2(screenPos.x + screenDelta.x, screenPos.y + screenDelta.y);
    
    // Constrain to screen if enabled
    if (script.constrainToScreen) {
        newScreenPos.x = Math.max(0, Math.min(1, newScreenPos.x));
        newScreenPos.y = Math.max(0, Math.min(1, newScreenPos.y));
    }
    
    // Convert back to world position
    var newWorldPos = camera.screenPointToWorldPoint(newScreenPos, worldPos.z);
    
    // Convert world to local (parent) space
    var parent = script.targetObject.getParent();
    var newLocalPos;
    if (parent) {
        newLocalPos = parent.getTransform().worldToLocalPoint(newWorldPos);
    } else {
        newLocalPos = newWorldPos;
    }
    
    // Set the new position
    script.targetObject.getTransform().setLocalPosition(newLocalPos);
}

/**
 * Update function called every frame
 */
function onUpdate(eventData) {
    var dt = eventData.getDeltaTime();
    
    if (!isDragging) {
        if (script.returnToStartPos) {
            // Return to start position
            var currentPos = script.targetObject.getTransform().getLocalPosition();
            var newPos = vec3.lerp(currentPos, startObjectPos, dt * script.returnSpeed);
            script.targetObject.getTransform().setLocalPosition(newPos);
            
            // Reset velocity when close to start position
            if (vec3.distance(currentPos, startObjectPos) < 0.001) {
                dragVelocity = new vec2(0, 0);
            }
        } else if (script.enableInertia && !vec2.equal(dragVelocity, vec2.zero())) {
            // Apply inertia
            moveObject(dragVelocity.uniformScale(dt));
            
            // Dampen velocity
            dragVelocity = dragVelocity.uniformScale(script.inertiaFactor);
            
            // Stop when velocity gets very small
            if (vec2.length(dragVelocity) < 0.001) {
                dragVelocity = new vec2(0, 0);
            }
        }
    }
}

/**
 * Enable or disable dragging
 * @param {boolean} isEnabled - Whether to enable dragging
 */
function setDraggingEnabled(isEnabled) {
    script.enableDragging = isEnabled;
    if (!isEnabled) {
        isDragging = false;
    }
}

/**
 * Reset the object to its starting position
 */
function resetPosition() {
    script.targetObject.getTransform().setLocalPosition(startObjectPos);
    dragVelocity = new vec2(0, 0);
    isDragging = false;
}

/**
 * Set whether the object should return to start position when released
 * @param {boolean} shouldReturn - Whether to return to start
 */
function setReturnToStart(shouldReturn) {
    script.returnToStartPos = shouldReturn;
}

// Initialize on script load
initialize();

// Bind touch events
var touchStartEvent = script.createEvent("TouchStartEvent");
touchStartEvent.bind(onTouchStart);

var touchMoveEvent = script.createEvent("TouchMoveEvent");
touchMoveEvent.bind(onTouchMove);

var touchEndEvent = script.createEvent("TouchEndEvent");
touchEndEvent.bind(onTouchEnd);

// Bind update event
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

// Expose public API
script.api.setDraggingEnabled = setDraggingEnabled;
script.api.resetPosition = resetPosition;
script.api.setReturnToStart = setReturnToStart; 