const axios = require('axios');
const { Octokit } = require('@octokit/rest');
const { GITHUB_TOKEN } = process.env;

class RepoService {
  constructor() {
    this.octokit = new Octokit({
      auth: GITHUB_TOKEN
    });
  }

  async createRepo(repoDetails) {
    try {
      const response = await this.octokit.repos.createForAuthenticatedUser({
        name: repoDetails.name,
        private: repoDetails.private,
        description: repoDetails.description,
        auto_init: true,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create repository: ${error.message}`);
    }
  }

  async uploadFilesToRepo(owner, repo, files) {
    try {
      const promises = files.map(file => {
        return this.octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: file.path,
          message: `Add ${file.path}`,
          content: Buffer.from(file.content).toString('base64'),
          branch: 'main'
        });
      });
      await Promise.all(promises);
      return { success: true, message: 'Files uploaded successfully.' };
    } catch (error) {
      throw new Error(`Failed to upload files: ${error.message}`);
    }
  }

  async getUserRepos(username) {
    try {
      const response = await this.octokit.repos.listForAuthenticatedUser({
        username,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to retrieve repositories: ${error.message}`);
    }
  }

  async deleteRepo(owner, repo) {
    try {
      await this.octokit.repos.delete({
        owner,
        repo,
      });
      return { success: true, message: 'Repository deleted successfully.' };
    } catch (error) {
      throw new Error(`Failed to delete repository: ${error.message}`);
    }
  }

  async getRepoDetails(owner, repo) {
    try {
      const response = await this.octokit.repos.get({
        owner,
        repo,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get repository details: ${error.message}`);
    }
  }
}

module.exports = new RepoService();