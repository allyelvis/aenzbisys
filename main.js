const { exec } = require('child_process');
const path = require('path');

// Function to execute shell commands
const executeCommand = (command, callback) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${command}\n`, error);
      return;
    }
    console.log(`Output for ${command}:\n`, stdout);
    if (stderr) {
      console.error(`Error Output for ${command}:\n`, stderr);
    }
    callback();
  });
};

// Function to set up and run the Restaurant POS project
const setupAndRunRestaurantPOS = () => {
  console.log('Setting up and running Restaurant POS...');

  const projectPath = path.join(__dirname, 'restaurant-pos');

  process.chdir(projectPath);
  executeCommand('npm install', () => {
    executeCommand('ng serve --open &', () => {
      console.log('Restaurant POS is running...');
      setupDebugConfig('restaurant-pos');
    });
  });
};

// Function to set up and run the E-commerce project
const setupAndRunEcommerce = () => {
  console.log('Setting up and running E-commerce...');

  const projectPath = path.join(__dirname, 'ecommerce');

  process.chdir(projectPath);
  executeCommand('npm install', () => {
    executeCommand('ng serve --open &', () => {
      console.log('E-commerce is running...');
      setupDebugConfig('ecommerce');
    });
  });
};

// Function to create debug configuration
const setupDebugConfig = (project) => {
  const vscodeConfigPath = path.join(__dirname, project, '.vscode', 'launch.json');

  const configContent = {
    version: '0.2.0',
    configurations: [
      {
        type: 'chrome',
        request: 'launch',
        name: `Launch Chrome against ${project}`,
        url: 'http://localhost:4200',
        webRoot: '${workspaceFolder}'
      }
    ]
  };

  const fs = require('fs');
  fs.writeFileSync(vscodeConfigPath, JSON.stringify(configContent, null, 2));
  console.log(`Debug configuration set up for ${project}`);
};

// Main function to start the setup process
const main = () => {
  setupAndRunRestaurantPOS();
  setupAndRunEcommerce();
};

main();