const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const querystring = require('querystring');
const { parse } = require('url');
const cookie = require('cookie');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;
const GITHUB_API_URL = 'https://api.github.com';

// Initiates OAuth2 authentication process with GitHub
const getGithubAuthUrl = () => {
    const scope = 'repo user';
    const authUrl = `https://github.com/login/oauth/authorize?${querystring.stringify({
        client_id: GITHUB_CLIENT_ID,
        redirect_uri: GITHUB_REDIRECT_URI,
        scope,
    })}`;
    return authUrl;
};

// Retrieves access token from GitHub using the provided code
const getAccessToken = async (code) => {
    const response = await axios.post(`https://github.com/login/oauth/access_token`, {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
    }, {
        headers: {
            accept: 'application/json',
        },
    });
    return response.data.access_token;
};

// Fetches user information from GitHub using the access token
const getUserInfo = async (accessToken) => {
    const response = await axios.get(`${GITHUB_API_URL}/user`, {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });
    return response.data;
};

// Pushes generated repository to user's GitHub account
const createGithubRepo = async (accessToken, repoData) => {
    const response = await axios.post(`${GITHUB_API_URL}/user/repos`, repoData, {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    });
    return response.data;
};

// Express middleware to handle GitHub callback
const handleGithubCallback = async (req, res) => {
    const { code } = parse(req.url, true).query;
    try {
        const accessToken = await getAccessToken(code);
        const userInfo = await getUserInfo(accessToken);
        // Store access token and user info in session or database
        res.writeHead(302, { Location: '/dashboard' });
        res.end();
    } catch (error) {
        console.error('Error during GitHub OAuth', error);
        res.writeHead(500);
        res.end('Authentication failed');
    }
};

module.exports = {
    getGithubAuthUrl,
    handleGithubCallback,
    createGithubRepo,
};