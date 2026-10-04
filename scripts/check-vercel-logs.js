const fetch = require('node-fetch');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = 'team_ZvUbIDnGsVgF6fxxBxOoxR9h';
const PROJECT_NAME = 'asg-clients';

async function main() {
  // 1. Get deployments
  const url = `https://api.vercel.com/v6/deployments?projectId=${PROJECT_NAME}&teamId=${TEAM_ID}&limit=5`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`
    }
  });
  if (!res.ok) {
    console.error('Failed to fetch deployments:', res.status, await res.text());
    return;
  }
  const data = await res.json();
  const deployments = data.deployments || [];
  console.log('Recent Deployments:');
  for (const d of deployments) {
    console.log(`- ID: ${d.uid}, URL: ${d.url}, State: ${d.state}, Created: ${new Date(d.created).toLocaleString()}`);
  }

  if (deployments.length === 0) return;

  // 2. Get logs for the latest deployment
  const latestId = deployments[0].uid;
  console.log(`\nFetching logs for latest deployment ${latestId}...`);
  const logsUrl = `https://api.vercel.com/v2/deployments/${latestId}/events?teamId=${TEAM_ID}&limit=20&direction=backward`;
  const logsRes = await fetch(logsUrl, {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`
    }
  });
  if (!logsRes.ok) {
    console.error('Failed to fetch logs:', logsRes.status, await logsRes.text());
    return;
  }
  const logsData = await logsRes.json();
  console.log('Logs:');
  for (const event of logsData || []) {
    if (event.payload) {
      console.log(`[${new Date(event.created).toLocaleTimeString()}] [${event.type}] ${event.payload.text || event.payload.message || JSON.stringify(event.payload)}`);
    } else {
      console.log(`[${new Date(event.created).toLocaleTimeString()}] ${JSON.stringify(event)}`);
    }
  }
}

main().catch(console.error);
