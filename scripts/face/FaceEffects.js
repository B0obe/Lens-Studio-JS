/**
 * FaceEffects.js
 * 
 * @description Apply and control various face effects with easy configuration
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * FaceEffects Script Component
 * This script provides a collection of common face effects with easy configuration.
 * It includes color overlays, face deformation, and texture effects.
 * 
 * @usage
 * 1. Add this script to a Scene Object with a Face Mesh
 * 2. Configure the desired effects in the Inspector
 * 3. Use the API to control effects at runtime
 */
// @input Component.FaceMesh faceMesh /** Face mesh to apply effects to */
// @input bool colorOverlayEnabled = false /** Enable color overlay effect */
// @input vec4 overlayColor = {1.0, 0.5, 0.5, 0.5} {"widget":"color", "showIf":"colorOverlayEnabled"} /** Color for the overlay */
// @input bool pulseOverlayColor = false {"showIf":"colorOverlayEnabled"} /** Pulse the overlay color */
// @input float pulseDuration = 1.0 {"showIf":"pulseOverlayColor"} /** Duration of each pulse cycle in seconds */

// @input bool deformationEnabled = false /** Enable face deformation */
// @input string deformationType = "bulge" {"widget":"combobox", "values":[{"value":"bulge", "label":"Bulge"}, {"value":"squeeze", "label":"Squeeze"}, {"value":"stretch", "label":"Stretch"}], "showIf":"deformationEnabled"} /** Type of deformation */
// @input float deformationStrength = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01, "showIf":"deformationEnabled"} /** Strength of the deformation */
// @input int deformationFeature = 0 {"widget":"combobox", "values":[{"value":0, "label":"Entire Face"}, {"value":1, "label":"Eyes"}, {"value":2, "label":"Nose"}, {"value":3, "label":"Mouth"}, {"value":4, "label":"Cheeks"}], "showIf":"deformationEnabled"} /** Feature to deform */

// @input bool textureEffectEnabled = false /** Enable texture effect */
// @input Asset.Texture effectTexture {"showIf":"textureEffectEnabled"} /** Texture to use for the effect */
// @input string blendMode = "normal" {"widget":"combobox", "values":[{"value":"normal", "label":"Normal"}, {"value":"add", "label":"Add"}, {"value":"multiply", "label":"Multiply"}, {"value":"screen", "label":"Screen"}], "showIf":"textureEffectEnabled"} /** Blend mode for the texture */
// @input float textureOpacity = 1.0 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01, "showIf":"textureEffectEnabled"} /** Opacity of the texture effect */

// @input bool animateEffects = false /** Animate effects over time */
// @input float animationSpeed = 1.0 {"showIf":"animateEffects"} /** Speed of the animation */

// Script global variables
var originalMaterial;
var effectMaterial;
var deformationController;
var isInitialized = false;
var time = 0;

/**
 * Initialize the script
 */
function initialize() {
    // Check if face mesh is provided
    if (!script.faceMesh) {
        print("FaceEffects: ERROR - No face mesh assigned");
        return;
    }
    
    // Store original material
    originalMaterial = script.faceMesh.mainMaterial;
    
    // Create effect material (clone of original)
    effectMaterial = originalMaterial.clone();
    
    // Apply the material to the face mesh
    script.faceMesh.mainMaterial = effectMaterial;
    
    // Initialize effects
    initializeColorOverlay();
    initializeDeformation();
    initializeTextureEffect();
    
    // Create update event for animations
    if (script.animateEffects || script.pulseOverlayColor) {
        var updateEvent = script.createEvent("UpdateEvent");
        updateEvent.bind(onUpdate);
    }
    
    isInitialized = true;
}

/**
 * Initialize color overlay effect
 */
function initializeColorOverlay() {
    if (!script.colorOverlayEnabled) return;
    
    // Set up color overlay
    if (effectMaterial.mainPass.hasUniform("overlayColor")) {
        effectMaterial.mainPass.overlayColor = script.overlayColor;
    } else {
        print("FaceEffects: WARNING - Material doesn't support color overlay");
    }
}

/**
 * Initialize deformation effect
 */
function initializeDeformation() {
    if (!script.deformationEnabled) return;
    
    // Create deformation controller based on type
    switch (script.deformationType) {
        case "bulge":
            deformationController = createBulgeDeformation();
            break;
        case "squeeze":
            deformationController = createSqueezeDeformation();
            break;
        case "stretch":
            deformationController = createStretchDeformation();
            break;
        default:
            print("FaceEffects: WARNING - Unknown deformation type: " + script.deformationType);
            return;
    }
    
    // Apply initial deformation
    if (deformationController) {
        deformationController.setStrength(script.deformationStrength);
        deformationController.setFeature(script.deformationFeature);
    }
}

/**
 * Initialize texture effect
 */
function initializeTextureEffect() {
    if (!script.textureEffectEnabled || !script.effectTexture) return;
    
    // Set up texture effect
    if (effectMaterial.mainPass.hasUniform("effectTexture")) {
        effectMaterial.mainPass.effectTexture = script.effectTexture;
    } else {
        print("FaceEffects: WARNING - Material doesn't support effect texture");
    }
    
    // Set blend mode
    if (effectMaterial.mainPass.hasUniform("blendMode")) {
        var blendModeValue = 0;
        switch (script.blendMode) {
            case "normal": blendModeValue = 0; break;
            case "add": blendModeValue = 1; break;
            case "multiply": blendModeValue = 2; break;
            case "screen": blendModeValue = 3; break;
        }
        effectMaterial.mainPass.blendMode = blendModeValue;
    }
    
    // Set opacity
    if (effectMaterial.mainPass.hasUniform("textureOpacity")) {
        effectMaterial.mainPass.textureOpacity = script.textureOpacity;
    }
}

/**
 * Create bulge deformation controller
 */
function createBulgeDeformation() {
    // This would be implemented with actual deformation logic
    // For now, we'll just return a simple interface
    return {
        setStrength: function(strength) {
            if (effectMaterial.mainPass.hasUniform("bulgeStrength")) {
                effectMaterial.mainPass.bulgeStrength = strength;
            }
        },
        setFeature: function(featureIndex) {
            if (effectMaterial.mainPass.hasUniform("bulgeFeature")) {
                effectMaterial.mainPass.bulgeFeature = featureIndex;
            }
        },
        animate: function(time) {
            if (effectMaterial.mainPass.hasUniform("bulgeStrength")) {
                var animatedStrength = script.deformationStrength * (0.5 + 0.5 * Math.sin(time * Math.PI * 2));
                effectMaterial.mainPass.bulgeStrength = animatedStrength;
            }
        }
    };
}

/**
 * Create squeeze deformation controller
 */
function createSqueezeDeformation() {
    // Similar to bulge but with squeeze logic
    return {
        setStrength: function(strength) {
            if (effectMaterial.mainPass.hasUniform("squeezeStrength")) {
                effectMaterial.mainPass.squeezeStrength = strength;
            }
        },
        setFeature: function(featureIndex) {
            if (effectMaterial.mainPass.hasUniform("squeezeFeature")) {
                effectMaterial.mainPass.squeezeFeature = featureIndex;
            }
        },
        animate: function(time) {
            if (effectMaterial.mainPass.hasUniform("squeezeStrength")) {
                var animatedStrength = script.deformationStrength * (0.5 + 0.5 * Math.sin(time * Math.PI * 2));
                effectMaterial.mainPass.squeezeStrength = animatedStrength;
            }
        }
    };
}

/**
 * Create stretch deformation controller
 */
function createStretchDeformation() {
    // Similar to bulge but with stretch logic
    return {
        setStrength: function(strength) {
            if (effectMaterial.mainPass.hasUniform("stretchStrength")) {
                effectMaterial.mainPass.stretchStrength = strength;
            }
        },
        setFeature: function(featureIndex) {
            if (effectMaterial.mainPass.hasUniform("stretchFeature")) {
                effectMaterial.mainPass.stretchFeature = featureIndex;
            }
        },
        animate: function(time) {
            if (effectMaterial.mainPass.hasUniform("stretchStrength")) {
                var animatedStrength = script.deformationStrength * (0.5 + 0.5 * Math.sin(time * Math.PI * 2));
                effectMaterial.mainPass.stretchStrength = animatedStrength;
            }
        }
    };
}

/**
 * Update event called every frame
 */
function onUpdate(eventData) {
    // Update time
    var deltaTime = getDeltaTime();
    time += deltaTime * script.animationSpeed;
    
    // Animate color overlay if enabled
    if (script.colorOverlayEnabled && script.pulseOverlayColor) {
        animateColorOverlay();
    }
    
    // Animate deformation if enabled
    if (script.deformationEnabled && script.animateEffects && deformationController) {
        deformationController.animate(time);
    }
    
    // Animate texture effect if enabled
    if (script.textureEffectEnabled && script.animateEffects) {
        animateTextureEffect();
    }
}

/**
 * Animate color overlay
 */
function animateColorOverlay() {
    if (!effectMaterial.mainPass.hasUniform("overlayColor")) return;
    
    // Pulse the alpha of the overlay color
    var alpha = 0.5 + 0.5 * Math.sin(time / script.pulseDuration * Math.PI * 2);
    var color = script.overlayColor;
    effectMaterial.mainPass.overlayColor = vec4.create(color.x, color.y, color.z, color.w * alpha);
}

/**
 * Animate texture effect
 */
function animateTextureEffect() {
    if (!effectMaterial.mainPass.hasUniform("textureOpacity")) return;
    
    // Animate the opacity of the texture
    var opacity = 0.5 + 0.5 * Math.sin(time * Math.PI * 2);
    effectMaterial.mainPass.textureOpacity = script.textureOpacity * opacity;
}

/**
 * Get delta time between frames
 */
function getDeltaTime() {
    if (script.getDeltaTime) {
        return script.getDeltaTime();
    } else {
        return 1/30; // Fallback to 30fps
    }
}

/**
 * Set the color overlay
 */
function setOverlayColor(color) {
    if (!isInitialized) return;
    
    script.overlayColor = color;
    
    if (effectMaterial.mainPass.hasUniform("overlayColor")) {
        effectMaterial.mainPass.overlayColor = color;
    }
}

/**
 * Set the color overlay opacity
 */
function setOverlayOpacity(opacity) {
    if (!isInitialized) return;
    
    var color = script.overlayColor;
    script.overlayColor = vec4.create(color.x, color.y, color.z, opacity);
    
    if (effectMaterial.mainPass.hasUniform("overlayColor")) {
        effectMaterial.mainPass.overlayColor = script.overlayColor;
    }
}

/**
 * Enable or disable the color overlay
 */
function setOverlayEnabled(enabled) {
    if (!isInitialized) return;
    
    script.colorOverlayEnabled = enabled;
    
    if (effectMaterial.mainPass.hasUniform("overlayEnabled")) {
        effectMaterial.mainPass.overlayEnabled = enabled ? 1.0 : 0.0;
    }
}

/**
 * Set the deformation strength
 */
function setDeformationStrength(strength) {
    if (!isInitialized || !deformationController) return;
    
    script.deformationStrength = strength;
    deformationController.setStrength(strength);
}

/**
 * Set the deformation feature
 */
function setDeformationFeature(featureIndex) {
    if (!isInitialized || !deformationController) return;
    
    script.deformationFeature = featureIndex;
    deformationController.setFeature(featureIndex);
}

/**
 * Enable or disable the deformation effect
 */
function setDeformationEnabled(enabled) {
    if (!isInitialized) return;
    
    script.deformationEnabled = enabled;
    
    if (effectMaterial.mainPass.hasUniform("deformationEnabled")) {
        effectMaterial.mainPass.deformationEnabled = enabled ? 1.0 : 0.0;
    }
}

/**
 * Set the texture effect opacity
 */
function setTextureOpacity(opacity) {
    if (!isInitialized) return;
    
    script.textureOpacity = opacity;
    
    if (effectMaterial.mainPass.hasUniform("textureOpacity")) {
        effectMaterial.mainPass.textureOpacity = opacity;
    }
}

/**
 * Enable or disable the texture effect
 */
function setTextureEffectEnabled(enabled) {
    if (!isInitialized) return;
    
    script.textureEffectEnabled = enabled;
    
    if (effectMaterial.mainPass.hasUniform("textureEffectEnabled")) {
        effectMaterial.mainPass.textureEffectEnabled = enabled ? 1.0 : 0.0;
    }
}

/**
 * Reset all effects to their default state
 */
function resetEffects() {
    if (!isInitialized) return;
    
    // Reset the material to original
    script.faceMesh.mainMaterial = originalMaterial;
    
    // Re-initialize
    effectMaterial = originalMaterial.clone();
    script.faceMesh.mainMaterial = effectMaterial;
    
    // Re-initialize effects
    initializeColorOverlay();
    initializeDeformation();
    initializeTextureEffect();
}

/**
 * Handle script being disabled
 */
function onDisable() {
    if (isInitialized) {
        // Reset to original material
        script.faceMesh.mainMaterial = originalMaterial;
    }
}

// Initialize on script load
initialize();

// Create event for disable
script.createEvent("OnDisable").bind(onDisable);

// Expose public API
script.api.setOverlayColor = setOverlayColor;
script.api.setOverlayOpacity = setOverlayOpacity;
script.api.setOverlayEnabled = setOverlayEnabled;
script.api.setDeformationStrength = setDeformationStrength;
script.api.setDeformationFeature = setDeformationFeature;
script.api.setDeformationEnabled = setDeformationEnabled;
script.api.setTextureOpacity = setTextureOpacity;
script.api.setTextureEffectEnabled = setTextureEffectEnabled;
script.api.resetEffects = resetEffects;
