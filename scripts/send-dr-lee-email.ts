import { emailTemplates } from '../lib/email-templates'

const html = emailTemplates.recruitment({
  recipientName: 'Dr. Ernesto Lee',
  recipientTitle: 'CEO at LVNG.ai & Professor',
  personalizedIntro: `Your work caught our attention in a big way. After researching your journey—from building AI-powered medical apps for rural Montana to founding LVNG.ai and Courseware.io, authoring "AI and the Art of Productive Struggle," and teaching the next generation of AI practitioners at FAU and Miami Dade College—we knew we had to reach out.

At HumanGlue, we're building something that aligns remarkably well with your mission: helping organizations bridge the gap between AI's potential and human-centered transformation.`,
  discoveredFacts: [
    '<strong>CEO of LVNG.ai</strong> — Leading AI transformation in healthcare and enterprise',
    '<strong>Author</strong> of "AI and the Art of Productive Struggle" — A philosophy we deeply resonate with',
    '<strong>Professor</strong> at Florida Atlantic University & Miami Dade College — Shaping future AI leaders',
    '<strong>Founder of Courseware.io</strong> — Revolutionizing educational content creation',
    '<strong>3,000+ Medium followers</strong> on drlee.io — Thought leadership at scale',
    '<strong>1,875+ Google Scholar citations</strong> — Academic impact and credibility',
    '<strong>CBS Featured Expert</strong> — Recognized voice in AI transformation',
  ],
  whyTheyFit: `Your unique combination of academic rigor, entrepreneurial success, and practical AI implementation experience is exactly what HumanGlue needs. We measure organizational AI maturity on a 0-10 scale across People, Process, Technology, and Strategy—and you've demonstrated mastery across all four dimensions.

Your philosophy of "productive struggle" in AI adoption mirrors our belief that lasting transformation requires both technical excellence and human understanding.`,
  opportunity: [
    '<strong>Expert Advisory Role</strong> — Shape our AI maturity assessment methodology',
    '<strong>Instructor Partnership</strong> — Develop and deliver premium training content',
    '<strong>Strategic Collaboration</strong> — Explore synergies between HumanGlue and LVNG.ai',
    '<strong>Equity Participation</strong> — Opportunity to be a founding advisor',
    '<strong>Thought Leadership Platform</strong> — Amplify your message through our network',
  ],
  senderName: 'Matty Squarzoni',
  senderTitle: 'Co-Founder & CTO, HumanGlue',
  senderEmail: 'matty@humanglue.ai',
  ctaText: 'Let\'s Connect',
  ctaUrl: 'https://hmnglue.com/demo'
})

async function sendEmail() {
  const response = await fetch('http://localhost:5040/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'drlee@lvng.ai',
      subject: 'Your Work at LVNG.ai + AI in Education Caught Our Attention | HumanGlue Partnership Opportunity',
      html: html,
      replyTo: 'matty@humanglue.ai'
    })
  })

  const result = await response.json()
  console.log('Email send result:', JSON.stringify(result, null, 2))
}

sendEmail().catch(console.error)
