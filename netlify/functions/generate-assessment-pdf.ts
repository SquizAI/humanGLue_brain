import type { Handler, HandlerEvent } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface OrgBranding {
  company_name: string
  tagline?: string
  primary_color: string
  secondary_color: string
  logo_url: string
  website: string
  footer_text: string
}

/**
 * Fetch organization branding configuration
 * Falls back to HumanGlue defaults if not configured
 */
async function getOrgBranding(orgId: string): Promise<OrgBranding> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data } = await supabase
    .from('organizations')
    .select('settings, logo_url')
    .eq('id', orgId)
    .single()

  const branding = data?.settings?.branding || {}

  return {
    company_name: branding.company_name || 'HumanGlue',
    tagline: branding.tagline || 'Guiding Fortune 1000 companies of tomorrow, today',
    primary_color: branding.colors?.primary || '#3b82f6',
    secondary_color: branding.colors?.secondary || '#8b5cf6',
    logo_url: data?.logo_url || branding.logo?.url || '/HumnaGlue_logo_white_blue.png',
    website: branding.social?.website || 'https://humanglue.ai',
    footer_text: branding.email?.footer_text || `© ${new Date().getFullYear()} HumanGlue. All rights reserved.`
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const assessment = JSON.parse(event.body || '{}')

    if (!assessment.userData || !assessment.analysis) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid assessment data' })
      }
    }

    if (!assessment.organizationId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing organizationId' })
      }
    }

    // Fetch organization branding
    const branding = await getOrgBranding(assessment.organizationId)

    // Generate HTML for PDF with org branding
    const html = generatePDFHTML(assessment, branding)

    // Return HTML with org-specific filename
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${branding.company_name.replace(/[^a-z0-9]/gi, '_')}_Assessment_${assessment.userData.company.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.html"`
      },
      body: html
    }

  } catch (error) {
    console.error('PDF generation error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

function generatePDFHTML(assessment: any, branding: OrgBranding): string {
  const { userData, analysis } = assessment

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AI Transformation Assessment - ${userData.company}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid ${branding.primary_color};
      padding-bottom: 20px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.secondary_color} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .score-box {
      background: linear-gradient(135deg, ${branding.primary_color} 0%, ${branding.secondary_color} 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin: 30px 0;
    }
    .score-value {
      font-size: 72px;
      font-weight: bold;
      margin: 10px 0;
    }
    .section {
      margin: 30px 0;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      background: #f9fafb;
    }
    .metric-label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 20px;
      font-weight: bold;
      color: #111827;
    }
    .finding-item {
      margin: 10px 0;
      padding: 12px;
      background: #f9fafb;
      border-left: 4px solid ${branding.primary_color};
      border-radius: 4px;
    }
    .action-item {
      margin: 10px 0;
      padding: 12px;
      background: #f0f9ff;
      border-left: 4px solid ${branding.secondary_color};
      border-radius: 4px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    ul {
      list-style-type: none;
      padding-left: 0;
    }
    li {
      padding: 8px 0;
    }
    li:before {
      content: "✓ ";
      color: #10b981;
      font-weight: bold;
      margin-right: 8px;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${branding.company_name}</div>
    <h1>AI Transformation Assessment</h1>
    <p style="color: #6b7280; font-size: 16px;">${userData.name} | ${userData.company}</p>
    <p style="color: #9ca3af; font-size: 14px;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="score-box">
    <div style="font-size: 18px; opacity: 0.9;">Your AI Transformation Score</div>
    <div class="score-value">${analysis.scoring.fitScore}<span style="font-size: 36px;">/100</span></div>
  </div>

  <div class="section">
    <div class="section-title">Company Profile</div>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-label">Company</div>
        <div class="metric-value">${userData.company}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Industry</div>
        <div class="metric-value">${userData.industry || userData.enrichedIndustry || 'N/A'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Location</div>
        <div class="metric-value">${userData.companyLocation || userData.enrichedLocation || 'N/A'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Company Size</div>
        <div class="metric-value">${userData.companySize || userData.enrichedEmployeeCount || 'N/A'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Primary Challenge</div>
        <div class="metric-value">${userData.challenge}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Budget</div>
        <div class="metric-value">${userData.budget || 'Not specified'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Scoring Breakdown</div>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-label">Fit Score</div>
        <div class="metric-value">${analysis.scoring.fitScore}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Engagement Score</div>
        <div class="metric-value">${analysis.scoring.engagementScore}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Urgency Score</div>
        <div class="metric-value">${analysis.scoring.urgencyScore}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Budget Alignment</div>
        <div class="metric-value">${analysis.scoring.budgetScore}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Key Findings</div>
    ${analysis.insights.keyFindings.map((finding: string) => `
      <div class="finding-item">${finding}</div>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title">Recommended Next Steps</div>
    ${analysis.insights.nextBestActions.map((action: string, i: number) => `
      <div class="action-item"><strong>${i + 1}.</strong> ${action}</div>
    `).join('')}
  </div>

  <div class="section">
    <div class="section-title">Predicted Outcomes</div>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-label">Time to Value</div>
        <div class="metric-value">${analysis.predictions.timeToClose} days</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Estimated ROI</div>
        <div class="metric-value">$${analysis.predictions.dealSize.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Success Probability</div>
        <div class="metric-value">${(analysis.predictions.successProbability * 100).toFixed(0)}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Churn Risk</div>
        <div class="metric-value">${(analysis.predictions.churnRisk * 100).toFixed(0)}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Personalized Resources</div>
    <ul>
      ${analysis.insights.personalizedContent.map((content: string) => `
        <li>${content}</li>
      `).join('')}
    </ul>
  </div>

  <div class="section">
    <div class="section-title">Next Steps</div>
    <p>Based on your assessment results, we recommend scheduling a complimentary 30-minute strategy session with our transformation specialists.</p>
    <p>During this session, we'll:</p>
    <ul>
      <li>Deep-dive into your specific findings and opportunities</li>
      <li>Create a customized 90-day implementation roadmap</li>
      <li>Identify quick wins that can deliver immediate value</li>
      <li>Answer any questions about AI transformation</li>
    </ul>
    <p><strong>Ready to get started?</strong> Visit <a href="${branding.website}">${branding.website.replace('https://', '').replace('http://', '')}</a></p>
  </div>

  <div class="footer">
    <p><strong>${branding.company_name}</strong>${branding.tagline ? ' | ' + branding.tagline : ''}</p>
    <p>This assessment is confidential and intended for ${userData.name} at ${userData.company}</p>
    <p>${branding.footer_text}</p>
  </div>

  <script>
    // Auto-print on load (optional)
    // window.print();
  </script>
</body>
</html>
  `.trim()
}
