const path = require('path');
const fs = require('fs');

// Configuration settings for the app
const settings = {
    appName: 'Repo Builder',
    version: '1.0.0',
    defaultBoilerplate: {
        language: 'JavaScript', // Default programming language
        cssFramework: 'Bootstrap', // Default CSS framework
        lintingRules: 'Airbnb', // Default linting rules
        gitIgnore: true, // Default to include .gitignore
        license: 'MIT' // Default license
    },
    customTemplates: [], // Array to hold user-defined templates
    githubOAuth: {
        clientId: process.env.GITHUB_CLIENT_ID || '', // GitHub OAuth Client ID
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '', // GitHub OAuth Client Secret
        callbackUrl: 'http://localhost:3000/auth/github/callback' // Callback URL for OAuth
    },
    terminalSettings: {
        simulatedCommands: [
            'npm install', // Example command for terminal simulation
            'npm run build' // Example build command
        ],
        maxOutputLines: 50 // Limit of output lines in terminal
    },
    localDownload: true, // Allow local file download
    savePath: path.join(__dirname, '..', 'user-templates') // Save path for user templates
};

// Ensures the directory for saving custom templates exists
const ensureTemplateDirectory = () => {
    if (!fs.existsSync(settings.savePath)) {
        fs.mkdirSync(settings.savePath, { recursive: true });
    }
};

// Save custom template to file
const saveCustomTemplate = (templateName, templateData) => {
    ensureTemplateDirectory();
    const filePath = path.join(settings.savePath, `${templateName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(templateData, null, 2), 'utf-8');
};

// Load custom templates
const loadCustomTemplates = () => {
    ensureTemplateDirectory();
    const files = fs.readdirSync(settings.savePath);
    settings.customTemplates = files.map(file => {
        const filePath = path.join(settings.savePath, file);
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    });
};

// Initialize custom templates on app startup
loadCustomTemplates();

module.exports = {
    settings,
    saveCustomTemplate
};