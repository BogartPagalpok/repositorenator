const fs = require('fs');
const path = require('path');

/**
 * Generates a file structure and boilerplate code based on user preferences.
 * @param {Object} settings - The user-defined settings for the repository.
 * @param {string} repoName - The name of the repository.
 * @returns {Promise<void>}
 */
async function generateRepo(settings, repoName) {
    const rootDir = path.join(__dirname, '..', repoName);

    // Create the base directory for the repository
    await createDirectory(rootDir);

    // Create the configuration files based on selected settings
    await createConfigFiles(rootDir, settings);

    // Generate index.html and main.js or index.js based on user options
    if (settings.frontendFramework) {
        await generateFrontendFiles(rootDir, settings);
    }

    // Generate CSS files if a stylesheet is chosen
    if (settings.cssFramework) {
        await generateCSSFiles(rootDir, settings);
    }

    // Create a package.json file for npm dependencies and scripts
    await createPackageJson(rootDir, settings);

    // Generate README.md file
    await generateReadme(rootDir, repoName, settings);

    console.log(`Repository structure for '${repoName}' created successfully!`);
}

/**
 * Create a directory.
 * @param {string} dir - The directory path.
 * @returns {Promise<void>}
 */
async function createDirectory(dir) {
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

/**
 * Create configuration files based on user settings (e.g., ESLint, Prettier).
 * @param {string} rootDir - The root directory of the repository.
 * @param {Object} settings - The user-defined settings.
 * @returns {Promise<void>}
 */
async function createConfigFiles(rootDir, settings) {
    if (settings.linting) {
        const eslintConfig = "{\n  \"env\": {\n    \"browser\": true,\n    \"es6\": true\n  },\n  \"extends\": [\n    \"eslint:recommended\"\n  ],\n  \"parserOptions\": {\n    \"ecmaVersion\": 2020\n  },\n  \"rules\": {\n    \"no-unused-vars\": [\"error\", {\"argsIgnorePattern\": '\"^_\"'}],\n    \"no-console\": \"warn\"\n  }\n}";
        await writeFile(path.join(rootDir, '.eslintrc.json'), eslintConfig);
    }

    if (settings.prettier) {
        const prettierConfig = "{\n    \"singleQuote\": true,\n    \"semi\": false\n}";
        await writeFile(path.join(rootDir, '.prettierrc'), prettierConfig);
    }
}

/**
 * Write a file to the specified path.
 * @param {string} filePath - The path of the file to write.
 * @param {string} content - The content to write into the file.
 * @returns {Promise<void>}
 */
async function writeFile(filePath, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, 'utf8', (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

/**
 * Generate frontend files based on the selected framework (React, Vue, etc.).
 * @param {string} rootDir - The root directory of the repository.
 * @param {Object} settings - The user-defined settings.
 * @returns {Promise<void>}
 */
async function generateFrontendFiles(rootDir, settings) {
    if (settings.frontendFramework === 'react') {
        const indexHtml = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>${settings.projectTitle}</title>\n</head>\n<body>\n    <div id=\"root\"></div>\n    <script src=\"main.js\"></script>\n</body>\n</html>`;
        await writeFile(path.join(rootDir, 'index.html'), indexHtml);
        const mainJs = `import React from 'react';\nimport ReactDOM from 'react-dom';\nimport './index.css';\n\nconst App = () => <h1>Hello ${settings.projectTitle}</h1>;\n\nReactDOM.render(<App />, document.getElementById('root'));`;
        await writeFile(path.join(rootDir, 'main.js'), mainJs);
    }
}

/**
 * Generate CSS files based on the selected framework.
 * @param {string} rootDir - The root directory of the repository.
 * @param {Object} settings - The user-defined settings.
 * @returns {Promise<void>}
 */
async function generateCSSFiles(rootDir, settings) {
    const cssFramework = settings.cssFramework;
    if (cssFramework === 'bootstrap') {
        // Example Bootstrap CSS inclusion
        const bootstrapCSS = `@import '\"https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css\"';\n`;
        await writeFile(path.join(rootDir, 'styles.css'), bootstrapCSS);
    }
}

/**
 * Create the package.json file.
 * @param {string} rootDir - The root directory of the repository.
 * @param {Object} settings - The user-defined settings.
 * @returns {Promise<void>}
 */
async function createPackageJson(rootDir, settings) {
    const packageJson = {  
        name: settings.projectName,  
        version: "1.0.0",  
        scripts: {  
            start: "webpack-dev-server --open",  
            build: "webpack"  
        },  
        dependencies: {},  
        devDependencies: {}  
    };

    if (settings.frontendFramework) {
        packageJson.dependencies[settings.frontendFramework] = "^latest";
    }

    if (settings.linting) {
        packageJson.devDependencies['eslint'] = "^latest";
    }

    await writeFile(path.join(rootDir, 'package.json'), JSON.stringify(packageJson, null, 2));
}

/**
 * Generate README.md file to describe the project.
 * @param {string} rootDir - The root directory of the repository.
 * @param {string} repoName - The name of the repository.
 * @param {Object} settings - The user-defined settings.
 * @returns {Promise<void>}
 */
async function generateReadme(rootDir, repoName, settings) {
    const readmeContent = `# ${repoName}\n\n## Description\n${settings.projectDescription}\n\n## Installation\nRun \\`npm install\\` to install dependencies.`;
    await writeFile(path.join(rootDir, 'README.md'), readmeContent);
}

module.exports = {
    generateRepo
};