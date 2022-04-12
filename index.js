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

    if (!copyArtifact) {

      this.serverless.cli.log('no config found', 'copy-artifact');

      return true;

    }
    
    if (copyArtifact.disabled) {
      
      this.serverless.cli.log('disabled, will do nothing', 'CopyArtifactPlugin');
      
      return true;
      
    }
    
    const serviceDir = this.serverless.config.servicePath;
    const slsDir = this.options.package || `${serviceDir}/.serverless`;
    
    const homeDir = serviceDir.replace(
      new RegExp(`/${copyArtifact.pathToMain}$`), 
      ''
    );
    
    const artifactDir = `${homeDir}/${service.package.artifactDirectoryName}`;
    const artDirParts = artifactDir.split(service.service);
    let copyDir = `${artDirParts[0]}${service.service}/${service.provider.stage}`;
    
    // console.log('service', service);
    // console.log('options', this.options);
    // console.log('homeDir', homeDir);
    // console.log('artifactDir', artifactDir);
    // console.log('copyDir', copyDir);
    // console.log('slsDir', slsDir);
    
    fs.emptyDirSync(copyDir);
    fs.ensureDirSync(artifactDir);
    fs.copySync(slsDir, artifactDir);
    
    fs.copySync(
      `${slsDir}/cloudformation-template-update-stack.json`,
      `${copyDir}/cloudformation-template-update-stack.json`
    );
    
    this.serverless.cli.log(`artifact copied to ${copyDir}`, 'CopyArtifactPlugin');
    
  }
  
}

module.exports = CopyArtifactPlugin;