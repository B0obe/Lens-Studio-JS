/**
 * WeatherEffects.js
 * 
 * @description Creates realistic weather effects like rain, snow, and fog
 * @author Bandar Al-Otibie <https://bento.me/b0obe>
 * @version 1.0.0
 *
 * @requires SceneObject
 */

/**
 * WeatherEffects Script Component
 * This script creates and controls various weather effects in your scene.
 * 
 * @usage
 * 1. Add this script to any object in your scene
 * 2. Configure the weather type and parameters
 * 3. Start the weather effect
 */
// @input string weatherType = "rain" {"widget":"combobox", "values":[{"label":"Rain", "value":"rain"}, {"label":"Snow", "value":"snow"}, {"label":"Fog", "value":"fog"}, {"label":"Wind", "value":"wind"}]} /** Type of weather effect */
// @input float intensity = 0.5 {"min":0.0, "max":1.0, "step":0.1} /** Weather effect intensity (0-1) */
// @input vec3 direction = {0.0, -1.0, 0.0} /** Direction of the weather effect (for rain, snow, wind) */
// @input vec4 particleColor = {1.0, 1.0, 1.0, 1.0} /** Color of particles */
// @input Asset.Texture particleTexture /** Custom texture for particles (optional) */
// @input float particleSize = 0.1 /** Size of individual particles */
// @input float particleSpeed = 1.0 /** Speed of particle movement */
// @input bool playOnStart = true /** Whether to start the effect when the Lens starts */
// @input bool randomizeDirection = false /** Add some randomness to particle directions */
// @input SceneObject emitterObject /** Optional custom emitter object (if not specified, creates one) */
// @input bool debugMode = false /** Show debug messages in logger */

// Script global variables
var weatherSystem = null;
var particleSystem = null;
var emitter = null;
var fogEffect = null;
var windController = null;
var isActive = false;

/**
 * Initialize the script
 */
function initialize() {
    // Get or create emitter object
    if (script.emitterObject) {
        emitter = script.emitterObject;
    } else {
        // Create a new emitter as a child of this object
        emitter = global.scene.createSceneObject("WeatherEmitter");
        emitter.setParent(script.getSceneObject());
        
        // Position the emitter above the scene
        emitter.getTransform().setLocalPosition(new vec3(0, 10, 0));
    }
    
    // Setup weather effect based on type
    setupWeatherEffect();
    
    if (script.playOnStart) {
        startWeather();
    }
    
    if (script.debugMode) {
        print("WeatherEffects: Initialized with type: " + script.weatherType);
    }
}

/**
 * Setup the weather effect based on the selected type
 */
function setupWeatherEffect() {
    // Clear any existing effects first
    clearWeatherEffects();
    
    switch (script.weatherType.toLowerCase()) {
        case "rain":
            setupRain();
            break;
        case "snow":
            setupSnow();
            break;
        case "fog":
            setupFog();
            break;
        case "wind":
            setupWind();
            break;
        default:
            print("WeatherEffects: ERROR - Unknown weather type: " + script.weatherType);
            return;
    }
    
    if (script.debugMode) {
        print("WeatherEffects: Set up " + script.weatherType + " effect");
    }
}

/**
 * Clear any existing weather effects
 */
function clearWeatherEffects() {
    // Remove existing components
    if (particleSystem) {
        emitter.removeComponent(particleSystem);
        particleSystem = null;
    }
    
    if (fogEffect) {
        emitter.removeComponent(fogEffect);
        fogEffect = null;
    }
    
    if (windController) {
        windController = null;
    }
}

/**
 * Setup rain effect using particle system
 */
function setupRain() {
    // Create particle component
    particleSystem = emitter.createComponent("Component.VFXComponent");
    
    // Configure particle system for rain
    var rainVfx = particleSystem.asset;
    
    if (!rainVfx) {
        // Create a new VFX asset for rain
        rainVfx = global.scene.createVFXAsset();
        particleSystem.asset = rainVfx;
    }
    
    // Configure the VFX graph for rain
    var spawn = rainVfx.getSpawnModule();
    spawn.rate = 500 * script.intensity;
    spawn.rateOverTime = 500 * script.intensity;
    
    var lifeSpan = rainVfx.getLifeSpanModule();
    lifeSpan.lifespan = 2.0;
    
    var size = rainVfx.getSizeModule();
    size.sizeStart = script.particleSize;
    size.sizeEnd = script.particleSize;
    
    var velocity = rainVfx.getVelocityModule();
    var rainDir = script.direction.normalize();
    velocity.direction = rainDir.mult(script.particleSpeed * 5.0);
    
    if (script.randomizeDirection) {
        velocity.directionRandomness = 0.2;
    }
    
    var shape = rainVfx.getShapeModule();
    shape.shape = 0; // Box shape
    shape.size = new vec3(20, 0.1, 20); // Wide but flat emitter
    
    var render = rainVfx.getRenderModule();
    render.renderMode = 0; // Billboard
    render.billboardMode = 1; // Stretched billboard
    render.stretch = 0.5; // Stretch factor
    
    // Set custom texture if provided
    if (script.particleTexture) {
        render.diffuseTexture = script.particleTexture;
    }
    
    render.color = script.particleColor;
    
    // Disable by default, will be enabled on start
    particleSystem.enabled = false;
}

/**
 * Setup snow effect using particle system
 */
function setupSnow() {
    // Create particle component
    particleSystem = emitter.createComponent("Component.VFXComponent");
    
    // Configure particle system for snow
    var snowVfx = particleSystem.asset;
    
    if (!snowVfx) {
        // Create a new VFX asset for snow
        snowVfx = global.scene.createVFXAsset();
        particleSystem.asset = snowVfx;
    }
    
    // Configure the VFX graph for snow
    var spawn = snowVfx.getSpawnModule();
    spawn.rate = 200 * script.intensity;
    spawn.rateOverTime = 200 * script.intensity;
    
    var lifeSpan = snowVfx.getLifeSpanModule();
    lifeSpan.lifespan = 5.0;
    
    var size = snowVfx.getSizeModule();
    size.sizeStart = script.particleSize * 0.8;
    size.sizeEnd = script.particleSize * 0.8;
    
    var velocity = snowVfx.getVelocityModule();
    var snowDir = script.direction.normalize();
    velocity.direction = snowDir.mult(script.particleSpeed * 1.5);
    
    // Snow needs more randomness
    velocity.directionRandomness = script.randomizeDirection ? 0.5 : 0.3;
    
    var shape = snowVfx.getShapeModule();
    shape.shape = 0; // Box shape
    shape.size = new vec3(30, 0.1, 30); // Wide but flat emitter
    
    var render = snowVfx.getRenderModule();
    render.renderMode = 0; // Billboard
    
    // Set custom texture if provided
    if (script.particleTexture) {
        render.diffuseTexture = script.particleTexture;
    }
    
    render.color = script.particleColor;
    
    // Add rotation to snowflakes
    var rotation = snowVfx.getRotationModule();
    rotation.initialRotation = 0;
    rotation.rotationOverTime = 0.2;
    rotation.rotationRandomness = 1.0;
    
    // Disable by default, will be enabled on start
    particleSystem.enabled = false;
}

/**
 * Setup fog effect
 */
function setupFog() {
    // For fog, we need to manipulate the scene's fog settings
    fogEffect = emitter.createComponent("Component.FogController");
    
    if (fogEffect) {
        // Configure fog based on intensity
        fogEffect.fogColor = script.particleColor;
        fogEffect.fogDensity = 0.02 * script.intensity;
        fogEffect.fogStartDistance = 0;
        fogEffect.fogEndDistance = 100;
        
        // Disable by default, will be enabled on start
        fogEffect.enabled = false;
    } else {
        print("WeatherEffects: ERROR - Failed to create fog effect");
    }
}

/**
 * Setup wind effect (affects scene objects)
 */
function setupWind() {
    // Wind is a special case that affects objects in the scene
    // We create a controller object to track and update objects
    windController = {
        windDirection: script.direction.normalize(),
        windSpeed: script.particleSpeed * script.intensity * 5.0,
        affectedObjects: [],
        originalPositions: {},
        time: 0
    };
    
    // Find scene objects with specific tags or components to affect
    // This is a simple implementation - in a real project, you'd want to tag objects
    var allObjects = global.scene.getAllSceneObjects();
    for (var i = 0; i < allObjects.length; i++) {
        var obj = allObjects[i];
        
        // Check if object should be affected by wind (e.g., by tag or component)
        // This is just an example - you'd need to implement proper filtering
        if (obj.name.toLowerCase().indexOf("leaf") >= 0 || 
            obj.name.toLowerCase().indexOf("branch") >= 0 || 
            obj.name.toLowerCase().indexOf("flag") >= 0 ||
            obj.name.toLowerCase().indexOf("cloth") >= 0) {
            
            windController.affectedObjects.push(obj);
            windController.originalPositions[obj.name] = obj.getTransform().getWorldPosition();
            
            if (script.debugMode) {
                print("WeatherEffects: Wind will affect object: " + obj.name);
            }
        }
    }
}

/**
 * Update wind effect on each frame
 */
function updateWind(eventData) {
    if (!isActive || !windController) return;
    
    var deltaTime = eventData.getDeltaTime();
    windController.time += deltaTime;
    
    // Apply wind force to each affected object
    for (var i = 0; i < windController.affectedObjects.length; i++) {
        var obj = windController.affectedObjects[i];
        if (!obj) continue;
        
        var originalPos = windController.originalPositions[obj.name];
        if (!originalPos) continue;
        
        // Create a wind effect with some randomness and oscillation
        var windEffect = windController.windDirection.mult(
            windController.windSpeed * 
            Math.sin(windController.time * 2 + i * 0.5) * 0.5 + 0.5
        );
        
        // Apply to object's transform
        var newPos = originalPos.add(windEffect);
        obj.getTransform().setWorldPosition(newPos);
        
        // Optionally rotate object based on wind
        var currentRot = obj.getTransform().getLocalRotation();
        var windRot = quat.angleAxis(
            Math.sin(windController.time * 3 + i) * 0.1 * windController.windSpeed,
            new vec3(0, 0, 1)
        );
        obj.getTransform().setLocalRotation(quat.multiply(currentRot, windRot));
    }
}

/**
 * Start the weather effect
 */
function startWeather() {
    if (isActive) return;
    
    if (particleSystem) {
        particleSystem.enabled = true;
    }
    
    if (fogEffect) {
        fogEffect.enabled = true;
    }
    
    isActive = true;
    
    if (script.debugMode) {
        print("WeatherEffects: Started " + script.weatherType + " effect");
    }
}

/**
 * Stop the weather effect
 */
function stopWeather() {
    if (!isActive) return;
    
    if (particleSystem) {
        particleSystem.enabled = false;
    }
    
    if (fogEffect) {
        fogEffect.enabled = false;
    }
    
    isActive = false;
    
    if (script.debugMode) {
        print("WeatherEffects: Stopped " + script.weatherType + " effect");
    }
}

/**
 * Set the weather effect intensity
 * @param {number} newIntensity - New intensity value (0-1)
 */
function setIntensity(newIntensity) {
    script.intensity = Math.max(0, Math.min(1, newIntensity));
    
    // Update active weather systems with new intensity
    if (particleSystem) {
        var vfx = particleSystem.asset;
        if (vfx) {
            var spawn = vfx.getSpawnModule();
            if (script.weatherType === "rain") {
                spawn.rate = 500 * script.intensity;
                spawn.rateOverTime = 500 * script.intensity;
            } else if (script.weatherType === "snow") {
                spawn.rate = 200 * script.intensity;
                spawn.rateOverTime = 200 * script.intensity;
            }
        }
    }
    
    if (fogEffect) {
        fogEffect.fogDensity = 0.02 * script.intensity;
    }
    
    if (windController) {
        windController.windSpeed = script.particleSpeed * script.intensity * 5.0;
    }
    
    if (script.debugMode) {
        print("WeatherEffects: Set intensity to " + script.intensity);
    }
}

/**
 * Change the weather effect type
 * @param {string} newType - New weather type ("rain", "snow", "fog", "wind")
 */
function setWeatherType(newType) {
    if (newType === script.weatherType) return;
    
    // Stop current weather
    stopWeather();
    
    // Change type and reset
    script.weatherType = newType;
    setupWeatherEffect();
    
    // Restart if it was active before
    if (isActive) {
        startWeather();
    }
    
    if (script.debugMode) {
        print("WeatherEffects: Changed type to " + script.weatherType);
    }
}

/**
 * Set the direction of the weather effect
 * @param {vec3} newDirection - New direction vector
 */
function setDirection(newDirection) {
    script.direction = newDirection;
    
    // Update direction in active weather systems
    if (particleSystem) {
        var vfx = particleSystem.asset;
        if (vfx) {
            var velocity = vfx.getVelocityModule();
            var dir = script.direction.normalize();
            
            if (script.weatherType === "rain") {
                velocity.direction = dir.mult(script.particleSpeed * 5.0);
            } else if (script.weatherType === "snow") {
                velocity.direction = dir.mult(script.particleSpeed * 1.5);
            }
        }
    }
    
    if (windController) {
        windController.windDirection = script.direction.normalize();
    }
    
    if (script.debugMode) {
        print("WeatherEffects: Set direction to " + script.direction);
    }
}

/**
 * Set the particle color for the weather effect
 * @param {vec4} newColor - New color value
 */
function setParticleColor(newColor) {
    script.particleColor = newColor;
    
    // Update color in active weather systems
    if (particleSystem) {
        var vfx = particleSystem.asset;
        if (vfx) {
            var render = vfx.getRenderModule();
            render.color = script.particleColor;
        }
    }
    
    if (fogEffect) {
        fogEffect.fogColor = script.particleColor;
    }
    
    if (script.debugMode) {
        print("WeatherEffects: Set particle color");
    }
}

/**
 * Function called on each frame update
 */
function onUpdate(eventData) {
    // Update wind effect if active
    if (script.weatherType === "wind" && isActive) {
        updateWind(eventData);
    }
}

// Initialize on script load
initialize();

// Bind to update event
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

// Expose public API
script.api.startWeather = startWeather;
script.api.stopWeather = stopWeather;
script.api.setIntensity = setIntensity;
script.api.setWeatherType = setWeatherType;
script.api.setDirection = setDirection;
script.api.setParticleColor = setParticleColor;