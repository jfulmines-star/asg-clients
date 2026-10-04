import handler from '../api/chat';

const mockReq = {
  method: 'POST',
  body: {
    slug: 'andrew',
    agent: 'rex',
    teamMember: 'Andy Parks',
    message: 'Can you generate a professional brief on the AH-64 protective cover installation process? Title it AH-64 Platform Brief and save it as a Word document.',
    history: []
  }
} as any;

const mockRes = {
  setHeader: (key: string, value: string) => {
    console.log(`[Header] ${key}: ${value}`);
  },
  status: function(code: number) {
    console.log(`[Status] ${code}`);
    return this;
  },
  json: function(data: any) {
    console.log('[JSON Response]', JSON.stringify(data, null, 2));
    return this;
  },
  end: function() {
    console.log('[End]');
    return this;
  }
} as any;

async function run() {
  console.log('Starting handler test...');
  await handler(mockReq, mockRes);
  console.log('Handler test completed.');
}

run().catch(err => {
  console.error('Unhandled error:', err);
});
