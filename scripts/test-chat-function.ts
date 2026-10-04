import { promises as fs } from 'fs';
import path from 'path';

async function run() {
  try {
    console.log('Reading chat.ts...');
    const chatTsPath = path.resolve(__dirname, '../api/chat.ts');
    let content = await fs.readFile(chatTsPath, 'utf8');
    
    // Add exports to functions we want to test
    content = content.replace('async function saveSharePointDocForSlug', 'export async function saveSharePointDocForSlug');
    content = content.replace('async function getShieldPortalToken', 'export async function getShieldPortalToken');
    
    const tempTsPath = path.resolve(__dirname, '../api/temp-chat-test.ts');
    await fs.writeFile(tempTsPath, content, 'utf8');
    
    console.log('Importing from api/temp-chat-test.ts...');
    const tempModule = await import('../api/temp-chat-test');
    
    console.log('Calling getShieldPortalToken...');
    const tokenResult = await tempModule.getShieldPortalToken();
    console.log('Token result:', tokenResult);
    
    console.log('Calling saveSharePointDocForSlug...');
    const result = await tempModule.saveSharePointDocForSlug('andrew', 'Capability-Brief-MRO.docx', 'Test Title\nTest content body\n## Heading 2\nMore body');
    console.log('Result from saveSharePointDocForSlug:', result);
    
    // Clean up
    await fs.unlink(tempTsPath);
  } catch (err) {
    console.error('Error in run:', err);
  }
}

run();
