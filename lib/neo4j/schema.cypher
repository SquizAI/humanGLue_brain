// ============================================================================
// HumanGlue Knowledge Graph Schema
// ============================================================================
// This Cypher script defines the node types, relationships, and constraints
// for the HumanGlue AI Maturity Assessment platform.
//
// Run this script to initialize the Neo4j database schema.
// ============================================================================

// ============================================================================
// CONSTRAINTS (Unique IDs and Required Properties)
// ============================================================================

// Organizations
CREATE CONSTRAINT org_id_unique IF NOT EXISTS
FOR (o:Organization)
REQUIRE o.id IS UNIQUE;

CREATE CONSTRAINT org_name IF NOT EXISTS
FOR (o:Organization)
REQUIRE o.name IS NOT NULL;

// Users
CREATE CONSTRAINT user_id_unique IF NOT EXISTS
FOR (u:User)
REQUIRE u.id IS UNIQUE;

CREATE CONSTRAINT user_email_unique IF NOT EXISTS
FOR (u:User)
REQUIRE u.email IS UNIQUE;

// Assessments
CREATE CONSTRAINT assessment_id_unique IF NOT EXISTS
FOR (a:Assessment)
REQUIRE a.id IS UNIQUE;

// Digital Twins
CREATE CONSTRAINT twin_id_unique IF NOT EXISTS
FOR (dt:DigitalTwin)
REQUIRE dt.id IS UNIQUE;

// Maturity Levels
CREATE CONSTRAINT maturity_level_id_unique IF NOT EXISTS
FOR (ml:MaturityLevel)
REQUIRE ml.level IS UNIQUE;

// Technologies
CREATE CONSTRAINT tech_name_unique IF NOT EXISTS
FOR (t:Technology)
REQUIRE t.name IS UNIQUE;

// Skills
CREATE CONSTRAINT skill_name_unique IF NOT EXISTS
FOR (s:Skill)
REQUIRE s.name IS UNIQUE;

// Industries
CREATE CONSTRAINT industry_code_unique IF NOT EXISTS
FOR (i:Industry)
REQUIRE i.naics_code IS UNIQUE;

// Workshops
CREATE CONSTRAINT workshop_id_unique IF NOT EXISTS
FOR (w:Workshop)
REQUIRE w.id IS UNIQUE;

// Experts
CREATE CONSTRAINT expert_id_unique IF NOT EXISTS
FOR (e:Expert)
REQUIRE e.id IS UNIQUE;

// ============================================================================
// INDEXES (For Query Performance)
// ============================================================================

// Organization indexes
CREATE INDEX org_created_at IF NOT EXISTS
FOR (o:Organization)
ON (o.created_at);

// User indexes
CREATE INDEX user_created_at IF NOT EXISTS
FOR (u:User)
ON (u.created_at);

CREATE INDEX user_role IF NOT EXISTS
FOR (u:User)
ON (u.role);

// Assessment indexes
CREATE INDEX assessment_created_at IF NOT EXISTS
FOR (a:Assessment)
ON (a.created_at);

CREATE INDEX assessment_status IF NOT EXISTS
FOR (a:Assessment)
ON (a.status);

CREATE INDEX assessment_score IF NOT EXISTS
FOR (a:Assessment)
ON (a.overall_score);

// Digital Twin indexes
CREATE INDEX twin_maturity_level IF NOT EXISTS
FOR (dt:DigitalTwin)
ON (dt.maturity_level);

CREATE INDEX twin_updated_at IF NOT EXISTS
FOR (dt:DigitalTwin)
ON (dt.updated_at);

// Industry indexes
CREATE INDEX industry_sector IF NOT EXISTS
FOR (i:Industry)
ON (i.sector);

// Technology indexes
CREATE INDEX tech_category IF NOT EXISTS
FOR (t:Technology)
ON (t.category);

// Skill indexes
CREATE INDEX skill_category IF NOT EXISTS
FOR (s:Skill)
ON (s.category);

// ============================================================================
// MATURITY LEVELS (Pre-populate reference data)
// ============================================================================

MERGE (ml0:MaturityLevel {level: 0})
SET ml0.name = 'Not Started',
    ml0.description = 'No AI initiatives or awareness',
    ml0.characteristics = [
      'No AI strategy',
      'No dedicated resources',
      'Limited awareness of AI potential'
    ];

MERGE (ml1:MaturityLevel {level: 1})
SET ml1.name = 'Awareness',
    ml1.description = 'Initial exploration and awareness',
    ml1.characteristics = [
      'Executive awareness',
      'Initial exploration',
      'No formal strategy'
    ];

MERGE (ml2:MaturityLevel {level: 2})
SET ml2.name = 'Experimentation',
    ml2.description = 'Pilot projects and experiments',
    ml2.characteristics = [
      'Pilot projects initiated',
      'Cross-functional teams forming',
      'Data assessment begun'
    ];

MERGE (ml3:MaturityLevel {level: 3})
SET ml3.name = 'Foundation',
    ml3.description = 'Building core capabilities',
    ml3.characteristics = [
      'AI strategy defined',
      'Data infrastructure in place',
      'Initial models deployed'
    ];

MERGE (ml4:MaturityLevel {level: 4})
SET ml4.name = 'Operational',
    ml4.description = 'AI in production use',
    ml4.characteristics = [
      'Multiple AI use cases deployed',
      'Governance frameworks established',
      'ROI being measured'
    ];

MERGE (ml5:MaturityLevel {level: 5})
SET ml5.name = 'Systematic',
    ml5.description = 'Systematic AI deployment',
    ml5.characteristics = [
      'AI integrated into core processes',
      'Center of Excellence established',
      'Continuous improvement cycles'
    ];

MERGE (ml6:MaturityLevel {level: 6})
SET ml6.name = 'Optimized',
    ml6.description = 'Optimized and scaling',
    ml6.characteristics = [
      'AI drives key business outcomes',
      'Advanced automation',
      'Scaling across organization'
    ];

MERGE (ml7:MaturityLevel {level: 7})
SET ml7.name = 'Transformative',
    ml7.description = 'AI-first transformation',
    ml7.characteristics = [
      'AI central to strategy',
      'New business models enabled',
      'Industry leadership'
    ];

MERGE (ml8:MaturityLevel {level: 8})
SET ml8.name = 'Leading',
    ml8.description = 'Industry-leading innovation',
    ml8.characteristics = [
      'Proprietary AI capabilities',
      'Competitive moats created',
      'Ecosystem influence'
    ];

MERGE (ml9:MaturityLevel {level: 9})
SET ml9.name = 'Pioneering',
    ml9.description = 'Defining the future',
    ml9.characteristics = [
      'Setting industry standards',
      'Research & innovation leader',
      'Global influence'
    ];

// ============================================================================
// SAMPLE INDUSTRIES (NAICS Codes)
// ============================================================================

MERGE (i:Industry {naics_code: '51'})
SET i.sector = 'Information',
    i.name = 'Information & Technology',
    i.ai_relevance = 'Very High';

MERGE (i:Industry {naics_code: '52'})
SET i.sector = 'Finance',
    i.name = 'Finance & Insurance',
    i.ai_relevance = 'Very High';

MERGE (i:Industry {naics_code: '54'})
SET i.sector = 'Professional Services',
    i.name = 'Professional, Scientific, and Technical Services',
    i.ai_relevance = 'High';

MERGE (i:Industry {naics_code: '62'})
SET i.sector = 'Healthcare',
    i.name = 'Healthcare & Social Assistance',
    i.ai_relevance = 'Very High';

MERGE (i:Industry {naics_code: '31-33'})
SET i.sector = 'Manufacturing',
    i.name = 'Manufacturing',
    i.ai_relevance = 'High';

MERGE (i:Industry {naics_code: '44-45'})
SET i.sector = 'Retail',
    i.name = 'Retail Trade',
    i.ai_relevance = 'High';

// ============================================================================
// VERIFICATION QUERIES
// ============================================================================

// To verify schema was created successfully, run:
// CALL db.constraints();
// CALL db.indexes();
// MATCH (ml:MaturityLevel) RETURN ml ORDER BY ml.level;
// MATCH (i:Industry) RETURN i.naics_code, i.name, i.ai_relevance;
