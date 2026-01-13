import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { resourceType, assessmentData, resourceIndex } = await request.json()

    if (!assessmentData) {
      return NextResponse.json(
        { error: 'Assessment data is required' },
        { status: 400 }
      )
    }

    // Generate hyper-tailored resource using Claude
    const resourceContent = await generateTailoredResource(
      resourceType,
      assessmentData,
      resourceIndex
    )

    // Create HTML document with the generated content
    const htmlContent = createResourceDocument(resourceType, resourceContent, assessmentData)

    // Return as downloadable HTML file
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${resourceType.replace(/[^a-z0-9]/gi, '_')}.html"`,
      },
    })
  } catch (error) {
    console.error('Resource generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate resource' },
      { status: 500 }
    )
  }
}

async function generateTailoredResource(
  resourceType: string,
  assessmentData: any,
  index: number
): Promise<string> {
  const userData = assessmentData.userData
  const analysis = assessmentData.analysis

  // Create a detailed prompt for Claude to generate hyper-tailored content
  const prompt = `You are an expert AI transformation consultant at HMN. Generate a comprehensive, actionable resource document titled "${resourceType}" for the following organization:

Company: ${userData.company}
Industry: ${userData.industry || 'Technology'}
Size: ${userData.companySize}
Location: ${userData.companyLocation || 'Not specified'}
Revenue: ${userData.companyRevenue || 'Not specified'}
Role: ${userData.role}
Name: ${userData.name}

Primary Challenge: ${userData.challenge}
Additional Challenges: ${userData.additionalChallenges?.join(', ') || 'None specified'}
Budget: ${userData.budget}

AI Readiness Score: ${analysis?.scoring?.fitScore || 'N/A'}
Maturity Level: ${analysis?.profile?.aiMaturityLevel || 'Beginner'}

Key Insights:
${analysis?.insights?.keyFindings?.join('\n') || 'None'}

Recommendations:
${analysis?.insights?.recommendations?.join('\n') || 'None'}

Please generate a ${resourceType} that includes:

1. Executive Summary (tailored to ${userData.role} at ${userData.company})
2. Current State Analysis (based on their specific challenges and industry)
3. Transformation Roadmap (phased approach specific to their size and budget)
4. ROI Calculator & Business Case
   - Cost breakdown for ${userData.companySize} organization
   - Expected returns over 12, 24, and 36 months
   - Industry-specific benchmarks
5. Implementation Timeline
   - Quarterly milestones
   - Resource requirements
   - Risk mitigation strategies
6. Success Metrics & KPIs
7. Industry-Specific Use Cases (relevant to ${userData.industry})
8. Next Steps & Action Items

Use HMN's methodologies:
- AI Maturity Framework (Levels 0-10)
- Human-Centered Transformation
- Change Management Integration
- Cultural Readiness Assessment
- Phased Implementation Approach

Make this HYPER-SPECIFIC to their situation. Reference their company name, industry, specific challenges, and goals throughout. Include actual numbers, timelines, and actionable recommendations.

Format the output in clean, professional HTML with proper headings, sections, and styling. Make it print-ready and professional.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  return content.type === 'text' ? content.text : ''
}

function createResourceDocument(
  title: string,
  content: string,
  assessmentData: any
): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${assessmentData.userData.company}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      border-bottom: 4px solid #8b5cf6;
      padding-bottom: 30px;
      margin-bottom: 40px;
    }

    .logo {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 36px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12px;
    }

    .meta {
      font-size: 14px;
      color: #6b7280;
    }

    h2 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      margin-top: 40px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    h3 {
      font-size: 22px;
      font-weight: 600;
      color: #374151;
      margin-top: 30px;
      margin-bottom: 15px;
    }

    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #4b5563;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    p {
      margin-bottom: 16px;
      color: #374151;
    }

    ul, ol {
      margin: 16px 0 16px 24px;
      color: #374151;
    }

    li {
      margin-bottom: 8px;
    }

    strong {
      color: #1a1a1a;
      font-weight: 600;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    th {
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .highlight-box {
      background: linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%);
      border-left: 4px solid #8b5cf6;
      padding: 20px;
      margin: 24px 0;
      border-radius: 4px;
    }

    .metric-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 16px 0;
    }

    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #8b5cf6;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }

    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">HMN</div>
    <h1>${title}</h1>
    <div class="meta">
      Prepared for: <strong>${assessmentData.userData.company}</strong> |
      Contact: <strong>${assessmentData.userData.name}</strong> (${assessmentData.userData.role}) |
      Date: <strong>${today}</strong>
    </div>
  </header>

  <main>
    ${content}
  </main>

  <footer>
    <p><strong>HMN - AI-Powered Organizational Transformation</strong></p>
    <p>This document was generated using AI-powered analysis tailored to your organization's specific needs.</p>
    <p>For questions or to schedule a strategy session, contact us at hello@humanglue.ai</p>
    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
      © ${new Date().getFullYear()} HMN. All rights reserved. | Generated: ${today}
    </p>
  </footer>
</body>
</html>`
}
