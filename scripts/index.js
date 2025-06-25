/**
 * lens-studio-js
 * 
 * @description A collection of reusable JavaScript scripts for Lens Studio
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * This index file provides easy access to all scripts in the collection.
 * You can either import this file to get access to all scripts,
 * or import individual scripts as needed.
 */

// Animation
export { default as BouncingObject } from './animation/BouncingObject';
export { default as Oscillator } from './animation/Oscillator';
export { default as Timeline } from './animation/Timeline';
export { default as TextAnimation } from './animation/TextAnimation';

// Face
export { default as BlinkDetector } from './face/BlinkDetector';
export { default as FaceEffects } from './face/FaceEffects';
export { default as SmileDetector } from './face/SmileDetector';
export { default as FaceDistortion } from './face/FaceDistortion';
export { default as FaceExpressionTrigger } from './face/FaceExpressionTrigger';

// Interaction
export { default as DragObject } from './interaction/DragObject';
export { default as SwipeDetector } from './interaction/SwipeDetector';
export { default as TouchGesture } from './interaction/TouchGesture';
export { default as GyroscopeController } from './interaction/GyroscopeController';
export { default as MultiTouchController } from './interaction/MultiTouchController';

// World
export { default as SurfaceTracker } from './world/SurfaceTracker';
export { default as WeatherEffects } from './world/WeatherEffects';
export { default as ARObjectPlacement } from './world/ARObjectPlacement';

// Visual
export { default as ColorCycler } from './visual/ColorCycler';
export { default as ParticleEmitter } from './visual/ParticleEmitter';
export { default as AudioVisualizer } from './visual/AudioVisualizer';
export { default as LightingEffects } from './visual/LightingEffects';

// Utility
export { default as MathUtils } from './utility/MathUtils';
export { default as CameraController } from './utility/CameraController';
export { default as VoiceController } from './utility/VoiceController';

/**
 * Usage example:
 * 
 * Option 1: Import everything
 * import * as LensScripts from './scripts/index.js';
 * var bouncer = new LensScripts.BouncingObject();
 * var math = LensScripts.MathUtils;
 * 
 * Option 2: Import specific scripts
 * import { BouncingObject, MathUtils } from './scripts/index.js';
 * var bouncer = new BouncingObject();
 * var mappedValue = MathUtils.map(0.5, 0, 1, 0, 100);
 * 
 * Option 3: Import directly
 * import BouncingObject from './scripts/animation/BouncingObject.js';
 * var bouncer = new BouncingObject();
 */

/**
 * Version information
 */
exports.version = '1.0.0';

/**
 * Information about the library
 */
exports.info = {
    name: 'Lens Studio JS',
    author: 'Bandar Al-Otibie',
    website: 'https://bento.me/b0obe',
    description: 'A collection of useful JavaScript modules for Snapchat\'s Lens Studio',
    license: 'MIT'
}; 