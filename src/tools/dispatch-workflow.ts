import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config();

interface WorkflowConfig {
  owner: string;
  repo: string;
  workflow_id: string;
  ref: string;
  inputs?: Record<string, string>;
}

async function dispatchWorkflow(config: WorkflowConfig) {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  try {
    const response = await octokit.actions.createWorkflowDispatch({
      owner: config.owner,
      repo: config.repo,
      workflow_id: config.workflow_id,
      ref: config.ref,
      inputs: config.inputs
    });

    if (response.status === 204) {
      console.log('Workflow dispatched successfully!');
      console.log('Configuration:', JSON.stringify(config, null, 2));
    } else {
      console.error('Unexpected response:', response.status);
    }
  } catch (error) {
    console.error('Error dispatching workflow:', error);
    process.exit(1);
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('config', {
      alias: 'c',
      type: 'string',
      description: 'Path to config file'
    })
    .option('owner', {
      type: 'string',
      description: 'Repository owner'
    })
    .option('repo', {
      type: 'string',
      description: 'Repository name'
    })
    .option('workflow', {
      type: 'string',
      description: 'Workflow file name or ID'
    })
    .option('ref', {
      type: 'string',
      description: 'Git reference (branch/tag)',
      default: 'main'
    })
    .option('inputs', {
      type: 'string',
      description: 'JSON string of workflow inputs'
    })
    .help()
    .argv;

  let config: WorkflowConfig;

  if (argv.config) {
    const { readFileSync } = require('fs');
    const configFile = readFileSync(argv.config, 'utf8');
    config = JSON.parse(configFile);
  } else {
    if (!argv.owner || !argv.repo || !argv.workflow) {
      console.error('Either provide a config file or specify owner, repo, and workflow');
      process.exit(1);
    }

    config = {
      owner: argv.owner,
      repo: argv.repo,
      workflow_id: argv.workflow,
      ref: argv.ref,
      inputs: argv.inputs ? JSON.parse(argv.inputs) : undefined
    };
  }

  await dispatchWorkflow(config);
}

main().catch(console.error); 