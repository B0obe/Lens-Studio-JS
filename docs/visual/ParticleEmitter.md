# ParticleEmitter

The `ParticleEmitter.js` script provides a flexible system for creating particle effects in Lens Studio. It allows you to generate dynamic particle systems using any Scene Object as a template, with control over emission rate, particle lifetime, movement, rotation, scaling, and color.

## Features

- Use any Scene Object as a particle template
- Control emission rate and particle lifetime
- Configure emission area size and shape
- Set initial velocity, randomness, and acceleration
- Apply rotation and scaling over particle lifetime
- Animate color transitions from initial to final color
- Support for local or world space emission
- Velocity inheritance from the emitter
- Physics simulation with gravity and acceleration
- Billboard mode to make particles face the camera
- Burst mode for instant particle emission

## Prerequisites

- A Scene Object to use as a particle template

## Usage

1. Add the `ParticleEmitter.js` script to any Scene Object
2. Set a particle template object (this will be cloned for each particle)
3. Configure emission and particle parameters in the Inspector panel
4. The emitter will start automatically if autoStart is enabled
5. Use the script API to control emission during runtime

## Parameters

| Parameter | Type | Default | Description |
|------------|------|---------|-------------|
| particleTemplate | SceneObject | null | Template object to use for particles |
| maxParticles | int | 50 | Maximum number of particles to create |
| emissionRate | float | 10 | Particles per second |
| particleLifetime | float | 2.0 | How long particles live (seconds) |
| emissionArea | vec3 | {10, 10, 0} | Size of emission area |
| initialVelocity | vec3 | {0, 10, 0} | Initial particle velocity |
| velocityRandomness | vec3 | {5, 5, 0} | Random velocity variation |
| acceleration | vec3 | {0, -9.8, 0} | Particle acceleration (gravity) |
| rotationSpeed | vec3 | {0, 0, 45} | Rotation speed (degrees/sec) |
| rotationRandomness | vec3 | {0, 0, 90} | Random rotation variation |
| initialScale | vec2 | {1.0, 1.0} | Initial particle scale |
| finalScale | vec2 | {0.0, 0.0} | Final particle scale |
| initialColor | vec4 | {1, 1, 1, 1} | Initial particle color |
| finalColor | vec4 | {1, 1, 1, 0} | Final particle color |
| autoStart | bool | true | Start emitting automatically |
| useLocalSpace | bool | true | Emit in local space instead of world space |
| inheritVelocity | bool | false | Particles inherit emitter velocity |
| usePhysics | bool | true | Apply physics simulation to particles |
| randomizeRotation | bool | true | Randomize initial rotation |
| billboardParticles | bool | true | Make particles always face camera |
| debugMode | bool | false | Show debug messages |

## Script API

### Emission Control

#### play()
Start or resume particle emission.

```javascript
// Example: start emitting particles
someObject.getComponent("Component.ScriptComponent").api.play();
```

#### stop(clearActive)
Stop particle emission. If clearActive is true, also removes currently active particles.

```javascript
// Example: stop emission but keep existing particles
someObject.getComponent("Component.ScriptComponent").api.stop(false);

// Example: stop emission and clear all particles
someObject.getComponent("Component.ScriptComponent").api.stop(true);
```

#### burst(count)
Emit a burst of particles instantly.

```javascript
// Example: emit 20 particles at once
someObject.getComponent("Component.ScriptComponent").api.burst(20);
```

### Parameter Control

#### setEmissionRate(rate)
Set the emission rate in particles per second.

```javascript
// Example: change emission rate to 5 particles per second
someObject.getComponent("Component.ScriptComponent").api.setEmissionRate(5);
```

#### setParticleLifetime(lifetime)
Set how long particles live in seconds.

```javascript
// Example: make particles live for 3 seconds
someObject.getComponent("Component.ScriptComponent").api.setParticleLifetime(3.0);
```

#### setInitialVelocity(velocity)
Set the initial velocity of particles.

```javascript
// Example: change initial velocity
someObject.getComponent("Component.ScriptComponent").api.setInitialVelocity(new vec3(0, 20, 0));
```

#### setAcceleration(acceleration)
Set the acceleration applied to particles.

```javascript
// Example: change gravity
someObject.getComponent("Component.ScriptComponent").api.setAcceleration(new vec3(0, -5, 0));
```

#### setColors(initialColor, finalColor)
Set the initial and final colors of particles.

```javascript
// Example: change colors to fade from blue to transparent
someObject.getComponent("Component.ScriptComponent").api.setColors(
    new vec4(0, 0, 1, 1),  // Blue, fully opaque
    new vec4(0, 0, 1, 0)   // Blue, fully transparent
);
```

#### setScales(initialScale, finalScale)
Set the initial and final scales of particles.

```javascript
// Example: make particles grow over their lifetime
someObject.getComponent("Component.ScriptComponent").api.setScales(
    new vec2(0.5, 0.5),  // Start small
    new vec2(2.0, 2.0)   // End large
);
```

## Examples

### Basic Particle Effect
This example creates a simple upward particle effect:

1. Create a small plane or sprite to use as the particle template
2. Add the ParticleEmitter script to an empty Scene Object
3. Assign the plane/sprite as the particleTemplate
4. Configure the following parameters:
   - emissionRate: 15
   - particleLifetime: 1.5
   - initialVelocity: {0, 15, 0}
   - acceleration: {0, -5, 0}
   - initialColor: White, fully opaque
   - finalColor: White, fully transparent
   - initialScale: {1, 1}
   - finalScale: {0, 0}

### Confetti Effect
This example creates a confetti effect with different colored particles:

```javascript
// In a separate controller script
var particleEmitter = script.emitterObject.getComponent("Component.ScriptComponent").api;

// Create multiple colored templates
var redTemplate = script.redParticle;
var blueTemplate = script.blueParticle;
var greenTemplate = script.greenParticle;
var yellowTemplate = script.yellowParticle;

// Array to track which template is active
var templates = [redTemplate, blueTemplate, greenTemplate, yellowTemplate];
var currentTemplateIndex = 0;

// Function to cycle through templates
function cycleTemplate() {
    // Hide all templates
    for (var i = 0; i < templates.length; i++) {
        templates[i].enabled = false;
    }
    
    // Update index
    currentTemplateIndex = (currentTemplateIndex + 1) % templates.length;
    
    // Set new template
    script.particleEmitter.api.particleTemplate = templates[currentTemplateIndex];
    
    // Emit a burst with the new template
    script.particleEmitter.api.burst(10);
}

// Create a tap event to cycle templates
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(cycleTemplate);
```

### Firework Effect
This example creates a firework effect with an explosion of particles:

```javascript
// In a separate controller script
var particleEmitter = script.emitterObject.getComponent("Component.ScriptComponent").api;

// Configure for firework effect
function setupFirework() {
    // Set parameters for launch
    particleEmitter.setEmissionRate(1);
    particleEmitter.setParticleLifetime(2.0);
    particleEmitter.setInitialVelocity(new vec3(0, 30, 0));
    particleEmitter.setAcceleration(new vec3(0, -9.8, 0));
    
    // Set colors for launch particle
    particleEmitter.setColors(
        new vec4(1, 0.5, 0, 1),  // Orange
        new vec4(1, 0, 0, 0)      // Red, fading out
    );
    
    // Start emitting
    particleEmitter.play();
    
    // Schedule explosion
    script.delayedCallback = script.createEvent("DelayedCallbackEvent");
    script.delayedCallback.bind(explode);
    script.delayedCallback.reset(1.5); // Explode after 1.5 seconds
}

// Create explosion effect
function explode() {
    // Stop the launch particle
    particleEmitter.stop(true);
    
    // Configure for explosion
    particleEmitter.setEmissionRate(0); // No continuous emission
    particleEmitter.setParticleLifetime(1.0);
    particleEmitter.setInitialVelocity(new vec3(0, 0, 0));
    particleEmitter.setAcceleration(new vec3(0, -2, 0));
    
    // Set colors for explosion particles
    var colors = [
        new vec4(1, 0, 0, 1),   // Red
        new vec4(0, 1, 0, 1),   // Green
        new vec4(0, 0, 1, 1),   // Blue
        new vec4(1, 1, 0, 1),   // Yellow
        new vec4(1, 0, 1, 1)    // Purple
    ];
    
    // Emit explosion particles in all directions
    for (var i = 0; i < 50; i++) {
        // Randomly select a color
        var colorIndex = Math.floor(Math.random() * colors.length);
        particleEmitter.setColors(colors[colorIndex], new vec4(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b, 0));
        
        // Set random velocity in all directions
        var angle = Math.random() * Math.PI * 2;
        var speed = 5 + Math.random() * 10;
        var velocity = new vec3(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            (Math.random() - 0.5) * speed
        );
        particleEmitter.setInitialVelocity(velocity);
        
        // Emit a single particle
        particleEmitter.burst(1);
    }
}

// Initialize firework
setupFirework();
```

## Best Practices

- **Optimize Particle Count**: Keep maxParticles as low as possible for your effect
- **Use Simple Meshes**: Use low-poly meshes or sprites for particles to maintain performance
- **Limit Emission Rate**: Use lower emission rates for continuous effects
- **Size Appropriately**: Make particles appropriately sized for your scene
- **Use Billboarding**: Enable billboardParticles for 2D particles to always face the camera
- **Vary Parameters**: Add randomness to velocity, rotation, and scale for more natural effects
- **Test on Device**: Always test particle effects on target devices to ensure good performance

## Performance Considerations

- The number of particles has the biggest impact on performance
- Using complex 3D models as particles will reduce performance significantly
- Physics calculations (acceleration, rotation) add some overhead
- Color and scale transitions have minimal performance impact
- Billboard mode may have a small performance cost but improves visual quality
- For best performance on lower-end devices, keep the total number of active particles under 50
