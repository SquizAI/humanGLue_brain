// PDF Export Function for GlueIQ Assessment
// This module contains the handleExportPDF function that generates a 3-page executive summary

interface GlueIQData {
  assessmentDate: string
  overallScore: number
  maturityLevel: number
  maturityName: string
  interviewCount: number
  totalInterviewMinutes: number
  confidenceLevel: number
}

export function generatePDFContent(glueiqData: GlueIQData): string {
  const topRecommendations = [
    {
      title: 'Launch AI Training Program',
      description: 'Implement mandatory AI fundamentals training for all staff, starting with the Strategy and Creative teams who show highest readiness.',
      impact: 'Expected 40% increase in AI adoption within 90 days',
      owner: 'HR Lead / Training Manager'
    },
    {
      title: 'Create AI Vision Document',
      description: 'Document formal AI strategy aligned with business objectives. Move from "playing with AI" to structured implementation.',
      impact: 'Provides clear direction and investment criteria for all AI initiatives',
      owner: 'CEO / Executive Team'
    },
    {
      title: 'Establish AI Champion Network',
      description: 'Identify and empower 2-3 AI champions across Strategy, Creative, and Technology departments to lead adoption efforts.',
      impact: 'Creates internal expertise and peer support for AI adoption',
      owner: 'Department Leads'
    },
    {
      title: 'Consolidate Tool Stack',
      description: 'Audit current 15+ tools and consolidate to core stack. Maximize utilization of existing ChatGPT Enterprise and Copilot licenses.',
      impact: 'Reduce tool sprawl costs by 25-30% while improving adoption',
      owner: 'Technology Lead'
    },
    {
      title: 'Implement Change Management Process',
      description: 'Create structured rollout process for new AI tools including training, communication plan, and success metrics.',
      impact: 'Transition from luck-based to process-based tool adoption',
      owner: 'Operations Lead'
    }
  ]

  const recommendationsHtml = topRecommendations.map((rec, i) =>
    `<div class="recommendation">
      <div class="recommendation-header">
        <div class="recommendation-number">${i + 1}</div>
        <div class="recommendation-title">${rec.title}</div>
      </div>
      <div class="recommendation-desc">${rec.description}</div>
      <div class="recommendation-meta">
        <div class="recommendation-meta-item">
          <span class="recommendation-meta-label">Impact:</span>
          <span class="recommendation-meta-value">${rec.impact}</span>
        </div>
        <div class="recommendation-meta-item">
          <span class="recommendation-meta-label">Owner:</span>
          <span class="recommendation-meta-value">${rec.owner}</span>
        </div>
      </div>
    </div>`
  ).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GlueIQ AI Maturity Assessment - Executive Summary</title>
  <style>
    @page { size: letter; margin: 0.75in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #1a1a1a; line-height: 1.5; background: white; }
    .page { page-break-after: always; min-height: 100vh; padding: 0; }
    .page:last-child { page-break-after: auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #0891b2; }
    .logo-placeholder { width: 180px; height: 50px; background: linear-gradient(135deg, #0891b2, #0ea5e9); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.25rem; }
    .report-meta { text-align: right; color: #666; font-size: 0.875rem; }
    .report-title { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
    .score-section { display: flex; gap: 2rem; margin-bottom: 2rem; }
    .score-card { flex: 1; padding: 1.5rem; border-radius: 12px; text-align: center; }
    .score-card.primary { background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px solid #fecaca; }
    .score-card.secondary { background: linear-gradient(135deg, #f8fafc, #f1f5f9); border: 2px solid #e2e8f0; }
    .score-value { font-size: 3rem; font-weight: 800; color: #dc2626; line-height: 1; }
    .score-value span { font-size: 1.5rem; color: #9ca3af; }
    .score-label { font-size: 0.875rem; color: #64748b; margin-top: 0.5rem; font-weight: 500; }
    .level-badge { display: inline-block; padding: 0.5rem 1rem; background: #dc2626; color: white; border-radius: 20px; font-weight: 600; font-size: 1rem; margin-top: 0.5rem; }
    .key-finding { background: linear-gradient(135deg, #f0fdfa, #ccfbf1); border: 2px solid #99f6e4; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; }
    .key-finding-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #0d9488; font-weight: 600; margin-bottom: 0.5rem; }
    .key-finding-text { font-size: 1.125rem; color: #0f172a; font-weight: 500; }
    .highlights { margin-bottom: 2rem; }
    .highlights h3 { font-size: 1rem; color: #374151; margin-bottom: 1rem; font-weight: 600; }
    .highlight-item { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px; }
    .highlight-bullet { width: 24px; height: 24px; background: #0891b2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
    .highlight-text { font-size: 0.9375rem; color: #374151; }
    .footer { margin-top: auto; padding-top: 1rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 0.75rem; color: #9ca3af; }
    .page-2 h2, .page-3 h2 { font-size: 1.5rem; color: #0f172a; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 2px solid #0891b2; }
    .recommendation { margin-bottom: 1.5rem; padding: 1.25rem; background: #f8fafc; border-radius: 12px; border-left: 4px solid #0891b2; }
    .recommendation-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .recommendation-number { width: 28px; height: 28px; background: linear-gradient(135deg, #0891b2, #0ea5e9); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; }
    .recommendation-title { font-size: 1.0625rem; font-weight: 600; color: #0f172a; }
    .recommendation-desc { font-size: 0.9375rem; color: #475569; margin-bottom: 0.75rem; padding-left: 2.5rem; }
    .recommendation-meta { display: flex; gap: 2rem; padding-left: 2.5rem; font-size: 0.8125rem; flex-wrap: wrap; }
    .recommendation-meta-item { display: flex; align-items: center; gap: 0.375rem; }
    .recommendation-meta-label { color: #9ca3af; font-weight: 500; }
    .recommendation-meta-value { color: #0891b2; font-weight: 600; }
    .financial-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .financial-card { padding: 1.5rem; border-radius: 12px; text-align: center; }
    .financial-card.cost { background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px solid #fecaca; }
    .financial-card.investment { background: linear-gradient(135deg, #fefce8, #fef3c7); border: 2px solid #fde68a; }
    .financial-card.roi { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #bbf7d0; }
    .financial-card.payback { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #bfdbfe; }
    .financial-value { font-size: 2.25rem; font-weight: 800; line-height: 1; margin-bottom: 0.25rem; }
    .financial-card.cost .financial-value { color: #dc2626; }
    .financial-card.investment .financial-value { color: #ca8a04; }
    .financial-card.roi .financial-value { color: #16a34a; }
    .financial-card.payback .financial-value { color: #2563eb; }
    .financial-label { font-size: 0.875rem; color: #64748b; font-weight: 500; }
    .financial-sublabel { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
    .chart-section { margin-top: 2rem; }
    .chart-section h3 { font-size: 1.125rem; color: #374151; margin-bottom: 1rem; font-weight: 600; }
    .bar-chart { display: flex; flex-direction: column; gap: 1rem; }
    .bar-item { display: flex; align-items: center; gap: 1rem; }
    .bar-label { width: 140px; font-size: 0.875rem; color: #374151; font-weight: 500; }
    .bar-container { flex: 1; height: 36px; background: #f1f5f9; border-radius: 8px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 8px; display: flex; align-items: center; justify-content: flex-end; padding-right: 0.75rem; font-size: 0.8125rem; font-weight: 600; color: white; }
    .bar-fill.current { background: linear-gradient(135deg, #dc2626, #ef4444); width: 75%; }
    .bar-fill.after { background: linear-gradient(135deg, #16a34a, #22c55e); width: 25%; }
    .disclaimer { margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 8px; font-size: 0.75rem; color: #64748b; font-style: italic; }
    .cta-section { margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #0891b2, #0ea5e9); border-radius: 12px; text-align: center; color: white; }
    .cta-section h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
    .cta-section p { font-size: 0.9375rem; opacity: 0.9; margin-bottom: 1rem; }
    .cta-button { display: inline-block; padding: 0.75rem 2rem; background: white; color: #0891b2; font-weight: 600; border-radius: 8px; text-decoration: none; }
    @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .page { page-break-after: always; height: auto; min-height: auto; } .no-print { display: none !important; } }
    .print-button { position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: linear-gradient(135deg, #0891b2, #0ea5e9); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 14px rgba(8, 145, 178, 0.4); }
    .print-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(8, 145, 178, 0.5); }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Save as PDF</button>

  <!-- Page 1: Executive Summary -->
  <div class="page page-1">
    <div class="header">
      <div class="logo-placeholder">HMN</div>
      <div class="report-meta">
        <div class="report-title">AI Maturity Assessment</div>
        <div>GlueIQ Executive Summary</div>
        <div style="margin-top: 0.5rem">${glueiqData.assessmentDate}</div>
      </div>
    </div>

    <div class="score-section">
      <div class="score-card primary">
        <div class="score-value">${glueiqData.overallScore}<span>/10</span></div>
        <div class="score-label">Overall Maturity Score</div>
        <div class="level-badge">Level ${glueiqData.maturityLevel}: ${glueiqData.maturityName}</div>
      </div>
      <div class="score-card secondary">
        <div style="font-size: 2rem; font-weight: 800; color: #0891b2;">${glueiqData.interviewCount}</div>
        <div class="score-label">Interviews Conducted</div>
        <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #64748b;">
          ${Math.round(glueiqData.totalInterviewMinutes / 60 * 10) / 10} hours of analysis
        </div>
        <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #0891b2; font-weight: 600;">
          ${glueiqData.confidenceLevel}% Confidence
        </div>
      </div>
    </div>

    <div class="key-finding">
      <div class="key-finding-label">Key Finding</div>
      <div class="key-finding-text">
        Organization at foundational stage with significant opportunity for AI transformation.
        Current state shows ad-hoc tool usage without formal strategy, governance, or training.
        Strong potential exists given leadership interest and existing tool investments.
      </div>
    </div>

    <div class="highlights">
      <h3>Assessment Highlights</h3>
      <div class="highlight-item">
        <div class="highlight-bullet">1</div>
        <div class="highlight-text">
          <strong>Leadership Engagement:</strong> CEO actively uses 9+ AI tools personally (ChatGPT, Claude, Perplexity, Motion, Copilot, MidJourney, Beautiful AI, Gamma, Fixer AI), demonstrating openness to AI adoption.
        </div>
      </div>
      <div class="highlight-item">
        <div class="highlight-bullet">2</div>
        <div class="highlight-text">
          <strong>Critical Gap:</strong> No formal AI strategy, training program, or governance framework exists. All 9 interviewees score at Level 0-1 on the maturity scale.
        </div>
      </div>
      <div class="highlight-item">
        <div class="highlight-bullet">3</div>
        <div class="highlight-text">
          <strong>Quick Win Opportunity:</strong> Tool consolidation from 15+ scattered tools to a focused core stack could immediately improve adoption and reduce costs.
        </div>
      </div>
    </div>

    <div class="footer">
      <div>Prepared by HMN AI | LVNG.ai Framework</div>
      <div>Page 1 of 3</div>
    </div>
  </div>

  <!-- Page 2: Top 5 Recommendations -->
  <div class="page page-2">
    <div class="header">
      <div class="logo-placeholder">HMN</div>
      <div class="report-meta">
        <div style="font-weight: 600;">GlueIQ Executive Summary</div>
        <div>${glueiqData.assessmentDate}</div>
      </div>
    </div>

    <h2>Top 5 Priority Recommendations</h2>

    ${recommendationsHtml}

    <div class="footer">
      <div>Prepared by HMN AI | LVNG.ai Framework</div>
      <div>Page 2 of 3</div>
    </div>
  </div>

  <!-- Page 3: Financial Impact -->
  <div class="page page-3">
    <div class="header">
      <div class="logo-placeholder">HMN</div>
      <div class="report-meta">
        <div style="font-weight: 600;">GlueIQ Executive Summary</div>
        <div>${glueiqData.assessmentDate}</div>
      </div>
    </div>

    <h2>Financial Impact Analysis</h2>

    <div class="financial-grid">
      <div class="financial-card cost">
        <div class="financial-value">$180K</div>
        <div class="financial-label">Current Annual Inefficiency Cost</div>
        <div class="financial-sublabel">Time lost to manual processes & tool sprawl</div>
      </div>
      <div class="financial-card investment">
        <div class="financial-value">$45K</div>
        <div class="financial-label">Recommended Investment</div>
        <div class="financial-sublabel">Training, tools, and implementation (Year 1)</div>
      </div>
      <div class="financial-card roi">
        <div class="financial-value">320%</div>
        <div class="financial-label">Projected 3-Year ROI</div>
        <div class="financial-sublabel">Based on industry benchmarks</div>
      </div>
      <div class="financial-card payback">
        <div class="financial-value">8 mo</div>
        <div class="financial-label">Payback Period</div>
        <div class="financial-sublabel">Time to recover initial investment</div>
      </div>
    </div>

    <div class="chart-section">
      <h3>Efficiency Comparison: Current vs. AI-Enabled</h3>
      <div class="bar-chart">
        <div class="bar-item">
          <div class="bar-label">Time on Manual Tasks</div>
          <div class="bar-container">
            <div class="bar-fill current">75%</div>
          </div>
        </div>
        <div class="bar-item">
          <div class="bar-label">After AI Optimization</div>
          <div class="bar-container">
            <div class="bar-fill after">25%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="disclaimer">
      * Financial projections are estimates based on industry benchmarks and comparable organization transformations.
      Actual results may vary based on implementation approach, team engagement, and market conditions.
      A detailed financial analysis will be provided during the strategy session.
    </div>

    <div class="cta-section">
      <h3>Ready to Start Your AI Transformation?</h3>
      <p>Schedule a strategy session to discuss your personalized roadmap from Level 0 to Level 3+</p>
      <a href="https://calendly.com/humanglue/strategy-session" class="cta-button" target="_blank">
        Schedule Strategy Session
      </a>
    </div>

    <div class="footer">
      <div>Prepared by HMN AI | LVNG.ai Framework</div>
      <div>Page 3 of 3</div>
    </div>
  </div>
</body>
</html>`
}

export function handleExportPDF(glueiqData: GlueIQData): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow pop-ups to generate the PDF report.')
    return
  }

  const htmlContent = generatePDFContent(glueiqData)
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
