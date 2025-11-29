#!/usr/bin/env node

/**
 * Multi-Role User Test Script
 *
 * This script provides helper functions to test the multi-role system.
 * Run in the browser console to set up test users with different role combinations.
 */

console.log('🔧 HumanGlue Multi-Role Test Helper Loaded\n')

// Test User Profiles
const testUsers = {
  // Regular student (single role - no switcher shown)
  student: {
    name: 'Emily Watson',
    email: 'emily@example.com',
    // No role flags = client only
  },

  // Instructor who is also a student (dual role)
  instructorStudent: {
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    isInstructor: true,
  },

  // Expert who is also a student (dual role)
  expertStudent: {
    name: 'David Kim',
    email: 'david@example.com',
    isExpert: true,
  },

  // Instructor + Expert (triple role with client)
  instructorExpert: {
    name: 'Maria Garcia',
    email: 'maria@example.com',
    isInstructor: true,
    isExpert: true,
  },

  // Admin + Instructor (triple role with client)
  adminInstructor: {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    isAdmin: true,
    isInstructor: true,
  },

  // Super user with all roles
  superUser: {
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    isAdmin: true,
    isInstructor: true,
    isExpert: true,
  },
}

// Helper function to set a test user
function setTestUser(userKey) {
  const user = testUsers[userKey]
  if (!user) {
    console.error(`❌ User "${userKey}" not found. Available users:`, Object.keys(testUsers))
    return
  }

  localStorage.setItem('humanglue_user', JSON.stringify(user))
  console.log(`✅ Test user set: ${user.name} (${user.email})`)
  console.log('📋 Roles:', {
    admin: user.isAdmin || false,
    expert: user.isExpert || false,
    instructor: user.isInstructor || false,
    client: true, // Everyone has client access
  })
  console.log('🔄 Reload the page to see changes')
}

// Helper function to list all test users
function listTestUsers() {
  console.log('👥 Available Test Users:\n')
  Object.entries(testUsers).forEach(([key, user]) => {
    const roles = []
    if (user.isAdmin) roles.push('Admin')
    if (user.isExpert) roles.push('Expert')
    if (user.isInstructor) roles.push('Instructor')
    roles.push('Student') // Everyone has client access

    console.log(`  ${key}:`)
    console.log(`    Name: ${user.name}`)
    console.log(`    Roles: ${roles.join(', ')}`)
    console.log('')
  })
  console.log('💡 Usage: setTestUser("userKey")')
}

// Helper function to get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('humanglue_user')
  if (!userStr) {
    console.log('❌ No user currently logged in')
    return null
  }

  const user = JSON.parse(userStr)
  console.log('👤 Current User:', user.name)
  console.log('📋 Roles:', {
    admin: user.isAdmin || false,
    expert: user.isExpert || false,
    instructor: user.isInstructor || false,
    client: true,
  })
  return user
}

// Helper to add a role to current user
function addRole(role) {
  const userStr = localStorage.getItem('humanglue_user')
  if (!userStr) {
    console.error('❌ No user currently logged in. Use setTestUser() first.')
    return
  }

  const user = JSON.parse(userStr)
  const roleKey = `is${role.charAt(0).toUpperCase() + role.slice(1)}`

  if (user[roleKey]) {
    console.log(`ℹ️  User already has ${role} role`)
    return
  }

  user[roleKey] = true
  localStorage.setItem('humanglue_user', JSON.stringify(user))
  console.log(`✅ Added ${role} role to ${user.name}`)
  console.log('🔄 Reload the page to see changes')
}

// Helper to remove a role from current user
function removeRole(role) {
  const userStr = localStorage.getItem('humanglue_user')
  if (!userStr) {
    console.error('❌ No user currently logged in. Use setTestUser() first.')
    return
  }

  const user = JSON.parse(userStr)
  const roleKey = `is${role.charAt(0).toUpperCase() + role.slice(1)}`

  if (!user[roleKey]) {
    console.log(`ℹ️  User doesn't have ${role} role`)
    return
  }

  delete user[roleKey]
  localStorage.setItem('humanglue_user', JSON.stringify(user))
  console.log(`✅ Removed ${role} role from ${user.name}`)
  console.log('🔄 Reload the page to see changes')
}

// Expose functions globally
window.setTestUser = setTestUser
window.listTestUsers = listTestUsers
window.getCurrentUser = getCurrentUser
window.addRole = addRole
window.removeRole = removeRole

// Show help on load
console.log('📚 Available Commands:')
console.log('  listTestUsers()           - List all test users')
console.log('  setTestUser("userKey")    - Set a test user')
console.log('  getCurrentUser()          - Show current user info')
console.log('  addRole("admin")          - Add a role to current user')
console.log('  removeRole("instructor")  - Remove a role from current user')
console.log('\n💡 Try: setTestUser("instructorStudent")\n')
