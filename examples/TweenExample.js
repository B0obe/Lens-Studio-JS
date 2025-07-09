/**
 * TweenExample.js
 * 
 * @description Example demonstrating how to use TweenUtils for animations
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

// @input SceneObject cubeObject /** Object to animate */
// @input SceneObject sphereObject /** Object to animate */
// @input SceneObject cylinderObject /** Object to animate */
// @input Component.ScriptComponent tweenUtils /** Reference to TweenUtils script */
// @input bool autoStart = true /** Whether to start animations automatically */

// Script global variables
var isTweening = false;

/**
 * Initialize the script
 */
function initialize() {
    if (!script.tweenUtils) {
        print("ERROR: Please add a reference to the TweenUtils script component!");
        print("ALTERNATIVE: You can add TweenUtils.js to your Resources, then add it as a Script Component to any object in your scene.");
        print("Then drag that Script Component reference to the tweenUtils input field in this script's Inspector.");
        return;
    }
    
    if (script.autoStart) {
        startAnimations();
    }
    
    // Create tap event to restart animations
    var tapEvent = script.createEvent("TapEvent");
    tapEvent.bind(onTap);
}

/**
 * Start all animations
 */
function startAnimations() {
    if (isTweening) {
        // Stop any existing animations
        script.tweenUtils.api.stopAllTweens();
    }
    
    isTweening = true;
    
    // Animate cube scale with bounce effect
    if (script.cubeObject) {
        // Reset initial state
        script.cubeObject.getTransform().setLocalScale(new vec3(0.3, 0.3, 0.3));
        
        // Create scale animation
        script.tweenUtils.api.tweenTo({
            start: 0.3,
            end: 1.0,
            duration: 1.5,
            ease: script.tweenUtils.api.Easing.easeOutElastic,
            onUpdate: function(value) {
                script.cubeObject.getTransform().setLocalScale(new vec3(value, value, value));
            }
        });
    }
    
    // Animate sphere position with ping-pong effect
    if (script.sphereObject) {
        // Reset initial state
        script.sphereObject.getTransform().setLocalPosition(new vec3(0, 0, 0));
        
        // Create position animation
        script.tweenUtils.api.tweenTo({
            start: [0, 0, 0],
            end: [0, 5, 0],
            duration: 1.0,
            yoyo: true,
            repeat: -1, // Infinite repeat
            ease: script.tweenUtils.api.Easing.easeInOutQuad,
            onUpdate: function(value) {
                script.sphereObject.getTransform().setLocalPosition(new vec3(value[0], value[1], value[2]));
            }
        });
    }
    
    // Animate cylinder rotation
    if (script.cylinderObject) {
        // Reset initial state
        script.cylinderObject.getTransform().setLocalRotation(quat.fromEulerAngles(0, 0, 0));
        
        // Create rotation animation
        script.tweenUtils.api.tweenTo({
            start: 0,
            end: 360,
            duration: 2.0,
            repeat: -1, // Infinite repeat
            ease: script.tweenUtils.api.Easing.linear,
            onUpdate: function(value) {
                // Convert degrees to radians and apply rotation
                var radians = value * (Math.PI / 180);
                script.cylinderObject.getTransform().setLocalRotation(quat.fromEulerAngles(0, radians, 0));
            }
        });
    }
    
    // Chain multiple animations with callbacks
    chainedAnimation();
}

/**
 * Example of chaining multiple animations
 */
function chainedAnimation() {
    // Get reference to the tween utils
    var tweenTo = script.tweenUtils.api.tweenTo;
    var Easing = script.tweenUtils.api.Easing;
    
    // First animation - move up
    tweenTo({
        start: [0, 0, 0],
        end: [0, 2, 0],
        duration: 1.0,
        ease: Easing.easeOutQuad,
        onUpdate: function(value) {
            if (script.cubeObject) {
                var currentPos = script.cubeObject.getTransform().getLocalPosition();
                script.cubeObject.getTransform().setLocalPosition(new vec3(currentPos.x, value[1], currentPos.z));
            }
        },
        onComplete: function() {
            // Second animation - rotate
            tweenTo({
                start: 0,
                end: 360,
                duration: 1.0,
                ease: Easing.easeInOutCubic,
                onUpdate: function(value) {
                    if (script.cubeObject) {
                        var radians = value * (Math.PI / 180);
                        script.cubeObject.getTransform().setLocalRotation(quat.fromEulerAngles(0, radians, 0));
                    }
                },
                onComplete: function() {
                    // Third animation - move back down
                    tweenTo({
                        start: 2,
                        end: 0,
                        duration: 1.0,
                        ease: Easing.easeInQuad,
                        onUpdate: function(value) {
                            if (script.cubeObject) {
                                var currentPos = script.cubeObject.getTransform().getLocalPosition();
                                script.cubeObject.getTransform().setLocalPosition(new vec3(currentPos.x, value, currentPos.z));
                            }
                        }
                    });
                }
            });
        }
    });
}

/**
 * Handle tap event
 */
function onTap(eventData) {
    startAnimations();
}

// Initialize on script load
initialize(); 