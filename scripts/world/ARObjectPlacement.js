/**
 * ARObjectPlacement.js
 * 
 * @description Place objects in AR with tap or surface detection
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * ARObjectPlacement Script Component
 * This script allows users to place objects in AR with tap gestures, surface detection, or world tracking.
 * It supports various placement modes, collision detection, and visual feedback.
 * 
 * @usage
 * 1. Add this script to any Scene Object
 * 2. Set the placement object(s)
 * 3. Configure placement parameters
 * 4. Start the AR session
 */

// @input SceneObject placementObject /** Object to place in AR */
// @input SceneObject[] additionalObjects {"showIf":"showAdvanced"} /** Additional objects to place with the main object */
// @input string placementMode = "tap" {"widget":"combobox", "values":[{"value":"tap", "label":"Tap to Place"}, {"value":"surface", "label":"Surface Detection"}, {"value":"worldTracking", "label":"World Tracking"}]} /** How objects are placed in AR */
// @input bool alignToSurface = true /** Align placed objects to surface normals */
// @input bool useHitTest = true /** Use hit test for more accurate placement */
// @input bool showPlacementMarker = true /** Show a placement marker before placing objects */
// @input Asset.Material placementMarkerMaterial {"showIf":"showPlacementMarker"} /** Material for the placement marker */
// @input bool allowMultiplePlacements = true /** Allow placing multiple objects */
// @input float minPlacementDistance = 30 {"showIf":"allowMultiplePlacements"} /** Minimum distance between placed objects (cm) */
// @input bool enableDragAfterPlacement = false /** Allow objects to be dragged after placement */
// @input bool showAdvanced = false /** Show advanced options */

// Script global variables
var isARSessionActive = false;
var placedObjects = [];
var placementMarker = null;
var surfaceTracker = null;
var touchSystem = null;

/**
 * Initialize the script
 */
function initialize() {
    // Get touch system
    touchSystem = global.scene.getTouchSystem();
    
    if (!script.placementObject) {
        print("ARObjectPlacement: Please assign a placementObject in the Inspector");
        return;
    }
    
    // Hide placement object initially
    script.placementObject.enabled = false;
    
    // Hide additional objects initially
    if (script.additionalObjects) {
        for (var i = 0; i < script.additionalObjects.length; i++) {
            if (script.additionalObjects[i]) {
                script.additionalObjects[i].enabled = false;
            }
        }
    }
    
    // Create placement marker if enabled
    if (script.showPlacementMarker) {
        createPlacementMarker();
    }
    
    // Set up based on placement mode
    setupPlacementMode();
    
    // Start AR session
    startARSession();
}

/**
 * Create the placement marker
 */
function createPlacementMarker() {
    placementMarker = global.scene.createSceneObject("PlacementMarker");
    
    // Add a circle mesh to the marker
    var circle = placementMarker.createComponent("Component.RenderMeshVisual");
    circle.mesh = global.scene.createComponent("Component.MeshBuilder");
    circle.mesh.createDisk(20, 64);
    
    // Set material if provided
    if (script.placementMarkerMaterial) {
        circle.material = script.placementMarkerMaterial;
    }
    
    // Hide marker initially
    placementMarker.enabled = false;
}

/**
 * Set up the script based on the selected placement mode
 */
function setupPlacementMode() {
    switch (script.placementMode) {
        case "tap":
            setupTapPlacement();
            break;
            
        case "surface":
            setupSurfaceTracking();
            break;
            
        case "worldTracking":
            setupWorldTracking();
            break;
    }
}

/**
 * Set up tap placement mode
 */
function setupTapPlacement() {
    // Create tap event
    var tapEvent = script.createEvent("TapEvent");
    tapEvent.bind(onTap);
}

/**
 * Set up surface tracking mode
 */
function setupSurfaceTracking() {
    // Find surface tracker in the scene
    var surfaceTrackers = global.scene.getRootObject().findComponents("Component.SurfaceTracking");
    
    if (surfaceTrackers.length > 0) {
        surfaceTracker = surfaceTrackers[0];
    } else {
        print("ARObjectPlacement: No SurfaceTracking component found in the scene");
    }
    
    // Create update event
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
}

/**
 * Set up world tracking mode
 */
function setupWorldTracking() {
    // Find world tracking in the scene
    var worldTrackingComponents = global.scene.getRootObject().findComponents("Component.WorldTracking");
    
    if (worldTrackingComponents.length === 0) {
        print("ARObjectPlacement: No WorldTracking component found in the scene");
    }
    
    // Create update event
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
}

/**
 * Handle tap events
 */
function onTap(eventData) {
    if (!isARSessionActive) return;
    
    var touchPos = eventData.getTapPosition();
    
    if (script.useHitTest) {
        performHitTest(touchPos);
    } else {
        // Place object directly at tap position
        placeObjectAtScreenPoint(touchPos);
    }
}

/**
 * Perform hit test at screen point
 * @param {vec2} screenPoint - Screen position to test
 */
function performHitTest(screenPoint) {
    var hitTestResults = touchSystem.hitTest(screenPoint);
    
    if (hitTestResults.length > 0) {
        // Use the closest hit result
        var hitResult = hitTestResults[0];
        placeObjectAtTransform(hitResult.worldTransform);
    }
}

/**
 * Place object at screen point
 * @param {vec2} screenPoint - Screen position to place object
 */
function placeObjectAtScreenPoint(screenPoint) {
    // Use camera and raycasting to determine placement position
    var camera = global.scene.getCameraProvider().getMainCamera();
    var rayDir = camera.screenSpaceToWorldSpace(screenPoint, 1).sub(camera.getTransform().getWorldPosition()).normalize();
    
    // Set a default distance
    var placementDistance = 100;
    
    // Create placement position
    var position = camera.getTransform().getWorldPosition().add(rayDir.uniformScale(placementDistance));
    
    // Create placement transform
    var transform = new global.scene.Transform();
    transform.setWorldPosition(position);
    
    // Place the object
    placeObjectAtTransform(transform);
}

/**
 * Update function called every frame
 */
function onUpdate() {
    if (!isARSessionActive) return;
    
    updatePlacementMarker();
    
    // Place object on tap in surface and world tracking modes
    if (script.placementMode !== "tap" && touchSystem.getTouchCount() > 0 && touchSystem.isTouchEnding(0)) {
        var touchPos = touchSystem.getTouchPosition(0);
        
        if (script.useHitTest) {
            performHitTest(touchPos);
        } else {
            placeObjectAtScreenPoint(touchPos);
        }
    }
}

/**
 * Update placement marker position
 */
function updatePlacementMarker() {
    if (!script.showPlacementMarker || !placementMarker) return;
    
    // Show marker only if not placing objects or if multiple placements allowed
    var shouldShowMarker = script.allowMultiplePlacements || placedObjects.length === 0;
    placementMarker.enabled = shouldShowMarker;
    
    if (!shouldShowMarker) return;
    
    // Get center of screen
    var screenCenter = new vec2(0.5, 0.5);
    
    if (script.useHitTest) {
        // Try to position marker using hit test
        var hitTestResults = touchSystem.hitTest(screenCenter);
        
        if (hitTestResults.length > 0) {
            var hitResult = hitTestResults[0];
            placementMarker.getTransform().setWorldPosition(hitResult.worldTransform.getPosition());
            
            // Align marker to surface normal if needed
            if (script.alignToSurface) {
                var normal = hitResult.normal;
                var lookRotation = quat.lookAt(normal, vec3.up());
                placementMarker.getTransform().setWorldRotation(lookRotation);
            }
        } else {
            placementMarker.enabled = false;
        }
    } else if (script.placementMode === "surface" && surfaceTracker) {
        // Use surface tracker for marker position
        placementMarker.getTransform().setWorldPosition(surfaceTracker.getSurfacePosition());
        
        // Align marker to surface normal if needed
        if (script.alignToSurface) {
            placementMarker.getTransform().setWorldRotation(surfaceTracker.getSurfaceRotation());
        }
    } else {
        // Default marker position
        var camera = global.scene.getCameraProvider().getMainCamera();
        var position = camera.getTransform().getWorldPosition().add(camera.getTransform().forward.uniformScale(100));
        placementMarker.getTransform().setWorldPosition(position);
    }
}

/**
 * Place object at transform
 * @param {Transform} worldTransform - World transform to place object at
 */
function placeObjectAtTransform(worldTransform) {
    // Check if we can place another object
    if (!script.allowMultiplePlacements && placedObjects.length > 0) {
        return;
    }
    
    // Check minimum distance if needed
    if (script.allowMultiplePlacements && script.minPlacementDistance > 0 && placedObjects.length > 0) {
        var position = worldTransform.getPosition();
        
        // Check distance to all placed objects
        for (var i = 0; i < placedObjects.length; i++) {
            var objPos = placedObjects[i].getTransform().getWorldPosition();
            var distance = position.distance(objPos);
            
            // Convert to centimeters
            distance = distance * 100;
            
            if (distance < script.minPlacementDistance) {
                print("ARObjectPlacement: Object too close to existing placement");
                return;
            }
        }
    }
    
    // Clone the placement object
    var newObject = script.placementObject.copy();
    newObject.enabled = true;
    
    // Set position and orientation
    newObject.getTransform().setWorldPosition(worldTransform.getPosition());
    
    if (script.alignToSurface) {
        newObject.getTransform().setWorldRotation(worldTransform.getRotation());
    }
    
    // Place additional objects if any
    if (script.additionalObjects) {
        for (var i = 0; i < script.additionalObjects.length; i++) {
            if (script.additionalObjects[i]) {
                var addObj = script.additionalObjects[i].copy();
                addObj.enabled = true;
                addObj.getTransform().setWorldPosition(worldTransform.getPosition());
                
                if (script.alignToSurface) {
                    addObj.getTransform().setWorldRotation(worldTransform.getRotation());
                }
                
                placedObjects.push(addObj);
            }
        }
    }
    
    // Add drag component if needed
    if (script.enableDragAfterPlacement) {
        addDragComponent(newObject);
    }
    
    // Add to placed objects
    placedObjects.push(newObject);
}

/**
 * Add drag component to an object
 * @param {SceneObject} obj - Object to add drag component to
 */
function addDragComponent(obj) {
    var dragScript = obj.createComponent("Component.ScriptComponent");
    dragScript.url = "DragObject.js"; // Assuming DragObject script exists
}

/**
 * Start AR session
 */
function startARSession() {
    isARSessionActive = true;
}

/**
 * Stop AR session
 */
function stopARSession() {
    isARSessionActive = false;
    
    // Hide placement marker
    if (placementMarker) {
        placementMarker.enabled = false;
    }
}

/**
 * Clear all placed objects
 */
function clearPlacedObjects() {
    for (var i = 0; i < placedObjects.length; i++) {
        placedObjects[i].destroy();
    }
    
    placedObjects = [];
}

/**
 * Set whether multiple placements are allowed
 * @param {boolean} allow - Whether to allow multiple placements
 */
function setAllowMultiplePlacements(allow) {
    script.allowMultiplePlacements = allow;
}

/**
 * Set minimum placement distance
 * @param {number} distance - Minimum distance in centimeters
 */
function setMinPlacementDistance(distance) {
    script.minPlacementDistance = distance;
}

/**
 * Set placement mode
 * @param {string} mode - Placement mode ("tap", "surface", or "worldTracking")
 */
function setPlacementMode(mode) {
    if (mode !== "tap" && mode !== "surface" && mode !== "worldTracking") {
        print("ARObjectPlacement: Invalid placement mode: " + mode);
        return;
    }
    
    script.placementMode = mode;
    setupPlacementMode();
}

// Initialize the script when it's loaded
initialize();

// Expose API functions
script.api.startARSession = startARSession;
script.api.stopARSession = stopARSession;
script.api.clearPlacedObjects = clearPlacedObjects;
script.api.setAllowMultiplePlacements = setAllowMultiplePlacements;
script.api.setMinPlacementDistance = setMinPlacementDistance;
script.api.setPlacementMode = setPlacementMode; 