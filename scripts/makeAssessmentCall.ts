/**
 * Script to initiate a Vapi assessment call
 * Usage: node scripts/makeAssessmentCall.js <phone-number>
 */

async function makeAssessmentCall(phoneNumber: string) {
  try {
    console.log(`Initiating assessment call to ${phoneNumber}...`)
    
    const response = await fetch('http://localhost:5040/api/vapi/create-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        // Optionally use a pre-created assistant ID
        // useAssistantId: 'your-assistant-id'
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to create call:', data)
      return
    }

    console.log('✅ Call initiated successfully!')
    console.log('Call ID:', data.callId)
    console.log('Status:', data.status)
    console.log('Phone Number:', data.phoneNumber)
    
  } catch (error) {
    console.error('Error making assessment call:', error)
  }
}

// Get phone number from command line or use the one you provided
const phoneNumber = process.argv[2] || '+19179221928'

// Format phone number if needed
const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`

makeAssessmentCall(formattedNumber)