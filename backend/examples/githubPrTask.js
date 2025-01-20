// /backend/examples/tasks/githubPrTask.js
export const createGitHubPRTask = (repoUrl, prTitle, prBody, head, base) => ({
    title: `Create PR: ${prTitle}`,
    description: `Create a pull request in ${repoUrl}`,
    priority: 3,
    requiredCapabilities: ['github_access'],
    requiredResources: [{
      type: 'github',
      permissions: ['write']
    }],
    config: {
      type: 'github',
      action: 'createPullRequest',
      repoUrl,
      prTitle,
      prBody,
      head,
      base
    }
  });