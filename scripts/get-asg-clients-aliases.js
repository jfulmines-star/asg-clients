const fetch = require('node-fetch');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = 'prj_ckUYLkV8uSMYjUQUvlUYVnNJmxCz';
const TEAM_ID = 'team_ZvUbIDnGsVgF6fxxBxOoxR9h';

async function main() {
  // Try with teamId
  const url1 = `https://api.vercel.com/v4/aliases?projectId=${PROJECT_ID}&teamId=${TEAM_ID}`;
  const res1 = await fetch(url1, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  console.log('With teamId:', res1.status);
  if (res1.ok) {
    const data = await res1.json();
    for (const a of data.aliases || []) {
      console.log(`- ${a.alias} -> ${a.deploymentId}`);
    }
  } else {
    console.log(await res1.text());
  }

  // Try without teamId
  const url2 = `https://api.vercel.com/v4/aliases?projectId=${PROJECT_ID}`;
  const res2 = await fetch(url2, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  console.log('Without teamId:', res2.status);
  if (res2.ok) {
    const data = await res2.json();
    for (const a of data.aliases || []) {
      console.log(`- ${a.alias} -> ${a.deploymentId}`);
    }
  } else {
    console.log(await res2.text());
  }
}

main().catch(console.error);
