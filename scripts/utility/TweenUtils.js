/**
 * TweenUtils.js
 * 
 * @description Lightweight tweening utility for animating values over time
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires None
 */

/**
 * TweenUtils Script
 * This script provides a simple, memory-efficient tweening utility for Lens Studio.
 * 
 * @usage
 * 1. Import this script in your project
 * 2. Use the tweenTo function to animate values over time
 * 3. Apply the animated values in the onUpdate callback
 */

// Collection of easing functions
const Easing = {
    // Linear
    linear: function(t) { return t; },
    
    // Quadratic
    easeInQuad: function(t) { return t * t; },
    easeOutQuad: function(t) { return t * (2 - t); },
    easeInOutQuad: function(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    
    // Cubic
    easeInCubic: function(t) { return t * t * t; },
    easeOutCubic: function(t) { return (--t) * t * t + 1; },
    easeInOutCubic: function(t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    
    // Quartic
    easeInQuart: function(t) { return t * t * t * t; },
    easeOutQuart: function(t) { return 1 - (--t) * t * t * t; },
    easeInOutQuart: function(t) { return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t; },
    
    // Quintic
    easeInQuint: function(t) { return t * t * t * t * t; },
    easeOutQuint: function(t) { return 1 + (--t) * t * t * t * t; },
    easeInOutQuint: function(t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t; },
    
    // Sinusoidal
    easeInSine: function(t) { return 1 - Math.cos(t * Math.PI / 2); },
    easeOutSine: function(t) { return Math.sin(t * Math.PI / 2); },
    easeInOutSine: function(t) { return 0.5 * (1 - Math.cos(Math.PI * t)); },
    
    // Exponential
    easeInExpo: function(t) { return t === 0 ? 0 : Math.pow(1024, t - 1); },
    easeOutExpo: function(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    easeInOutExpo: function(t) { 
        if (t === 0) return 0;
        if (t === 1) return 1;
        if ((t *= 2) < 1) return 0.5 * Math.pow(1024, t - 1);
        return 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
    },
    
    // Circular
    easeInCirc: function(t) { return 1 - Math.sqrt(1 - t * t); },
    easeOutCirc: function(t) { return Math.sqrt(1 - (--t * t)); },
    easeInOutCirc: function(t) {
        if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
        return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    },
    
    // Elastic
    easeInElastic: function(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
    },
    easeOutElastic: function(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
    },
    easeInOutElastic: function(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        t *= 2;
        if (t < 1) return -0.5 * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
        return 0.5 * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) + 1;
    },
    
    // Back
    easeInBack: function(t) {
        const s = 1.70158;
        return t * t * ((s + 1) * t - s);
    },
    easeOutBack: function(t) {
        const s = 1.70158;
        return (t = t - 1) * t * ((s + 1) * t + s) + 1;
    },
    easeInOutBack: function(t) {
        let s = 1.70158 * 1.525;
        if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
        return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    },
    
    // Bounce
    easeInBounce: function(t) { return 1 - Easing.easeOutBounce(1 - t); },
    easeOutBounce: function(t) {
        if (t < (1 / 2.75)) {
            return 7.5625 * t * t;
        } else if (t < (2 / 2.75)) {
            return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
        } else if (t < (2.5 / 2.75)) {
            return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
        } else {
            return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
        }
    },
    easeInOutBounce: function(t) {
        if (t < 0.5) return Easing.easeInBounce(t * 2) * 0.5;
        return Easing.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
    }
};

// Active tweens storage
const _activeTweens = {};
let _tweenIdCounter = 0;

/**
 * Interpolate between values
 * @param {number|Array} start - Start value or array of values
 * @param {number|Array} end - End value or array of values
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number|Array} - Interpolated value(s)
 */
function _interpolate(start, end, t) {
    if (Array.isArray(start) && Array.isArray(end)) {
        const result = [];
        const len = Math.min(start.length, end.length);
        
        for (let i = 0; i < len; i++) {
            result[i] = start[i] + (end[i] - start[i]) * t;
        }
        
        return result;
    } else {
        return start + (end - start) * t;
    }
}

/**
 * Create a new tween animation
 * @param {Object|number|Array} options - Tween options or start value
 * @param {number|Array} [options.start] - Start value or array of values
 * @param {number|Array} [options.end] - End value or array of values
 * @param {number} [options.duration=1.0] - Duration in seconds
 * @param {Function} [options.ease=Easing.linear] - Easing function
 * @param {Function} [options.onUpdate] - Callback for value updates
 * @param {Function} [options.onComplete] - Callback when tween completes
 * @param {number} [options.delay=0] - Delay before starting in seconds
 * @param {boolean} [options.yoyo=false] - Whether to reverse the tween after completion
 * @param {number} [options.repeat=0] - Number of times to repeat (-1 for infinite)
 * @returns {Object} - Tween control object
 */
function tweenTo(options, end, duration, ease, onUpdate, onComplete) {
    // Handle both object and parameter syntax
    let config = {};
    
    if (typeof options === 'object' && options !== null && !Array.isArray(options)) {
        config = options;
    } else {
        config.start = options;
        config.end = end;
        config.duration = duration || 1.0;
        config.ease = ease || Easing.linear;
        config.onUpdate = onUpdate;
        config.onComplete = onComplete;
    }
    
    // Set defaults
    config.start = config.start !== undefined ? config.start : 0;
    config.end = config.end !== undefined ? config.end : 1;
    config.duration = config.duration !== undefined ? config.duration : 1.0;
    config.ease = config.ease || Easing.linear;
    config.delay = config.delay || 0;
    config.yoyo = config.yoyo || false;
    config.repeat = config.repeat !== undefined ? config.repeat : 0;
    
    // Create tween state
    const tweenId = 'tween_' + (_tweenIdCounter++);
    const tween = {
        id: tweenId,
        elapsed: -config.delay,
        progress: 0,
        value: config.start,
        active: true,
        direction: 1,
        iteration: 0,
        config: config
    };
    
    // Store in active tweens
    _activeTweens[tweenId] = tween;
    
    // Create and bind update event
    const updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(function(eventData) {
        if (!tween.active) {
            script.removeEvent(updateEvent);
            return;
        }
        
        // Update elapsed time
        tween.elapsed += eventData.getDeltaTime();
        
        // Handle delay
        if (tween.elapsed < 0) {
            return;
        }
        
        // Calculate progress
        tween.progress = Math.min(tween.elapsed / config.duration, 1.0) * tween.direction;
        
        // Apply easing
        const easedProgress = config.ease(tween.direction > 0 ? tween.progress : 1 - tween.progress);
        
        // Calculate current value
        tween.value = _interpolate(config.start, config.end, easedProgress);
        
        // Call update callback
        if (config.onUpdate) {
            config.onUpdate(tween.value);
        }
        
        // Check if complete
        if (tween.elapsed >= config.duration) {
            // Handle yoyo
            if (config.yoyo && (tween.direction > 0 || config.repeat === -1 || (config.repeat !== 0 && tween.iteration < config.repeat))) {
                tween.direction *= -1;
                tween.elapsed = 0;
                if (tween.direction < 0) {
                    tween.iteration++;
                }
            } 
            // Handle repeat
            else if (config.repeat === -1 || tween.iteration < config.repeat) {
                tween.elapsed = 0;
                tween.iteration++;
            } 
            // Complete
            else {
                tween.active = false;
                delete _activeTweens[tweenId];
                
                if (config.onComplete) {
                    config.onComplete();
                }
                
                script.removeEvent(updateEvent);
            }
        }
    });
    
    // Return control object
    return {
        stop: function() {
            tween.active = false;
            delete _activeTweens[tweenId];
        },
        pause: function() {
            tween.active = false;
        },
        resume: function() {
            tween.active = true;
        },
        restart: function() {
            tween.elapsed = -config.delay;
            tween.progress = 0;
            tween.direction = 1;
            tween.iteration = 0;
            tween.active = true;
        },
        isActive: function() {
            return tween.active;
        },
        getValue: function() {
            return tween.value;
        }
    };
}

/**
 * Stop all active tweens
 */
function stopAllTweens() {
    for (const id in _activeTweens) {
        _activeTweens[id].active = false;
        delete _activeTweens[id];
    }
}

/**
 * Stop tweens affecting a specific target
 * @param {string} targetId - ID to identify tweens affecting the same target
 */
function stopTweensByTarget(targetId) {
    for (const id in _activeTweens) {
        if (_activeTweens[id].config.targetId === targetId) {
            _activeTweens[id].active = false;
            delete _activeTweens[id];
        }
    }
}

// Export the API
script.api.tweenTo = tweenTo;
script.api.stopAllTweens = stopAllTweens;
script.api.stopTweensByTarget = stopTweensByTarget;
script.api.Easing = Easing; 

// Add support for require system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = script.api;
} 