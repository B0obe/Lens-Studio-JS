/**
 * SurfaceTracker.js
 * 
 * @description Track surfaces and place objects in the real world
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires WorldTracking
 */

/**
 * SurfaceTracker Script Component
 * This script enables placement of objects on detected real-world surfaces.
 * It handles tap detection and uses world tracking to place objects on horizontal surfaces.
 * 
 * @usage
 * 1. Make sure World Tracking is enabled in your project
 * 2. Add this script to a Scene Object
 * 3. Set a target object to place on surfaces
 * 4. Configure placement options
 */
// @input SceneObject targetObject /** The object to place on surfaces */
// @input int maxPlacementCount = 10 /** Maximum number of objects to place (0 for unlimited) */
// @input bool allowRepositioning = true /** Allow moving objects after placement */
// @input bool alignToSurfaceNormal = true /** Rotate object to align with surface */
// @input bool applySurfaceScale = false /** Scale object based on distance from camera */
// @input float minScale = 0.5 /** Minimum object scale */
// @input float maxScale = 2.0 /** Maximum object scale */
// @input bool showSurfaceHint = true /** Show a visual hint for trackable surfaces */
// @input Asset.Material hintMaterial /** Optional material for surface hint */
// @input float hintScale = 10.0 /** Size of the surface hint */

// Script global variables
var worldTrackingEnabled = false;
var surfaceHintObject = null;
var placedObjects = [];
var repositioningObject = null;
var surfaceTrackingComponent = null;

/**
 * Initialize the script
 */
function initialize() {
    // Check if world tracking is available
    if (!global.WorldTracking) {
        print("SurfaceTracker: ERROR - World Tracking is not enabled in project");
        return;
    }
    
    // Check if a target object is specified
    if (!script.targetObject) {
        print("SurfaceTracker: ERROR - No target object specified");
        return;
    }
    
    // Create a hint object if requested
    if (script.showSurfaceHint) {
        createSurfaceHint();
    }
    
    // Hide the original target object
    script.targetObject.enabled = false;
    
    // Create and configure surface tracking
    configureWorldTracking();
    
    // Create touch events for placing objects
    createEvents();
    
    worldTrackingEnabled = true;
    print("SurfaceTracker: Initialized successfully");
}

/**
 * Configure world tracking component
 */
function configureWorldTracking() {
    // Get or create the tracking component
    surfaceTrackingComponent = script.getSceneObject().getComponent("Component.WorldTrackingComponent");
    if (!surfaceTrackingComponent) {
        surfaceTrackingComponent = script.getSceneObject().createComponent("Component.WorldTrackingComponent");
    }
}

/**
 * Create a hint object to show trackable surfaces
 */
function createSurfaceHint() {
    // Create a plane object for the hint
    surfaceHintObject = scene.createSceneObject("SurfaceHint");
    var meshVisual = surfaceHintObject.createComponent("Component.MeshVisual");
    
    // Set up the mesh for the hint
    meshVisual.mesh = Assets.findFirst("Plane");
    
    // Apply material if provided, otherwise use a default
    if (script.hintMaterial) {
        meshVisual.mainMaterial = script.hintMaterial;
    } else {
        // Default material with some transparency
        var defaultMat = scene.createSceneObject("DefaultMaterial").createComponent("Component.MaterialMeshVisual");
        defaultMat.mainPass.baseColor = new vec4(0.0, 0.5, 1.0, 0.3); // Semi-transparent blue
        meshVisual.mainMaterial = defaultMat;
    }
    
    // Set scale
    surfaceHintObject.getTransform().setLocalScale(new vec3(script.hintScale, 1.0, script.hintScale));
    
    // Initially hidden
    surfaceHintObject.enabled = false;
}

/**
 * Create events for surface tracking and touch
 */
function createEvents() {
    // Create event for handling surface tracking results
    var worldTrackingEvent = script.createEvent("WorldTrackingEvent");
    worldTrackingEvent.bind(onWorldTracking);
    
    // Create event for handling tap
    var tapEvent = script.createEvent("TapEvent");
    tapEvent.bind(onTap);
    
    // Create update event for repositioning
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
}

/**
 * Handle world tracking event
 */
function onWorldTracking(eventData) {
    if (!worldTrackingEnabled) return;
    
    // Check if a surface was found
    if (eventData.trackingState == WorldTrackingState.Tracking) {
        // Update hint if available
        if (script.showSurfaceHint && surfaceHintObject) {
            surfaceHintObject.enabled = true;
            surfaceHintObject.getTransform().setWorldPosition(eventData.surfacePosition);
            
            if (script.alignToSurfaceNormal) {
                // Align hint to surface normal
                alignObjectToSurfaceNormal(surfaceHintObject, eventData.surfaceNormal);
            }
        }
    } else {
        // Hide hint if no surface detected
        if (surfaceHintObject) {
            surfaceHintObject.enabled = false;
        }
    }
}

/**
 * Handle tap event for placing objects
 */
function onTap(eventData) {
    if (!worldTrackingEnabled) return;
    
    // Get touch position
    var touchPos = eventData.getTapPosition();
    
    // If we're repositioning an object, stop repositioning
    if (repositioningObject) {
        repositioningObject = null;
        return;
    }
    
    // Check if we tapped on an existing object to reposition
    var tappedObj = findTappedObject(touchPos);
    if (tappedObj && script.allowRepositioning) {
        repositioningObject = tappedObj;
        return;
    }
    
    // Check if we've reached max placement count
    if (script.maxPlacementCount > 0 && placedObjects.length >= script.maxPlacementCount) {
        print("SurfaceTracker: Maximum placement count reached");
        return;
    }

    // Get the world position from touch
    var worldPos = surfaceTrackingComponent.hitTestWorldPoint(touchPos);
    if (!worldPos) {
        print("SurfaceTracker: No surface detected at tap position");
        return;
    }
    
    // Get the surface normal
    var surfaceNormal = surfaceTrackingComponent.getSurfaceNormal();
    
    // Place a new object
    placeObject(worldPos, surfaceNormal);
}

/**
 * Place an object at the specified world position
 */
function placeObject(worldPos, normal) {
    // Create a new instance of the target object
    var newObject = script.targetObject.clone();
    newObject.enabled = true;
    newObject.getTransform().setWorldPosition(worldPos);
    
    // Align to surface normal if needed
    if (script.alignToSurfaceNormal) {
        alignObjectToSurfaceNormal(newObject, normal);
    }
    
    // Scale based on distance if needed
    if (script.applySurfaceScale) {
        var cameraPos = scene.getCameraObject().getTransform().getWorldPosition();
        var dist = vec3.distance(worldPos, cameraPos);
        var scaleFactor = Math.max(script.minScale, Math.min(script.maxScale, dist / 100.0));
        newObject.getTransform().setWorldScale(new vec3(scaleFactor, scaleFactor, scaleFactor));
    }
    
    // Add to placed objects array
    placedObjects.push(newObject);
    
    print("SurfaceTracker: Object placed at " + worldPos.toString());
}

/**
 * Align an object to the surface normal
 */
function alignObjectToSurfaceNormal(obj, normal) {
    // Create a rotation that aligns the object's up vector with the surface normal
    var upVector = new vec3(0, 1, 0); // Assuming Y is up
    var rotationAxis = vec3.cross(upVector, normal).normalize();
    var rotationAngle = Math.acos(vec3.dot(upVector, normal));
    
    if (rotationAxis.length() < 0.001) {
        // Vectors are nearly parallel, no need for rotation
        return;
    }
    
    var rotation = quat.angleAxis(rotationAngle, rotationAxis);
    obj.getTransform().setWorldRotation(rotation);
}

/**
 * Find an object that was tapped
 */
function findTappedObject(screenPos) {
    // Simplified hit testing - in a real implementation you'd use raycasting
    // For now we just check if any placed object centers are near the tap
    var touchPos3D = scene.unprojectToWorldSpace(screenPos.x, screenPos.y, 0.5);
    var camera = scene.getCameraObject();
    var camPos = camera.getTransform().getWorldPosition();
    var touchDir = vec3.normalize(touchPos3D.sub(camPos));
    
    // Find the closest object within a reasonable distance
    var closestObj = null;
    var closestDist = 0.05; // Screen-space distance threshold (simplified)
    
    for (var i = 0; i < placedObjects.length; i++) {
        var obj = placedObjects[i];
        var objPos = obj.getTransform().getWorldPosition();
        var objScreenPos = scene.projectWorldPoint(objPos);
        
        var screenDist = vec2.distance(new vec2(screenPos.x, screenPos.y), 
                                      new vec2(objScreenPos.x, objScreenPos.y));
        
        if (screenDist < closestDist) {
            closestDist = screenDist;
            closestObj = obj;
        }
    }
    
    return closestObj;
}

/**
 * Update function called every frame
 */
function onUpdate(eventData) {
    if (!worldTrackingEnabled) return;
    
    // Handle repositioning of an object
    if (repositioningObject && script.allowRepositioning) {
        // Get the current world tracking data
        var worldTrackingData = surfaceTrackingComponent.getWorldTrackingInfo();
        
        if (worldTrackingData.trackingState == WorldTrackingState.Tracking) {
            // Update object position to follow the detected surface
            repositioningObject.getTransform().setWorldPosition(worldTrackingData.surfacePosition);
            
            // Align to surface normal if needed
            if (script.alignToSurfaceNormal) {
                alignObjectToSurfaceNormal(repositioningObject, worldTrackingData.surfaceNormal);
            }
        }
    }
}

/**
 * Reset and remove all placed objects
 */
function clearAllPlacedObjects() {
    for (var i = 0; i < placedObjects.length; i++) {
        scene.destroyObject(placedObjects[i]);
    }
    placedObjects = [];
    repositioningObject = null;
}

/**
 * Enable or disable surface tracking
 */
function setEnabled(isEnabled) {
    worldTrackingEnabled = isEnabled;
    if (surfaceHintObject) {
        surfaceHintObject.enabled = isEnabled && script.showSurfaceHint;
    }
}

/**
 * Set whether the surface hint is visible
 */
function setSurfaceHintVisible(isVisible) {
    script.showSurfaceHint = isVisible;
    if (surfaceHintObject) {
        surfaceHintObject.enabled = isVisible && worldTrackingEnabled;
    }
}

// Initialize on script load
initialize();

// Expose public API
script.api.setEnabled = setEnabled;
script.api.clearAllPlacedObjects = clearAllPlacedObjects;
script.api.setSurfaceHintVisible = setSurfaceHintVisible; 