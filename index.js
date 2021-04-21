'use strict';

const fs = require('fs-extra');

class CopyArtifactPlugin {
  
  constructor(serverless, options) {
    
    this.serverless = serverless;
    
    this.options = options;
    
    this.hooks = {
      'after:package:finalize': this.copyArtifact.bind(this)
    };
    
  }
  
  copyArtifact() {
    
    const service = this.serverless.service;
    
    const copyArtifact = service.custom.copyArtifact;
    
    if (copyArtifact.disabled) {
      
      this.serverless.cli.log('disabled, will do nothing', 'CopyArtifactPlugin');
      
      return true;
      
    }
    
    this.serverless.cli.log('copying artifact', 'CopyArtifactPlugin');
    
    const serviceDir = this.serverless.config.servicePath;
    const slsDir = `${serviceDir}/.serverless`;
    
    const homeDir = serviceDir.replace(
      new RegExp(`/${copyArtifact.pathToMain}$`), 
      ''
    );
    
    const artifactDir = `${homeDir}/${service.package.artifactDirectoryName}`;
    const copyDir = `${homeDir}/serverless/${service.service}/${service.provider.stage}`;
    
    // console.log('homeDir', homeDir);
    // console.log('artifactDir', artifactDir);
    // console.log('copyDir', copyDir);
    // console.log('slsDir', slsDir);
    
    fs.ensureDirSync(artifactDir);
    fs.copySync(slsDir, artifactDir);
    
    fs.ensureDirSync(copyDir);
    fs.copySync(
      `${slsDir}/cloudformation-template-update-stack.json`,
      `${copyDir}/cloudformation-template-upate-stack.json`
    );
    
    this.serverless.cli.log(`artifact copied to ${copyDir}`, 'CopyArtifactPlugin');
    
  }
  
}

module.exports = CopyArtifactPlugin;