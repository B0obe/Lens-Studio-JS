/**
 * CameraController.js
 * 
 * @description Control camera movement, transitions, and effects
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * CameraController Script Component
 * This script provides control over camera movement, transitions, and effects.
 * It allows for smooth camera animations, shake effects, and field of view control.
 * 
 * @usage
 * 1. Add this script to a Camera object or parent of a Camera
 * 2. Configure camera movement parameters
 * 3. Use the API to control camera during runtime
 */
// @input Component.Camera camera /** Camera to control (uses first found camera if not set) */
// @input bool useOrbitControls = false /** Enable orbit controls for the camera */
// @input float orbitDistance = 10.0 {"showIf":"useOrbitControls"} /** Distance from orbit center */
// @input float orbitSpeed = 1.0 {"showIf":"useOrbitControls"} /** Orbit rotation speed */
// @input SceneObject lookAtTarget = null /** Object for the camera to look at */
// @input bool smoothFollow = false /** Enable smooth follow for lookAtTarget */
// @input float followSpeed = 5.0 {"showIf":"smoothFollow"} /** Follow speed (higher is faster) */
// @input bool enableTransitions = true /** Enable smooth transitions between positions */
// @input float transitionSpeed = 2.0 {"showIf":"enableTransitions"} /** Transition speed (higher is faster) */
// @input bool enableShake = true /** Enable camera shake effect */
// @input float shakeDamping = 0.9 {"showIf":"enableShake"} /** How quickly shake effect diminishes */
// @input bool enableFovControl = true /** Enable field of view control */
// @input float defaultFov = 60.0 {"showIf":"enableFovControl"} /** Default field of view in degrees */
// @input bool debugMode = false /** Show debug messages */

// Script global variables
var cameraComponent = null;
var cameraTransform = null;
var targetPosition = null;
var targetRotation = null;
var targetFov = null;
var isTransitioning = false;
var shakeAmount = 0;
var shakeVelocity = new vec3(0, 0, 0);
var orbitAngle = 0;
var orbitCenter = new vec3(0, 0, 0);
var initialized = false;

/**
 * Initialize the script
 */
function initialize() {
    if (initialized) return;
    
    // Get camera component
    cameraComponent = script.camera || script.getSceneObject().getComponent("Component.Camera");
    
    if (!cameraComponent) {
        // Try to find camera in children
        var children = script.getSceneObject().getChildren();
        for (var i = 0; i < children.length; i++) {
            var camera = children[i].getComponent("Component.Camera");
            if (camera) {
                cameraComponent = camera;
                break;
            }
        }
    }
    
    if (!cameraComponent) {
        print("CameraController: ERROR - No camera component found");
        return;
    }
    
    // Get camera transform
    cameraTransform = cameraComponent.getSceneObject().getTransform();
    
    // Set initial target values
    targetPosition = cameraTransform.getWorldPosition();
    targetRotation = cameraTransform.getWorldRotation();
    
    // Set initial FOV
    if (script.enableFovControl) {
        targetFov = script.defaultFov;
        cameraComponent.fov = targetFov;
    }
    
    // Set orbit center if using orbit controls
    if (script.useOrbitControls) {
        if (script.lookAtTarget) {
            orbitCenter = script.lookAtTarget.getTransform().getWorldPosition();
        }
    }
    
    // Create update event
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
    
    initialized = true;
    
    if (script.debugMode) {
        print("CameraController: Initialized successfully");
    }
}

/**
 * Update function called every frame
 */
function onUpdate(eventData) {
    var deltaTime = eventData.getDeltaTime();
    
    // Update orbit controls if enabled
    if (script.useOrbitControls) {
        updateOrbitControls(deltaTime);
    }
    // Update look at target if set
    else if (script.lookAtTarget) {
        updateLookAtTarget(deltaTime);
    }
    // Otherwise handle transitions
    else if (script.enableTransitions && isTransitioning) {
        updateTransition(deltaTime);
    }
    
    // Apply camera shake if enabled
    if (script.enableShake && shakeAmount > 0) {
        updateCameraShake(deltaTime);
    }
    
    // Update field of view if enabled
    if (script.enableFovControl && cameraComponent.fov !== targetFov) {
        updateFov(deltaTime);
    }
}

/**
 * Update orbit controls
 * @param {number} deltaTime - Time since last update
 */
function updateOrbitControls(deltaTime) {
    // Update orbit angle
    orbitAngle += script.orbitSpeed * deltaTime;
    
    // Update orbit center if following a target
    if (script.lookAtTarget) {
        if (script.smoothFollow) {
            // Smoothly move orbit center towards target
            var targetPos = script.lookAtTarget.getTransform().getWorldPosition();
            orbitCenter = vec3.lerp(orbitCenter, targetPos, deltaTime * script.followSpeed);
        } else {
            // Directly set orbit center to target
            orbitCenter = script.lookAtTarget.getTransform().getWorldPosition();
        }
    }
    
    // Calculate new camera position
    var x = orbitCenter.x + Math.cos(orbitAngle) * script.orbitDistance;
    var z = orbitCenter.z + Math.sin(orbitAngle) * script.orbitDistance;
    var newPosition = new vec3(x, orbitCenter.y, z);
    
    // Set camera position
    cameraTransform.setWorldPosition(newPosition);
    
    // Make camera look at orbit center
    lookAt(orbitCenter);
}

/**
 * Update look at target
 * @param {number} deltaTime - Time since last update
 */
function updateLookAtTarget(deltaTime) {
    var targetPos = script.lookAtTarget.getTransform().getWorldPosition();
    
    if (script.smoothFollow) {
        // Smoothly rotate to look at target
        var currentPos = cameraTransform.getWorldPosition();
        var direction = targetPos.sub(currentPos).normalize();
        var targetQuat = lookAtQuaternion(currentPos, targetPos, new vec3(0, 1, 0));
        
        // Interpolate rotation
        var newRotation = quat.slerp(
            cameraTransform.getWorldRotation(),
            targetQuat,
            deltaTime * script.followSpeed
        );
        
        cameraTransform.setWorldRotation(newRotation);
    } else {
        // Directly look at target
        lookAt(targetPos);
    }
}

/**
 * Update camera transition
 * @param {number} deltaTime - Time since last update
 */
function updateTransition(deltaTime) {
    var currentPos = cameraTransform.getWorldPosition();
    var currentRot = cameraTransform.getWorldRotation();
    var t = deltaTime * script.transitionSpeed;
    
    // Interpolate position
    var newPosition = vec3.lerp(currentPos, targetPosition, t);
    cameraTransform.setWorldPosition(newPosition);
    
    // Interpolate rotation
    var newRotation = quat.slerp(currentRot, targetRotation, t);
    cameraTransform.setWorldRotation(newRotation);
    
    // Check if transition is complete
    var posDistance = currentPos.distance(targetPosition);
    if (posDistance < 0.01) {
        isTransitioning = false;
        
        if (script.debugMode) {
            print("CameraController: Transition complete");
        }
    }
}

/**
 * Update camera shake effect
 * @param {number} deltaTime - Time since last update
 */
function updateCameraShake(deltaTime) {
    // Calculate random shake offset
    var offsetX = (Math.random() - 0.5) * 2 * shakeAmount;
    var offsetY = (Math.random() - 0.5) * 2 * shakeAmount;
    var offsetZ = (Math.random() - 0.5) * 2 * shakeAmount;
    
    // Apply shake offset
    var shakeOffset = new vec3(offsetX, offsetY, offsetZ);
    var currentPos = cameraTransform.getWorldPosition();
    cameraTransform.setWorldPosition(currentPos.add(shakeOffset));
    
    // Reduce shake amount over time
    shakeAmount *= script.shakeDamping;
    
    // Stop shaking if amount is very small
    if (shakeAmount < 0.001) {
        shakeAmount = 0;
        
        if (script.debugMode) {
            print("CameraController: Shake stopped");
        }
    }
}

/**
 * Update field of view
 * @param {number} deltaTime - Time since last update
 */
function updateFov(deltaTime) {
    // Interpolate FOV
    var currentFov = cameraComponent.fov;
    var t = deltaTime * script.transitionSpeed;
    var newFov = currentFov + (targetFov - currentFov) * t;
    
    // Apply new FOV
    cameraComponent.fov = newFov;
}

/**
 * Make the camera look at a position
 * @param {vec3} position - Position to look at
 */
function lookAt(position) {
    var currentPos = cameraTransform.getWorldPosition();
    var direction = position.sub(currentPos).normalize();
    var rotation = lookAtQuaternion(currentPos, position, new vec3(0, 1, 0));
    cameraTransform.setWorldRotation(rotation);
}

/**
 * Calculate quaternion to look at a point
 * @param {vec3} eyePos - Eye position
 * @param {vec3} targetPos - Target position
 * @param {vec3} upVector - Up vector
 * @returns {quat} - Rotation quaternion
 */
function lookAtQuaternion(eyePos, targetPos, upVector) {
    // Calculate look direction
    var forward = targetPos.sub(eyePos).normalize();
    
    // Calculate right vector
    var right = upVector.cross(forward).normalize();
    
    // Recalculate up vector
    var up = forward.cross(right).normalize();
    
    // Create rotation matrix
    var rotMatrix = new mat3(
        right.x, right.y, right.z,
        up.x, up.y, up.z,
        forward.x, forward.y, forward.z
    );
    
    // Convert to quaternion
    return quat.fromRotationMatrix(rotMatrix);
}

/**
 * Move camera to a new position and rotation
 * @param {vec3} position - New position
 * @param {quat} rotation - New rotation
 */
function moveTo(position, rotation) {
    if (script.enableTransitions) {
        // Start transition to new position and rotation
        targetPosition = position;
        targetRotation = rotation;
        isTransitioning = true;
        
        if (script.debugMode) {
            print("CameraController: Starting transition to new position and rotation");
        }
    } else {
        // Directly set position and rotation
        cameraTransform.setWorldPosition(position);
        cameraTransform.setWorldRotation(rotation);
        
        if (script.debugMode) {
            print("CameraController: Directly set new position and rotation");
        }
    }
}

/**
 * Move camera to look at a position
 * @param {vec3} position - Position to move to
 * @param {vec3} lookAtPos - Position to look at
 */
function moveToLookAt(position, lookAtPos) {
    // Calculate rotation to look at target
    var rotation = lookAtQuaternion(position, lookAtPos, new vec3(0, 1, 0));
    
    // Move to position and rotation
    moveTo(position, rotation);
}

/**
 * Shake the camera
 * @param {number} intensity - Shake intensity
 * @param {number} duration - Shake duration in seconds (optional)
 */
function shake(intensity, duration) {
    if (!script.enableShake) return;
    
    shakeAmount = intensity;
    
    if (script.debugMode) {
        print("CameraController: Starting camera shake with intensity " + intensity);
    }
    
    // If duration is specified, create a delayed event to stop shaking
    if (duration !== undefined) {
        var delayedEvent = script.createEvent("DelayedCallbackEvent");
        delayedEvent.bind(function() {
            shakeAmount = 0;
            
            if (script.debugMode) {
                print("CameraController: Shake duration completed");
            }
        });
        delayedEvent.reset(duration);
    }
}

/**
 * Set the field of view
 * @param {number} fov - New field of view in degrees
 */
function setFov(fov) {
    if (!script.enableFovControl) return;
    
    targetFov = Math.max(1, Math.min(179, fov));
    
    if (script.debugMode) {
        print("CameraController: Setting FOV to " + targetFov);
    }
}

/**
 * Reset field of view to default
 */
function resetFov() {
    if (!script.enableFovControl) return;
    
    targetFov = script.defaultFov;
    
    if (script.debugMode) {
        print("CameraController: Resetting FOV to default");
    }
}

/**
 * Set orbit center for orbit controls
 * @param {vec3} center - New orbit center
 */
function setOrbitCenter(center) {
    if (!script.useOrbitControls) return;
    
    orbitCenter = center;
    
    if (script.debugMode) {
        print("CameraController: Setting orbit center");
    }
}

/**
 * Set orbit distance for orbit controls
 * @param {number} distance - New orbit distance
 */
function setOrbitDistance(distance) {
    if (!script.useOrbitControls) return;
    
    script.orbitDistance = Math.max(0.1, distance);
    
    if (script.debugMode) {
        print("CameraController: Setting orbit distance to " + script.orbitDistance);
    }
}

/**
 * Set orbit speed for orbit controls
 * @param {number} speed - New orbit speed
 */
function setOrbitSpeed(speed) {
    if (!script.useOrbitControls) return;
    
    script.orbitSpeed = speed;
    
    if (script.debugMode) {
        print("CameraController: Setting orbit speed to " + script.orbitSpeed);
    }
}

/**
 * Get the camera component
 * @returns {Component.Camera} - Camera component
 */
function getCamera() {
    return cameraComponent;
}

/**
 * Get the camera transform
 * @returns {Component.Transform} - Camera transform
 */
function getCameraTransform() {
    return cameraTransform;
}

// Initialize on script load
initialize();

// Expose public API
script.api.moveTo = moveTo;
script.api.moveToLookAt = moveToLookAt;
script.api.lookAt = lookAt;
script.api.shake = shake;
script.api.setFov = setFov;
script.api.resetFov = resetFov;
script.api.setOrbitCenter = setOrbitCenter;
script.api.setOrbitDistance = setOrbitDistance;
script.api.setOrbitSpeed = setOrbitSpeed;
script.api.getCamera = getCamera;
script.api.getCameraTransform = getCameraTransform;
