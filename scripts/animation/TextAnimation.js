/**
 * TextAnimation.js
 * 
 * @description Animate text with various effects like typing, fading, and more
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * TextAnimation Script Component
 * This script provides various text animation effects for Text Components.
 * It allows for typing, fading, color transitions, and more.
 * 
 * @usage
 * 1. Add this script to a Scene Object with a Text Component
 * 2. Choose an animation type
 * 3. Configure animation parameters
 * 4. Set autoPlay to true or call play() from script
 */

// @input Component.Text textComponent /** The Text Component to animate */
// @input string animationType = "typewriter" {"widget":"combobox", "values":[{"value":"typewriter", "label":"Typewriter"}, {"value":"fade", "label":"Fade"}, {"value":"colorCycle", "label":"Color Cycle"}, {"value":"waveEffect", "label":"Wave Effect"}, {"value":"bounce", "label":"Bounce"}, {"value":"glitch", "label":"Glitch"}]} /** Type of animation */
// @input float duration = 2.0 /** Animation duration in seconds */
// @input float delay = 0.0 /** Delay before animation starts */
// @input vec4 startColor = {r:1, g:1, b:1, a:0} {"showIf":"animationType", "showIfValue":"fade"} /** Starting color and opacity */
// @input vec4 endColor = {r:1, g:1, b:1, a:1} {"showIf":"animationType", "showIfValue":"fade"} /** Ending color and opacity */
// @input vec4[] colorSequence {"showIf":"animationType", "showIfValue":"colorCycle"} /** Colors for the color cycle animation */
// @input string easingFunction = "linear" {"widget":"combobox", "values":[{"value":"linear", "label":"Linear"}, {"value":"easeInOut", "label":"Ease In/Out"}, {"value":"easeIn", "label":"Ease In"}, {"value":"easeOut", "label":"Ease Out"}, {"value":"bounce", "label":"Bounce"}, {"value":"elastic", "label":"Elastic"}]} /** Easing function */
// @input bool looping = false /** Whether the animation should loop */
// @input float loopDelay = 0.5 /** Delay between loops */
// @input bool autoPlay = true /** Start animation automatically */
// @input bool reverseOnLoop = false /** Reverse animation direction when looping */
// @input bool showAdvanced = false /** Show advanced options */
// @input float waveAmplitude = 5.0 {"showIf":"animationType", "showIfValue":"waveEffect", "showIfCondition":"showAdvanced"} /** Amplitude of the wave effect */
// @input float waveFrequency = 2.0 {"showIf":"animationType", "showIfValue":"waveEffect", "showIfCondition":"showAdvanced"} /** Frequency of the wave effect */
// @input float bounceHeight = 10.0 {"showIf":"animationType", "showIfValue":"bounce", "showIfCondition":"showAdvanced"} /** Height of the bounce effect */
// @input int glitchFrequency = 5 {"showIf":"animationType", "showIfValue":"glitch", "showIfCondition":"showAdvanced"} /** Frequency of glitch effect (times per second) */
// @input float glitchIntensity = 0.5 {"showIf":"animationType", "showIfValue":"glitch", "showIfCondition":"showAdvanced"} /** Intensity of glitch effect */
// @input bool playSound = false {"showIfCondition":"showAdvanced"} /** Play sound during animation */
// @input Asset.AudioTrackAsset sound {"showIf":"playSound", "showIfCondition":"showAdvanced"} /** Sound to play */

// Script global variables
var originalText = "";
var originalColor = null;
var isPlaying = false;
var startTime = 0;
var elapsed = 0;
var isForward = true;
var soundPlayed = false;
var textMeshes = [];
var charPositions = [];
var originalPositions = [];
var audioComponent = null;

/**
 * Initialize the script
 */
function initialize() {
    if (!script.textComponent) {
        print("TextAnimation: Please assign a textComponent in the Inspector");
        return;
    }
    
    // Store the original text
    originalText = script.textComponent.text;
    
    // Store the original color
    originalColor = script.textComponent.textFill.color;
    
    // Initialize text meshes for character-based animations
    if (script.animationType === "waveEffect" || script.animationType === "bounce") {
        initCharacterMeshes();
    }
    
    // Set up audio if needed
    if (script.playSound && script.sound) {
        setupAudio();
    }
    
    // Start animation if auto-play is enabled
    if (script.autoPlay) {
        play();
    }
}

/**
 * Initialize individual character meshes for character-based animations
 */
function initCharacterMeshes() {
    var text = originalText;
    textMeshes = [];
    charPositions = [];
    originalPositions = [];
    
    // Create character meshes
    for (var i = 0; i < text.length; i++) {
        // Get character bounds
        var charPos = getCharacterPosition(i);
        if (!charPos) continue;
        
        charPositions.push(charPos);
        originalPositions.push(charPos.clone());
    }
}

/**
 * Set up audio component
 */
function setupAudio() {
    // Create an audio component if needed
    audioComponent = script.getSceneObject().createComponent("Component.AudioComponent");
    audioComponent.audioTrack = script.sound;
}

/**
 * Start the animation
 */
function play() {
    if (isPlaying) return;
    
    isPlaying = true;
    startTime = getTime();
    elapsed = 0;
    soundPlayed = false;
    
    // Reset to original state
    reset();
    
    // Create an update event if needed
    if (!script.updateEvent) {
        script.updateEvent = script.createEvent("UpdateEvent");
        script.updateEvent.bind(onUpdate);
    }
}

/**
 * Stop the animation
 */
function stop() {
    isPlaying = false;
}

/**
 * Reset to original state
 */
function reset() {
    switch (script.animationType) {
        case "typewriter":
            script.textComponent.text = "";
            break;
            
        case "fade":
            script.textComponent.textFill.color = script.startColor;
            script.textComponent.text = originalText;
            break;
            
        case "colorCycle":
            script.textComponent.textFill.color = script.colorSequence.length > 0 ? script.colorSequence[0] : originalColor;
            script.textComponent.text = originalText;
            break;
            
        case "waveEffect":
        case "bounce":
            script.textComponent.text = originalText;
            resetCharPositions();
            break;
            
        case "glitch":
            script.textComponent.text = originalText;
            break;
    }
}

/**
 * Reset character positions to original state
 */
function resetCharPositions() {
    for (var i = 0; i < charPositions.length; i++) {
        charPositions[i].x = originalPositions[i].x;
        charPositions[i].y = originalPositions[i].y;
    }
}

/**
 * Update function called every frame
 */
function onUpdate() {
    if (!isPlaying) return;
    
    // Update elapsed time
    elapsed = getTime() - startTime;
    
    // Check if delay has passed
    if (elapsed < script.delay) return;
    
    // Adjust elapsed time for delay
    var adjustedTime = elapsed - script.delay;
    
    // Check if animation is complete
    if (adjustedTime >= script.duration) {
        onAnimationComplete();
        return;
    }
    
    // Calculate progress from 0 to 1
    var progress = adjustedTime / script.duration;
    
    // Apply easing function
    var easedProgress = applyEasing(progress, script.easingFunction);
    
    // Play sound if needed
    if (script.playSound && !soundPlayed && progress > 0) {
        playSound();
    }
    
    // Apply the animation based on type
    switch (script.animationType) {
        case "typewriter":
            animateTypewriter(easedProgress);
            break;
            
        case "fade":
            animateFade(easedProgress);
            break;
            
        case "colorCycle":
            animateColorCycle(easedProgress);
            break;
            
        case "waveEffect":
            animateWave(easedProgress);
            break;
            
        case "bounce":
            animateBounce(easedProgress);
            break;
            
        case "glitch":
            animateGlitch(easedProgress);
            break;
    }
}

/**
 * Handle animation completion
 */
function onAnimationComplete() {
    if (script.looping) {
        // Handle looping
        if (script.reverseOnLoop) {
            isForward = !isForward;
            startTime = getTime() + script.loopDelay;
        } else {
            // Reset and restart
            startTime = getTime() + script.loopDelay;
            reset();
        }
    } else {
        // Complete the animation
        completeAnimation();
        isPlaying = false;
    }
}

/**
 * Set final animation state
 */
function completeAnimation() {
    switch (script.animationType) {
        case "typewriter":
            script.textComponent.text = originalText;
            break;
            
        case "fade":
            script.textComponent.textFill.color = script.endColor;
            break;
            
        case "colorCycle":
            script.textComponent.textFill.color = originalColor;
            break;
            
        case "waveEffect":
        case "bounce":
            resetCharPositions();
            break;
            
        case "glitch":
            script.textComponent.text = originalText;
            break;
    }
}

/**
 * Typewriter animation
 * @param {number} progress - Animation progress (0-1)
 */
function animateTypewriter(progress) {
    var textLength = originalText.length;
    var visibleLength = Math.floor(textLength * progress);
    script.textComponent.text = originalText.substring(0, visibleLength);
}

/**
 * Fade animation
 * @param {number} progress - Animation progress (0-1)
 */
function animateFade(progress) {
    var startColor = script.startColor;
    var endColor = script.endColor;
    
    var currentColor = new vec4(
        lerpFloat(startColor.r, endColor.r, progress),
        lerpFloat(startColor.g, endColor.g, progress),
        lerpFloat(startColor.b, endColor.b, progress),
        lerpFloat(startColor.a, endColor.a, progress)
    );
    
    script.textComponent.textFill.color = currentColor;
}

/**
 * Color cycle animation
 * @param {number} progress - Animation progress (0-1)
 */
function animateColorCycle(progress) {
    if (!script.colorSequence || script.colorSequence.length < 2) {
        print("TextAnimation: Please add at least 2 colors to the colorSequence");
        return;
    }
    
    var numColors = script.colorSequence.length;
    var totalSegments = numColors - 1;
    var segmentSize = 1.0 / totalSegments;
    var currentSegment = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
    var segmentProgress = (progress - (currentSegment * segmentSize)) / segmentSize;
    
    var startColor = script.colorSequence[currentSegment];
    var endColor = script.colorSequence[currentSegment + 1];
    
    var currentColor = new vec4(
        lerpFloat(startColor.r, endColor.r, segmentProgress),
        lerpFloat(startColor.g, endColor.g, segmentProgress),
        lerpFloat(startColor.b, endColor.b, segmentProgress),
        lerpFloat(startColor.a, endColor.a, segmentProgress)
    );
    
    script.textComponent.textFill.color = currentColor;
}

/**
 * Wave animation
 * @param {number} progress - Animation progress (0-1)
 */
function animateWave(progress) {
    if (charPositions.length === 0) return;
    
    var textTransform = "";
    var chars = originalText.split("");
    
    for (var i = 0; i < chars.length; i++) {
        if (i >= charPositions.length) continue;
        
        // Calculate wave offset
        var waveOffset = Math.sin((progress * Math.PI * 2 * script.waveFrequency) + (i * 0.2)) * script.waveAmplitude;
        
        // Create character with transform
        var charTransform = "<style pos=\"" + (originalPositions[i].x) + ", " + (originalPositions[i].y + waveOffset) + "\">" + chars[i] + "</style>";
        textTransform += charTransform;
    }
    
    // Apply transformed text
    script.textComponent.text = textTransform;
}

/**
 * Bounce animation
 * @param {number} progress - Animation progress (0-1)
 */
function animateBounce(progress) {
    if (charPositions.length === 0) return;
    
    var textTransform = "";
    var chars = originalText.split("");
    
    for (var i = 0; i < chars.length; i++) {
        if (i >= charPositions.length) continue;
        
        // Calculate bounce offset with a delay per character
        var charDelay = i * 0.1;
        var adjustedProgress = Math.max(0, Math.min(1, (progress - charDelay) * 3));
        
        var bounceOffset = 0;
        if (adjustedProgress > 0 && adjustedProgress <= 1) {
            // Simple bounce curve: rise quickly, fall with bounce
            if (adjustedProgress < 0.5) {
                bounceOffset = script.bounceHeight * (adjustedProgress * 2); // Rise
            } else {
                // Fall with small bounce
                var t = (adjustedProgress - 0.5) * 2;
                bounceOffset = script.bounceHeight * (1 - t * t);
            }
        }
        
        // Create character with transform
        var charTransform = "<style pos=\"" + (originalPositions[i].x) + ", " + (originalPositions[i].y - bounceOffset) + "\">" + chars[i] + "</style>";
        textTransform += charTransform;
    }
    
    // Apply transformed text
    script.textComponent.text = textTransform;
}

/**
 * Glitch animation
 * @param {number} progress - Animation progress (0-1)
 */
function animateGlitch(progress) {
    // Use time to create random glitch effect
    var time = getTime() * 1000;
    var shouldGlitch = Math.floor(time * script.glitchFrequency) % 2 === 0 && Math.random() < script.glitchIntensity;
    
    if (shouldGlitch) {
        // Create glitched text
        var glitchedText = "";
        var chars = originalText.split("");
        
        for (var i = 0; i < chars.length; i++) {
            if (Math.random() < script.glitchIntensity * 0.3) {
                // Replace with a random character
                var randChar = String.fromCharCode(33 + Math.floor(Math.random() * 94)); // Random ASCII
                glitchedText += randChar;
            } else {
                glitchedText += chars[i];
            }
        }
        
        script.textComponent.text = glitchedText;
    } else {
        script.textComponent.text = originalText;
    }
}

/**
 * Play sound effect
 */
function playSound() {
    if (!audioComponent || !script.sound) return;
    
    audioComponent.play(1);
    soundPlayed = true;
}

/**
 * Get character position at index
 * @param {number} index - Character index
 * @returns {vec2} - Character position
 */
function getCharacterPosition(index) {
    // This is an approximation - Lens Studio doesn't have a direct API for this
    // For more accurate positioning, you might need to use a custom font or layout
    var textSettings = script.textComponent;
    var fontSize = textSettings.size;
    var bounds = textSettings.getBounds();
    var x = bounds.x + (index * fontSize * 0.6);
    var y = bounds.y;
    
    return new vec2(x, y);
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
            
        case "easeInOut":
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            
        case "easeIn":
            return t * t;
            
        case "easeOut":
            return t * (2 - t);
            
        case "bounce":
            var pow2, bounce = 4;
            while (t < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
            return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
            
        case "elastic":
            return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
            
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
 * Set the animation type
 * @param {string} type - Animation type
 */
function setAnimationType(type) {
    var validTypes = ["typewriter", "fade", "colorCycle", "waveEffect", "bounce", "glitch"];
    
    if (validTypes.indexOf(type) === -1) {
        print("TextAnimation: Invalid animation type: " + type);
        return;
    }
    
    script.animationType = type;
    reset();
}

/**
 * Set the animation duration
 * @param {number} seconds - Duration in seconds
 */
function setDuration(seconds) {
    script.duration = Math.max(0.1, seconds);
}

/**
 * Set whether the animation should loop
 * @param {boolean} shouldLoop - Whether to loop
 */
function setLooping(shouldLoop) {
    script.looping = shouldLoop;
}

/**
 * Set the text to animate
 * @param {string} text - Text to animate
 */
function setText(text) {
    originalText = text;
    reset();
    
    // Reinitialize character meshes if needed
    if (script.animationType === "waveEffect" || script.animationType === "bounce") {
        initCharacterMeshes();
    }
}

// Initialize the script when it's loaded
initialize();

// Expose API functions
script.api.play = play;
script.api.stop = stop;
script.api.reset = reset;
script.api.setAnimationType = setAnimationType;
script.api.setDuration = setDuration;
script.api.setLooping = setLooping;
script.api.setText = setText; 