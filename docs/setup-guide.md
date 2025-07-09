# Setup Guide for Lens Studio JS

This guide explains how to set up and use the Lens Studio JS library in your Lens Studio projects.

## Method 1: Using Script References (Recommended)

This is the most reliable method for using the library in Lens Studio.

1. **Add script files to your project**
   - Copy the script files you need from the `scripts` folder into your Lens Studio project's Resources panel
   - For example, add `TweenUtils.js` to your Resources

2. **Add the script as a component**
   - Create or select an object in your scene (like an empty Scene Object)
   - In the Inspector panel, click "Add Component" → "Script" → "Script Component"
   - In the new Script Component, click "Add Script" and select the script you added (e.g., TweenUtils.js)

3. **Reference the script in your own scripts**
   - In your own script, add an input parameter to reference the script component:
   ```javascript
   // @input Component.ScriptComponent tweenUtilsScript /** Reference to TweenUtils script */
   ```
   - In the Inspector panel for your script, drag the Script Component from step 2 to this input field

4. **Access the script's API**
   - In your script code, access the API through the script reference:
   ```javascript
   var tweenUtils = script.tweenUtilsScript.api;
   
   // Now you can use the API
   tweenUtils.tweenTo({
       start: 0,
       end: 1,
       duration: 1.0,
       onUpdate: function(value) {
           // Your animation code here
       }
   });
   ```

## Method 2: Using require (Advanced)

The `require` system in Lens Studio can be used but may require additional setup.

1. **Set up your project structure**
   - Create a folder structure in your Resources panel that matches the library structure
   - For example, create a folder named `utility` and place `TweenUtils.js` inside it

2. **Modify the script for require**
   - At the end of each script file, add an export statement:
   ```javascript
   module.exports = script.api;
   ```

3. **Import the script using require**
   - In your script, use require to import the module:
   ```javascript
   const TweenUtils = require('./utility/TweenUtils');
   
   // Now you can use the API
   TweenUtils.tweenTo({
       // options here
   });
   ```

## Troubleshooting

If you're having issues with the `require` system:

1. **Check script paths**
   - Make sure the path in your require statement matches the actual folder structure
   - Try using absolute paths: `require('/Scripts/utility/TweenUtils')`

2. **Check for export statements**
   - Make sure each script properly exports its API

3. **Use script references instead**
   - If require continues to cause issues, switch to Method 1 (Script References)

## Example

See the `examples/TweenSimpleExample.js` file for a complete example of using script references. 