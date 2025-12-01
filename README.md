# Weather Dashboard with CI/CD

A weather dashboard application with automated CI/CD pipeline using GitHub Actions.

## Features

- Real-time weather display (connected to an API)
- Responsive design
- Automated testing
- Continuous deployment to GitHub Pages
- Build artifacts and status reports

## CI/CD Pipeline

The project includes a complete CI/CD pipeline with:

1. **Lint & Test** - Code quality checks and test execution
2. **Build** - Package the application
3. **Deploy** - Automatic deployment to GitHub Pages
4. **Notify** - Status reporting

## View the Application

The application is automatically deployed to: 
`https://[your-username].github.io/weather-dashboard/`

## View Workflow Runs

Check the Actions tab to see all pipeline executions:
`https://github.com/[your-username]/weather-dashboard/actions`

## Local Development

To run locally:
```bash
# Install dependencies
npm install

# Run tests
npm test

# Start local server
npm start