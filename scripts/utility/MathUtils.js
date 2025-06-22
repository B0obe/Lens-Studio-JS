/**
 * MathUtils.js
 * 
 * @description Utility math functions for Lens Studio projects
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * MathUtils
 * A collection of helpful math utilities that extend the built-in functionality
 * of Lens Studio's math capabilities.
 * 
 * @usage
 * 1. Add this script to your Lens Studio project
 * 2. Use the provided functions in your scripts by requiring this module
 * 3. See example usage in the documentation
 */

/**
 * Map a value from one range to another
 * @param {number} value - The value to map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @param {boolean} clamp - Whether to clamp the output to the output range
 * @returns {number} The mapped value
 */
function map(value, inMin, inMax, outMin, outMax, clamp) {
    var result = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    
    if (clamp) {
        if (outMin < outMax) {
            result = Math.max(outMin, Math.min(outMax, result));
        } else {
            result = Math.max(outMax, Math.min(outMin, result));
        }
    }
    
    return result;
}

/**
 * Linearly interpolate between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} The interpolated value
 */
function lerp(start, end, t) {
    return start + (end - start) * Math.max(0, Math.min(1, t));
}

/**
 * Linearly interpolate between two vectors
 * @param {vec2|vec3|vec4} start - Start vector
 * @param {vec2|vec3|vec4} end - End vector
 * @param {number} t - Interpolation factor (0-1)
 * @returns {vec2|vec3|vec4} The interpolated vector
 */
function lerpVec(start, end, t) {
    t = Math.max(0, Math.min(1, t));
    
    if (start instanceof vec2 && end instanceof vec2) {
        return new vec2(
            start.x + (end.x - start.x) * t,
            start.y + (end.y - start.y) * t
        );
    } else if (start instanceof vec3 && end instanceof vec3) {
        return new vec3(
            start.x + (end.x - start.x) * t,
            start.y + (end.y - start.y) * t,
            start.z + (end.z - start.z) * t
        );
    } else if (start instanceof vec4 && end instanceof vec4) {
        return new vec4(
            start.x + (end.x - start.x) * t,
            start.y + (end.y - start.y) * t,
            start.z + (end.z - start.z) * t,
            start.w + (end.w - start.w) * t
        );
    } else {
        print("MathUtils: ERROR - Incompatible vector types for lerpVec");
        return null;
    }
}

/**
 * Smoothly interpolate between two values using Smoothstep function
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} The smoothly interpolated value
 */
function smoothStep(start, end, t) {
    t = Math.max(0, Math.min(1, t));
    t = t * t * (3 - 2 * t);
    return start + (end - start) * t;
}

/**
 * Calculate the distance between two points
 * @param {vec2|vec3} a - First point
 * @param {vec2|vec3} b - Second point
 * @returns {number} The distance between points
 */
function distance(a, b) {
    if (a instanceof vec2 && b instanceof vec2) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    } else if (a instanceof vec3 && b instanceof vec3) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        var dz = b.z - a.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    } else {
        print("MathUtils: ERROR - Incompatible vector types for distance");
        return null;
    }
}

/**
 * Calculate the angle between two 2D vectors in radians
 * @param {vec2} a - First vector
 * @param {vec2} b - Second vector
 * @returns {number} The angle in radians
 */
function angleBetween(a, b) {
    if (!(a instanceof vec2) || !(b instanceof vec2)) {
        print("MathUtils: ERROR - Arguments must be vec2 for angleBetween");
        return 0;
    }
    
    return Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Check if a point is inside a rectangle
 * @param {vec2} point - The point to check
 * @param {vec2} rectMin - Rectangle minimum point (top-left)
 * @param {vec2} rectMax - Rectangle maximum point (bottom-right)
 * @returns {boolean} Whether the point is inside the rectangle
 */
function pointInRect(point, rectMin, rectMax) {
    if (!(point instanceof vec2) || !(rectMin instanceof vec2) || !(rectMax instanceof vec2)) {
        print("MathUtils: ERROR - Arguments must be vec2 for pointInRect");
        return false;
    }
    
    return point.x >= rectMin.x && point.x <= rectMax.x &&
           point.y >= rectMin.y && point.y <= rectMax.y;
}

/**
 * Get a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random value between min and max
 */
function random(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Get a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer between min and max
 */
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Return a random item from an array
 * @param {Array} array - The array to pick from
 * @returns {*} A random item from the array
 */
function randomItem(array) {
    if (!Array.isArray(array) || array.length === 0) {
        print("MathUtils: ERROR - Invalid or empty array for randomItem");
        return null;
    }
    
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Calculate eased value using various easing functions
 * @param {number} t - Input value (0-1)
 * @param {string} easingType - Type of easing ("easeInQuad", "easeOutQuad", "easeInOutQuad", etc.)
 * @returns {number} Eased value
 */
function ease(t, easingType) {
    t = clamp(t, 0, 1);
    
    switch (easingType) {
        case "linear":
            return t;
        case "easeInQuad":
            return t * t;
        case "easeOutQuad":
            return t * (2 - t);
        case "easeInOutQuad":
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        case "easeInCubic":
            return t * t * t;
        case "easeOutCubic":
            return (--t) * t * t + 1;
        case "easeInOutCubic":
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        case "easeInExpo":
            return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
        case "easeOutExpo":
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        case "easeInOutExpo":
            if (t === 0) return 0;
            if (t === 1) return 1;
            return t < 0.5 ? Math.pow(2, 10 * (2 * t - 1)) / 2 : (2 - Math.pow(2, -10 * (2 * t - 1))) / 2;
        default:
            print("MathUtils: WARNING - Unknown easing type, defaulting to linear");
            return t;
    }
}

// Export the module
module.exports = {
    map: map,
    lerp: lerp,
    lerpVec: lerpVec,
    smoothStep: smoothStep,
    distance: distance,
    angleBetween: angleBetween,
    degreesToRadians: degreesToRadians,
    radiansToDegrees: radiansToDegrees,
    pointInRect: pointInRect,
    random: random,
    randomInt: randomInt,
    randomItem: randomItem,
    clamp: clamp,
    ease: ease
}; 