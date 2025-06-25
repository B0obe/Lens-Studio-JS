/**
 * LightingEffects.js
 * 
 * @description Create dynamic lighting effects for Lens Studio scenes
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * LightingEffects Script Component
 * This script provides various dynamic lighting effects for enhancing scene ambiance.
 * It can control light intensity, color, flicker, pulse, and other effects.
 * 
 * @usage
 * 1. Add this script to a Scene Object with a Light
 * 2. Choose an effect type
 * 3. Configure effect parameters
 * 4. Run the Lens and see the lighting effect
 */

// @input Component.LightSource lightSource = null /** Light source to control */
// @input string effectType = "pulse" {"widget":"combobox", "values":[{"value":"pulse", "label":"Pulse"}, {"value":"flicker", "label":"Flicker"}, {"value":"colorCycle", "label":"Color Cycle"}, {"value":"strobe", "label":"Strobe"}, {"value":"ambient", "label":"Ambient Weather"}, {"value":"custom", "label":"Custom"}]} /** Type of lighting effect */
// @input vec4 startColor = {r:1.0, g:1.0, b:1.0, a:1.0} /** Starting color */
// @input vec4 endColor = {r:1.0, g:0.0, b:0.0, a:1.0} {"showIf":"effectType", "showIfValue":"pulse,colorCycle"} /** End color for pulse/cycle */
// @input vec4[] colorSequence {"showIf":"effectType", "showIfValue":"colorCycle"} /** Color sequence for color cycle */
// @input float minIntensity = 0.5 {"showIf":"effectType", "showIfValue":"pulse,flicker,strobe,ambient"} /** Minimum light intensity */
// @input float maxIntensity = 1.5 {"showIf":"effectType", "showIfValue":"pulse,flicker,strobe,ambient"} /** Maximum light intensity */
// @input float effectSpeed = 1.0 /** Speed of the effect (pulses/cycles per second) */
// @input float flickerAmount = 0.2 {"showIf":"effectType", "showIfValue":"flicker,ambient"} /** Amount of flicker (0-1) */
// @input float strobeOnRatio = 0.5 {"showIf":"effectType", "showIfValue":"strobe"} /** Ratio of time light is on vs off (0-1) */
// @input string easingFunction = "sinusoidal" {"widget":"combobox", "values":[{"value":"sinusoidal", "label":"Sinusoidal"}, {"value":"linear", "label":"Linear"}, {"value":"easeIn", "label":"Ease In"}, {"value":"easeOut", "label":"Ease Out"}, {"value":"easeInOut", "label":"Ease In/Out"}, {"value":"bounce", "label":"Bounce"}]} /** Easing function for pulse effect */
// @input bool controlIntensity = true /** Control light intensity */
// @input bool controlColor = true /** Control light color */
// @input bool reactToAudio = false /** Light reacts to audio input */
// @input float audioReactivity = 1.0 {"showIf":"reactToAudio"} /** How strongly the light reacts to audio (0-5) */
// @input Asset.AudioOutputAsset audioOutput {"showIf":"reactToAudio"} /** Audio output to react to */
// @input bool autoPlay = true /** Start effects automatically */
// @input bool looping = true /** Loop the effect continuously */
// @input float randomSeed = 0.0 {"showIf":"effectType", "showIfValue":"flicker,ambient"} /** Random seed for flicker pattern */
// @input vec3 ambientWeatherParams = {x:0.5, y:0.2, z:2.0} {"showIf":"effectType", "showIfValue":"ambient"} /** Weather parameters (wetness, cloudiness, windiness) */

// Script global variables
var isPlaying = false;
var startTime = 0;
var originalIntensity = 1.0;
var originalColor = null;
var audioAnalyzer = null;
var randomGenerator = null;
var lastUpdate = 0;
var updateFrequency = 1/60; // Cap updates to 60fps

/**
 * Initialize the script
 */
function initialize() {
    if (!script.lightSource) {
        print("LightingEffects: Please assign a lightSource in the Inspector");
        return;
    }
    
    // Store original light properties
    originalIntensity = script.lightSource.intensity;
    originalColor = script.lightSource.color;
    
    // Initialize audio analyzer if needed
    if (script.reactToAudio && script.audioOutput) {
        setupAudioAnalyzer();
    }
    
    // Initialize random generator
    randomGenerator = new Math.Random(script.randomSeed * 10000 || 0);
    
    // Start effects if auto-play is enabled
    if (script.autoPlay) {
        play();
    }
}

/**
 * Set up audio analyzer for audio reactivity
 */
function setupAudioAnalyzer() {
    audioAnalyzer = global.AudioModule.createAudioAnalyzer(script.audioOutput);
}

/**
 * Start the lighting effect
 */
function play() {
    if (isPlaying) return;
    
    isPlaying = true;
    startTime = getTime();
    
    // Create an update event if needed
    if (!script.updateEvent) {
        script.updateEvent = script.createEvent("UpdateEvent");
        script.updateEvent.bind(onUpdate);
    }
}

/**
 * Stop the lighting effect
 */
function stop() {
    isPlaying = false;
}

/**
 * Reset light to original properties
 */
function reset() {
    if (!script.lightSource) return;
    
    script.lightSource.intensity = originalIntensity;
    script.lightSource.color = originalColor;
}

/**
 * Update function called every frame
 */
function onUpdate(eventData) {
    if (!isPlaying || !script.lightSource) return;
    
    // Limit update frequency to improve performance
    var currentTime = getTime();
    if (currentTime - lastUpdate < updateFrequency) return;
    lastUpdate = currentTime;
    
    // Calculate time parameters
    var elapsedTime = currentTime - startTime;
    var audioMultiplier = getAudioMultiplier();
    
    // Apply the effect based on type
    switch (script.effectType) {
        case "pulse":
            applyPulseEffect(elapsedTime, audioMultiplier);
            break;
            
        case "flicker":
            applyFlickerEffect(elapsedTime, audioMultiplier);
            break;
            
        case "colorCycle":
            applyColorCycleEffect(elapsedTime, audioMultiplier);
            break;
            
        case "strobe":
            applyStrobeEffect(elapsedTime, audioMultiplier);
            break;
            
        case "ambient":
            applyAmbientWeatherEffect(elapsedTime, audioMultiplier);
            break;
            
        case "custom":
            applyCustomEffect(elapsedTime, audioMultiplier);
            break;
    }
}

/**
 * Apply pulse effect (smooth intensity and/or color transitions)
 * @param {number} elapsedTime - Time since effect started
 * @param {number} audioMultiplier - Audio reactivity multiplier
 */
function applyPulseEffect(elapsedTime, audioMultiplier) {
    // Calculate pulse progress (0 to 1, then back to 0)
    var cycleTime = 1.0 / script.effectSpeed;
    var cycleProgress = (elapsedTime % cycleTime) / cycleTime;
    
    // Apply easing function
    var easedProgress = applyEasing(cycleProgress, script.easingFunction);
    
    // Apply audio reactivity
    easedProgress = Math.min(1, easedProgress * (1 + (audioMultiplier - 1) * 0.5));
    
    // Update light intensity
    if (script.controlIntensity) {
        var intensityRange = script.maxIntensity - script.minIntensity;
        var newIntensity = script.minIntensity + intensityRange * easedProgress;
        script.lightSource.intensity = newIntensity;
    }
    
    // Update light color
    if (script.controlColor) {
        var startColor = script.startColor;
        var endColor = script.endColor;
        
        var newColor = new vec4(
            lerpFloat(startColor.r, endColor.r, easedProgress),
            lerpFloat(startColor.g, endColor.g, easedProgress),
            lerpFloat(startColor.b, endColor.b, easedProgress),
            1.0
        );
        
        script.lightSource.color = newColor;
    }
}

/**
 * Apply flicker effect (random intensity variations)
 * @param {number} elapsedTime - Time since effect started
 * @param {number} audioMultiplier - Audio reactivity multiplier
 */
function applyFlickerEffect(elapsedTime, audioMultiplier) {
    // Calculate base intensity
    var baseIntensity = (script.minIntensity + script.maxIntensity) * 0.5;
    var intensityRange = (script.maxIntensity - script.minIntensity) * 0.5;
    
    // Generate random flicker
    var flickerAmount = script.flickerAmount * (audioMultiplier * 0.5 + 0.5);
    var randomValue = randomGenerator.nextFloat() * 2.0 - 1.0;
    var flickerOffset = randomValue * intensityRange * flickerAmount;
    
    // Add smooth oscillation component
    var smoothAmount = 1.0 - flickerAmount;
    var smoothOffset = Math.sin(elapsedTime * 6.283 * script.effectSpeed) * intensityRange * smoothAmount;
    
    // Combine for final intensity
    var newIntensity = baseIntensity + flickerOffset + smoothOffset;
    
    // Clamp to min/max
    newIntensity = Math.max(script.minIntensity, Math.min(script.maxIntensity, newIntensity));
    
    // Update light intensity
    if (script.controlIntensity) {
        script.lightSource.intensity = newIntensity;
    }
    
    // Optionally apply subtle color variation
    if (script.controlColor) {
        var hueShift = randomValue * 0.1 * flickerAmount;
        var satShift = randomValue * 0.1 * flickerAmount;
        
        var startColor = script.startColor;
        var newColor = new vec4(
            startColor.r * (1.0 + hueShift),
            startColor.g * (1.0 + satShift),
            startColor.b * (1.0 - hueShift),
            1.0
        );
        
        script.lightSource.color = newColor;
    }
}

/**
 * Apply color cycle effect (cycle through multiple colors)
 * @param {number} elapsedTime - Time since effect started
 * @param {number} audioMultiplier - Audio reactivity multiplier
 */
function applyColorCycleEffect(elapsedTime, audioMultiplier) {
    var colors = script.colorSequence.length > 1 ? script.colorSequence : [script.startColor, script.endColor];
    
    if (colors.length < 2) {
        print("LightingEffects: Need at least 2 colors for color cycle effect");
        return;
    }
    
    // Calculate cycle progress
    var cycleTime = 1.0 / script.effectSpeed;
    var totalTime = cycleTime * (colors.length - 1);
    var loopedTime = elapsedTime % totalTime;
    
    // Determine which color segment we're in
    var segmentIndex = Math.floor(loopedTime / cycleTime);
    var segmentProgress = (loopedTime % cycleTime) / cycleTime;
    
    // Apply audio reactivity to progress speed
    segmentProgress = Math.min(1, segmentProgress * audioMultiplier);
    
    // Get colors to lerp between
    var startColor = colors[segmentIndex];
    var endColor = colors[(segmentIndex + 1) % colors.length];
    
    // Interpolate colors
    var newColor = new vec4(
        lerpFloat(startColor.r, endColor.r, segmentProgress),
        lerpFloat(startColor.g, endColor.g, segmentProgress),
        lerpFloat(startColor.b, endColor.b, segmentProgress),
        1.0
    );
    
    // Update light color
    if (script.controlColor) {
        script.lightSource.color = newColor;
    }
    
    // Update light intensity (optional)
    if (script.controlIntensity) {
        var intensityProgress = Math.sin(elapsedTime * 6.283 * script.effectSpeed * 0.5) * 0.5 + 0.5;
        var newIntensity = lerpFloat(script.minIntensity, script.maxIntensity, intensityProgress);
        script.lightSource.intensity = newIntensity;
    }
}

/**
 * Apply strobe effect (rapid on/off transitions)
 * @param {number} elapsedTime - Time since effect started
 * @param {number} audioMultiplier - Audio reactivity multiplier
 */
function applyStrobeEffect(elapsedTime, audioMultiplier) {
    // Calculate strobe cycle
    var cycleTime = 1.0 / script.effectSpeed;
    var cycleProgress = (elapsedTime % cycleTime) / cycleTime;
    
    // Adjust on-ratio with audio reactivity
    var onRatio = Math.min(1.0, script.strobeOnRatio * audioMultiplier);
    
    // Determine if light should be on or off
    var isOn = cycleProgress <= onRatio;
    
    // Update light intensity
    if (script.controlIntensity) {
        script.lightSource.intensity = isOn ? script.maxIntensity : script.minIntensity;
    }
    
    // Update light color (optional)
    if (script.controlColor && isOn) {
        script.lightSource.color = script.startColor;
    }
}

/**
 * Apply ambient weather effects (simulating natural lighting)
 * @param {number} elapsedTime - Time since effect started
 * @param {number} audioMultiplier - Audio reactivity multiplier
 */
function applyAmbientWeatherEffect(elapsedTime, audioMultiplier) {
    // Extract weather parameters
    var wetness = script.ambientWeatherParams.x;     // 0-1: affects flicker frequency
    var cloudiness = script.ambientWeatherParams.y;  // 0-1: affects intensity range
    var windiness = script.ambientWeatherParams.z;   // 0-5: affects flicker speed
    
    // Calculate multiple overlapping sine waves for natural looking effect
    var slowWave = Math.sin(elapsedTime * 0.5 * windiness) * 0.2;
    var mediumWave = Math.sin(elapsedTime * 1.7 * windiness) * 0.15;
    var fastWave = Math.sin(elapsedTime * 4.3 * windiness) * 0.1 * wetness;
    
    // Add random flicker component
    var flickerSpeed = 10.0 + wetness * 20.0;
    var flickerTime = Math.floor(elapsedTime * flickerSpeed);
    var flickerAmount = script.flickerAmount * wetness;
    var randomFlicker = (randomGenerator.nextFloat() - 0.5) * flickerAmount;
    
    // Combine waves for final value
    var combinedEffect = slowWave + mediumWave + fastWave + randomFlicker;
    
    // Calculate intensity based on cloudiness
    var baseIntensity = lerpFloat(script.maxIntensity, script.minIntensity, cloudiness);
    var intensityRange = (script.maxIntensity - script.minIntensity) * (1.0 - cloudiness * 0.5);
    var newIntensity = baseIntensity + combinedEffect * intensityRange;
    
    // Clamp to min/max
    newIntensity = Math.max(script.minIntensity, Math.min(script.maxIntensity, newIntensity));
    
    // Apply audio reactivity
    if (audioMultiplier > 1.0) {
        newIntensity = lerpFloat(newIntensity, script.maxIntensity, (audioMultiplier - 1.0) * 0.5);
    }
    
    // Update light intensity
    if (script.controlIntensity) {
        script.lightSource.intensity = newIntensity;
    }
    
    // Update light color based on weather
    if (script.controlColor) {
        // Cloudier days are cooler/bluer, sunny days are warmer
        var colorTemp = lerpFloat(0.0, 1.0, 1.0 - cloudiness * 0.7);
        var newColor = new vec4(
            lerpFloat(0.9, 1.0, colorTemp),  // Red (less in cooler light)
            lerpFloat(0.9, 1.0, colorTemp),  // Green
            lerpFloat(1.0, 0.8, colorTemp),  // Blue (more in cooler light)
            1.0
        );
        
        script.lightSource.color = newColor;
    }
}

/**
 * Apply custom effect (placeholder for user-defined effects)
 * @param {number} elapsedTime - Time since effect started
 * @param {number} audioMultiplier - Audio reactivity multiplier
 */
function applyCustomEffect(elapsedTime, audioMultiplier) {
    // This is a placeholder for custom effects
    // Users can modify this function to create their own effects
    
    // Example: Combined pulse and flicker
    var pulseProgress = (Math.sin(elapsedTime * 6.283 * script.effectSpeed) * 0.5 + 0.5);
    
    // Add random flicker
    var flickerAmount = 0.1;
    var randomValue = (randomGenerator.nextFloat() - 0.5) * flickerAmount;
    
    // Combine pulse and flicker
    var combinedEffect = pulseProgress + randomValue;
    combinedEffect = Math.max(0, Math.min(1, combinedEffect));
    
    // Apply audio reactivity
    combinedEffect = combinedEffect * (1 + (audioMultiplier - 1) * 0.5);
    
    // Update light intensity
    if (script.controlIntensity) {
        var newIntensity = lerpFloat(script.minIntensity, script.maxIntensity, combinedEffect);
        script.lightSource.intensity = newIntensity;
    }
    
    // Update light color
    if (script.controlColor) {
        var startColor = script.startColor;
        var endColor = script.endColor;
        
        var newColor = new vec4(
            lerpFloat(startColor.r, endColor.r, combinedEffect),
            lerpFloat(startColor.g, endColor.g, combinedEffect),
            lerpFloat(startColor.b, endColor.b, combinedEffect),
            1.0
        );
        
        script.lightSource.color = newColor;
    }
}

/**
 * Calculate audio reactivity multiplier
 * @returns {number} - Audio reactivity multiplier (1.0 = no effect)
 */
function getAudioMultiplier() {
    if (!script.reactToAudio || !audioAnalyzer) return 1.0;
    
    // Get audio spectrum data
    var audioData = audioAnalyzer.getAverageLoudness();
    
    // Convert to useful multiplier range
    var multiplier = 1.0 + audioData * script.audioReactivity;
    
    return multiplier;
}

/**
 * Apply easing function to progress
 * @param {number} t - Progress (0-1)
 * @param {string} easingType - Type of easing
 * @returns {number} - Eased progress
 */
function applyEasing(t, easingType) {
    switch (easingType) {
        case "linear":
            return t;
            
        case "sinusoidal":
            return Math.sin(t * Math.PI) * 0.5 + 0.5;
            
        case "easeIn":
            return t * t;
            
        case "easeOut":
            return t * (2 - t);
            
        case "easeInOut":
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            
        case "bounce":
            if (t < (1/2.75)) {
                return 7.5625 * t * t;
            } else if (t < (2/2.75)) {
                return 7.5625 * (t -= (1.5/2.75)) * t + 0.75;
            } else if (t < (2.5/2.75)) {
                return 7.5625 * (t -= (2.25/2.75)) * t + 0.9375;
            } else {
                return 7.5625 * (t -= (2.625/2.75)) * t + 0.984375;
            }
            
        default:
            return t;
    }
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Progress (0-1)
 * @returns {number} - Interpolated value
 */
function lerpFloat(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Get current time in seconds
 * @returns {number} - Current time
 */
function getTime() {
    return global.Time.getTime();
}

/**
 * Set the effect type
 * @param {string} type - Effect type
 */
function setEffectType(type) {
    var validTypes = ["pulse", "flicker", "colorCycle", "strobe", "ambient", "custom"];
    
    if (validTypes.indexOf(type) === -1) {
        print("LightingEffects: Invalid effect type: " + type);
        return;
    }
    
    script.effectType = type;
}

/**
 * Set the effect speed
 * @param {number} speed - Speed in cycles per second
 */
function setEffectSpeed(speed) {
    script.effectSpeed = Math.max(0.1, speed);
}

/**
 * Set light intensity range
 * @param {number} min - Minimum intensity
 * @param {number} max - Maximum intensity
 */
function setIntensityRange(min, max) {
    script.minIntensity = Math.max(0, min);
    script.maxIntensity = Math.max(script.minIntensity, max);
}

/**
 * Set whether the light reacts to audio
 * @param {boolean} react - Whether to react to audio
 */
function setReactToAudio(react) {
    script.reactToAudio = react;
    
    if (react && script.audioOutput && !audioAnalyzer) {
        setupAudioAnalyzer();
    }
}

// Initialize the script when it's loaded
initialize();

// Expose API functions
script.api.play = play;
script.api.stop = stop;
script.api.reset = reset;
script.api.setEffectType = setEffectType;
script.api.setEffectSpeed = setEffectSpeed;
script.api.setIntensityRange = setIntensityRange;
script.api.setReactToAudio = setReactToAudio; 