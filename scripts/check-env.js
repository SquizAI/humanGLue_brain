#!/usr/bin/env node

/**
 * ============================================================================
 * HumanGlue Platform - Environment Variables Validation Script
 * ============================================================================
 *
 * This script validates that all required environment variables are set
 * and properly configured for the current environment.
 *
 * Usage:
 *   node scripts/check-env.js
 *   NODE_ENV=production node scripts/check-env.js
 *
 * Exit codes:
 *   0 - All required variables are set
 *   1 - Missing required variables or validation errors
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const { red, green, yellow, blue, reset } = colors;

// ============================================================================
// Environment Variable Definitions
// ============================================================================

const ENV_VARS = {
  // Critical variables (must be set in all environments)
  critical: [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      description: 'Supabase project URL',
      pattern: /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
      example: 'https://your-project.supabase.co',
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      description: 'Supabase anonymous key',
      pattern: /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/,
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      description: 'Supabase service role key (server-side only)',
      pattern: /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/,
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      serverOnly: true,
    },
  ],

  // Production-only required variables
  production: [
    {
      name: 'NEXT_PUBLIC_SITE_URL',
      description: 'Production site URL',
      pattern: /^https:\/\//,
      example: 'https://humanglue.ai',
    },
    {
      name: 'STRIPE_SECRET_KEY',
      description: 'Stripe secret key (should be live key in production)',
      pattern: /^sk_live_/,
      example: 'sk_live_...',
      serverOnly: true,
    },
    {
      name: 'STRIPE_WEBHOOK_SECRET',
      description: 'Stripe webhook secret',
      pattern: /^whsec_/,
      example: 'whsec_...',
      serverOnly: true,
    },
  ],

  // Recommended variables (warnings if missing)
  recommended: [
    {
      name: 'UPSTASH_REDIS_REST_URL',
      description: 'Upstash Redis URL for rate limiting',
      pattern: /^https:\/\//,
    },
    {
      name: 'UPSTASH_REDIS_REST_TOKEN',
      description: 'Upstash Redis token',
    },
    {
      name: 'NEXT_PUBLIC_SENTRY_DSN',
      description: 'Sentry DSN for error tracking',
      pattern: /^https:\/\//,
    },
    {
      name: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
      description: 'Google Analytics measurement ID',
      pattern: /^G-[A-Z0-9]+$/,
    },
    {
      name: 'RESEND_API_KEY',
      description: 'Resend API key for emails',
      pattern: /^re_/,
      serverOnly: true,
    },
  ],

  // Optional variables (info only)
  optional: [
    'GOOGLE_AI_API_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'SENDGRID_API_KEY',
  ],
};

// ============================================================================
// Validation Functions
// ============================================================================

function checkVariable(envVar) {
  const value = process.env[envVar.name];

  if (!value) {
    return {
      status: 'missing',
      message: `${envVar.name} is not set`,
    };
  }

  // Check if it's a placeholder value
  if (
    value.includes('your-') ||
    value.includes('...') ||
    value === 'example' ||
    value === 'TODO'
  ) {
    return {
      status: 'placeholder',
      message: `${envVar.name} contains placeholder value`,
    };
  }

  // Validate pattern if provided
  if (envVar.pattern && !envVar.pattern.test(value)) {
    return {
      status: 'invalid',
      message: `${envVar.name} format is invalid`,
      expected: envVar.example,
    };
  }

  // Check for development keys in production
  if (process.env.NODE_ENV === 'production') {
    if (
      envVar.name.includes('STRIPE') &&
      value.includes('_test_')
    ) {
      return {
        status: 'warning',
        message: `${envVar.name} appears to be a test key in production`,
      };
    }
  }

  return {
    status: 'valid',
    message: `${envVar.name} is set`,
  };
}

function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';

  console.log(`${blue}============================================================================${reset}`);
  console.log(`${blue}Environment Variables Validation${reset}`);
  console.log(`${blue}============================================================================${reset}\n`);
  console.log(`Environment: ${yellow}${env}${reset}\n`);

  let errors = 0;
  let warnings = 0;
  let valid = 0;

  // Check critical variables
  console.log(`${blue}▶ Critical Variables (Required)${reset}\n`);

  ENV_VARS.critical.forEach((envVar) => {
    const result = checkVariable(envVar);

    if (result.status === 'valid') {
      console.log(`  ${green}✓${reset} ${envVar.name}`);
      valid++;
    } else if (result.status === 'missing') {
      console.log(`  ${red}✗${reset} ${envVar.name} - ${result.message}`);
      console.log(`    ${yellow}→${reset} ${envVar.description}`);
      if (envVar.example) {
        console.log(`    ${yellow}→${reset} Example: ${envVar.example}`);
      }
      errors++;
    } else {
      console.log(`  ${red}✗${reset} ${result.message}`);
      if (result.expected) {
        console.log(`    ${yellow}→${reset} Expected format: ${result.expected}`);
      }
      errors++;
    }
  });

  // Check production variables if in production
  if (isProduction) {
    console.log(`\n${blue}▶ Production Variables (Required)${reset}\n`);

    ENV_VARS.production.forEach((envVar) => {
      const result = checkVariable(envVar);

      if (result.status === 'valid') {
        console.log(`  ${green}✓${reset} ${envVar.name}`);
        valid++;
      } else if (result.status === 'warning') {
        console.log(`  ${yellow}⚠${reset} ${result.message}`);
        warnings++;
      } else {
        console.log(`  ${red}✗${reset} ${result.message}`);
        if (result.expected) {
          console.log(`    ${yellow}→${reset} Expected format: ${result.expected}`);
        }
        errors++;
      }
    });
  }

  // Check recommended variables
  console.log(`\n${blue}▶ Recommended Variables${reset}\n`);

  ENV_VARS.recommended.forEach((envVar) => {
    const result = checkVariable(envVar);

    if (result.status === 'valid') {
      console.log(`  ${green}✓${reset} ${envVar.name}`);
      valid++;
    } else {
      console.log(`  ${yellow}⚠${reset} ${result.message}`);
      console.log(`    ${yellow}→${reset} ${envVar.description}`);
      warnings++;
    }
  });

  // Check optional variables
  console.log(`\n${blue}▶ Optional Variables${reset}\n`);

  ENV_VARS.optional.forEach((name) => {
    const value = process.env[name];
    if (value) {
      console.log(`  ${green}✓${reset} ${name}`);
      valid++;
    } else {
      console.log(`  ${yellow}○${reset} ${name} (optional - not set)`);
    }
  });

  // Check for sensitive data in client-side variables
  console.log(`\n${blue}▶ Security Checks${reset}\n`);

  const clientVars = Object.keys(process.env).filter((key) =>
    key.startsWith('NEXT_PUBLIC_')
  );

  const sensitivePatterns = [
    { pattern: /secret/i, name: 'secret' },
    { pattern: /private/i, name: 'private key' },
    { pattern: /password/i, name: 'password' },
    { pattern: /sk_live_/i, name: 'Stripe secret key' },
    { pattern: /sk_test_/i, name: 'Stripe test key' },
  ];

  let securityIssues = 0;

  clientVars.forEach((varName) => {
    const value = process.env[varName];
    sensitivePatterns.forEach(({ pattern, name }) => {
      if (pattern.test(value)) {
        console.log(`  ${red}✗${reset} ${varName} may contain ${name} (exposed to client)`);
        securityIssues++;
      }
    });
  });

  if (securityIssues === 0) {
    console.log(`  ${green}✓${reset} No sensitive data detected in client variables`);
  }

  // Summary
  console.log(`\n${blue}============================================================================${reset}`);
  console.log(`${blue}Summary${reset}`);
  console.log(`${blue}============================================================================${reset}\n`);

  console.log(`  ${green}Valid:    ${valid}${reset}`);
  console.log(`  ${yellow}Warnings: ${warnings}${reset}`);
  console.log(`  ${red}Errors:   ${errors}${reset}`);

  if (securityIssues > 0) {
    console.log(`  ${red}Security Issues: ${securityIssues}${reset}`);
  }

  console.log('');

  // Final verdict
  if (errors > 0 || securityIssues > 0) {
    console.log(`${red}============================================================================${reset}`);
    console.log(`${red}✗ VALIDATION FAILED${reset}`);
    console.log(`${red}============================================================================${reset}\n`);
    console.log('Please fix the errors above before deploying.\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`${yellow}============================================================================${reset}`);
    console.log(`${yellow}⚠ VALIDATION PASSED WITH WARNINGS${reset}`);
    console.log(`${yellow}============================================================================${reset}\n`);
    console.log('Consider addressing the warnings above.\n');
    process.exit(0);
  } else {
    console.log(`${green}============================================================================${reset}`);
    console.log(`${green}✓ VALIDATION PASSED${reset}`);
    console.log(`${green}============================================================================${reset}\n`);
    process.exit(0);
  }
}

// ============================================================================
// Check if .env.example is up to date
// ============================================================================

function checkEnvExample() {
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envExamplePath)) {
    console.log(`${yellow}⚠ Warning: .env.example file not found${reset}\n`);
    return;
  }

  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  const allVars = [
    ...ENV_VARS.critical,
    ...ENV_VARS.production,
    ...ENV_VARS.recommended,
  ];

  const missingFromExample = [];

  allVars.forEach((envVar) => {
    if (!envExample.includes(envVar.name)) {
      missingFromExample.push(envVar.name);
    }
  });

  if (missingFromExample.length > 0) {
    console.log(`${yellow}⚠ Warning: .env.example is missing these variables:${reset}`);
    missingFromExample.forEach((name) => {
      console.log(`  - ${name}`);
    });
    console.log('');
  }
}

// ============================================================================
// Main Execution
// ============================================================================

// Load .env files if they exist
try {
  const dotenvPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(dotenvPath)) {
    require('dotenv').config({ path: dotenvPath });
  } else {
    require('dotenv').config();
  }
} catch (error) {
  // dotenv not available, continue with system environment variables
}

checkEnvExample();
validateEnvironment();
