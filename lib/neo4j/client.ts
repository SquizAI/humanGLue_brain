/**
 * Neo4j Knowledge Graph Client
 *
 * Manages connections to the Neo4j database for the HumanGlue platform.
 * Used for modeling complex relationships between organizations, assessments,
 * maturity levels, recommendations, and behavioral patterns.
 */

import neo4j, { Driver, Session, Result } from 'neo4j-driver'

let driver: Driver | null = null

/**
 * Get or create Neo4j driver instance (singleton)
 */
export function getDriver(): Driver {
  if (driver) {
    return driver
  }

  const uri = process.env.NEO4J_URI || 'bolt://localhost:7690'
  const username = process.env.NEO4J_USERNAME || 'neo4j'
  const password = process.env.NEO4J_PASSWORD || 'humanglue2024'

  const maxPoolSize = parseInt(process.env.NEO4J_MAX_CONNECTION_POOL_SIZE || '50', 10)
  const connectionTimeout = parseInt(process.env.NEO4J_CONNECTION_TIMEOUT || '30000', 10)
  const maxRetryTime = parseInt(process.env.NEO4J_MAX_TRANSACTION_RETRY_TIME || '15000', 10)

  driver = neo4j.driver(
    uri,
    neo4j.auth.basic(username, password),
    {
      maxConnectionPoolSize: maxPoolSize,
      connectionTimeout,
      maxTransactionRetryTime: maxRetryTime,
      disableLosslessIntegers: true, // Return JS numbers instead of neo4j.int
    }
  )

  console.log('[Neo4j] Driver created:', {
    uri,
    maxPoolSize,
    connectionTimeout,
    maxRetryTime,
  })

  return driver
}

/**
 * Create a new session for executing queries
 */
export function getSession(database?: string): Session {
  const db = database || process.env.NEO4J_DATABASE || 'neo4j'
  return getDriver().session({ database: db })
}

/**
 * Execute a read query
 */
export async function executeRead<T = any>(
  query: string,
  params: Record<string, any> = {},
  database?: string
): Promise<T[]> {
  const session = getSession(database)

  try {
    const result = await session.executeRead(tx =>
      tx.run(query, params)
    )

    return result.records.map(record => record.toObject() as T)
  } finally {
    await session.close()
  }
}

/**
 * Execute a write query
 */
export async function executeWrite<T = any>(
  query: string,
  params: Record<string, any> = {},
  database?: string
): Promise<T[]> {
  const session = getSession(database)

  try {
    const result = await session.executeWrite(tx =>
      tx.run(query, params)
    )

    return result.records.map(record => record.toObject() as T)
  } finally {
    await session.close()
  }
}

/**
 * Verify database connectivity
 */
export async function verifyConnectivity(): Promise<boolean> {
  try {
    const driver = getDriver()
    await driver.verifyConnectivity()
    console.log('[Neo4j] Connectivity verified')
    return true
  } catch (error) {
    console.error('[Neo4j] Connectivity check failed:', error)
    return false
  }
}

/**
 * Close the driver connection (for graceful shutdown)
 */
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close()
    driver = null
    console.log('[Neo4j] Driver closed')
  }
}

/**
 * Health check - verifies connection and returns server info
 */
export async function healthCheck(): Promise<{
  connected: boolean
  serverInfo?: any
  error?: string
}> {
  try {
    const driver = getDriver()
    const serverInfo = await driver.getServerInfo()

    return {
      connected: true,
      serverInfo: {
        address: serverInfo.address,
        agent: serverInfo.agent,
        protocolVersion: serverInfo.protocolVersion,
      }
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
