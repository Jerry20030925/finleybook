#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动 FinleyBook 开发服务器...');
console.log('📁 项目目录:', process.cwd());

// 清理现有进程
console.log('🧹 清理现有进程...');
const cleanup = spawn('pkill', ['-f', 'next dev'], { stdio: 'ignore' });
cleanup.on('close', () => {
  setTimeout(() => {
    console.log('🔧 启动 Next.js 开发服务器...');
    
    const server = spawn('npx', ['next', 'dev', '-p', '3001', '-H', '0.0.0.0'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    server.on('error', (error) => {
      console.error('❌ 启动失败:', error);
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 关闭服务器...');
      server.kill();
      process.exit();
    });
  }, 2000);
});