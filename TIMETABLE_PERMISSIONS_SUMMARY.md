# Timetable Permissions Summary

This document outlines all permission checks and reactive UI elements in the timetable system.

## User Roles

There are 3 permission levels for any timetable:

1. **OWNER** - Creator of the timetable
   - Full control: create, edit, delete timetable
   - Manage collaborators (invite, remove, change roles)
   - Share with others
   - Add, edit, delete events
   - Drag-and-drop and resize events

2. **CONTRIBUTOR** - Collaborator with edit access
   - View the timetable
   - Add, edit, delete events
   - Drag-and-drop and resize events
   - Cannot manage collaborators
   - Cannot delete or rename the timetable
   - Can leave the timetable

3. **VIEWER** - Collaborator with read-only access
   - View the timetable only
   - Cannot add, edit, or delete events
   - Cannot drag-and-drop or resize events
   - Cannot manage collaborators
   - Can leave the timetable

## Permission Checks by Component

### Main Timetable Page (`timetable/page.tsx`)

#### Visual Indicators
- **Lines 540-545**: Shows "Viewer" or "Contributor" badge for non-owners
- **Lines 674-690**: Shows "View-Only Access" info banner for viewers

#### Action Buttons
- **Lines 549-558**: "Add Class" button - Only visible when `canEdit === true` (Owner or Contributor)
- **Lines 568-577**: "Share" button - Only visible when `isOwner === true`
- **Lines 559-567**: "Collaborators" button - Visible to everyone (but actions inside are restricted)
- **Lines 579-587**: "Settings" button - Visible to everyone (but edit functions are restricted inside)

#### Calendar Interactions
- **Line 705**: `resizable={canEdit}` - Only owners/contributors can resize events
- **Line 706**: `draggableAccessor={() => canEdit}` - Only owners/contributors can drag events
- **Line 718**: Cursor style changes: `cursor: canEdit ? "move" : "default"`

### EventDetailsModal

#### View Mode
- **Lines 244-263**: Edit and Delete buttons - Only visible when `canEdit === true`
- **Lines 265-271**: "View-only access" message - Shown when `canEdit === false`

#### Edit Mode
- **Line 273-onwards**: Entire edit form - Only accessible when `canEdit === true` (setIsEditing can only be triggered if canEdit is true)

### TimetableSettingsModal

#### General Tab
- **Lines 164-204**: "Set as Default" - Available to everyone (owners, contributors, viewers)
- **Lines 206-243**: Edit name and description - Only visible when `isOwner === true`

#### Danger Zone Tab
- **Lines 255-290**: "Leave Timetable" - Only visible when `!isOwner` (contributors and viewers)
- **Lines 293-328**: "Delete Timetable" - Only visible when `isOwner === true`

### ManageCollaboratorsModal

#### Owner Section
- **Lines 94-109**: Owner card - Always shown (read-only)

#### Active Collaborators
- **Lines 181-215**: Role selector (VIEWER ↔ CONTRIBUTOR) - Only visible when `isOwner === true`
- **Lines 216-220**: Static role badge - Shown for non-owners
- **Lines 223-235**: Remove button - Only visible when `isOwner === true`

#### Pending Invitations
- **Lines 238-270**: Pending invitations list - Only visible when `isOwner === true`
- **Lines 258-267**: Cancel invitation button - Only visible when `isOwner === true`

### ShareTimetableModal

- **Entire modal**: Only accessible when user is the owner (button to open it is hidden for non-owners)

### InvitationsBanner

- **Entire component**: Shows pending timetable invitations for all users
- Accept/Reject actions available to the invited user

## Permission Logic

### canEdit Calculation
```typescript
const canEdit = selectedTimetable
  ? selectedTimetable.createdBy === selectedTimetable.creator.id ||
    selectedTimetable.collaborators.some(
      (c) => c.role === "CONTRIBUTOR" && c.status === "ACCEPTED",
    )
  : false;
```

### isOwner Calculation
```typescript
const isOwner = selectedTimetable
  ? selectedTimetable.createdBy === selectedTimetable.creator.id
  : false;
```

## What Each Role Can Do

| Action | OWNER | CONTRIBUTOR | VIEWER |
|--------|-------|-------------|--------|
| View timetable | ✅ | ✅ | ✅ |
| Set as default | ✅ | ✅ | ✅ |
| View collaborators | ✅ | ✅ | ✅ |
| Add events | ✅ | ✅ | ❌ |
| Edit events | ✅ | ✅ | ❌ |
| Delete events | ✅ | ✅ | ❌ |
| Drag/resize events | ✅ | ✅ | ❌ |
| Rename timetable | ✅ | ❌ | ❌ |
| Delete timetable | ✅ | ❌ | ❌ |
| Share timetable | ✅ | ❌ | ❌ |
| Invite collaborators | ✅ | ❌ | ❌ |
| Change roles | ✅ | ❌ | ❌ |
| Remove collaborators | ✅ | ❌ | ❌ |
| Leave timetable | ❌ | ✅ | ✅ |

## UI Feedback for Viewers

1. **Badge in action bar**: Shows "Viewer" label with eye icon
2. **Info banner**: Prominent blue banner explaining view-only access
3. **No action buttons**: Add Class, Share buttons are hidden
4. **Event details**: Shows "view-only access" message instead of Edit/Delete buttons
5. **Cursor**: Events show default cursor (not move cursor)
6. **Disabled interactions**: Cannot drag, drop, or resize events
7. **Settings modal**: Only shows "Set as Default" and "Leave" options
8. **Collaborators modal**: Shows static role badges, no change/remove buttons

## Security Notes

- All UI restrictions are **visual only** - backend must also enforce these permissions
- The backend tRPC mutations already check permissions server-side
- UI checks prevent accidental actions and improve UX
- Users cannot bypass UI restrictions through developer tools because backend validates everything
