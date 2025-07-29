#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class ZipBuilder {
  constructor() {
    this.projectRoot = process.cwd();
    this.buildDir = path.join(this.projectRoot, 'build');
    this.timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.zipName = `vibelegal_v2_${this.timestamp}.zip`;
  }

  async build() {
    console.log('Building VibeLegal v2 deployment package...');
    
    try {
      this.prepareBuildDirectory();
      this.copyProjectFiles();
      this.buildFrontend();
      this.createZip();
      this.cleanup();
      
      console.log(`\n✅ Build complete: ${this.zipName}`);
      return true;
    } catch (error) {
      console.error('\n❌ Build failed:', error.message);
      return false;
    }
  }

  prepareBuildDirectory() {
    console.log('Preparing build directory...');
    
    if (fs.existsSync(this.buildDir)) {
      execSync(`rm -rf ${this.buildDir}`);
    }
    fs.mkdirSync(this.buildDir, { recursive: true });
  }

  copyProjectFiles() {
    console.log('Copying project files...');
    
    const filesToCopy = [
      'app/',
      'jurisdictions/',
      'scripts/',
      'schemas/',
      'README.md',
      'CONTRIBUTING.md',
      'Dockerfile',
      'render.yaml',
      '.env.example',
      '.github/'
    ];

    filesToCopy.forEach(item => {
      const srcPath = path.join(this.projectRoot, item);
      const destPath = path.join(this.buildDir, item);
      
      if (fs.existsSync(srcPath)) {
        if (fs.statSync(srcPath).isDirectory()) {
          execSync(`cp -r "${srcPath}" "${destPath}"`);
        } else {
          execSync(`cp "${srcPath}" "${destPath}"`);
        }
      }
    });
  }

  buildFrontend() {
    console.log('Building frontend...');
    
    const webDir = path.join(this.projectRoot, 'web');
    if (fs.existsSync(webDir)) {
      // Install dependencies and build
      execSync('npm install', { cwd: webDir, stdio: 'inherit' });
      execSync('npm run build', { cwd: webDir, stdio: 'inherit' });
      
      // Copy built frontend to app/public
      const distDir = path.join(webDir, 'dist');
      const publicDir = path.join(this.buildDir, 'app', 'public');
      
      if (fs.existsSync(distDir)) {
        execSync(`cp -r "${distDir}"/* "${publicDir}"/`);
      }
    }
  }

  createZip() {
    console.log('Creating deployment package...');
    
    const zipPath = path.join(this.projectRoot, this.zipName);
    execSync(`cd "${this.buildDir}" && zip -r "${zipPath}" .`);
  }

  cleanup() {
    console.log('Cleaning up...');
    execSync(`rm -rf ${this.buildDir}`);
  }
}

// CLI usage
const builder = new ZipBuilder();
const success = await builder.build();

process.exit(success ? 0 : 1);

