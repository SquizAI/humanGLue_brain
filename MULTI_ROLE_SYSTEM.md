# Multi-Role System Documentation

## Overview

The HumanGlue platform now supports **multi-role users** who can hold multiple roles simultaneously and switch between them seamlessly.

## Features

### 1. Multi-Role Detection
Users can have any combination of the following roles:
- **Admin** - System administration
- **Expert** - Expert consulting
- **Instructor** - Teaching & course management
- **Client/Student** - Learning dashboard (default for all users)

### 2. Role Switcher Dropdown
When a user has multiple roles, a dropdown appears in the sidebar that allows them to:
- View all their available portals
- Switch between portals with a single click
- See which portal they're currently viewing

### 3. Role-Based Navigation
The sidebar automatically adapts based on the active role:
- Shows role-specific navigation items
- Adjusts cart visibility (only for client/student role)
- Updates the portal title
- Changes the default home link

## Implementation Details

### Role Detection
```typescript
// User can have multiple roles
const hasAdminRole = userData?.isAdmin || userData?.role === 'admin'
const hasInstructorRole = userData?.isInstructor || userData?.role === 'instructor'
const hasExpertRole = userData?.isExpert || userData?.role === 'expert'
const hasClientRole = true // Everyone has client access

// Current active role is detected from pathname
const currentActiveRole =
  pathname.startsWith('/admin') ? 'admin' :
  pathname.startsWith('/expert') ? 'expert' :
  pathname.startsWith('/instructor') ? 'instructor' :
  'client'
```

### Available Roles Array
```typescript
const availableRoles = [
  hasAdminRole && { id: 'admin', label: 'Admin Portal', icon: Shield, href: '/admin' },
  hasExpertRole && { id: 'expert', label: 'Expert Portal', icon: Award, href: '/expert' },
  hasInstructorRole && { id: 'instructor', label: 'Instructor Portal', icon: Users, href: '/instructor/courses' },
  hasClientRole && { id: 'client', label: 'Student Portal', icon: LayoutDashboard, href: '/dashboard' },
].filter(Boolean)
```

## User Data Structure

To assign multiple roles to a user, set any combination of these flags in the user data:

```typescript
const userData = {
  name: 'John Doe',
  email: 'john@example.com',

  // Role flags (set any combination)
  isAdmin: true,          // Has admin access
  isInstructor: true,     // Has instructor access
  isExpert: false,        // Has expert access

  // Alternative role property (for backward compatibility)
  role: 'instructor',     // Primary role
  userType: 'instructor', // Alternative userType
}
```

## Testing Multi-Role Users

### Example 1: Instructor who is also a Student
```typescript
localStorage.setItem('humanglue_user', JSON.stringify({
  name: 'Sarah Chen',
  email: 'sarah@example.com',
  isInstructor: true,
  // isAdmin: false (not set, so no admin access)
  // isExpert: false (not set, so no expert access)
  // Client access is automatic for everyone
}))
```

Result: Sarah will see a role switcher with:
- ✅ Instructor Portal
- ✅ Student Portal

### Example 2: Admin who is also an Instructor and Expert
```typescript
localStorage.setItem('humanglue_user', JSON.stringify({
  name: 'Michael Rodriguez',
  email: 'michael@example.com',
  isAdmin: true,
  isInstructor: true,
  isExpert: true,
}))
```

Result: Michael will see a role switcher with:
- ✅ Admin Portal
- ✅ Expert Portal
- ✅ Instructor Portal
- ✅ Student Portal

### Example 3: Regular Student (Single Role)
```typescript
localStorage.setItem('humanglue_user', JSON.stringify({
  name: 'Emily Watson',
  email: 'emily@example.com',
  // No special role flags
}))
```

Result: Emily will NOT see a role switcher (only has client access).

## UI/UX Behavior

### Role Switcher Visibility
- **Hidden**: When user has only 1 role (client)
- **Visible**: When user has 2 or more roles
- **Location**: Between logo and user profile in sidebar

### Role Switcher UI
- Shows current active portal with icon and title
- "Switch portal" hint text
- Dropdown arrow that rotates when open
- Dropdown shows all available portals with:
  - Role icon
  - Portal label
  - Portal description
  - Checkmark on current active role
  - Purple highlight on current role

### Portal-Specific Features
Each portal has its own:
- Navigation items
- Cart visibility (only client portal)
- Upgrade button visibility (only client portal)
- Default home link
- Portal title

## File Modified

**File**: `/components/organisms/DashboardSidebar.tsx`

**Key Changes**:
1. Added `ChevronDown` and `Check` icons
2. Added `showRoleSwitcher` state
3. Changed from single role detection to multi-role detection
4. Added `currentActiveRole` and `availableRoles` logic
5. Added role switcher dropdown UI component
6. Updated all role references to use `currentActiveRole`

## Next Steps

To fully enable multi-role support:

1. **Update user authentication** - Modify your auth system to set multiple role flags
2. **Database schema** - Add role columns or role relationships to user table
3. **API endpoints** - Update user endpoints to return role data
4. **Permissions** - Implement role-based permissions for each portal
5. **Role management UI** - Add admin interface to assign/remove roles

## Example Login Flow

```typescript
// After successful login, store user data with roles
const loginResponse = await api.login(email, password)

// Server returns user with role flags
const userData = {
  id: loginResponse.userId,
  name: loginResponse.name,
  email: loginResponse.email,
  isAdmin: loginResponse.roles.includes('admin'),
  isInstructor: loginResponse.roles.includes('instructor'),
  isExpert: loginResponse.roles.includes('expert'),
}

// Save to localStorage (or context/state management)
localStorage.setItem('humanglue_user', JSON.stringify(userData))

// Redirect to appropriate portal based on primary role
const primaryRole = loginResponse.roles[0]
router.push(
  primaryRole === 'admin' ? '/admin' :
  primaryRole === 'expert' ? '/expert' :
  primaryRole === 'instructor' ? '/instructor/courses' :
  '/dashboard'
)
```

## Security Considerations

⚠️ **Important**: Role-based access control should be enforced on the **server side**:

1. **API endpoints** should verify user roles before returning data
2. **Middleware** should protect routes based on user roles
3. **Client-side role flags** are for UI/UX only, not security
4. Always validate permissions on the backend

Example middleware:
```typescript
export function middleware(request: NextRequest) {
  const user = getUserFromToken(request)

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user.isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/instructor')) {
    if (!user.isInstructor) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // ... similar checks for other roles
}
```
