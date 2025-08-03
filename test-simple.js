const https = require('https');
const http = require('http');

// Test URLs đơn giản
const urls = [
  'https://vue-mongo-db-docker.vercel.app',
  'https://vue-mongo-db-docker.vercel.app/api/test',
  'https://nheii.vercel.app',
  'https://vue-mongo-db-docker-git-main-phinguyen111.vercel.app'
];

function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode < 400,
          contentType: res.headers['content-type'],
          dataLength: data.length
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

async function testAll() {
  console.log('🔍 Testing Vercel deployment URLs...');
  console.log('=' .repeat(60));
  
  for (const url of urls) {
    console.log(`\nTesting: ${url}`);
    const result = await testUrl(url);
    
    if (result.success) {
      console.log(`✅ Status: ${result.status}`);
      console.log(`   Content-Type: ${result.contentType}`);
      console.log(`   Data Length: ${result.dataLength} bytes`);
    } else {
      console.log(`❌ Status: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Testing completed!');
}

testAll().catch(console.error);