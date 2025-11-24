#!/usr/bin/env node

const http = require('http');

const ports = [3001, 3000, 3002];
const hosts = ['localhost', '127.0.0.1'];

async function testConnection(host, port) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}`, { timeout: 2000 }, (res) => {
      resolve({ host, port, status: 'success', code: res.statusCode });
    });
    
    req.on('error', (err) => {
      resolve({ host, port, status: 'error', error: err.code });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ host, port, status: 'timeout' });
    });
  });
}

async function main() {
  console.log('🔍 测试 FinleyBook 服务器连接...\n');
  
  for (const port of ports) {
    console.log(`📡 测试端口 ${port}:`);
    
    for (const host of hosts) {
      const result = await testConnection(host, port);
      const symbol = result.status === 'success' ? '✅' : '❌';
      const message = result.status === 'success' 
        ? `${symbol} http://${host}:${port} - 可访问 (状态码: ${result.code})`
        : `${symbol} http://${host}:${port} - 无法访问 (${result.error || result.status})`;
      
      console.log(`   ${message}`);
      
      if (result.status === 'success') {
        console.log(`\n🎉 找到可用地址! 请在浏览器中访问: http://${host}:${port}\n`);
        return;
      }
    }
    console.log('');
  }
  
  console.log('❌ 未找到可用的服务器连接');
  console.log('💡 请确保开发服务器正在运行: npm run dev');
}

main().catch(console.error);