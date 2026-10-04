const SHIELD_GRAPH_TENANT   = '9df00d69-3980-486c-b81e-d6ef8ab81b10';
const SHIELD_GRAPH_CLIENT_ID = '3ae2aaaa-b799-4a54-963d-4d4497f0e330';
const SHIELD_GRAPH_SECRET    = 'W.Chd9gudo.K.c5Amc0I5wL6Ec.-L8MUv-';
const SHIELD_TOKEN_URL       = `https://login.microsoftonline.us/${SHIELD_GRAPH_TENANT}/oauth2/v2.0/token`;
const SHIELD_GRAPH_BASE      = 'https://graph.microsoft.us/v1.0';
const UPN = 'andy.parks@shieldtechnologies.com';

async function test() {
  console.log('Obtaining access token from commercial AD...');
  const tokenResp = await fetch(SHIELD_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     SHIELD_GRAPH_CLIENT_ID,
      client_secret: SHIELD_GRAPH_SECRET,
      grant_type:    'client_credentials',
      scope:         'https://graph.microsoft.us/.default',
    }).toString(),
  });
  if (!tokenResp.ok) {
    console.error('Failed to get token:', await tokenResp.text());
    return;
  }
  const tokenData = await tokenResp.json();
  const token = tokenData.access_token;
  console.log('Token obtained successfully.');

  console.log(`Checking user drives for: ${UPN}...`);
  const drivesResp = await fetch(`${SHIELD_GRAPH_BASE}/users/${encodeURIComponent(UPN)}/drives`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!drivesResp.ok) {
    console.error('Failed to get drives:', await drivesResp.text());
  } else {
    console.log('Drives:', JSON.stringify(await drivesResp.json(), null, 2));
  }

  console.log('Checking root children of user default drive...');
  const rootResp = await fetch(`${SHIELD_GRAPH_BASE}/users/${encodeURIComponent(UPN)}/drive/root/children`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!rootResp.ok) {
    console.error('Failed to get root children:', await rootResp.text());
  } else {
    const rootData = await rootResp.json();
    console.log('Root children:', rootData.value?.map(c => `${c.name} (folder: ${!!c.folder}, id: ${c.id})`));
  }

  console.log('Attempting upload to Documents folder...');
  const uploadResp = await fetch(
    `${SHIELD_GRAPH_BASE}/users/${encodeURIComponent(UPN)}/drive/root:/Documents/test-diagnostic.txt:/content`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' },
      body: 'Diagnostic test'
    }
  );
  console.log('Upload HTTP Status:', uploadResp.status);
  console.log('Upload Response Text:', await uploadResp.text());
}

test().catch(console.error);
