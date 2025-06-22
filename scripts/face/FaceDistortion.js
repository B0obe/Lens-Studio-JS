/**
 * FaceDistortion.js
 * 
 * @description Create dynamic face distortion effects with customizable parameters
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires FaceTracking
 */

/**
 * FaceDistortion Script Component
 * This script provides an easy way to create face distortion effects.
 * It allows for dynamic control of various face mesh deformations.
 * 
 * @usage
 * 1. Add this script to an object with a Face Mesh Visual component
 * 2. Configure the distortion parameters
 * 3. Use the API to animate distortions during runtime
 */
// @input int faceIndex = 0 /** Face to track (0 is first face) */
// @input bool enableCheekPuff = true /** Enable cheek puff distortion */
// @input float cheekPuffAmount = 0.0 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01} /** Cheek puff amount */
// @input bool enableJawOpen = true /** Enable jaw open distortion */
// @input float jawOpenAmount = 0.0 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01} /** Jaw open amount */
// @input bool enableEyeOpen = true /** Enable eye open distortion */
// @input float eyeOpenAmount = 0.0 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01} /** Eye open amount */
// @input bool enableBrowRaise = true /** Enable brow raise distortion */
// @input float browRaiseAmount = 0.0 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01} /** Brow raise amount */
// @input bool enableSmile = true /** Enable smile distortion */
// @input float smileAmount = 0.0 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01} /** Smile amount */
// @input bool enableNoseSneer = true /** Enable nose sneer distortion */
// @input float noseSneerAmount = 0.0 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01} /** Nose sneer amount */
// @input bool autoApply = true /** Apply distortion values automatically */
// @input bool debugMode = false /** Show debug messages */

// Script global variables
var initialized = false;
var faceTransform = null;
var blendShapes = null;
var currentDistortions = {};

/**
 * Initialize the script
 */
function initialize() {
    if (initialized) return;
    
    // Check if face tracking is available
    if (!global.FaceTracking) {
        print("FaceDistortion: ERROR - Face tracking is not available");
        return;
    }
    
    // Get the face mesh if available
    setupFaceMesh();
    
    // Initialize current distortion values
    initializeDistortions();
    
    // Create update event if auto-apply is enabled
    if (script.autoApply) {
        var updateEvent = script.createEvent("UpdateEvent");
        updateEvent.bind(onUpdate);
    }
    
    initialized = true;
    
    if (script.debugMode) {
        print("FaceDistortion: Initialized successfully for face index " + script.faceIndex);
    }
}

/**
 * Set up the face mesh component
 */
function setupFaceMesh() {
    // Get the face mesh component
    var faceMeshVisual = script.getSceneObject().getComponent("Component.FaceMeshVisual");
    
    if (!faceMeshVisual) {
        print("FaceDistortion: WARNING - No FaceMeshVisual component found on this object");
        return;
    }
    
    // Set the face index
    faceMeshVisual.faceIndex = script.faceIndex;
    
    // Store reference to the face transform and blend shapes
    faceTransform = script.getSceneObject().getTransform();
    blendShapes = faceMeshVisual.blendShapes;
    
    if (!blendShapes) {
        print("FaceDistortion: WARNING - No blend shapes available on this face mesh");
    }
}

/**
 * Initialize distortion values
 */
function initializeDistortions() {
    // Store initial distortion values
    currentDistortions = {
        cheekPuff: script.cheekPuffAmount,
        jawOpen: script.jawOpenAmount,
        eyeOpen: script.eyeOpenAmount,
        browRaise: script.browRaiseAmount,
        smile: script.smileAmount,
        noseSneer: script.noseSneerAmount
    };
}

/**
 * Update function called every frame when auto-apply is enabled
 */
function onUpdate() {
    if (!initialized || !blendShapes) return;
    
    // Apply current distortion values
    applyDistortions();
}

/**
 * Apply current distortion values to the face mesh
 */
function applyDistortions() {
    if (!blendShapes) return;
    
    // Apply each enabled distortion
    if (script.enableCheekPuff) {
        blendShapes.setBlendShapeWeight("cheekPuff", currentDistortions.cheekPuff);
    }
    
    if (script.enableJawOpen) {
        blendShapes.setBlendShapeWeight("jawOpen", currentDistortions.jawOpen);
    }
    
    if (script.enableEyeOpen) {
        blendShapes.setBlendShapeWeight("eyeBlinkLeft", 1.0 - currentDistortions.eyeOpen);
        blendShapes.setBlendShapeWeight("eyeBlinkRight", 1.0 - currentDistortions.eyeOpen);
    }
    
    if (script.enableBrowRaise) {
        blendShapes.setBlendShapeWeight("browInnerUp", currentDistortions.browRaise);
        blendShapes.setBlendShapeWeight("browOuterUpLeft", currentDistortions.browRaise);
        blendShapes.setBlendShapeWeight("browOuterUpRight", currentDistortions.browRaise);
    }
    
    if (script.enableSmile) {
        blendShapes.setBlendShapeWeight("mouthSmile", currentDistortions.smile);
    }
    
    if (script.enableNoseSneer) {
        blendShapes.setBlendShapeWeight("noseSneer", currentDistortions.noseSneer);
    }
    
    if (script.debugMode) {
        print("FaceDistortion: Applied distortions");
    }
}

/**
 * Set the cheek puff distortion amount
 * @param {number} amount - Distortion amount (0-1)
 */
function setCheekPuff(amount) {
    currentDistortions.cheekPuff = Math.max(0, Math.min(1, amount));
    
    if (!script.autoApply) {
        applyDistortions();
    }
}

/**
 * Set the jaw open distortion amount
 * @param {number} amount - Distortion amount (0-1)
 */
function setJawOpen(amount) {
    currentDistortions.jawOpen = Math.max(0, Math.min(1, amount));
    
    if (!script.autoApply) {
        applyDistortions();
    }
}

/**
 * Set the eye open distortion amount
 * @param {number} amount - Distortion amount (0-1)
 */
function setEyeOpen(amount) {
    currentDistortions.eyeOpen = Math.max(0, Math.min(1, amount));
    
    if (!script.autoApply) {
        applyDistortions();
    }
}

/**
 * Set the brow raise distortion amount
 * @param {number} amount - Distortion amount (0-1)
 */
function setBrowRaise(amount) {
    currentDistortions.browRaise = Math.max(0, Math.min(1, amount));
    
    if (!script.autoApply) {
        applyDistortions();
    }
}

/**
 * Set the smile distortion amount
 * @param {number} amount - Distortion amount (0-1)
 */
function setSmile(amount) {
    currentDistortions.smile = Math.max(0, Math.min(1, amount));
    
    if (!script.autoApply) {
        applyDistortions();
    }
}

/**
 * Set the nose sneer distortion amount
 * @param {number} amount - Distortion amount (0-1)
 */
function setNoseSneer(amount) {
    currentDistortions.noseSneer = Math.max(0, Math.min(1, amount));
    
    if (!script.autoApply) {
        applyDistortions();
    }
}

/**
 * Apply a preset distortion configuration
 * @param {string} presetName - Name of the preset to apply
 */
function applyPreset(presetName) {
    switch(presetName.toLowerCase()) {
        case "surprised":
            setCheekPuff(0.0);
            setJawOpen(0.7);
            setEyeOpen(1.0);
            setBrowRaise(0.8);
            setSmile(0.0);
            setNoseSneer(0.0);
            break;
            
        case "angry":
            setCheekPuff(0.2);
            setJawOpen(0.3);
            setEyeOpen(0.7);
            setBrowRaise(0.0);
            setSmile(0.0);
            setNoseSneer(0.6);
            break;
            
        case "happy":
            setCheekPuff(0.3);
            setJawOpen(0.2);
            setEyeOpen(0.8);
            setBrowRaise(0.4);
            setSmile(1.0);
            setNoseSneer(0.0);
            break;
            
        case "sad":
            setCheekPuff(0.0);
            setJawOpen(0.1);
            setEyeOpen(0.6);
            setBrowRaise(0.3);
            setSmile(0.0);
            setNoseSneer(0.0);
            break;
            
        case "silly":
            setCheekPuff(1.0);
            setJawOpen(0.5);
            setEyeOpen(0.3);
            setBrowRaise(0.7);
            setSmile(0.8);
            setNoseSneer(0.4);
            break;
            
        case "reset":
        default:
            setCheekPuff(0.0);
            setJawOpen(0.0);
            setEyeOpen(0.0);
            setBrowRaise(0.0);
            setSmile(0.0);
            setNoseSneer(0.0);
            break;
    }
    
    if (script.debugMode) {
        print("FaceDistortion: Applied preset '" + presetName + "'");
    }
}

/**
 * Reset all distortions to zero
 */
function resetDistortions() {
    applyPreset("reset");
}

/**
 * Enable or disable auto-apply mode
 * @param {boolean} enabled - Whether to enable auto-apply
 */
function setAutoApply(enabled) {
    script.autoApply = enabled;
    
    // If enabling auto-apply, create update event if it doesn't exist
    if (enabled && !script.updateEvent) {
        script.updateEvent = script.createEvent("UpdateEvent");
        script.updateEvent.bind(onUpdate);
    }
}

// Initialize on script load
initialize();

// Expose public API
script.api.setCheekPuff = setCheekPuff;
script.api.setJawOpen = setJawOpen;
script.api.setEyeOpen = setEyeOpen;
script.api.setBrowRaise = setBrowRaise;
script.api.setSmile = setSmile;
script.api.setNoseSneer = setNoseSneer;
script.api.applyPreset = applyPreset;
script.api.resetDistortions = resetDistortions;
script.api.setAutoApply = setAutoApply; 