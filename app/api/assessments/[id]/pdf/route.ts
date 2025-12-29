/**
 * PDF Generation API
 * POST /api/assessments/[id]/pdf - Generate PDF report for assessment
 *
 * WHITE-LABEL READY: Uses centralized BRAND config for all colors
 */

import { NextRequest, NextResponse } from 'next/server'
import { BRAND } from '@/lib/email-templates'

/**
 * POST /api/assessments/[id]/pdf
 * Generate print-ready HTML that can be saved as PDF
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.userData || !body.analysis) {
      return NextResponse.json(
        { error: 'Invalid assessment data - missing userData or analysis' },
        { status: 400 }
      )
    }

    // Generate HTML for PDF
    const html = generatePDFHTML(body)

    // Return HTML as blob for download
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="HumanGlue_Assessment_${body.userData.company}_${id}.html"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

function generatePDFHTML(assessment: any): string {
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
      font-family: ${BRAND.fonts.primary};
      line-height: 1.6;
      color: ${BRAND.colors.text};
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid ${BRAND.colors.primary};
      padding-bottom: 20px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, ${BRAND.colors.primary} 0%, ${BRAND.colors.accent} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .score-box {
      background: linear-gradient(135deg, ${BRAND.colors.primary} 0%, ${BRAND.colors.accent} 100%);
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
      color: ${BRAND.colors.text};
      margin-bottom: 15px;
      border-bottom: 2px solid ${BRAND.colors.border};
      padding-bottom: 10px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      border: 1px solid ${BRAND.colors.border};
      border-radius: 8px;
      padding: 15px;
      background: ${BRAND.colors.cardBg};
    }
    .metric-label {
      font-size: 14px;
      color: ${BRAND.colors.mutedText};
      margin-bottom: 5px;
    }
    .metric-value {
      font-size: 20px;
      font-weight: bold;
      color: ${BRAND.colors.text};
    }
    .finding-item {
      margin: 10px 0;
      padding: 12px;
      background: ${BRAND.colors.cardBg};
      border-left: 4px solid ${BRAND.colors.primary};
      border-radius: 4px;
    }
    .action-item {
      margin: 10px 0;
      padding: 12px;
      background: ${BRAND.colors.lightBg};
      border-left: 4px solid ${BRAND.colors.accent};
      border-radius: 4px;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid ${BRAND.colors.border};
      text-align: center;
      color: ${BRAND.colors.mutedText};
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
      color: ${BRAND.colors.success};
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
    <div class="logo">${BRAND.company.name}</div>
    <h1>AI Transformation Assessment</h1>
    <p style="color: ${BRAND.colors.mutedText}; font-size: 16px;">\${userData.name} | \${userData.company}</p>
    <p style="color: ${BRAND.colors.secondaryText}; font-size: 14px;">Generated on \${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
    <p><strong>Ready to get started?</strong> Visit <a href="https://humanglue.ai">humanglue.ai</a> or email us at contact@humanglue.ai</p>
  </div>

  <div class="footer">
    <p><strong>HumanGlue</strong> | Guiding Fortune 1000 companies of tomorrow, today</p>
    <p>This assessment is confidential and intended for ${userData.name} at ${userData.company}</p>
    <p>© ${new Date().getFullYear()} HumanGlue. All rights reserved.</p>
  </div>

  <script>
    // Auto-print on load (optional)
    // window.print();
  </script>
</body>
</html>
  `.trim()
}
