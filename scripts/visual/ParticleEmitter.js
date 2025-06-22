/**
 * ParticleEmitter.js
 * 
 * @description Create customizable particle effects with JavaScript
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 */

/**
 * ParticleEmitter Script Component
 * This script creates customizable particle effects using Scene Objects.
 * It allows for dynamic control of emission rate, particle lifetime, size, color, and movement.
 * 
 * @usage
 * 1. Add this script to any Scene Object
 * 2. Set a particle template object
 * 3. Configure emission and particle parameters
 * 4. Start emission with the play() method or enable autoStart
 */
// @input SceneObject particleTemplate /** Template object to use for particles */
// @input int maxParticles = 50 /** Maximum number of particles to create */
// @input float emissionRate = 10 /** Particles per second */
// @input float particleLifetime = 2.0 /** How long particles live (seconds) */
// @input vec3 emissionArea = {x: 10, y: 10, z: 0} /** Size of emission area */
// @input vec3 initialVelocity = {x: 0, y: 10, z: 0} /** Initial particle velocity */
// @input vec3 velocityRandomness = {x: 5, y: 5, z: 0} /** Random velocity variation */
// @input vec3 acceleration = {x: 0, y: -9.8, z: 0} /** Particle acceleration (gravity) */
// @input vec3 rotationSpeed = {x: 0, y: 0, z: 45} /** Rotation speed (degrees/sec) */
// @input vec3 rotationRandomness = {x: 0, y: 0, z: 90} /** Random rotation variation */
// @input vec2 initialScale = {x: 1.0, y: 1.0} /** Initial particle scale */
// @input vec2 finalScale = {x: 0.0, y: 0.0} /** Final particle scale */
// @input vec4 initialColor = {r: 1.0, g: 1.0, b: 1.0, a: 1.0} {"widget":"color"} /** Initial particle color */
// @input vec4 finalColor = {r: 1.0, g: 1.0, b: 1.0, a: 0.0} {"widget":"color"} /** Final particle color */
// @input bool autoStart = true /** Start emitting automatically */
// @input bool useLocalSpace = true /** Emit in local space instead of world space */
// @input bool inheritVelocity = false /** Particles inherit emitter velocity */
// @input bool usePhysics = true /** Apply physics simulation to particles */
// @input bool randomizeRotation = true /** Randomize initial rotation */
// @input bool billboardParticles = true /** Make particles always face camera */
// @input bool debugMode = false /** Show debug messages */

// Script global variables
var isEmitting = false;
var particles = [];
var particlePool = [];
var lastEmissionTime = 0;
var emitterTransform = null;
var emitterPreviousPosition = null;
var emitterVelocity = new vec3(0, 0, 0);
var updateEvent = null;

/**
 * Initialize the script
 */
function initialize() {
    // Check if particle template is set
    if (!script.particleTemplate) {
        print("ParticleEmitter: ERROR - No particle template set");
        return;
    }
    
    // Hide the template
    script.particleTemplate.enabled = false;
    
    // Get emitter transform
    emitterTransform = script.getSceneObject().getTransform();
    emitterPreviousPosition = emitterTransform.getWorldPosition();
    
    // Create particle pool
    createParticlePool();
    
    // Create update event
    updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
    
    // Start emitting if auto-start is enabled
    if (script.autoStart) {
        play();
    }
    
    if (script.debugMode) {
        print("ParticleEmitter: Initialized with " + script.maxParticles + " particles");
    }
}

/**
 * Create pool of reusable particles
 */
function createParticlePool() {
    for (var i = 0; i < script.maxParticles; i++) {
        // Clone the template
        var particleObj = script.particleTemplate.clone();
        particleObj.enabled = false;
        
        // Create particle data
        var particle = {
            object: particleObj,
            transform: particleObj.getTransform(),
            visualComponent: getVisualComponent(particleObj),
            active: false,
            lifetime: 0,
            maxLifetime: 0,
            velocity: new vec3(0, 0, 0),
            rotation: new vec3(0, 0, 0),
            initialScale: new vec2(1, 1),
            finalScale: new vec2(1, 1),
            initialColor: new vec4(1, 1, 1, 1),
            finalColor: new vec4(1, 1, 1, 1)
        };
        
        // Set up billboard mode if enabled
        if (script.billboardParticles && particle.visualComponent) {
            if (particle.visualComponent.mainPass) {
                particle.visualComponent.mainPass.facingMode = FacingMode.Camera;
            }
        }
        
        // Add to pool
        particlePool.push(particle);
    }
}

/**
 * Get the visual component from a particle object
 * @param {SceneObject} obj - The particle object
 * @returns {Component} - The visual component or null
 */
function getVisualComponent(obj) {
    // Try to find a visual component
    var component = obj.getComponent("Component.MeshVisual") || 
                    obj.getComponent("Component.SpriteVisual") || 
                    obj.getComponent("Component.Image");
    
    return component;
}

/**
 * Start emitting particles
 */
function play() {
    if (isEmitting) return;
    
    isEmitting = true;
    lastEmissionTime = getTime();
    
    if (script.debugMode) {
        print("ParticleEmitter: Started emission");
    }
}

/**
 * Stop emitting particles
 * @param {boolean} clearActive - Whether to clear currently active particles
 */
function stop(clearActive) {
    if (!isEmitting) return;
    
    isEmitting = false;
    
    if (clearActive) {
        // Deactivate all particles
        for (var i = 0; i < particles.length; i++) {
            deactivateParticle(particles[i]);
        }
        particles = [];
    }
    
    if (script.debugMode) {
        print("ParticleEmitter: Stopped emission");
    }
}

/**
 * Update function called every frame
 */
function onUpdate(eventData) {
    var currentTime = getTime();
    var deltaTime = eventData.getDeltaTime();
    
    // Update emitter velocity for inheritance
    if (script.inheritVelocity) {
        var currentPosition = emitterTransform.getWorldPosition();
        emitterVelocity = currentPosition.sub(emitterPreviousPosition).div(deltaTime);
        emitterPreviousPosition = currentPosition;
    }
    
    // Emit new particles if emitting
    if (isEmitting) {
        var timeSinceLastEmission = currentTime - lastEmissionTime;
        var particlesToEmit = Math.floor(timeSinceLastEmission * script.emissionRate);
        
        if (particlesToEmit > 0) {
            // Emit particles
            for (var i = 0; i < particlesToEmit; i++) {
                emitParticle();
            }
            
            // Update last emission time
            lastEmissionTime = currentTime - (timeSinceLastEmission % (1.0 / script.emissionRate));
        }
    }
    
    // Update active particles
    updateParticles(deltaTime);
}

/**
 * Emit a single particle
 */
function emitParticle() {
    // Get a particle from the pool
    var particle = getParticleFromPool();
    if (!particle) return;
    
    // Set particle properties
    resetParticle(particle);
    
    // Add to active particles
    particles.push(particle);
    
    // Enable the particle object
    particle.object.enabled = true;
    particle.active = true;
}

/**
 * Get an available particle from the pool
 * @returns {Object} - Particle object or null if none available
 */
function getParticleFromPool() {
    for (var i = 0; i < particlePool.length; i++) {
        if (!particlePool[i].active) {
            return particlePool[i];
        }
    }
    
    // No particles available
    return null;
}

/**
 * Reset a particle to initial state
 * @param {Object} particle - Particle to reset
 */
function resetParticle(particle) {
    // Set lifetime
    particle.lifetime = 0;
    particle.maxLifetime = script.particleLifetime * (0.8 + Math.random() * 0.4); // +/- 20% variation
    
    // Set position
    var position = getRandomEmissionPosition();
    if (script.useLocalSpace) {
        particle.transform.setLocalPosition(position);
    } else {
        particle.transform.setWorldPosition(position);
    }
    
    // Set velocity
    particle.velocity = getRandomVelocity();
    if (script.inheritVelocity) {
        particle.velocity = particle.velocity.add(emitterVelocity);
    }
    
    // Set rotation
    if (script.randomizeRotation) {
        var randomRotation = getRandomRotation();
        if (script.useLocalSpace) {
            particle.transform.setLocalRotation(randomRotation);
        } else {
            particle.transform.setWorldRotation(randomRotation);
        }
    }
    
    // Set rotation speed
    particle.rotation = getRandomRotationSpeed();
    
    // Set scale
    particle.initialScale = new vec2(
        script.initialScale.x * (0.8 + Math.random() * 0.4),
        script.initialScale.y * (0.8 + Math.random() * 0.4)
    );
    particle.finalScale = script.finalScale;
    particle.transform.setLocalScale(new vec3(particle.initialScale.x, particle.initialScale.y, 1));
    
    // Set color
    particle.initialColor = script.initialColor;
    particle.finalColor = script.finalColor;
    setParticleColor(particle, particle.initialColor);
}

/**
 * Get a random position within the emission area
 * @returns {vec3} - Random position
 */
function getRandomEmissionPosition() {
    var position = new vec3(
        (Math.random() - 0.5) * script.emissionArea.x,
        (Math.random() - 0.5) * script.emissionArea.y,
        (Math.random() - 0.5) * script.emissionArea.z
    );
    
    // Convert to world space if needed
    if (!script.useLocalSpace) {
        position = emitterTransform.localPointToWorldPoint(position);
    }
    
    return position;
}

/**
 * Get a random initial velocity
 * @returns {vec3} - Random velocity
 */
function getRandomVelocity() {
    var velocity = new vec3(
        script.initialVelocity.x + (Math.random() - 0.5) * script.velocityRandomness.x * 2,
        script.initialVelocity.y + (Math.random() - 0.5) * script.velocityRandomness.y * 2,
        script.initialVelocity.z + (Math.random() - 0.5) * script.velocityRandomness.z * 2
    );
    
    // Convert to world space if needed
    if (!script.useLocalSpace) {
        velocity = emitterTransform.localVectorToWorldVector(velocity);
    }
    
    return velocity;
}

/**
 * Get a random initial rotation
 * @returns {quat} - Random rotation quaternion
 */
function getRandomRotation() {
    var x = Math.random() * 360;
    var y = Math.random() * 360;
    var z = Math.random() * 360;
    
    return quat.fromEulerAngles(
        x * Math.PI / 180,
        y * Math.PI / 180,
        z * Math.PI / 180
    );
}

/**
 * Get a random rotation speed
 * @returns {vec3} - Random rotation speed in degrees per second
 */
function getRandomRotationSpeed() {
    return new vec3(
        script.rotationSpeed.x + (Math.random() - 0.5) * script.rotationRandomness.x * 2,
        script.rotationSpeed.y + (Math.random() - 0.5) * script.rotationRandomness.y * 2,
        script.rotationSpeed.z + (Math.random() - 0.5) * script.rotationRandomness.z * 2
    );
}

/**
 * Update all active particles
 * @param {number} deltaTime - Time since last update
 */
function updateParticles(deltaTime) {
    var i = 0;
    while (i < particles.length) {
        var particle = particles[i];
        
        // Update lifetime
        particle.lifetime += deltaTime;
        
        // Check if particle has expired
        if (particle.lifetime >= particle.maxLifetime) {
            // Deactivate particle
            deactivateParticle(particle);
            
            // Remove from active particles
            particles.splice(i, 1);
            continue;
        }
        
        // Calculate life progress (0-1)
        var progress = particle.lifetime / particle.maxLifetime;
        
        // Update position with physics
        if (script.usePhysics) {
            // Apply acceleration
            if (script.useLocalSpace) {
                var worldAccel = emitterTransform.localVectorToWorldVector(script.acceleration);
                particle.velocity = particle.velocity.add(worldAccel.mult(deltaTime));
            } else {
                particle.velocity = particle.velocity.add(script.acceleration.mult(deltaTime));
            }
            
            // Update position
            var movement = particle.velocity.mult(deltaTime);
            var currentPosition = particle.transform.getLocalPosition();
            var newPosition = currentPosition.add(movement);
            particle.transform.setLocalPosition(newPosition);
        }
        
        // Update rotation
        if (particle.rotation.x !== 0 || particle.rotation.y !== 0 || particle.rotation.z !== 0) {
            var currentRotation = particle.transform.getLocalRotation();
            var rotationDelta = new vec3(
                particle.rotation.x * deltaTime * Math.PI / 180,
                particle.rotation.y * deltaTime * Math.PI / 180,
                particle.rotation.z * deltaTime * Math.PI / 180
            );
            
            var rotationDeltaQuat = quat.fromEulerAngles(
                rotationDelta.x,
                rotationDelta.y,
                rotationDelta.z
            );
            
            var newRotation = currentRotation.multiply(rotationDeltaQuat);
            particle.transform.setLocalRotation(newRotation);
        }
        
        // Update scale
        var currentScale = new vec2(
            particle.initialScale.x + (particle.finalScale.x - particle.initialScale.x) * progress,
            particle.initialScale.y + (particle.finalScale.y - particle.initialScale.y) * progress
        );
        particle.transform.setLocalScale(new vec3(currentScale.x, currentScale.y, 1));
        
        // Update color
        var currentColor = lerpColor(particle.initialColor, particle.finalColor, progress);
        setParticleColor(particle, currentColor);
        
        // Move to next particle
        i++;
    }
}

/**
 * Deactivate a particle
 * @param {Object} particle - Particle to deactivate
 */
function deactivateParticle(particle) {
    particle.object.enabled = false;
    particle.active = false;
}

/**
 * Set the color of a particle
 * @param {Object} particle - Particle to set color for
 * @param {vec4} color - Color to set
 */
function setParticleColor(particle, color) {
    if (!particle.visualComponent) return;
    
    // Try to set color based on component type
    if (particle.visualComponent.mainPass) {
        // MeshVisual or SpriteVisual
        particle.visualComponent.mainPass.baseColor = color;
    } else if (particle.visualComponent.mainMaterial && particle.visualComponent.mainMaterial.mainPass) {
        // Component with material
        particle.visualComponent.mainMaterial.mainPass.baseColor = color;
    } else if (particle.visualComponent.tintColorRGBA !== undefined) {
        // Image component
        particle.visualComponent.tintColorRGBA = color;
    }
}

/**
 * Interpolate between two colors
 * @param {vec4} color1 - Start color
 * @param {vec4} color2 - End color
 * @param {number} t - Interpolation factor (0-1)
 * @returns {vec4} - Interpolated color
 */
function lerpColor(color1, color2, t) {
    return new vec4(
        color1.r + (color2.r - color1.r) * t,
        color1.g + (color2.g - color1.g) * t,
        color1.b + (color2.b - color1.b) * t,
        color1.a + (color2.a - color1.a) * t
    );
}

/**
 * Get current time in seconds
 * @returns {number} - Current time
 */
function getTime() {
    return script.getTime !== undefined ? script.getTime() : getTimeInSeconds();
}

/**
 * Fallback time function in case getTime is not available
 * @returns {number} - Time in seconds
 */
function getTimeInSeconds() {
    return new Date().getTime() / 1000;
}

/**
 * Set the emission rate
 * @param {number} rate - Particles per second
 */
function setEmissionRate(rate) {
    script.emissionRate = Math.max(0, rate);
}

/**
 * Set the particle lifetime
 * @param {number} lifetime - Lifetime in seconds
 */
function setParticleLifetime(lifetime) {
    script.particleLifetime = Math.max(0.1, lifetime);
}

/**
 * Set the initial velocity
 * @param {vec3} velocity - Initial velocity
 */
function setInitialVelocity(velocity) {
    script.initialVelocity = velocity;
}

/**
 * Set the acceleration (gravity)
 * @param {vec3} acceleration - Acceleration vector
 */
function setAcceleration(acceleration) {
    script.acceleration = acceleration;
}

/**
 * Set the initial and final color
 * @param {vec4} initialColor - Initial color
 * @param {vec4} finalColor - Final color
 */
function setColors(initialColor, finalColor) {
    script.initialColor = initialColor;
    script.finalColor = finalColor;
}

/**
 * Set the initial and final scale
 * @param {vec2} initialScale - Initial scale
 * @param {vec2} finalScale - Final scale
 */
function setScales(initialScale, finalScale) {
    script.initialScale = initialScale;
    script.finalScale = finalScale;
}

/**
 * Emit a burst of particles
 * @param {number} count - Number of particles to emit
 */
function burst(count) {
    // Ensure we're not emitting more than the pool size
    count = Math.min(count, script.maxParticles);
    
    for (var i = 0; i < count; i++) {
        emitParticle();
    }
    
    if (script.debugMode) {
        print("ParticleEmitter: Emitted burst of " + count + " particles");
    }
}

// Initialize on script load
initialize();

// Expose public API
script.api.play = play;
script.api.stop = stop;
script.api.burst = burst;
script.api.setEmissionRate = setEmissionRate;
script.api.setParticleLifetime = setParticleLifetime;
script.api.setInitialVelocity = setInitialVelocity;
script.api.setAcceleration = setAcceleration;
script.api.setColors = setColors;
script.api.setScales = setScales;
