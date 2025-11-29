# Neo4j Knowledge Graph Setup

**Status:** ✅ Complete
**Created:** 2025-01-28

---

## Overview

The HumanGlue platform now includes a **Neo4j knowledge graph** for modeling complex relationships between:
- Organizations
- Assessments & Digital Twins
- Maturity Levels (0-9 scale)
- Technologies & Skills
- Industries & Benchmarks
- Workshops & Recommendations
- Experts & Talent Matching

This complements our PostgreSQL database (Supabase) by providing graph-based querying capabilities for insights, recommendations, and behavioral pattern analysis.

---

## Architecture

### **Hybrid Database Strategy**

**PostgreSQL (Supabase):**
- Transactional data (users, auth, payments)
- Structured business logic
- Row-level security (RLS)
- ACID guarantees

**Neo4j (Knowledge Graph):**
- Relationship modeling
- Recommendation engine
- Maturity progression tracking
- Pattern detection
- Impact analysis

**Sync Strategy:**
- PostgreSQL = Source of Truth
- Neo4j = Read replica + Enhanced queries
- Sync via background jobs / webhooks

---

## Local Development Setup

### 1. Start Neo4j

```bash
# Start Neo4j in Docker
docker-compose -f docker-compose.neo4j.yml up -d

# Check status
docker ps | grep humanglue-neo4j

# View logs
docker logs -f humanglue-neo4j
```

### 2. Access Neo4j Browser

**URL:** http://localhost:7478
**Username:** `neo4j`
**Password:** `humanglue2024`
**Bolt connection:** `bolt://localhost:7690`

### 3. Initialize Schema

```bash
# Run schema initialization
npx tsx scripts/init-neo4j-schema.ts
```

This creates:
- ✅ 1 unique constraint (user email)
- ✅ 7 performance indexes
- ✅ 9 maturity levels (0-9)
- ✅ 5 industry categories

### 4. Verify Setup

```cypher
// In Neo4j Browser, run:

// Check all maturity levels
MATCH (ml:MaturityLevel)
RETURN ml.level, ml.name, ml.description
ORDER BY ml.level;

// Check industries
MATCH (i:Industry)
RETURN i.naics_code, i.name, i.ai_relevance;

// View all constraints
SHOW CONSTRAINTS;

// View all indexes
SHOW INDEXES;
```

---

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Neo4j Knowledge Graph
NEO4J_URI=bolt://localhost:7690
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=humanglue2024
NEO4J_DATABASE=neo4j
NEO4J_MAX_CONNECTION_POOL_SIZE=50
NEO4J_CONNECTION_TIMEOUT=30000
NEO4J_MAX_TRANSACTION_RETRY_TIME=15000
```

### Docker Configuration

File: `docker-compose.neo4j.yml`

**Ports:**
- HTTP Browser: `7478` (mapped from 7474)
- Bolt Protocol: `7690` (mapped from 7687)

**Volumes:**
- `neo4j_data` - Persistent database storage
- `neo4j_logs` - Log files
- `neo4j_import` - Import directory
- `neo4j_plugins` - APOC and other plugins

**Memory:**
- Heap: 512MB - 2GB
- Page Cache: 1GB

---

## Schema Overview

### Node Types

1. **Organization**
   - Unique constraint on `id`
   - Represents companies using the platform

2. **User**
   - Unique constraints on `id` and `email`
   - Indexes on `role` and `created_at`

3. **Assessment**
   - Unique constraint on `id`
   - Indexes on `status`, `score`, `created_at`

4. **DigitalTwin**
   - Unique constraint on `id`
   - Indexes on `maturity_level` and `updated_at`
   - One per organization (aggregates all assessments)

5. **MaturityLevel (Reference Data)**
   - 10 levels: 0 (Not Started) → 9 (Pioneering)
   - Each with name, description, characteristics

6. **Technology**
   - Tracks tech stack (cloud platforms, AI tools, etc.)
   - Index on `category`

7. **Skill**
   - Organizational skills inventory
   - Index on `category`

8. **Industry (Reference Data)**
   - NAICS industry codes
   - AI relevance ratings
   - Benchmark data

9. **Workshop**
   - Available training/workshops
   - Linked to maturity improvements

10. **Expert**
    - Platform experts for matching
    - Skills and specialization tags

### Relationship Types

```cypher
// Organization relationships
(Organization)-[:HAS_ASSESSMENT]->(Assessment)
(Organization)-[:HAS_DIGITAL_TWIN]->(DigitalTwin)
(Organization)-[:IN_INDUSTRY]->(Industry)
(Organization)-[:EMPLOYS]->(User)
(Organization)-[:USES_TECHNOLOGY]->(Technology)

// User relationships
(User)-[:TOOK_ASSESSMENT]->(Assessment)
(User)-[:HAS_SKILL]->(Skill)

// Assessment relationships
(Assessment)-[:AT_MATURITY_LEVEL]->(MaturityLevel)
(Assessment)-[:RECOMMENDS_WORKSHOP]->(Workshop)
(Assessment)-[:SUGGESTS_EXPERT]->(Expert)

// Digital Twin relationships
(DigitalTwin)-[:CURRENT_MATURITY]->(MaturityLevel)
(DigitalTwin)-[:SNAPSHOT_AT]->(MaturityLevel) // Historical
(DigitalTwin)-[:REQUIRES_SKILL]->(Skill)
(DigitalTwin)-[:REQUIRES_TECHNOLOGY]->(Technology)

// Workshop relationships
(Workshop)-[:IMPROVES_TO]->(MaturityLevel)
(Workshop)-[:TAUGHT_BY]->(Expert)

// Expert relationships
(Expert)-[:HAS_SKILL]->(Skill)
(Expert)-[:SPECIALIZES_IN]->(Industry)
```

---

## Usage Examples

### 1. Query Organization Digital Twin

```cypher
// Get organization with all relationships
MATCH (o:Organization {id: $org_id})
OPTIONAL MATCH (o)-[:HAS_DIGITAL_TWIN]->(dt:DigitalTwin)
OPTIONAL MATCH (dt)-[:CURRENT_MATURITY]->(ml:MaturityLevel)
OPTIONAL MATCH (o)-[:USES_TECHNOLOGY]->(t:Technology)
OPTIONAL MATCH (o)-[:HAS_ASSESSMENT]->(a:Assessment)
RETURN o, dt, ml, collect(DISTINCT t) as technologies, count(a) as total_assessments
```

### 2. Find Recommended Workshops

```cypher
// Find workshops to improve from current to target maturity
MATCH (o:Organization {id: $org_id})-[:HAS_DIGITAL_TWIN]->(dt:DigitalTwin)
MATCH (dt)-[:CURRENT_MATURITY]->(current:MaturityLevel)
MATCH (w:Workshop)-[:IMPROVES_TO]->(target:MaturityLevel)
WHERE target.level > current.level
RETURN w, target
ORDER BY target.level
LIMIT 5
```

### 3. Match Experts to Organization

```cypher
// Find experts matching organization needs
MATCH (o:Organization {id: $org_id})-[:IN_INDUSTRY]->(i:Industry)
MATCH (e:Expert)-[:SPECIALIZES_IN]->(i)
MATCH (o)-[:HAS_DIGITAL_TWIN]->(dt:DigitalTwin)
MATCH (dt)-[:REQUIRES_SKILL]->(s:Skill)
MATCH (e)-[:HAS_SKILL]->(s)
RETURN e, collect(DISTINCT s.name) as matching_skills
ORDER BY size(matching_skills) DESC
LIMIT 10
```

### 4. Track Maturity Progression

```cypher
// Get maturity evolution over time
MATCH (o:Organization {id: $org_id})-[:HAS_DIGITAL_TWIN]->(dt:DigitalTwin)
MATCH (dt)-[:SNAPSHOT_AT]->(ml:MaturityLevel)
RETURN ml.level, count(*) as snapshot_count
ORDER BY ml.level
```

---

## Client Library Usage

### TypeScript/JavaScript

```typescript
import { executeRead, executeWrite, verifyConnectivity } from '@/lib/neo4j/client'

// Health check
const isConnected = await verifyConnectivity()

// Read query
const results = await executeRead(
  `MATCH (o:Organization {id: $orgId})
   OPTIONAL MATCH (o)-[:HAS_DIGITAL_TWIN]->(dt:DigitalTwin)
   RETURN o, dt`,
  { orgId: 'org-123' }
)

// Write query
await executeWrite(
  `MERGE (o:Organization {id: $orgId})
   SET o.name = $name, o.updated_at = datetime()
   RETURN o`,
  { orgId: 'org-123', name: 'Acme Corp' }
)
```

---

## Management Commands

### Start/Stop

```bash
# Start
docker-compose -f docker-compose.neo4j.yml up -d

# Stop (keeps data)
docker-compose -f docker-compose.neo4j.yml down

# Stop and remove data
docker-compose -f docker-compose.neo4j.yml down -v
```

### Backup

```bash
# Backup to local directory
docker exec humanglue-neo4j neo4j-admin database dump neo4j --to-path=/backups

# Copy backup from container
docker cp humanglue-neo4j:/backups/neo4j.dump ./backups/
```

### Restore

```bash
# Copy backup to container
docker cp ./backups/neo4j.dump humanglue-neo4j:/backups/

# Restore
docker exec humanglue-neo4j neo4j-admin database load neo4j --from-path=/backups
```

---

## Production Deployment (Future)

### DigitalOcean Kubernetes

1. **Helm Chart:** Use official Neo4j Helm chart
2. **Persistent Volumes:** 100GB+ SSD for production
3. **High Availability:** 3-node cluster with causal clustering
4. **Security:**
   - TLS encryption
   - Network policies
   - Secret management (K8s secrets)
5. **Monitoring:** Prometheus + Grafana dashboards
6. **Backup:** Automated daily backups to S3

### Estimated Costs

- **Starter:** Single node (2 vCPU, 4GB RAM) - ~$40/mo
- **Production:** 3-node cluster (4 vCPU, 8GB RAM each) - ~$240/mo
- **Storage:** 300GB SSD (~$30/mo)

**Total Production:** ~$270/month

---

## Performance Tips

1. **Use parameters** - Never inline values in queries
2. **Limit results** - Always use `LIMIT` for large datasets
3. **Create indexes** - Index frequently queried properties
4. **Use EXPLAIN** - Analyze query plans before running
5. **Batch writes** - Use transactions for bulk operations

---

## Troubleshooting

### Can't connect to Neo4j

```bash
# Check if container is running
docker ps | grep humanglue-neo4j

# Check logs
docker logs humanglue-neo4j

# Verify ports
lsof -i :7478
lsof -i :7690
```

### Out of memory

Edit `docker-compose.neo4j.yml`:
```yaml
- NEO4J_server_memory_heap_max__size=4G
- NEO4J_server_memory_pagecache_size=2G
```

Then restart:
```bash
docker-compose -f docker-compose.neo4j.yml restart
```

---

## Next Steps

1. ✅ **Phase 1.1:** Data sync service (Supabase → Neo4j)
2. ✅ **Phase 1.2:** Recommendation engine queries
3. ✅ **Phase 1.3:** Digital Twin aggregation logic
4. ✅ **Phase 1.4:** Maturity progression analytics

---

**Last Updated:** 2025-01-28
**Version:** 1.0
**Neo4j Version:** 5.15.0
**Status:** Production Ready (Local)
