# HumanGlue Education AI Assessment Workflow

## Workflow Configuration

### Workflow Details
- **Workflow ID**: `f00002b7-6b12-4523-8666-4fad930eb699`
- **Name**: HumanGlue Education AI Assessment
- **Assistant ID**: `0fda58ce-6ad6-464d-995b-4bf57bdda974`
- **Phone Number**: +1 (448) 228-6664
- **Phone Number ID**: `d4269d03-3914-404a-a798-aa58570abfb1`

### Voice Configuration
- **Provider**: 11labs
- **Voice**: bIHbv24MWmeRgasZH58o (same as GlueIQ assessments)
- **Description**: Consistent professional voice across all HumanGlue assessments

### Making Calls

#### Using the Workflow:
```bash
node scripts/callEducationWorkflow.js +13057753881
```

#### Using the Assistant Directly:
```bash
node scripts/educationAssessmentCall.js +13057753881
```

### Workflow Structure

The workflow consists of 6 sequential phases:

1. **Introduction & Stakeholder Identification**
   - Tool: `identify_education_stakeholder`
   - Captures: name, role, institution type, size, decision authority
   - Duration: 1-2 minutes

2. **Infrastructure Assessment**
   - Tool: `assess_education_infrastructure`
   - Evaluates: device access, connectivity, LMS, integration, analytics
   - Duration: 3-4 minutes

3. **Teaching & Learning Innovation**
   - Tool: `assess_teaching_learning_innovation`
   - Assesses: pedagogical practices, AI adoption, personalization
   - Duration: 4-5 minutes

4. **Stakeholder Readiness**
   - Tool: `assess_education_stakeholder_readiness`
   - Measures: teacher attitudes, PD, leadership vision, change readiness
   - Duration: 3-4 minutes

5. **Outcomes & Equity**
   - Tool: `assess_education_outcomes_equity`
   - Analyzes: learning outcomes, achievement gaps, digital divide
   - Duration: 3-4 minutes

6. **Maturity Scoring**
   - Tool: `calculate_education_maturity_score`
   - Delivers: final score (0-10), opportunities, recommendations
   - Duration: 2-3 minutes

### Total Duration: 20-25 minutes

## Key Features

### AI-Powered Educational Expertise
- Transparent about being AI-powered
- Trained on extensive educational research
- Empathetic and encouraging tone
- Addresses resistance and concerns
- Builds trust through expertise and understanding

### Education-Specific Focus
- Pedagogical terminology
- Student outcome emphasis
- Equity and accessibility priority
- Teacher empowerment (not replacement)

### Comprehensive Assessment
- 6 domains of evaluation
- Structured yet conversational
- Data-driven insights
- Actionable recommendations

## API Configuration

### Required Environment Variables
```bash
VAPI_API_KEY=your-api-key-here
```

### Call Payload Example
```json
{
  "workflowId": "f00002b7-6b12-4523-8666-4fad930eb699",
  "customer": {
    "number": "+13057753881"
  },
  "phoneNumberId": "d4269d03-3914-404a-a798-aa58570abfb1"
}
```

## Testing Instructions

1. Ensure you have the API key configured
2. Run the workflow call script with a valid phone number
3. The assessment will follow the 6-phase structure automatically
4. Results are collected through the integrated tools
5. Final report delivered with maturity score and recommendations

## Support

For questions or issues:
- Email: education@humanglue.ai
- Technical support: support@humanglue.ai
- Documentation: /education folder