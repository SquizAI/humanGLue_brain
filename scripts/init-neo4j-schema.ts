#!/usr/bin/env tsx

/**
 * Initialize Neo4j Schema
 *
 * This script creates the constraints, indexes, and reference data
 * for the HumanGlue Knowledge Graph.
 *
 * Usage:
 *   npx tsx scripts/init-neo4j-schema.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { getDriver, closeDriver, verifyConnectivity } from '../lib/neo4j/client'

async function initSchema() {
  console.log('🔧 Initializing Neo4j Schema...\n')

  // Verify connectivity first
  console.log('1️⃣  Verifying Neo4j connectivity...')
  const connected = await verifyConnectivity()

  if (!connected) {
    console.error('❌ Failed to connect to Neo4j')
    console.error('   Make sure Neo4j is running: docker-compose -f docker-compose.neo4j.yml up -d')
    console.error('   Check connection at: http://localhost:7478')
    process.exit(1)
  }

  console.log('✅ Connected to Neo4j\n')

  // Read Cypher schema file
  console.log('2️⃣  Reading schema definition...')
  const schemaPath = join(__dirname, '..', 'lib', 'neo4j', 'schema.cypher')
  const schema = readFileSync(schemaPath, 'utf-8')

  // Split into individual statements (separated by semicolons)
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('//'))

  console.log(`✅ Found ${statements.length} statements\n`)

  // Execute each statement
  console.log('3️⃣  Executing schema statements...')
  const driver = getDriver()
  const session = driver.session()

  let successCount = 0
  let errorCount = 0

  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip comments
      if (statement.startsWith('//')) continue

      try {
        await session.run(statement)
        successCount++

        // Log progress for constraints and indexes
        if (statement.includes('CONSTRAINT')) {
          const match = statement.match(/CREATE CONSTRAINT (\w+)/)
          console.log(`  ✓ Created constraint: ${match?.[1] || 'unknown'}`)
        } else if (statement.includes('INDEX')) {
          const match = statement.match(/CREATE INDEX (\w+)/)
          console.log(`  ✓ Created index: ${match?.[1] || 'unknown'}`)
        } else if (statement.includes('MERGE') && statement.includes('MaturityLevel')) {
          const match = statement.match(/level: (\d+)/)
          console.log(`  ✓ Created maturity level: ${match?.[1]}`)
        } else if (statement.includes('MERGE') && statement.includes('Industry')) {
          const match = statement.match(/naics_code: '([^']+)'/)
          console.log(`  ✓ Created industry: ${match?.[1]}`)
        }
      } catch (error) {
        errorCount++
        console.error(`  ✗ Error in statement ${i + 1}:`, error instanceof Error ? error.message : error)
      }
    }

    console.log(`\n✅ Schema initialization complete!`)
    console.log(`   Successful: ${successCount}`)
    console.log(`   Errors: ${errorCount}\n`)

    // Verify schema
    console.log('4️⃣  Verifying schema...')

    const constraintsResult = await session.run('SHOW CONSTRAINTS')
    console.log(`   Constraints: ${constraintsResult.records.length}`)

    const indexesResult = await session.run('SHOW INDEXES')
    console.log(`   Indexes: ${indexesResult.records.length}`)

    const maturityResult = await session.run(
      'MATCH (ml:MaturityLevel) RETURN count(ml) as count'
    )
    const maturityCount = maturityResult.records[0].get('count')
    console.log(`   Maturity Levels: ${maturityCount}`)

    const industryResult = await session.run(
      'MATCH (i:Industry) RETURN count(i) as count'
    )
    const industryCount = industryResult.records[0].get('count')
    console.log(`   Industries: ${industryCount}`)

    console.log('\n🎉 Neo4j Knowledge Graph is ready!')
    console.log('\n📊 Access Neo4j Browser at: http://localhost:7478')
    console.log('   Username: neo4j')
    console.log('   Password: humanglue2024')

  } finally {
    await session.close()
    await closeDriver()
  }
}

initSchema().catch(error => {
  console.error('❌ Schema initialization failed:', error)
  process.exit(1)
})
