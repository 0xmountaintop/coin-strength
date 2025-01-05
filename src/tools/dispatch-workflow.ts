import { Octokit } from '@octokit/rest';
import { parseArgs } from 'node:util';
import * as dotenv from 'dotenv';

dotenv.config();

const { values } = parseArgs({
  options: {
    owner: { type: 'string' },
    repo: { type: 'string' },
    workflow: { type: 'string' },
    ref: { type: 'string' },
    inputs: { type: 'string' }
  }
});

async function main() {
  if (!process.env.GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN environment variable is required');
    process.exit(1);
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  console.log(values);

  try {
    await octokit.rest.actions.createWorkflowDispatch({
      owner: values.owner!,
      repo: values.repo!,
      workflow_id: values.workflow!,
      ref: values.ref!,
      inputs: JSON.parse(values.inputs || '{}')
    });

    console.log('Workflow dispatched successfully');
  } catch (error) {
    console.error('Error dispatching workflow:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 