#!/bin/bash

# Function to set up and run Restaurant POS
setup_and_run_restaurant_pos() {
    echo "Setting up and running Restaurant POS..."

    cd restaurant-pos || exit

    # Install dependencies
    npm install

    # Serve the application
    ng serve --open &

    # Open the project in Visual Studio Code
    code . &

    # Set up launch.json for debugging
    mkdir -p .vscode
    cat <<EOL > .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:4200",
      "webRoot": "\${workspaceFolder}"
    }
  ]
}
EOL

    echo "Restaurant POS setup and running."
    cd ..
}

# Function to set up and run E-commerce
setup_and_run_ecommerce() {
    echo "Setting up and running E-commerce..."

    cd ecommerce || exit

    # Install dependencies
    npm install

    # Serve the application
    ng serve --open &

    # Open the project in Visual Studio Code
    code . &

    # Set up launch.json for debugging
    mkdir -p .vscode
    cat <<EOL > .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:4200",
      "webRoot": "\${workspaceFolder}"
    }
  ]
}
EOL

    echo "E-commerce setup and running."
    cd ..
}

# Main execution
setup_and_run_restaurant_pos
setup_and_run_ecommerce

echo "All projects are set up, running, and ready for debugging."