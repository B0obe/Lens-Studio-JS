/**
 * AudioVisualizer.js
 * 
 * @description Creates visual effects that react to audio input or playback
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires SceneObject
 * @requires AudioComponent
 */

/**
 * AudioVisualizer Script Component
 * This script analyzes audio and creates visual effects based on audio characteristics.
 * 
 * @usage
 * 1. Add this script to any object in your scene
 * 2. Connect it to an Audio Component
 * 3. Assign visual objects to be affected by audio
 */
// @input Component.AudioComponent audioSource /** Audio source to analyze */
// @input SceneObject[] visualObjects /** Objects to be affected by audio */
// @input bool useAudioInput = false /** Whether to use microphone input instead of audio playback */
// @input int frequencyBands = 4 /** Number of frequency bands to analyze (1-8) */
// @input float sensitivity = 1.0 /** Audio detection sensitivity */
// @input float smoothing = 0.3 /** Smoothing factor for transitions (0-1) */
// @input string[] responseTypes = ["scale", "color", "rotation"] /** Types of visual responses to audio */
// @input bool debugMode = false /** Show debug information */

// Script global variables
var audioAnalyzer = null;
var frequencyData = [];
var averageVolume = 0;
var lastUpdateTime = 0;
var visualResponders = [];

/**
 * Initialize the script
 */
function initialize() {
    // Validate inputs
    if (!script.audioSource) {
        print("AudioVisualizer: ERROR - No audio source specified");
        return;
    }
    
    // Clamp frequency bands
    script.frequencyBands = Math.max(1, Math.min(8, script.frequencyBands));
    
    // Initialize frequency data array
    for (var i = 0; i < script.frequencyBands; i++) {
        frequencyData.push({
            value: 0,
            smoothed: 0,
            peak: 0
        });
    }
    
    // Create visual responders for each object
    for (var i = 0; i < script.visualObjects.length; i++) {
        var obj = script.visualObjects[i];
        if (obj) {
            createResponder(obj, i % script.frequencyBands);
        }
    }
    
    if (script.debugMode) {
        print("AudioVisualizer: Initialized with " + script.frequencyBands + " frequency bands");
    }
}

/**
 * Create a visual responder for an object
 */
function createResponder(obj, bandIndex) {
    var responder = {
        object: obj,
        bandIndex: bandIndex,
        originalScale: obj.getTransform().getLocalScale(),
        originalRotation: obj.getTransform().getLocalRotation(),
        originalColor: null,
        responseTypes: []
    };
    
    // Get the original color if the object has a visual component
    var visualComponent = obj.getFirstComponent("Component.MeshVisual") || 
                          obj.getFirstComponent("Component.Image") || 
                          obj.getFirstComponent("Component.Text");
    if (visualComponent) {
        responder.originalColor = visualComponent.mainMaterial.mainPass.baseColor;
        responder.visualComponent = visualComponent;
    }
    
    // Set response types based on script input
    for (var i = 0; i < script.responseTypes.length; i++) {
        var type = script.responseTypes[i].toLowerCase();
        if (type === "scale" || type === "color" || type === "rotation") {
            responder.responseTypes.push(type);
        }
    }
    
    visualResponders.push(responder);
    
    if (script.debugMode) {
        print("AudioVisualizer: Created responder for " + obj.name + " on band " + bandIndex);
    }
}

/**
 * Function called on each frame update
 */
function onUpdate(eventData) {
    // Analyze audio
    analyzeAudio();
    
    // Update visuals
    updateVisuals();
}

/**
 * Analyze audio data
 */
function analyzeAudio() {
    // Get the current time
    var currentTime = getTime();
    
    // Use a consistent update rate to reduce performance impact
    if (currentTime - lastUpdateTime < 0.05) {
        return;
    }
    
    lastUpdateTime = currentTime;
    
    // Get audio spectrum data
    var spectrum = [];
    var volumeLevel = 0;
    
    if (script.useAudioInput) {
        // Use microphone input
        volumeLevel = script.audioSource.getMicrophoneLevel() * script.sensitivity;
        
        // Simulate spectrum for microphone input
        for (var i = 0; i < script.frequencyBands; i++) {
            spectrum.push(volumeLevel * (1.0 - (i / script.frequencyBands) * 0.5));
        }
    } else {
        // Use audio playback
        volumeLevel = script.audioSource.getAmplitude() * script.sensitivity;
        
        // Get frequency data from different ranges of the spectrum
        var spectrumData = script.audioSource.getSpectrum();
        var spectrumLength = spectrumData.length;
        var bandSize = Math.floor(spectrumLength / script.frequencyBands);
        
        for (var i = 0; i < script.frequencyBands; i++) {
            var startIndex = i * bandSize;
            var endIndex = (i + 1) * bandSize;
            var bandSum = 0;
            
            for (var j = startIndex; j < endIndex; j++) {
                bandSum += spectrumData[j];
            }
            
            var bandAverage = bandSum / bandSize * script.sensitivity;
            spectrum.push(bandAverage);
        }
    }
    
    // Smooth and store frequency data
    for (var i = 0; i < script.frequencyBands; i++) {
        var newValue = spectrum[i] || 0;
        
        // Apply smoothing
        frequencyData[i].smoothed = frequencyData[i].smoothed * script.smoothing + 
                                    newValue * (1.0 - script.smoothing);
        
        // Update raw value
        frequencyData[i].value = newValue;
        
        // Update peak value
        if (newValue > frequencyData[i].peak) {
            frequencyData[i].peak = newValue;
        } else {
            frequencyData[i].peak = frequencyData[i].peak * 0.99; // Slowly decrease peak
        }
    }
    
    // Update average volume with smoothing
    averageVolume = averageVolume * script.smoothing + volumeLevel * (1.0 - script.smoothing);
    
    if (script.debugMode && currentTime % 1 < 0.05) {
        print("AudioVisualizer: Volume: " + averageVolume.toFixed(3));
    }
}

/**
 * Update visual objects based on audio data
 */
function updateVisuals() {
    for (var i = 0; i < visualResponders.length; i++) {
        var responder = visualResponders[i];
        var band = frequencyData[responder.bandIndex];
        
        if (!band) continue;
        
        // Apply all response types
        for (var j = 0; j < responder.responseTypes.length; j++) {
            var responseType = responder.responseTypes[j];
            
            switch (responseType) {
                case "scale":
                    updateScale(responder, band);
                    break;
                case "color":
                    updateColor(responder, band);
                    break;
                case "rotation":
                    updateRotation(responder, band);
                    break;
            }
        }
    }
}

/**
 * Update object scale based on audio
 */
function updateScale(responder, band) {
    var transform = responder.object.getTransform();
    var scaleValue = 1.0 + band.smoothed * 2.0; // Adjust scale factor as needed
    
    var newScale = new vec3(
        responder.originalScale.x * scaleValue,
        responder.originalScale.y * scaleValue,
        responder.originalScale.z * scaleValue
    );
    
    transform.setLocalScale(newScale);
}

/**
 * Update object color based on audio
 */
function updateColor(responder, band) {
    if (!responder.visualComponent || !responder.originalColor) return;
    
    var intensityValue = band.smoothed / band.peak;
    if (isNaN(intensityValue)) intensityValue = 0;
    
    // Create a color that gets brighter with audio intensity
    var newColor = new vec4(
        responder.originalColor.x * (1.0 + intensityValue),
        responder.originalColor.y * (1.0 + intensityValue),
        responder.originalColor.z * (1.0 + intensityValue),
        responder.originalColor.w
    );
    
    responder.visualComponent.mainMaterial.mainPass.baseColor = newColor;
}

/**
 * Update object rotation based on audio
 */
function updateRotation(responder, band) {
    var transform = responder.object.getTransform();
    
    // Use the band value to create a rotation around the y-axis
    var rotationAmount = band.smoothed * 30.0; // Adjust rotation factor as needed
    
    var baseRotation = responder.originalRotation;
    var newRotation = quat.angleAxis(rotationAmount, vec3.up());
    
    transform.setLocalRotation(quat.multiply(baseRotation, newRotation));
}

/**
 * Set the audio sensitivity
 * @param {number} newSensitivity - New sensitivity value
 */
function setSensitivity(newSensitivity) {
    script.sensitivity = Math.max(0, newSensitivity);
}

/**
 * Set the smoothing factor
 * @param {number} newSmoothing - New smoothing value (0-1)
 */
function setSmoothing(newSmoothing) {
    script.smoothing = Math.max(0, Math.min(1, newSmoothing));
}

/**
 * Switch between audio playback and microphone input
 * @param {boolean} useMicrophone - Whether to use microphone input
 */
function setAudioInputMode(useMicrophone) {
    script.useAudioInput = useMicrophone;
}

/**
 * Helper function to get current time
 */
function getTime() {
    return getTimeInSeconds();
}

/**
 * Helper function to get current time in seconds
 */
function getTimeInSeconds() {
    return new Date().getTime() / 1000;
}

// Initialize on script load
initialize();

// Bind to update event
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

// Expose public API
script.api.setSensitivity = setSensitivity;
script.api.setSmoothing = setSmoothing;
script.api.setAudioInputMode = setAudioInputMode;