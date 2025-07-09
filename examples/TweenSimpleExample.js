/**
 * TweenSimpleExample.js
 * 
 * @description Simple example showing how to use TweenUtils without require
 * @version 1.0.0
 */

// @input Component.ScriptComponent tweenUtilsScript /** Reference to TweenUtils script */
// @input SceneObject targetObject /** Object to animate */

// Initialize when script loads
init();

function init() {
    if (!script.tweenUtilsScript) {
        print("ERROR: Please add a reference to the TweenUtils script component!");
        return;
    }
    
    if (!script.targetObject) {
        print("ERROR: Please assign a target object to animate!");
        return;
    }
    
    // Create tap event to start animation
    var tapEvent = script.createEvent("TapEvent");
    tapEvent.bind(startAnimation);
}

/**
 * Start animation when screen is tapped
 */
function startAnimation() {
    // Access the TweenUtils API through the script reference
    var tweenUtils = script.tweenUtilsScript.api;
    
    // Reset object scale
    script.targetObject.getTransform().setLocalScale(new vec3(0.5, 0.5, 0.5));
    
    // Create a simple scale animation
    tweenUtils.tweenTo({
        start: 0.5,
        end: 1.5,
        duration: 1.0,
        yoyo: true,
        repeat: -1, // Infinite repeat with yoyo (ping-pong)
        ease: tweenUtils.Easing.easeOutElastic,
        onUpdate: function(value) {
            script.targetObject.getTransform().setLocalScale(new vec3(value, value, value));
        }
    });
    
    print("Animation started! The object will scale up and down infinitely.");
} 