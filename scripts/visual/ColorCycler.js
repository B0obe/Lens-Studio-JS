/**
 * ColorCycler.js
 * 
 * @description Animate colors through custom color sequences
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires Material
 */

/**
 * ColorCycler Script Component
 * This script animates colors on materials through customizable color sequences.
 * It can cycle through a predefined color palette or use gradient transitions.
 * 
 * @usage
 * 1. Add this script to an object with materials
 * 2. Set the target materials and configure the color animation
 * 3. Customize the timing and transition settings
 */
// @input Component.MaterialMeshVisual[] targetMaterials /** Materials to animate */
// @input vec4[] colorPalette = [vec4(1,0,0,1), vec4(0,1,0,1), vec4(0,0,1,1)] {"widget":"color"} /** Color palette to cycle through */
// @input float cycleDuration = 3.0 /** Time in seconds to complete one full color cycle */
// @input string colorProperty = "baseColor" /** Material property to animate */
// @input string transitionType = "smooth" {"widget":"combobox", "values":[{"value":"smooth", "label":"Smooth"}, {"value":"step", "label":"Step"}, {"value":"pulse", "label":"Pulse"}, {"value":"rainbow", "label":"Rainbow"}]} /** How colors transition */
// @input bool randomizeStart = false /** Start from a random position in the cycle */
// @input bool affectAlpha = false /** Whether to animate the alpha channel */
// @input bool autoPlay = true /** Start animation automatically */

// Script global variables
var isPlaying = false;
var startTime = 0;
var currentTime = 0;
var initialColors = [];
var lastColorIndex = 0;

/**
 * Initialize the script
 */
function initialize() {
    // Check for target materials
    if (!script.targetMaterials || script.targetMaterials.length === 0) {
        print("ColorCycler: WARNING - No target materials assigned");
        return;
    }
    
    // Check for color palette
    if (!script.colorPalette || script.colorPalette.length < 2) {
        print("ColorCycler: WARNING - Need at least 2 colors in palette");
        return;
    }
    
    // Store the initial colors from materials
    storeInitialColors();
    
    // Randomize starting position if requested
    if (script.randomizeStart) {
        currentTime = Math.random() * script.cycleDuration;
    }
    
    // Start animation if enabled
    if (script.autoPlay) {
        play();
    }
}

/**
 * Store the initial colors from all materials
 */
function storeInitialColors() {
    initialColors = [];
    
    for (var i = 0; i < script.targetMaterials.length; i++) {
        var material = script.targetMaterials[i];
        if (material && material.mainPass) {
            var color = null;
            
            // Get the current color based on the specified property
            switch (script.colorProperty) {
                case "baseColor":
                    color = material.mainPass.baseColor;
                    break;
                case "emissiveColor":
                    color = material.mainPass.emissive;
                    break;
                default:
                    print("ColorCycler: WARNING - Unsupported color property: " + script.colorProperty);
                    color = material.mainPass.baseColor;
            }
            
            initialColors.push(color.clone());
        } else {
            // Use a fallback color if material is invalid
            initialColors.push(new vec4(1, 1, 1, 1));
            print("ColorCycler: WARNING - Invalid material at index " + i);
        }
    }
}

/**
 * Start the color animation
 */
function play() {
    if (isPlaying) return;
    
    startTime = getTime() - currentTime;
    isPlaying = true;
    
    // Create update event if needed
    if (!script.updateEvent) {
        script.updateEvent = script.createEvent("UpdateEvent");
        script.updateEvent.bind(onUpdate);
    }
}

/**
 * Pause the color animation
 */
function pause() {
    if (!isPlaying) return;
    
    isPlaying = false;
    // Store current position in the cycle
    currentTime = getTime() - startTime;
}

/**
 * Stop the animation and reset to initial colors
 */
function stop() {
    isPlaying = false;
    currentTime = 0;
    
    // Reset materials to initial colors
    resetColors();
}

/**
 * Reset materials to their initial colors
 */
function resetColors() {
    for (var i = 0; i < script.targetMaterials.length; i++) {
        var material = script.targetMaterials[i];
        if (material && material.mainPass && i < initialColors.length) {
            var initialColor = initialColors[i];
            
            // Set the color based on the specified property
            switch (script.colorProperty) {
                case "baseColor":
                    material.mainPass.baseColor = initialColor;
                    break;
                case "emissiveColor":
                    material.mainPass.emissive = initialColor;
                    break;
            }
        }
    }
}

/**
 * Update event called every frame
 */
function onUpdate(eventData) {
    if (!isPlaying) return;
    
    // Calculate the current cycle position (0-1)
    var time = getTime() - startTime;
    var cyclePosition = (time % script.cycleDuration) / script.cycleDuration;
    
    // Update the color for each material
    updateColors(cyclePosition);
}

/**
 * Update all material colors based on the current cycle position
 */
function updateColors(cyclePosition) {
    // Calculate the current color based on transition type
    var currentColor;
    
    switch (script.transitionType) {
        case "smooth":
            currentColor = getSmoothColor(cyclePosition);
            break;
        case "step":
            currentColor = getStepColor(cyclePosition);
            break;
        case "pulse":
            currentColor = getPulseColor(cyclePosition);
            break;
        case "rainbow":
            currentColor = getRainbowColor(cyclePosition);
            break;
        default:
            currentColor = getSmoothColor(cyclePosition);
    }
    
    // Apply the color to all target materials
    for (var i = 0; i < script.targetMaterials.length; i++) {
        var material = script.targetMaterials[i];
        if (material && material.mainPass) {
            var finalColor;
            
            if (i < initialColors.length && !script.affectAlpha) {
                // Preserve the original alpha if not affecting alpha
                finalColor = new vec4(
                    currentColor.x,
                    currentColor.y,
                    currentColor.z,
                    initialColors[i].w
                );
            } else {
                finalColor = currentColor;
            }
            
            // Set the color based on the specified property
            switch (script.colorProperty) {
                case "baseColor":
                    material.mainPass.baseColor = finalColor;
                    break;
                case "emissiveColor":
                    material.mainPass.emissive = finalColor;
                    break;
            }
        }
    }
}

/**
 * Get a smoothly interpolated color between palette entries
 */
function getSmoothColor(position) {
    var numColors = script.colorPalette.length;
    var idx1 = Math.floor(position * numColors);
    var idx2 = (idx1 + 1) % numColors;
    
    var color1 = script.colorPalette[idx1];
    var color2 = script.colorPalette[idx2];
    
    var blendFactor = (position * numColors) - idx1;
    
    return lerpColor(color1, color2, blendFactor);
}

/**
 * Get a step-transitioned color from the palette
 */
function getStepColor(position) {
    var numColors = script.colorPalette.length;
    var idx = Math.floor(position * numColors);
    
    // Track when color index changes for events
    if (idx !== lastColorIndex) {
        lastColorIndex = idx;
        if (script.api.onColorChanged) {
            script.api.onColorChanged(idx);
        }
    }
    
    return script.colorPalette[idx];
}

/**
 * Get a pulsing color that fades between the palette colors
 */
function getPulseColor(position) {
    // Modify the position to create a pulse effect
    var pulsePosition = Math.sin(position * Math.PI * 2) * 0.5 + 0.5;
    
    // Use the modified position with smooth color transition
    return getSmoothColor(pulsePosition);
}

/**
 * Get a rainbow color effect
 */
function getRainbowColor(position) {
    // Convert position (0-1) to hue (0-360)
    var hue = position * 360;
    
    // Convert HSV (hue, 1, 1) to RGB
    return hsvToRgb(hue, 1, 1);
}

/**
 * Convert HSV color to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-1)
 * @param {number} v - Value (0-1)
 * @returns {vec4} RGBA color
 */
function hsvToRgb(h, s, v) {
    var r, g, b;
    var i = Math.floor(h / 60) % 6;
    var f = h / 60 - Math.floor(h / 60);
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    
    switch (i) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    
    return new vec4(r, g, b, 1);
}

/**
 * Linearly interpolate between two colors
 * @param {vec4} color1 - First color
 * @param {vec4} color2 - Second color
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {vec4} Interpolated color
 */
function lerpColor(color1, color2, factor) {
    return new vec4(
        color1.x + (color2.x - color1.x) * factor,
        color1.y + (color2.y - color1.y) * factor,
        color1.z + (color2.z - color1.z) * factor,
        color1.w + (color2.w - color1.w) * factor
    );
}

/**
 * Get current time in seconds
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
 * Set new color palette
 * @param {vec4[]} colors - Array of colors to use
 */
function setColorPalette(colors) {
    if (!colors || colors.length < 2) {
        print("ColorCycler: ERROR - Need at least 2 colors in palette");
        return;
    }
    
    script.colorPalette = colors;
}

/**
 * Set the cycle duration
 * @param {number} seconds - Duration in seconds
 */
function setCycleDuration(seconds) {
    if (seconds <= 0) {
        print("ColorCycler: ERROR - Duration must be positive");
        return;
    }
    
    script.cycleDuration = seconds;
    
    // Adjust the start time to maintain current position
    if (isPlaying) {
        var elapsed = getTime() - startTime;
        var position = (elapsed % script.cycleDuration) / script.cycleDuration;
        startTime = getTime() - (position * script.cycleDuration);
    }
}

/**
 * Set the transition type
 * @param {string} type - One of: "smooth", "step", "pulse", "rainbow"
 */
function setTransitionType(type) {
    var validTypes = ["smooth", "step", "pulse", "rainbow"];
    if (validTypes.indexOf(type) === -1) {
        print("ColorCycler: ERROR - Invalid transition type: " + type);
        return;
    }
    
    script.transitionType = type;
}

// Initialize on script load
initialize();

// Expose public API
script.api.play = play;
script.api.pause = pause;
script.api.stop = stop;
script.api.setColorPalette = setColorPalette;
script.api.setCycleDuration = setCycleDuration;
script.api.setTransitionType = setTransitionType;
script.api.onColorChanged = null;  // User can set this callback 