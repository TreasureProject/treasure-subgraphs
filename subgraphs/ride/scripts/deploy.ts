require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');

const NETWORKS = {
  sepolia_base: {
    name: process.env.SUBGRAPH_NAME_SEPOLIA_BASE,
    config: './config/sepolia-base.json',
  },
  base: {
    name: process.env.SUBGRAPH_NAME_BASE,
    config: './config/base.json',
  },
  sepolia: {
    name: process.env.SUBGRAPH_NAME_SEPOLIA,
    config: './config/sepolia.json',
  },
  mainnet: {
    name: process.env.SUBGRAPH_NAME_MAINNET,
    config: './config/mainnet.json',
  },
};

function validateEnvironment() {
  const requiredVars = ['ALCHEMY_DEPLOY_KEY', 'VERSION_LABEL'];
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  console.log('Environment variables are valid: ', requiredVars);
}

function deployToNetwork(network) {
  const networkConfig = NETWORKS[network];

  if (!networkConfig) {
    console.error(`Invalid network: ${network}`);
    process.exit(1);
  }

  try {
    // Prepare configuration
    console.log(`Preparing ${network} configuration...`);
    execSync(`npm run prepare:${network}`);

    // Generate types
    console.log('Generating types...');
    execSync('npm run codegen');

    // Build
    console.log('Building subgraph...');
    execSync('npm run build');

    // Deploy
    console.log(`Deploying to ${network}...`);
    const deployCommand = `graph deploy ride-dex-base-testnet2 \
  --version-label v0.0.1-2 \
  --node https://subgraphs.alchemy.com/api/subgraphs/deploy \
  --deploy-key 265rztu1cFNq5 \
  --ipfs https://ipfs.satsuma.xyz`;
    console.log('Executing: ', deployCommand);
    execSync(deployCommand, { stdio: 'inherit' });

    console.log(`Deployment to ${network} successful!`);
  } catch (error) {
    console.error(`Deployment to ${network} failed:`, error);
    process.exit(1);
  }
}

// Main execution
validateEnvironment();
const network = process.argv[2] || 'sepolia_base';
deployToNetwork(network);
