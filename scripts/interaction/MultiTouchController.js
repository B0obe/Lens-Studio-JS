/**
 * MultiTouchController.js
 * 
 * @description Handles multi-touch interactions with objects
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * MultiTouchController Script Component
 * This script provides multi-touch control capabilities for objects in Lens Studio,
 * allowing users to move, rotate, and scale objects with intuitive touch gestures.
 * 
 * @usage
 * 1. Add this script to any Scene Object
 * 2. Configure which transform properties to affect (position, rotation, scale)
 * 3. Run the Lens and use two-finger gestures to manipulate the object
 */

// @input bool enableTranslation = true /** Allow moving the object */
// @input bool enableRotation = true /** Allow rotating the object */
// @input bool enableScaling = true /** Allow scaling the object */
// @input bool localTransform = true /** Use local transform instead of world transform */
// @input bool maintainAspectRatio = true /** Maintain aspect ratio when scaling */
// @input SceneObject targetObject = null /** Object to control (uses this object if null) */
// @input float translationSensitivity = 1.0 /** Movement sensitivity */
// @input float rotationSensitivity = 1.0 /** Rotation sensitivity */
// @input float scalingSensitivity = 1.0 /** Scaling sensitivity */
// @input float minScale = 0.1 /** Minimum scale allowed */
// @input float maxScale = 10.0 /** Maximum scale allowed */
// @input bool constrainToScreen = false /** Keep object visible on screen */
// @input bool resetOnRelease = false /** Reset transform when touch ends */
// @input vec3 translationAxis = {x:1.0, y:1.0, z:0.0} /** Axes to allow translation on */
// @input vec3 rotationAxis = {x:0.0, y:0.0, z:1.0} /** Axes to allow rotation around */

// Script global variables
var touchSystem = null;
var target = null;
var transform = null;
var initialTouchPosition = null;
var initialTransform = null;
var initialDistance = 0;
var currentTouchId1 = -1;
var currentTouchId2 = -1;
var isMultiTouching = false;
var lastTouchPosition = null;
var lastTouchDistance = 0;
var isTouchActive = false;
var savedScale = null;
var screenBounds = new vec4(-0.5, -0.5, 0.5, 0.5); // left, bottom, right, top

/**
 * Initialize the script
 */
function initialize() {
    // Get touch system
    touchSystem = global.scene.getTouchSystem();
    
    // Get target object
    target = script.targetObject ? script.targetObject : script.getSceneObject();
    transform = target.getTransform();
    
    // Save initial transform
    initialTransform = {
        position: script.localTransform ? transform.getLocalPosition() : transform.getWorldPosition(),
        rotation: script.localTransform ? transform.getLocalRotation() : transform.getWorldRotation(),
        scale: script.localTransform ? transform.getLocalScale() : transform.getWorldScale()
    };
    
    // Create events
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
}

/**
 * Update function called every frame
 */
function onUpdate() {
    // Check for touches
    var touchCount = touchSystem.getTouchCount();
    
    if (touchCount === 0) {
        endMultiTouch();
        return;
    } else if (touchCount >= 2) {
        // Handle multi-touch
        handleMultiTouch();
    }
}

/**
 * Handle multi-touch interactions
 */
function handleMultiTouch() {
    // Get first two touches
    var touch1 = {
        id: touchSystem.getTouchId(0),
        pos: touchSystem.getTouchPosition(0)
    };
    
    var touch2 = {
        id: touchSystem.getTouchId(1),
        pos: touchSystem.getTouchPosition(1)
    };
    
    // Check if this is a new multi-touch
    if (!isMultiTouching || touch1.id !== currentTouchId1 || touch2.id !== currentTouchId2) {
        // Start new multi-touch
        startMultiTouch(touch1, touch2);
        return;
    }
    
    // Calculate touch movement
    var currentCenter = touch1.pos.add(touch2.pos).uniformScale(0.5);
    var deltaPosition = currentCenter.sub(lastTouchPosition);
    
    // Calculate distance between touches for scaling
    var currentDistance = touch1.pos.distance(touch2.pos);
    var scaleFactor = currentDistance / lastTouchDistance;
    
    // Calculate rotation angle
    var prevVector = touch1.pos.sub(touch2.pos);
    var currentVector = touch1.pos.sub(touch2.pos);
    var angleInRadians = Math.atan2(prevVector.y, prevVector.x) - Math.atan2(currentVector.y, currentVector.x);
    
    // Apply transformations
    if (script.enableTranslation) {
        applyTranslation(deltaPosition);
    }
    
    if (script.enableScaling && Math.abs(scaleFactor - 1.0) > 0.01) {
        applyScaling(scaleFactor);
    }
    
    if (script.enableRotation && Math.abs(angleInRadians) > 0.01) {
        applyRotation(angleInRadians);
    }
    
    // Constrain to screen if needed
    if (script.constrainToScreen) {
        constrainToScreen();
    }
    
    // Update last touch information
    lastTouchPosition = currentCenter;
    lastTouchDistance = currentDistance;
}

/**
 * Start multi-touch tracking
 * @param {Object} touch1 - First touch information
 * @param {Object} touch2 - Second touch information
 */
function startMultiTouch(touch1, touch2) {
    isMultiTouching = true;
    isTouchActive = true;
    currentTouchId1 = touch1.id;
    currentTouchId2 = touch2.id;
    
    // Calculate center between touches
    lastTouchPosition = touch1.pos.add(touch2.pos).uniformScale(0.5);
    lastTouchDistance = touch1.pos.distance(touch2.pos);
    
    // Save current transform
    initialTransform.position = script.localTransform ? transform.getLocalPosition() : transform.getWorldPosition();
    initialTransform.rotation = script.localTransform ? transform.getLocalRotation() : transform.getWorldRotation();
    initialTransform.scale = script.localTransform ? transform.getLocalScale() : transform.getWorldScale();
    
    // Save current scale for maintaining aspect ratio
    savedScale = initialTransform.scale.clone();
}

/**
 * End multi-touch tracking
 */
function endMultiTouch() {
    if (!isMultiTouching) return;
    
    isMultiTouching = false;
    isTouchActive = false;
    currentTouchId1 = -1;
    currentTouchId2 = -1;
    
    // Reset transform if needed
    if (script.resetOnRelease) {
        resetTransform();
    }
}

/**
 * Apply translation based on touch movement
 * @param {vec2} deltaPosition - Change in position
 */
function applyTranslation(deltaPosition) {
    // Scale movement by sensitivity
    var dx = deltaPosition.x * script.translationSensitivity * 100;
    var dy = deltaPosition.y * script.translationSensitivity * 100;
    
    // Apply translation based on allowed axes
    var position = script.localTransform ? transform.getLocalPosition() : transform.getWorldPosition();
    var newPosition = new vec3(
        position.x + (dx * script.translationAxis.x),
        position.y + (dy * script.translationAxis.y),
        position.z
    );
    
    // Apply new position
    if (script.localTransform) {
        transform.setLocalPosition(newPosition);
    } else {
        transform.setWorldPosition(newPosition);
    }
}

/**
 * Apply scaling based on pinch gesture
 * @param {number} scaleFactor - Scaling factor
 */
function applyScaling(scaleFactor) {
    // Adjust scale factor by sensitivity
    var adjustedScaleFactor = 1.0 + ((scaleFactor - 1.0) * script.scalingSensitivity);
    
    // Get current scale
    var currentScale = script.localTransform ? transform.getLocalScale() : transform.getWorldScale();
    var newScale;
    
    if (script.maintainAspectRatio) {
        // Calculate uniform scale
        var uniformScale = adjustedScaleFactor;
        newScale = savedScale.uniformScale(uniformScale);
    } else {
        // Calculate non-uniform scale
        newScale = new vec3(
            savedScale.x * adjustedScaleFactor,
            savedScale.y * adjustedScaleFactor,
            savedScale.z * adjustedScaleFactor
        );
    }
    
    // Clamp scale to min/max
    newScale.x = Math.max(script.minScale, Math.min(script.maxScale, newScale.x));
    newScale.y = Math.max(script.minScale, Math.min(script.maxScale, newScale.y));
    newScale.z = Math.max(script.minScale, Math.min(script.maxScale, newScale.z));
    
    // Apply new scale
    if (script.localTransform) {
        transform.setLocalScale(newScale);
    } else {
        transform.setWorldScale(newScale);
    }
    
    // Update saved scale
    savedScale = newScale.clone();
}

/**
 * Apply rotation based on touch movement
 * @param {number} angleInRadians - Rotation angle in radians
 */
function applyRotation(angleInRadians) {
    // Adjust rotation by sensitivity
    var adjustedAngle = angleInRadians * script.rotationSensitivity;
    
    // Convert radians to degrees
    var angleDegrees = adjustedAngle * 180 / Math.PI;
    
    // Create rotation quaternion
    var rotationQuat = quat.fromEulerAngles(
        angleDegrees * script.rotationAxis.x,
        angleDegrees * script.rotationAxis.y,
        angleDegrees * script.rotationAxis.z
    );
    
    // Get current rotation
    var currentRotation = script.localTransform ? transform.getLocalRotation() : transform.getWorldRotation();
    var newRotation = rotationQuat.multiply(currentRotation);
    
    // Apply new rotation
    if (script.localTransform) {
        transform.setLocalRotation(newRotation);
    } else {
        transform.setWorldRotation(newRotation);
    }
}

/**
 * Constrain object to screen bounds
 */
function constrainToScreen() {
    if (!script.constrainToScreen) return;
    
    // Get position in screen space
    var camera = global.scene.getCameraProvider().getMainCamera();
    var screenPos = camera.worldSpaceToScreenSpace(transform.getWorldPosition());
    
    var isOutOfBounds = false;
    var newPos = screenPos.clone();
    
    // Check and adjust horizontal position
    if (screenPos.x < screenBounds.x) {
        newPos.x = screenBounds.x;
        isOutOfBounds = true;
    } else if (screenPos.x > screenBounds.z) {
        newPos.x = screenBounds.z;
        isOutOfBounds = true;
    }
    
    // Check and adjust vertical position
    if (screenPos.y < screenBounds.y) {
        newPos.y = screenBounds.y;
        isOutOfBounds = true;
    } else if (screenPos.y > screenBounds.w) {
        newPos.y = screenBounds.w;
        isOutOfBounds = true;
    }
    
    // If out of bounds, update position
    if (isOutOfBounds) {
        var worldPos = camera.screenSpaceToWorldSpace(newPos);
        transform.setWorldPosition(worldPos);
    }
}

/**
 * Reset object to initial transform
 */
function resetTransform() {
    if (script.localTransform) {
        transform.setLocalPosition(initialTransform.position);
        transform.setLocalRotation(initialTransform.rotation);
        transform.setLocalScale(initialTransform.scale);
    } else {
        transform.setWorldPosition(initialTransform.position);
        transform.setWorldRotation(initialTransform.rotation);
        transform.setWorldScale(initialTransform.scale);
    }
}

/**
 * Enable specific transform control
 * @param {string} type - Type of transform to enable ("translation", "rotation", or "scaling")
 */
function enableControl(type) {
    switch (type) {
        case "translation":
            script.enableTranslation = true;
            break;
            
        case "rotation":
            script.enableRotation = true;
            break;
            
        case "scaling":
            script.enableScaling = true;
            break;
            
        case "all":
            script.enableTranslation = true;
            script.enableRotation = true;
            script.enableScaling = true;
            break;
    }
}

/**
 * Disable specific transform control
 * @param {string} type - Type of transform to disable ("translation", "rotation", or "scaling")
 */
function disableControl(type) {
    switch (type) {
        case "translation":
            script.enableTranslation = false;
            break;
            
        case "rotation":
            script.enableRotation = false;
            break;
            
        case "scaling":
            script.enableScaling = false;
            break;
            
        case "all":
            script.enableTranslation = false;
            script.enableRotation = false;
            script.enableScaling = false;
            break;
    }
}

/**
 * Set the translation sensitivity
 * @param {number} sensitivity - New sensitivity value
 */
function setTranslationSensitivity(sensitivity) {
    script.translationSensitivity = Math.max(0.1, sensitivity);
}

/**
 * Set the rotation sensitivity
 * @param {number} sensitivity - New sensitivity value
 */
function setRotationSensitivity(sensitivity) {
    script.rotationSensitivity = Math.max(0.1, sensitivity);
}

/**
 * Set the scaling sensitivity
 * @param {number} sensitivity - New sensitivity value
 */
function setScalingSensitivity(sensitivity) {
    script.scalingSensitivity = Math.max(0.1, sensitivity);
}

/**
 * Set the minimum allowed scale
 * @param {number} min - Minimum scale value
 */
function setMinScale(min) {
    script.minScale = Math.max(0.01, min);
}

/**
 * Set the maximum allowed scale
 * @param {number} max - Maximum scale value
 */
function setMaxScale(max) {
    script.maxScale = Math.max(script.minScale, max);
}

/**
 * Set whether to constrain the object to screen bounds
 * @param {boolean} constrain - Whether to constrain to screen
 */
function setConstrainToScreen(constrain) {
    script.constrainToScreen = constrain;
}

/**
 * Set whether to reset on touch release
 * @param {boolean} reset - Whether to reset on release
 */
function setResetOnRelease(reset) {
    script.resetOnRelease = reset;
}

/**
 * Check if multi-touch is currently active
 * @returns {boolean} - Whether multi-touch is active
 */
function isActive() {
    return isTouchActive;
}

// Initialize the script when it's loaded
initialize();

// Expose API functions
script.api.enableControl = enableControl;
script.api.disableControl = disableControl;
script.api.setTranslationSensitivity = setTranslationSensitivity;
script.api.setRotationSensitivity = setRotationSensitivity;
script.api.setScalingSensitivity = setScalingSensitivity;
script.api.setMinScale = setMinScale;
script.api.setMaxScale = setMaxScale;
script.api.setConstrainToScreen = setConstrainToScreen;
script.api.setResetOnRelease = setResetOnRelease;
script.api.isActive = isActive;
script.api.resetTransform = resetTransform; 