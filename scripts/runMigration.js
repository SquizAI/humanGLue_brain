#!/usr/bin/env node
/**
 * Run database migration for HumanGlue platform
 * Executes the multi-tenant schema migration using direct PostgreSQL connection
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Extract Supabase project details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ref from URL (e.g., https://egqqdscvxvtwcdwknbnt.supabase.co)
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
const connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function runMigration() {
  console.log('🚀 Starting database migration...\n');
  console.log(`📍 Project: ${projectRef}`);
  console.log(`🔗 URL: ${supabaseUrl}\n`);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_multi_tenant_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Loaded migration file: 001_multi_tenant_schema.sql');
    console.log(`📏 File size: ${(migrationSQL.length / 1024).toFixed(1)} KB\n`);

    // Execute the entire migration as one transaction
    console.log('⚙️  Executing migration...\n');

    await client.query('BEGIN');
    try {
      await client.query(migrationSQL);
      await client.query('COMMIT');
      console.log('✅ Migration completed successfully!\n');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

    // Verify tables created
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`📊 Created ${rows.length} tables:`);
    rows.forEach(row => console.log(`   - ${row.table_name}`));

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('   Details:', error.detail || 'No additional details');
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run migration
runMigration();
