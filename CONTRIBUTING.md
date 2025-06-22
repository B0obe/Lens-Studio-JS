# Contributing to Lens Studio Script Collection

Thank you for your interest in contributing to the Lens Studio Script Collection! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please be respectful and constructive in your interactions with others. We aim to create a positive and inclusive environment for all contributors.

## How to Contribute

### Reporting Issues

If you encounter a bug or have a feature request:

1. Check if the issue already exists in the [Issues](https://github.com/yourusername/lens-studio-js/issues) section.
2. If not, create a new issue with a clear title and description.
3. Include steps to reproduce the bug or a detailed description of the feature request.
4. If applicable, include code samples, error messages, and screenshots.

### Submitting Changes

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes following the coding standards.
4. Add proper documentation for your changes.
5. Test your changes thoroughly in Lens Studio.
6. Commit your changes with clear, descriptive commit messages.
7. Submit a pull request to the main repository.

## Coding Standards

### Script Structure

All scripts should follow this structure:

```javascript
/**
 * ScriptName.js
 * 
 * @description Brief description of what the script does
 * @author Your Name <your-link>
 * @version x.x.x
 *
 * @requires Optional list of dependencies
 */

/**
 * ScriptName Script Component
 * A more detailed description of what the script does and how it works.
 * 
 * @usage
 * Step-by-step instruction on how to use the script
 */
// @input definitions

// Script global variables

/**
 * Initialize the script
 */
function initialize() {
    // Initialization code
}

/**
 * Any other functions
 */
function someFunction() {
    // Function code
}

// Initialize on script load
initialize();

// Expose public API
script.api.someFunction = someFunction;
```

### Documentation Requirements

- All scripts must include proper documentation.
- Document all public functions with JSDoc comments.
- Include usage examples where appropriate.
- Add a corresponding Markdown file in the `/docs` directory.

### Naming Conventions

- Use camelCase for variables and functions: `myVariable`, `myFunction()`
- Use PascalCase for script names: `BouncingObject.js`
- Use clear, descriptive names that reflect the purpose

## Adding New Scripts

When adding a new script:

1. Place it in the appropriate category folder (`animation`, `interaction`, etc.).
2. Create proper documentation in the corresponding `/docs` folder.
3. Update `index.js` to include your new script.
4. If relevant, create an example in the `/examples` folder.
5. Test the script thoroughly in multiple scenarios.

## Testing

Before submitting:

- Test your scripts in Lens Studio with different Lens templates.
- Ensure compatibility with the latest Lens Studio version.
- Check that the script works as expected on different device types.
- Verify that the script doesn't cause significant performance issues.

## Documentation

When creating documentation for your script:

1. Use the existing documentation as a template.
2. Include all parameters with clear descriptions.
3. Provide usage examples for common scenarios.
4. List any special considerations or limitations.
5. Include performance tips where relevant.

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE). 