/**
 * HumanGlue Email Template System
 *
 * Brand Guidelines:
 * - Primary Cyan: #61D8FE
 * - Secondary Cyan: #22D3EE
 * - Dark Background: #1D212A
 * - Gray Text: #4D4D4D
 * - Light Background: #F2F2F2
 *
 * Logo URL: https://hmnglue.com/HumnaGlue_logo_dark_blue.png
 * Icon URL: https://hmnglue.com/HG_icon.png
 * Website: https://hmnglue.com
 */

// Brand constants
export const BRAND = {
  colors: {
    cyan: '#61D8FE',
    purple: '#22D3EE', // Now cyan for backwards compatibility
    dark: '#1D212A',
    gray: '#4D4D4D',
    lightGray: '#6B7280',
    light: '#F2F2F2',
    white: '#FFFFFF',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
  },
  fonts: {
    primary: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  urls: {
    logo: 'https://hmnglue.com/HumnaGlue_logo_white_blue.png',
    logoDark: 'https://hmnglue.com/HumnaGlue_logo_dark_blue.png',
    icon: 'https://hmnglue.com/HG_icon.png',
    website: 'https://hmnglue.com',
    demo: 'https://hmnglue.com/demo',
    linkedin: 'https://linkedin.com/company/humanglue',
  },
  company: {
    name: 'HumanGlue',
    tagline: 'AI-Powered Organizational Transformation',
    address: 'Miami, FL',
  },
}

// Base wrapper for all emails
export function emailWrapper(content: string, options?: { preheader?: string }): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>HumanGlue</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; max-width: 100%; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* Responsive - Enhanced for mobile */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding: 24px 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-full-width { width: 100% !important; max-width: 100% !important; }
      .mobile-hide { display: none !important; }
      .mobile-font-size { font-size: 16px !important; line-height: 1.5 !important; }
      .header-padding { padding: 24px 16px !important; }
      .content-padding { padding: 24px 16px !important; }
      .footer-padding { padding: 24px 16px !important; }
      .button-full { display: block !important; width: 100% !important; }
      .button-full a { display: block !important; width: 100% !important; text-align: center !important; }
      h1 { font-size: 24px !important; }
      h2 { font-size: 20px !important; }
      h3 { font-size: 18px !important; }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a1a !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.colors.light}; font-family: ${BRAND.fonts.primary};">
  ${options?.preheader ? `
  <!-- Preheader text (hidden) -->
  <div style="display: none; font-size: 1px; color: ${BRAND.colors.light}; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${options.preheader}
  </div>
  ` : ''}

  <!-- Email wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BRAND.colors.light};">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Main container -->
        <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BRAND.colors.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); max-width: 100%;">

          <!-- Header with logo -->
          <tr>
            <td class="header-padding" style="padding: 32px 40px; background: linear-gradient(135deg, ${BRAND.colors.dark} 0%, #2D3748 100%);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <img src="${BRAND.urls.logo}" alt="HumanGlue" width="180" style="display: block; max-width: 180px; height: auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="mobile-padding content-padding" style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-padding" style="padding: 32px 40px; background-color: ${BRAND.colors.light}; border-top: 1px solid ${BRAND.colors.border};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <img src="${BRAND.urls.icon}" alt="HG" width="40" style="display: block; margin-bottom: 16px;" />
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: ${BRAND.colors.gray}; font-weight: 600;">
                      ${BRAND.company.name}
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 12px; color: ${BRAND.colors.lightGray};">
                      ${BRAND.company.tagline}
                    </p>
                    <p style="margin: 0; font-size: 12px; color: ${BRAND.colors.lightGray};">
                      <a href="${BRAND.urls.website}" style="color: ${BRAND.colors.purple}; text-decoration: none;">hmnglue.com</a>
                      &nbsp;•&nbsp;
                      <a href="${BRAND.urls.linkedin}" style="color: ${BRAND.colors.purple}; text-decoration: none;">LinkedIn</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Legal footer -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin-top: 24px;">
          <tr>
            <td align="center" style="padding: 0 20px;">
              <p style="margin: 0; font-size: 11px; color: ${BRAND.colors.lightGray}; line-height: 1.5;">
                © ${new Date().getFullYear()} HumanGlue. All rights reserved.<br/>
                ${BRAND.company.address}
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Component builders
export const emailComponents = {
  // Heading
  heading(text: string, level: 1 | 2 | 3 = 1): string {
    const sizes = { 1: '28px', 2: '22px', 3: '18px' }
    return `
      <h${level} style="margin: 0 0 20px 0; font-size: ${sizes[level]}; font-weight: 700; color: ${BRAND.colors.dark}; line-height: 1.3;">
        ${text}
      </h${level}>
    `
  },

  // Paragraph
  paragraph(text: string, options?: { muted?: boolean; small?: boolean }): string {
    const color = options?.muted ? BRAND.colors.lightGray : BRAND.colors.gray
    const size = options?.small ? '14px' : '16px'
    return `
      <p style="margin: 0 0 16px 0; font-size: ${size}; color: ${color}; line-height: 1.6;">
        ${text}
      </p>
    `
  },

  // Primary CTA button
  button(text: string, url: string, options?: { secondary?: boolean }): string {
    const bgColor = options?.secondary ? BRAND.colors.white : BRAND.colors.purple
    const textColor = options?.secondary ? BRAND.colors.purple : BRAND.colors.white
    const border = options?.secondary ? `2px solid ${BRAND.colors.purple}` : 'none'
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
        <tr>
          <td style="border-radius: 8px; background: ${options?.secondary ? 'transparent' : `linear-gradient(135deg, ${BRAND.colors.purple} 0%, ${BRAND.colors.cyan} 150%)`};">
            <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: ${textColor}; text-decoration: none; border-radius: 8px; border: ${border};">
              ${text}
            </a>
          </td>
        </tr>
      </table>
    `
  },

  // Centered button (mobile-friendly)
  buttonCentered(text: string, url: string): string {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" class="button-full" cellspacing="0" cellpadding="0" border="0" style="min-width: 200px;">
              <tr>
                <td style="border-radius: 8px; background: linear-gradient(135deg, ${BRAND.colors.purple} 0%, ${BRAND.colors.cyan} 150%); box-shadow: 0 4px 14px rgba(84, 74, 233, 0.4);">
                  <a href="${url}" target="_blank" style="display: block; padding: 16px 32px; font-size: 16px; font-weight: 600; color: ${BRAND.colors.white}; text-decoration: none; border-radius: 8px; text-align: center;">
                    ${text}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `
  },

  // Highlight box
  highlightBox(content: string, options?: { type?: 'info' | 'success' | 'warning' }): string {
    const colors = {
      info: { bg: '#EEF2FF', border: BRAND.colors.purple, text: '#4338CA' },
      success: { bg: '#ECFDF5', border: BRAND.colors.success, text: '#065F46' },
      warning: { bg: '#FFFBEB', border: BRAND.colors.warning, text: '#92400E' },
    }
    const theme = colors[options?.type || 'info']
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
        <tr>
          <td style="padding: 20px 24px; background-color: ${theme.bg}; border-left: 4px solid ${theme.border}; border-radius: 0 8px 8px 0;">
            <div style="font-size: 15px; color: ${theme.text}; line-height: 1.6;">
              ${content}
            </div>
          </td>
        </tr>
      </table>
    `
  },

  // Bulleted list
  bulletList(items: string[]): string {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 16px 0;">
        ${items.map(item => `
          <tr>
            <td width="24" valign="top" style="padding: 4px 0;">
              <span style="display: inline-block; width: 6px; height: 6px; background-color: ${BRAND.colors.cyan}; border-radius: 50%; margin-top: 8px;"></span>
            </td>
            <td style="padding: 4px 0 4px 8px; font-size: 15px; color: ${BRAND.colors.gray}; line-height: 1.5;">
              ${item}
            </td>
          </tr>
        `).join('')}
      </table>
    `
  },

  // Divider
  divider(): string {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
        <tr>
          <td style="border-top: 1px solid ${BRAND.colors.border};"></td>
        </tr>
      </table>
    `
  },

  // Signature block
  signature(name: string, title: string, email?: string): string {
    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px;">
        <tr>
          <td>
            <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: ${BRAND.colors.dark};">
              ${name}
            </p>
            <p style="margin: 0; font-size: 14px; color: ${BRAND.colors.lightGray};">
              ${title}${email ? ` • <a href="mailto:${email}" style="color: ${BRAND.colors.purple}; text-decoration: none;">${email}</a>` : ''}
            </p>
          </td>
        </tr>
      </table>
    `
  },

  // Stats row (for metrics)
  statsRow(stats: Array<{ value: string; label: string }>): string {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
        <tr>
          ${stats.map(stat => `
            <td align="center" style="padding: 16px;">
              <p style="margin: 0 0 4px 0; font-size: 28px; font-weight: 700; color: ${BRAND.colors.purple};">
                ${stat.value}
              </p>
              <p style="margin: 0; font-size: 12px; color: ${BRAND.colors.lightGray}; text-transform: uppercase; letter-spacing: 0.5px;">
                ${stat.label}
              </p>
            </td>
          `).join('')}
        </tr>
      </table>
    `
  },

  // Quote block
  quote(text: string, author?: string): string {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
        <tr>
          <td style="padding: 24px; background-color: ${BRAND.colors.light}; border-radius: 8px;">
            <p style="margin: 0; font-size: 18px; font-style: italic; color: ${BRAND.colors.gray}; line-height: 1.6;">
              "${text}"
            </p>
            ${author ? `
              <p style="margin: 12px 0 0 0; font-size: 14px; color: ${BRAND.colors.lightGray};">
                — ${author}
              </p>
            ` : ''}
          </td>
        </tr>
      </table>
    `
  },

  // AI-generated badge
  aiGeneratedBadge(): string {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0 0 0;">
        <tr>
          <td align="center" style="padding: 16px; background: linear-gradient(135deg, ${BRAND.colors.dark} 0%, #2D3748 100%); border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; color: ${BRAND.colors.cyan}; letter-spacing: 0.5px;">
              ✨ This email was crafted by AI • Powered by HumanGlue
            </p>
          </td>
        </tr>
      </table>
    `
  },

  // Feature card
  featureCard(title: string, description: string, icon?: string): string {
    return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 16px 0;">
        <tr>
          <td style="padding: 20px; background-color: ${BRAND.colors.white}; border: 1px solid ${BRAND.colors.border}; border-radius: 12px;">
            ${icon ? `<p style="margin: 0 0 12px 0; font-size: 24px;">${icon}</p>` : ''}
            <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: ${BRAND.colors.dark};">
              ${title}
            </p>
            <p style="margin: 0; font-size: 14px; color: ${BRAND.colors.lightGray}; line-height: 1.5;">
              ${description}
            </p>
          </td>
        </tr>
      </table>
    `
  },
}

// Pre-built email templates
export const emailTemplates = {
  // Recruitment/Outreach email
  recruitment(options: {
    recipientName: string
    recipientTitle?: string
    personalizedIntro: string
    discoveredFacts: string[]
    whyTheyFit: string
    opportunity: string[]
    senderName: string
    senderTitle: string
    senderEmail: string
    ctaText?: string
    ctaUrl?: string
  }): string {
    const c = emailComponents

    const content = `
      ${c.paragraph(`${options.recipientName},`)}

      ${c.paragraph(options.personalizedIntro)}

      ${c.highlightBox(`
        <p style="margin: 0 0 12px 0; font-weight: 600;">What We Discovered About You:</p>
        ${c.bulletList(options.discoveredFacts)}
      `, { type: 'info' })}

      ${c.heading('Why HumanGlue Needs You', 2)}

      ${c.paragraph(options.whyTheyFit)}

      ${c.heading('The Opportunity', 2)}

      ${c.highlightBox(c.bulletList(options.opportunity), { type: 'success' })}

      ${c.buttonCentered(options.ctaText || 'Schedule a Conversation', options.ctaUrl || BRAND.urls.demo)}

      ${c.paragraph("I'd love to connect and explore how we can work together.")}

      ${c.signature(options.senderName, options.senderTitle, options.senderEmail)}

      ${c.aiGeneratedBadge()}
    `

    return emailWrapper(content, {
      preheader: `${options.recipientName}, your expertise is exactly what we're building at HumanGlue`
    })
  },

  // User invitation email
  invitation(options: {
    recipientName: string
    inviterName: string
    companyName: string
    role: string
    loginUrl: string
    tempPassword?: string
  }): string {
    const c = emailComponents

    const content = `
      ${c.heading(`Welcome to HumanGlue, ${options.recipientName}!`)}

      ${c.paragraph(`<strong>${options.inviterName}</strong> has invited you to join <strong>${options.companyName}</strong> on HumanGlue as a <strong>${options.role}</strong>.`)}

      ${c.paragraph("HumanGlue is an AI-powered platform that helps organizations measure and improve their AI maturity across People, Process, Technology, and Strategy.")}

      ${options.tempPassword ? c.highlightBox(`
        <p style="margin: 0 0 8px 0; font-weight: 600;">Your temporary password:</p>
        <p style="margin: 0; font-family: monospace; font-size: 18px; letter-spacing: 1px;">${options.tempPassword}</p>
        <p style="margin: 12px 0 0 0; font-size: 13px;">Please change this after your first login.</p>
      `, { type: 'warning' }) : ''}

      ${c.buttonCentered('Access Your Account', options.loginUrl)}

      ${c.paragraph("If you have any questions, simply reply to this email.", { muted: true })}
    `

    return emailWrapper(content, {
      preheader: `${options.inviterName} invited you to ${options.companyName} on HumanGlue`
    })
  },

  // Assessment results email
  assessmentResults(options: {
    recipientName: string
    companyName: string
    overallScore: number
    dimensionScores: Array<{ name: string; score: number }>
    topStrengths: string[]
    topOpportunities: string[]
    reportUrl: string
  }): string {
    const c = emailComponents

    const content = `
      ${c.heading(`${options.companyName}'s AI Maturity Assessment Results`)}

      ${c.paragraph(`${options.recipientName}, your organization's assessment is complete. Here's a summary of the findings:`)}

      ${c.statsRow([
        { value: options.overallScore.toFixed(1), label: 'Overall Score' },
        ...options.dimensionScores.slice(0, 3).map(d => ({ value: d.score.toFixed(1), label: d.name }))
      ])}

      ${c.heading('Key Strengths', 2)}
      ${c.bulletList(options.topStrengths)}

      ${c.heading('Opportunities for Growth', 2)}
      ${c.bulletList(options.topOpportunities)}

      ${c.buttonCentered('View Full Report', options.reportUrl)}

      ${c.paragraph("Our team is ready to help you create a transformation roadmap based on these results.", { muted: true })}
    `

    return emailWrapper(content, {
      preheader: `${options.companyName}'s AI Maturity Score: ${options.overallScore.toFixed(1)}/10`
    })
  },
}

// Utility to strip HTML for plain text version
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}
