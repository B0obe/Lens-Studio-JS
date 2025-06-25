/**
 * VoiceController.js
 * 
 * @description Control Lens experiences with voice commands
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * VoiceController Script Component
 * This script enables voice command recognition for controlling Lens experiences.
 * It uses Lens Studio's voice ML capabilities to detect commands and trigger actions.
 * 
 * @usage
 * 1. Add this script to a Scene Object
 * 2. Configure voice commands and callbacks
 * 3. Use the API to listen for commands
 */

// @input string[] commands = ["start", "stop", "next", "back", "reset"] /** Voice commands to recognize */
// @input string language = "en" /** Language for voice recognition */
// @input float detectionThreshold = 0.7 /** Confidence threshold for detection (0-1) */
// @input float cooldownTime = 1.0 /** Cooldown between commands (seconds) */
// @input bool showDebugging = false /** Show debug messages */
// @input bool autoStart = true /** Start listening automatically */
// @input bool useVisualFeedback = false /** Show visual feedback for voice detection */
// @input Component.Text feedbackTextComponent {"showIf":"useVisualFeedback"} /** Text component for feedback */
// @input SceneObject micIndicator {"showIf":"useVisualFeedback"} /** Visual indicator that mic is active */
// @input bool useSoundFeedback = false /** Play sounds for feedback */
// @input Asset.AudioTrackAsset commandRecognizedSound {"showIf":"useSoundFeedback"} /** Sound to play when command is recognized */
// @input Asset.AudioTrackAsset activationSound {"showIf":"useSoundFeedback"} /** Sound to play when voice detection starts */

// Script global variables
var voiceML = null;
var isListening = false;
var lastCommandTime = 0;
var currentConfidence = 0;
var processingCommand = false;
var commandCallbacks = {};
var globalCallbacks = [];
var audioComponent = null;
var activeMethods = [];

/**
 * Initialize the script
 */
function initialize() {
    // Check if VoiceML is supported
    if (!global.VoiceML) {
        print("VoiceController: VoiceML is not supported in this version of Lens Studio");
        return;
    }
    
    // Initialize VoiceML
    try {
        voiceML = global.VoiceML.createVoiceML();
        debug("VoiceML initialized successfully");
        
        // Set up audio if needed
        if (script.useSoundFeedback) {
            setupAudio();
        }
        
        // Hide mic indicator initially
        if (script.useVisualFeedback && script.micIndicator) {
            script.micIndicator.enabled = false;
        }
        
        // Start automatically if enabled
        if (script.autoStart) {
            startListening();
        }
    } catch (e) {
        print("VoiceController: Error initializing VoiceML - " + e);
    }
}

/**
 * Set up audio component
 */
function setupAudio() {
    audioComponent = script.getSceneObject().createComponent("Component.AudioComponent");
}

/**
 * Start listening for voice commands
 */
function startListening() {
    if (!voiceML || isListening) return;
    
    try {
        // Add commands to recognize
        for (var i = 0; i < script.commands.length; i++) {
            var command = script.commands[i].toLowerCase();
            addVoiceMLMethod(command);
        }
        
        // Start VoiceML
        voiceML.start();
        isListening = true;
        debug("Started listening for voice commands");
        
        // Show mic indicator
        if (script.useVisualFeedback) {
            updateVisualFeedback(true, "Listening...", 0);
        }
        
        // Play activation sound
        if (script.useSoundFeedback && script.activationSound) {
            playSound(script.activationSound);
        }
    } catch (e) {
        print("VoiceController: Error starting voice recognition - " + e);
    }
}

/**
 * Stop listening for voice commands
 */
function stopListening() {
    if (!voiceML || !isListening) return;
    
    try {
        // Stop VoiceML
        voiceML.stop();
        
        // Clear active methods
        for (var i = 0; i < activeMethods.length; i++) {
            voiceML.remove(activeMethods[i]);
        }
        activeMethods = [];
        
        isListening = false;
        debug("Stopped listening for voice commands");
        
        // Hide mic indicator
        if (script.useVisualFeedback) {
            updateVisualFeedback(false, "", 0);
        }
    } catch (e) {
        print("VoiceController: Error stopping voice recognition - " + e);
    }
}

/**
 * Add a voice method to VoiceML
 * @param {string} command - Command to listen for
 */
function addVoiceMLMethod(command) {
    if (!voiceML) return;
    
    try {
        // Create method for this command
        var method = voiceML.createMethod({
            name: command,
            language: script.language,
            callback: createCommandCallback(command)
        });
        
        // Add method to active list
        activeMethods.push(method);
    } catch (e) {
        print("VoiceController: Error adding voice method for '" + command + "' - " + e);
    }
}

/**
 * Create a callback function for a specific command
 * @param {string} command - Command to create callback for
 * @returns {function} - Callback function
 */
function createCommandCallback(command) {
    return function(results) {
        onCommandDetected(command, results);
    };
}

/**
 * Handle command detection
 * @param {string} command - Detected command
 * @param {Object} results - Detection results
 */
function onCommandDetected(command, results) {
    var confidence = results.confidence;
    currentConfidence = confidence;
    
    // Check if confidence meets threshold
    if (confidence < script.detectionThreshold) {
        debug("Command '" + command + "' detected but below threshold: " + confidence.toFixed(2));
        return;
    }
    
    // Check cooldown time
    var currentTime = getTime();
    if (currentTime - lastCommandTime < script.cooldownTime) {
        debug("Command ignored due to cooldown");
        return;
    }
    
    // Update command time
    lastCommandTime = currentTime;
    
    // Show feedback
    debug("Command detected: '" + command + "' with confidence: " + confidence.toFixed(2));
    if (script.useVisualFeedback) {
        updateVisualFeedback(true, "Command: " + command, confidence);
    }
    
    // Play sound
    if (script.useSoundFeedback && script.commandRecognizedSound) {
        playSound(script.commandRecognizedSound);
    }
    
    // Process the command
    processCommand(command, confidence);
}

/**
 * Process a detected command
 * @param {string} command - Command to process
 * @param {number} confidence - Detection confidence
 */
function processCommand(command, confidence) {
    if (processingCommand) return;
    
    processingCommand = true;
    
    // Call specific callbacks for this command
    if (commandCallbacks[command]) {
        for (var i = 0; i < commandCallbacks[command].length; i++) {
            try {
                commandCallbacks[command][i](command, confidence);
            } catch (e) {
                print("VoiceController: Error in command callback - " + e);
            }
        }
    }
    
    // Call global callbacks
    for (var j = 0; j < globalCallbacks.length; j++) {
        try {
            globalCallbacks[j](command, confidence);
        } catch (e) {
            print("VoiceController: Error in global callback - " + e);
        }
    }
    
    processingCommand = false;
}

/**
 * Update visual feedback
 * @param {boolean} isActive - Whether voice detection is active
 * @param {string} text - Text to show
 * @param {number} confidence - Detection confidence
 */
function updateVisualFeedback(isActive, text, confidence) {
    // Update mic indicator
    if (script.micIndicator) {
        script.micIndicator.enabled = isActive;
    }
    
    // Update text component
    if (script.feedbackTextComponent) {
        script.feedbackTextComponent.text = text;
        
        // Optionally show confidence
        if (confidence > 0) {
            script.feedbackTextComponent.text += " (" + (confidence * 100).toFixed(0) + "%)";
        }
    }
    
    // Hide feedback after a delay
    if (confidence > 0) {
        script.createEvent("DelayedCallbackEvent").bind(function() {
            if (script.feedbackTextComponent) {
                script.feedbackTextComponent.text = isListening ? "Listening..." : "";
            }
        }).delay = 2.0;
    }
}

/**
 * Play sound with audio component
 * @param {Asset.AudioTrackAsset} sound - Sound to play
 */
function playSound(sound) {
    if (!audioComponent || !sound) return;
    
    audioComponent.audioTrack = sound;
    audioComponent.play(1);
}

/**
 * Print debug message
 * @param {string} message - Message to print
 */
function debug(message) {
    if (script.showDebugging) {
        print("VoiceController: " + message);
    }
}

/**
 * Get current time in seconds
 * @returns {number} - Current time
 */
function getTime() {
    return global.Time.getTime();
}

/**
 * Add a command to recognize
 * @param {string} command - Command to add
 */
function addCommand(command) {
    // Check if command already exists
    for (var i = 0; i < script.commands.length; i++) {
        if (script.commands[i].toLowerCase() === command.toLowerCase()) {
            return;
        }
    }
    
    // Add command to list
    script.commands.push(command);
    
    // If already listening, add the command to VoiceML
    if (isListening) {
        addVoiceMLMethod(command.toLowerCase());
    }
}

/**
 * Remove a command from recognition
 * @param {string} command - Command to remove
 */
function removeCommand(command) {
    var commandLower = command.toLowerCase();
    
    // Remove from commands list
    var newCommands = [];
    for (var i = 0; i < script.commands.length; i++) {
        if (script.commands[i].toLowerCase() !== commandLower) {
            newCommands.push(script.commands[i]);
        }
    }
    script.commands = newCommands;
    
    // Remove from VoiceML if active
    if (isListening && voiceML) {
        // Find and remove matching method
        var newActiveMethods = [];
        for (var j = 0; j < activeMethods.length; j++) {
            var method = activeMethods[j];
            if (method.name.toLowerCase() === commandLower) {
                voiceML.remove(method);
            } else {
                newActiveMethods.push(method);
            }
        }
        activeMethods = newActiveMethods;
    }
}

/**
 * Add a callback for a specific command
 * @param {string} command - Command to listen for
 * @param {function} callback - Callback function
 */
function addCommandCallback(command, callback) {
    var commandLower = command.toLowerCase();
    
    // Initialize array if needed
    if (!commandCallbacks[commandLower]) {
        commandCallbacks[commandLower] = [];
    }
    
    // Add callback
    commandCallbacks[commandLower].push(callback);
    
    // Make sure command is in the recognition list
    var found = false;
    for (var i = 0; i < script.commands.length; i++) {
        if (script.commands[i].toLowerCase() === commandLower) {
            found = true;
            break;
        }
    }
    
    if (!found) {
        addCommand(command);
    }
}

/**
 * Add a global callback for any command
 * @param {function} callback - Callback function
 */
function addGlobalCallback(callback) {
    globalCallbacks.push(callback);
}

/**
 * Set the detection threshold
 * @param {number} threshold - Confidence threshold (0-1)
 */
function setDetectionThreshold(threshold) {
    script.detectionThreshold = Math.min(1.0, Math.max(0.0, threshold));
}

/**
 * Set the cooldown time between commands
 * @param {number} seconds - Cooldown time in seconds
 */
function setCooldownTime(seconds) {
    script.cooldownTime = Math.max(0.1, seconds);
}

// Initialize the script when it's loaded
initialize();

// Expose API functions
script.api.startListening = startListening;
script.api.stopListening = stopListening;
script.api.addCommand = addCommand;
script.api.removeCommand = removeCommand;
script.api.addCommandCallback = addCommandCallback;
script.api.addGlobalCallback = addGlobalCallback;
script.api.setDetectionThreshold = setDetectionThreshold;
script.api.setCooldownTime = setCooldownTime;
script.api.isListening = function() { return isListening; }; 