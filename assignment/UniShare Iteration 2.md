# UniShare - Sprint 2 Iteration Report

**Application Development - SCSJ3104**
**Qaiwan International University**

## Prepared by:

| Team Members | Matric Number |
|--------------|---------------|
| Rawa Dara Radha | |
| Parwar Yassin qadr | |
| Drud Zmnako | |
| Muhamad ahmad | |
| Aland haval | |

**Submitted to:** Mr. Sassan Sarbast
**Date:** December 1, 2025
**Sprint Duration:** November 11, 2025 - December 1, 2025

---

## Table of Contents

1. Use Case Diagrams
2. Domain Model (UML Diagram)
3. Sequence Diagrams
4. Use Case Scenarios
5. Data Description
6. Data Dictionary

---

## Sprint 2 Overview

Sprint 2 builds upon Sprint 1's foundation by implementing user-facing authentication features, student registration workflows, and admin approval systems. This sprint introduces the first functional interfaces where students can register, admins can approve registrations, and users can authenticate with role-based redirection.

### Sprint 2 Goals
- ✅ Student registration form with university/faculty selection
- ✅ Student ID upload via UploadThing (4MB image verification)
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Admin approval dashboard with pending user list
- ✅ Email notifications via Nodemailer (Gmail SMTP)
- ✅ NextAuth login with credentials provider
- ✅ Role-based redirects (PENDING, APPROVED, ADMIN)
- ✅ Session management with JWT (30-day expiration)

### Technical Achievements
- Implemented secure password hashing with bcrypt salt rounds
- Built faculty-cascading dropdown (university selection filters faculties)
- Created admin dashboard with student ID verification view
- Integrated Nodemailer with HTML email templates
- Developed role-based middleware for route protection
- Implemented "waiting for approval" page for pending users

---

## 1. Use Case Diagrams

### Student Use Case

**[DIAGRAM 1: Student Registration and Authentication Use Case - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The student use case diagram illustrates the registration workflow where students select their university and faculty from cascading dropdowns, upload their student ID for verification via UploadThing, create secure passwords, and submit registration. The system validates all inputs using Zod schemas, checks for duplicate emails, hashes passwords using bcrypt (12 rounds), stores the user with a PENDING role, uploads student ID to UploadThing CDN, and dispatches a confirmation email via Nodemailer.

**Actors:**
- Student (unauthenticated)
- UniShare Registration System
- UploadThing Service
- Email Service (Nodemailer)

**System Boundary:** Student Registration & Authentication

**Use Cases:**
1. **UC-S2-001:** View Registration Form
2. **UC-S2-002:** Select University (loads faculties)
3. **UC-S2-003:** Select Faculty (filtered by university)
4. **UC-S2-004:** Upload Student ID (UploadThing, 4MB max)
5. **UC-S2-005:** Submit Registration
   - **Includes:** Validate Email, Hash Password, Create User Record
6. **UC-S2-006:** Receive Confirmation Email
7. **UC-S2-007:** View Waiting Approval Page
8. **UC-S2-008:** Login with Credentials
   - **Includes:** Verify Password, Check Role, Create Session
9. **UC-S2-009:** Check Approval Status

**Role-Based Redirects:**
- **PENDING** → `/waiting-approval` (shows approval status message)
- **APPROVED** → `/courses` (main application)
- **ADMIN** → `/admin` (admin dashboard)

---

### Admin Use Case

**[DIAGRAM 2: Admin Approval Workflow Use Case - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The admin use case shows how administrators authenticate with ADMIN role, access the admin dashboard, review pending student registrations in a list view, click on individual students to see detailed information including university, faculty, name, email, and uploaded student ID image, verify the authenticity of student IDs, and approve or reject applications. Upon approval, the system updates the user role from PENDING to APPROVED, sets the `approvedAt` timestamp, and sends an approval email with login instructions via Nodemailer. Upon rejection, the system optionally deletes the user record or marks it as rejected and sends a rejection email explaining the decision.

**Actors:**
- Admin (authenticated with ADMIN role)
- UniShare Admin Dashboard
- Email Service (Nodemailer)

**System Boundary:** Admin Approval System

**Use Cases:**
1. **UC-S2-010:** Admin Login
   - **Includes:** Verify Credentials, Check ADMIN Role
2. **UC-S2-011:** View Pending Users List
   - **Includes:** Fetch Users with role=PENDING, Display Count
3. **UC-S2-012:** View Student Details
   - **Includes:** Load Student ID Image, Show University/Faculty Info
4. **UC-S2-013:** Approve Student Registration
   - **Includes:** Update Role to APPROVED, Set approvedAt, Send Approval Email
5. **UC-S2-014:** Reject Student Registration
   - **Includes:** Delete/Mark User, Send Rejection Email
6. **UC-S2-015:** Search/Filter Pending Users
7. **UC-S2-016:** Bulk Approve (future enhancement)

---

## 2. Domain Model (UML Diagram)

**[DIAGRAM 3: UniShare Domain Model - Sprint 2 - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The domain model illustrates the core entities for Sprint 2, maintaining the same structure from Sprint 1 but now actively utilized for registration and authentication workflows.

### Key Relationships:

**User ↔ University:** Many-to-One
- Multiple students belong to one university
- User must select university during registration
- University selection determines available faculties

**User ↔ Faculty:** Many-to-One
- Multiple students belong to one faculty
- Faculty dropdown filtered by selected university
- Faculty must belong to selected university (validation rule)

**User ↔ Account (NextAuth):** One-to-Many
- User can have multiple accounts (credentials provider currently)
- Account stores authentication provider information
- Cascade delete on user deletion

**User ↔ Session (NextAuth):** One-to-Many
- User can have multiple active sessions (multi-device login)
- Session stores JWT token and expiration
- 30-day session expiration
- Cascade delete on user deletion

### Entities in Use:

**1. User:**
- **Sprint 2 Additions:** Active registration with bcrypt password hashing, UploadThing studentIdUrl storage
- **Flow:** Student registers → User created with role=PENDING → Admin approves → role=APPROVED + approvedAt set → Student can login

**2. University:**
- **Sprint 2 Usage:** Populated in registration form dropdown, used for faculty filtering

**3. Faculty:**
- **Sprint 2 Usage:** Dynamically loaded based on university selection, validates university association

**4. Account (NextAuth):**
- **Sprint 2 Usage:** Created automatically on first login via Credentials provider

**5. Session (NextAuth):**
- **Sprint 2 Usage:** Created on successful login, stores JWT token, expires after 30 days

### Authentication Flow:
```
Registration: Student → Form → Validation → bcrypt Hash → User (PENDING) → Email → Waiting Page
Approval: Admin → Dashboard → Review → Approve → Update role → Email → Student Notified
Login: Student → Credentials → bcrypt Compare → Role Check → JWT Session → Redirect by Role
```

---

## 3. Sequence Diagrams

### Sequence 1: Student Registration

**[DIAGRAM 4: Student Registration Sequence Diagram - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The registration sequence shows the interaction between Student, Registration Form, Validation System (Zod), UploadThing CDN, Prisma/Database, Bcrypt, and Nodemailer.

**Participants:**
1. Student (User)
2. Registration Form (Next.js Client Component)
3. Form Validation (Zod Schema)
4. UploadThing API
5. Server Action (Registration Handler)
6. Bcrypt Password Hasher
7. Prisma Client
8. PostgreSQL Database (NeonDB)
9. Nodemailer (Email Service)

**Flow:**
1. Student → Registration Form: Navigate to `/register`
2. Registration Form → Student: Display form fields
3. Student → Registration Form: Enter name, email, password
4. Student → Registration Form: Select university
5. Registration Form → Database: Fetch faculties for selected university
6. Database → Registration Form: Return faculties list
7. Registration Form → Student: Update faculty dropdown options
8. Student → Registration Form: Select faculty
9. Student → UploadThing: Click upload student ID
10. UploadThing → Student: Open file picker
11. Student → UploadThing: Select image file (JPG/PNG)
12. UploadThing → UploadThing: Validate file size (max 4MB)
13. UploadThing → UploadThing: Upload to S3 CDN
14. UploadThing → Registration Form: Return file URL (`https://utfs.io/f/{key}`)
15. Registration Form → Student: Show upload success
16. Student → Registration Form: Click "Register" button
17. Registration Form → Form Validation: Validate all fields
18. Form Validation → Form Validation: Check email format
19. Form Validation → Form Validation: Check password strength (min 8 chars)
20. Form Validation → Form Validation: Validate name, university, faculty
21. Form Validation → Registration Form: Validation passed
22. Registration Form → Server Action: Submit form data
23. Server Action → Database: Check if email already exists
24. Database → Server Action: Email unique
25. Server Action → Bcrypt: Hash password with 12 salt rounds
26. Bcrypt → Server Action: Return hashed password (60 chars)
27. Server Action → Prisma: Create user record
28. Prisma → Database: INSERT INTO users
29. Database → Prisma: User created with id, role=PENDING
30. Server Action → Nodemailer: Send confirmation email
31. Nodemailer → SMTP Server: Send HTML email
32. SMTP Server → Student Email: Deliver email
33. Nodemailer → Server Action: Email sent successfully
34. Server Action → Registration Form: Registration successful
35. Registration Form → Student: Redirect to `/waiting-approval`
36. Student: See waiting message with approval status

**Alternative Flows:**
- **A1: Email already exists**
  - At step 24, if email exists, return error "Email already registered"
  - Display error on form, highlight email field
- **A2: File upload fails**
  - At step 13, if upload fails (network error, size exceeded), show error
  - Student can retry upload
- **A3: Validation fails**
  - At step 21, if validation fails, show field-specific errors
  - Student corrects errors and resubmits
- **A4: Database error**
  - At step 29, if database error, rollback transaction
  - Show generic error message, log error for debugging

---

### Sequence 2: Admin Approval Workflow

**[DIAGRAM 5: Admin Approval Sequence Diagram - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
This sequence diagram demonstrates the admin approval workflow including authentication verification, fetching pending users from the database, displaying student details with uploaded IDs, updating user roles, and triggering email notifications.

**Participants:**
1. Admin (User with ADMIN role)
2. Login Page
3. NextAuth
4. Admin Dashboard
5. Prisma Client
6. PostgreSQL Database
7. Nodemailer

**Flow:**
1. Admin → Login Page: Navigate to `/login`
2. Admin → Login Page: Enter email and password
3. Login Page → NextAuth: Submit credentials
4. NextAuth → Database: Query user by email
5. Database → NextAuth: Return user record (role=ADMIN)
6. NextAuth → Bcrypt: Compare password hash
7. Bcrypt → NextAuth: Password matches
8. NextAuth → NextAuth: Create JWT token with user id and role
9. NextAuth → NextAuth: Create session with 30-day expiration
10. NextAuth → Login Page: Authentication successful
11. Login Page → Admin: Check role = ADMIN
12. Admin → Admin Dashboard: Redirect to `/admin/approvals`
13. Admin Dashboard → Prisma: Query users WHERE role = PENDING
14. Prisma → Database: SELECT * FROM users WHERE role = 'PENDING'
15. Database → Prisma: Return pending users list
16. Prisma → Admin Dashboard: Return pending users array
17. Admin Dashboard → Admin: Display list of pending students
   - Show: Name, Email, University, Faculty, Registration Date
   - Show count: "5 students awaiting approval"
18. Admin → Admin Dashboard: Click on student row
19. Admin Dashboard → Prisma: Query student by id (includes studentIdUrl)
20. Prisma → Database: SELECT * FROM users WHERE id = {studentId}
21. Database → Prisma: Return full user record
22. Admin Dashboard → Admin: Display student details page
   - Show student ID image from UploadThing URL
   - Show all registration information
23. Admin → Admin Dashboard: Click "Approve" button
24. Admin Dashboard → Admin: Show confirmation dialog
25. Admin → Admin Dashboard: Confirm approval
26. Admin Dashboard → Prisma: Update user SET role = 'APPROVED', approvedAt = NOW()
27. Prisma → Database: UPDATE users SET role = 'APPROVED', approvedAt = {timestamp}
28. Database → Prisma: Update successful
29. Admin Dashboard → Nodemailer: Send approval email
30. Nodemailer → Nodemailer: Load approval HTML template
31. Nodemailer → SMTP Server: Send email with login instructions
32. SMTP Server → Student Email: Deliver approval email
33. Nodemailer → Admin Dashboard: Email sent
34. Admin Dashboard → Admin: Show success message "Student approved"
35. Admin Dashboard → Prisma: Refresh pending users list
36. Admin: See updated list with student removed

**Alternative Flow - Rejection:**
- At step 23, if Admin clicks "Reject":
  - Show rejection reason dialog (optional)
  - DELETE user record OR update with rejected status
  - Send rejection email with reason (optional)
  - Refresh pending list

**Alternative Flow - Email Fails:**
- At step 33, if email fails to send:
  - Log error but complete approval
  - Admin sees warning: "Approved but email failed to send"
  - User can still login (email is courtesy, not required)

---

### Sequence 3: Login Authentication

**[DIAGRAM 6: Login Authentication Sequence Diagram - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The login sequence illustrates NextAuth credential validation, bcrypt password comparison, role checking, JWT session creation, and role-based redirection to appropriate dashboards.

**Participants:**
1. User (Student or Admin)
2. Login Form
3. NextAuth Credentials Provider
4. Bcrypt
5. Prisma Client
6. PostgreSQL Database
7. JWT Handler
8. Next.js Middleware
9. Protected Route

**Flow:**
1. User → Login Form: Navigate to `/login`
2. User → Login Form: Enter email and password
3. User → Login Form: Click "Login" button
4. Login Form → NextAuth: Submit credentials
5. NextAuth → Prisma: Query user by email
6. Prisma → Database: SELECT * FROM users WHERE email = {email}
7. Database → Prisma: Return user record (or null if not found)
8. Prisma → NextAuth: Return user (includes hashed password, role)
9. NextAuth → NextAuth: Check if user exists
10. NextAuth → Bcrypt: Compare plaintext password with hash
11. Bcrypt → Bcrypt: Run comparison (12 rounds)
12. Bcrypt → NextAuth: Password matches = true/false
13. **If password incorrect:**
    - NextAuth → Login Form: Return error "Invalid credentials"
    - Login Form → User: Display error message
    - Process ends
14. **If password correct:**
    - NextAuth → NextAuth: Password valid, proceed
15. NextAuth → JWT Handler: Create JWT token
16. JWT Handler → JWT Handler: Encode payload:
    ```json
    {
      "id": "clx123abc",
      "email": "student@example.com",
      "role": "APPROVED",
      "iat": 1699564800,
      "exp": 1702156800
    }
    ```
17. JWT Handler → NextAuth: Return JWT token
18. NextAuth → Database: Create session record
19. Database → NextAuth: Session created
20. NextAuth → Login Form: Authentication successful
21. Login Form → Next.js Middleware: Check user role
22. Next.js Middleware → Next.js Middleware: Read role from JWT
23. **Role-based Redirect:**
    - **If role = PENDING:**
      - Middleware → User: Redirect to `/waiting-approval`
      - Show message: "Your registration is pending admin approval"
    - **If role = APPROVED:**
      - Middleware → User: Redirect to `/courses`
      - User sees main application (courses page)
    - **If role = ADMIN:**
      - Middleware → User: Redirect to `/admin`
      - User sees admin dashboard
24. User: Access granted to appropriate dashboard

**Alternative Flows:**
- **A1: User not found**
  - At step 7, if no user with email exists
  - Return error "Invalid credentials" (don't reveal email doesn't exist for security)
- **A2: Password incorrect**
  - At step 12, if bcrypt comparison fails
  - Return error "Invalid credentials"
  - Log failed login attempt (security)
- **A3: Account locked** (future feature)
  - After 5 failed attempts, lock account for 15 minutes
  - Show error "Account temporarily locked"

---

## 4. Use Case Scenarios

### Use Case 1: Student Registration

**ID:** UC-S2-001
**Actors:** Student (unauthenticated)
**Description:** Student registers for UniShare by providing personal information, selecting university and faculty, uploading student ID, and creating secure password.

**Preconditions:**
- Student has valid email address
- Student has valid student ID document (image format)
- Student's university and faculty exist in system database
- Student has not previously registered with this email

**Flow of Events:**
1. Student navigates to registration page (`/register`)
2. Student sees registration form with fields:
   - Name (text input, required)
   - Email (email input, required, unique)
   - Password (password input, required, min 8 characters)
   - University (dropdown, required)
   - Faculty (dropdown, required, depends on university)
   - Student ID (file upload, required, max 4MB)
3. Student enters full name
4. Student enters email address
5. Student creates password (frontend shows strength indicator)
6. Student clicks university dropdown
7. System fetches all universities from database
8. System displays universities in dropdown (Qaiwan, Salahaddin, Sulaimani)
9. Student selects university
10. System triggers faculty dropdown update
11. System fetches faculties WHERE universityId = selected university
12. System displays faculties in dropdown (filtered by university)
13. Student selects faculty from dropdown
14. Student clicks "Upload Student ID" button
15. UploadThing opens file picker dialog
16. Student selects image file from device (JPG, PNG, GIF, WEBP)
17. UploadThing validates file:
    - Check file type is image
    - Check file size ≤ 4MB
18. UploadThing uploads file to S3 CDN
19. UploadThing returns file URL to form
20. System displays upload success message with preview
21. Student reviews all entered information
22. Student clicks "Register" button
23. System validates form client-side using Zod schema:
    - Name: not empty, 2-100 characters
    - Email: valid email format, not empty
    - Password: min 8 characters
    - University: valid CUID
    - Faculty: valid CUID, belongs to selected university
    - Student ID URL: valid UploadThing URL
24. If validation fails, system shows field-specific errors
25. If validation passes, system submits to server action
26. Server validates all inputs again (never trust client)
27. Server checks if email already exists in database
28. If email exists, return error "Email already registered"
29. Server hashes password using bcrypt (12 salt rounds)
30. Server creates user record in database:
    ```sql
    INSERT INTO users (
      name, email, password, role, universityId, facultyId, studentIdUrl
    ) VALUES (
      {name}, {email}, {hashedPassword}, 'PENDING', {universityId}, {facultyId}, {studentIdUrl}
    )
    ```
31. Database generates CUID for user id
32. Database sets createdAt and updatedAt timestamps
33. Server prepares confirmation email:
    - Subject: "Welcome to UniShare - Registration Received"
    - Body: HTML template with university branding
    - Content: "Your registration is pending admin approval. You'll receive an email once approved."
34. Server sends email via Nodemailer (Gmail SMTP)
35. Nodemailer connects to SMTP server (smtp.gmail.com:587)
36. SMTP server delivers email to student's inbox
37. Server returns success response
38. Frontend redirects student to `/waiting-approval`
39. Student sees waiting page:
    - Message: "Your registration is pending approval"
    - Status indicator: "We'll email you once an admin reviews your application"
    - Estimated time: "Usually within 24-48 hours"

**Postconditions:**
- User record created in database with role=PENDING
- Student ID uploaded to UploadThing CDN
- Confirmation email sent to student
- Student redirected to waiting approval page
- Admin can now see this user in pending approvals list

**Alternative Flows:**
- **A1: Email already exists**
  - At step 28, if email exists, return error
  - Frontend displays error: "This email is already registered"
  - Student can try different email or use "Forgot Password"
- **A2: File upload fails**
  - At step 18, if upload fails (network error, timeout)
  - UploadThing retries automatically (3 attempts)
  - If all attempts fail, show error: "Upload failed, please try again"
  - Student can retry file upload
- **A3: File size exceeds limit**
  - At step 17, if file > 4MB
  - UploadThing rejects file immediately
  - Show error: "File too large. Maximum size is 4MB"
  - Student selects smaller file or compresses image
- **A4: Invalid file type**
  - At step 17, if file is not image (e.g., PDF)
  - Show error: "Only images are allowed (JPG, PNG, GIF, WEBP)"
  - Student selects image file
- **A5: Faculty doesn't belong to university**
  - At step 26, if faculty validation fails
  - Server rejects with error (prevents client-side tampering)
  - Show error: "Invalid faculty selection"
- **A6: Email fails to send**
  - At step 36, if SMTP error (server down, auth fails)
  - Log error but complete registration
  - User is still created, just doesn't receive email
  - Admin approval will trigger email again

**Priority:** Critical

---

### Use Case 2: Admin Approval

**ID:** UC-S2-002
**Actors:** Admin (authenticated with ADMIN role)
**Description:** Admin reviews pending student registrations, verifies uploaded student IDs, and approves or rejects applications with email notifications.

**Preconditions:**
- Admin must be authenticated (logged in)
- Admin user has role = ADMIN
- At least one user exists with role = PENDING
- Student ID images are accessible via UploadThing URLs

**Flow of Events:**
1. Admin logs in to UniShare
2. NextAuth verifies credentials and role
3. Middleware checks role = ADMIN
4. System redirects Admin to admin dashboard (`/admin`)
5. Admin sees dashboard overview:
   - Pending approvals count: "5 students awaiting approval"
   - Recent activity summary
   - Quick links
6. Admin clicks "Pending Approvals" or navigates to `/admin/approvals`
7. System queries database for pending users:
   ```sql
   SELECT id, name, email, createdAt, university.name, faculty.name
   FROM users
   LEFT JOIN universities ON users.universityId = universities.id
   LEFT JOIN faculties ON users.facultyId = faculties.id
   WHERE users.role = 'PENDING'
   ORDER BY createdAt DESC
   ```
8. System displays pending users in table:
   - Columns: Name, Email, University, Faculty, Registration Date, Actions
   - Sortable by date, name, university
   - Search box for filtering by name/email
9. Admin scans list of pending students
10. Admin clicks on a student row to view details
11. System navigates to student detail page (`/admin/approvals/{userId}`)
12. System fetches full user record from database
13. System displays comprehensive student information:
    - **Personal Info:** Name, Email
    - **Academic Info:** University, Faculty
    - **Registration Details:** Registered on {date}, Status: Pending
    - **Student ID Verification:** Display uploaded image from UploadThing URL
14. Admin reviews student ID image:
    - Checks if ID is from correct university
    - Verifies student name matches ID
    - Checks ID appears authentic (not photoshopped)
15. Admin reviews university and faculty selection:
    - Checks if selections are appropriate
    - Verifies faculty belongs to selected university
16. **Admin Decision: Approve**
    - Admin clicks "Approve Student" button
    - System shows confirmation dialog:
      - "Are you sure you want to approve {student name}?"
      - "They will receive an email and can login immediately"
      - Buttons: "Confirm Approval" | "Cancel"
    - Admin clicks "Confirm Approval"
17. System processes approval:
    - Update database:
      ```sql
      UPDATE users
      SET role = 'APPROVED', approvedAt = CURRENT_TIMESTAMP
      WHERE id = {userId}
      ```
    - Database updates record
    - Database returns success
18. System prepares approval email:
    - Subject: "🎉 Your UniShare Account is Approved!"
    - Body: HTML template with:
      - Congratulations message
      - Login instructions
      - Link to login page: `https://unishare.com/login`
      - Getting started guide
19. System sends email via Nodemailer
20. Nodemailer connects to SMTP server
21. SMTP delivers email to student's inbox
22. System shows success toast: "Student approved successfully"
23. System updates pending approvals list (removes approved student)
24. System logs approval action:
    - Log: "Admin {adminEmail} approved {studentEmail} at {timestamp}"
25. Admin sees updated pending list with one less student

**Postconditions:**
- User role updated from PENDING to APPROVED
- approvedAt timestamp set to current time
- Approval email sent to student
- Student can now login and access main application
- Admin dashboard shows updated pending count

**Alternative Flow - Rejection:**
- At step 16, if Admin clicks "Reject Student":
  - Show rejection dialog:
    - "Why are you rejecting this application?" (optional textarea)
    - "Delete account permanently" (checkbox, default: checked)
    - Buttons: "Confirm Rejection" | "Cancel"
  - If confirmed:
    - If "Delete account" checked:
      - DELETE user record from database
      - Note: Cascade delete removes associated Account and Session records
    - If "Delete account" unchecked:
      - Update role to "REJECTED" (requires adding REJECTED to Role enum)
      - Set rejectedAt timestamp
    - Send rejection email:
      - Subject: "UniShare Registration - Update"
      - Body: "Your registration was not approved. Reason: {reason}"
    - Show success toast: "Student rejected"
    - Refresh pending list

**Alternative Flows:**
- **A1: Email fails to send**
  - At step 21, if SMTP error occurs
  - Log error: "Failed to send approval email to {email}"
  - Show warning toast: "Approved but email failed to send"
  - Approval still completes (email is courtesy, not critical)
  - Student can still login
- **A2: Student already approved**
  - At step 17, if another admin approved simultaneously
  - Database update affects 0 rows (role already APPROVED)
  - Show info message: "This student was already approved by another admin"
  - Redirect to pending list
- **A3: Student record deleted**
  - At step 12, if user not found (deleted by another admin)
  - Show error: "Student not found. They may have been rejected by another admin"
  - Redirect to pending list

**Priority:** Critical

---

### Use Case 3: Student Login

**ID:** UC-S2-003
**Actors:** Student (APPROVED) or Admin (ADMIN)
**Description:** User logs in using email and password credentials, system validates using bcrypt, checks role, creates JWT session, and redirects based on role.

**Preconditions:**
- User has registered account in database
- User's role is APPROVED or ADMIN (PENDING users redirected to waiting page)
- User knows their email and password
- NextAuth is configured and working

**Flow of Events:**
1. User navigates to login page (`/login`)
2. System displays login form:
   - Email input field
   - Password input field (masked)
   - "Remember me" checkbox (extends session to 30 days)
   - "Forgot password?" link (future feature)
   - "Login" button
   - "Don't have an account? Register" link
3. User enters email address
4. User enters password
5. User optionally checks "Remember me"
6. User clicks "Login" button
7. System validates inputs client-side:
   - Email: not empty, valid format
   - Password: not empty
8. If validation fails, show inline errors
9. If validation passes, submit to NextAuth
10. NextAuth receives credentials (email, password)
11. NextAuth queries database for user:
    ```sql
    SELECT id, name, email, password, role, universityId, facultyId
    FROM users
    WHERE email = {email}
    ```
12. Database returns user record (or null if not found)
13. **If user not found:**
    - NextAuth returns error "Invalid credentials"
    - Don't reveal whether email exists (security best practice)
    - Login form shows error message
    - Process ends
14. **If user found:**
    - NextAuth proceeds with password verification
15. NextAuth extracts hashed password from user record
16. NextAuth calls bcrypt to compare:
    - Plaintext password: what user entered
    - Hashed password: from database (60 characters)
    - Salt rounds: 12 (embedded in hash)
17. Bcrypt runs comparison algorithm:
    - Extracts salt from stored hash
    - Hashes plaintext password with extracted salt
    - Compares result with stored hash
    - Returns true/false
18. **If password incorrect:**
    - NextAuth returns error "Invalid credentials"
    - Login form shows error message
    - Log failed attempt (security monitoring)
    - Process ends
19. **If password correct:**
    - NextAuth proceeds with authentication
20. NextAuth checks user role:
    - Extracts role from user record (PENDING | APPROVED | ADMIN)
21. NextAuth creates JWT token:
    ```json
    {
      "id": "clx123abc",
      "email": "student@example.com",
      "name": "Rawa Dara",
      "role": "APPROVED",
      "universityId": "clx456def",
      "facultyId": "clx789ghi",
      "iat": 1699564800,
      "exp": 1702156800
    }
    ```
22. NextAuth signs token with `NEXTAUTH_SECRET`
23. NextAuth creates session record in database:
    ```sql
    INSERT INTO sessions (sessionToken, userId, expires)
    VALUES ({token}, {userId}, {expirationDate})
    ```
24. If "Remember me" checked, set expiration to 30 days
25. If "Remember me" not checked, set expiration to browser session
26. NextAuth sets session cookie in browser:
    - Cookie name: `next-auth.session-token`
    - Value: JWT token
    - HttpOnly: true (prevents JavaScript access)
    - Secure: true (HTTPS only in production)
    - SameSite: Lax (CSRF protection)
27. NextAuth returns success to login form
28. Login form triggers redirect based on role
29. Next.js middleware reads JWT from cookie
30. Middleware extracts role from JWT
31. **Role-Based Redirect:**
    - **If role = PENDING:**
      - Redirect to `/waiting-approval`
      - Show page: "Your registration is pending admin approval"
      - Show status: "Check your email for updates"
      - No access to main features
    - **If role = APPROVED:**
      - Redirect to `/courses` (main application entry point)
      - User sees courses page (empty state if new user)
      - Full access to all student features
    - **If role = ADMIN:**
      - Redirect to `/admin` (admin dashboard)
      - User sees pending approvals, statistics
      - Access to admin-only features
32. User successfully authenticated and using application

**Postconditions:**
- User authenticated with valid JWT session
- Session stored in database with expiration
- User redirected to appropriate page based on role
- User can access role-appropriate features
- Session persists across browser tabs
- Session expires after 30 days (or browser close if "Remember me" not checked)

**Alternative Flows:**
- **A1: Email not found**
  - At step 12, if no user with email exists
  - Show error: "Invalid credentials"
  - Don't reveal email doesn't exist (security)
  - User can try again or register
- **A2: Password incorrect**
  - At step 18, if bcrypt comparison fails
  - Show error: "Invalid credentials"
  - Log failed attempt with timestamp and IP (security)
  - After 5 failed attempts, implement rate limiting (future)
- **A3: PENDING user tries to login**
  - At step 30, if role = PENDING
  - Redirect to `/waiting-approval`
  - Show message: "Your account is pending approval"
  - User cannot access main application until approved
- **A4: Session creation fails**
  - At step 23, if database error
  - NextAuth falls back to JWT-only mode
  - User still authenticated (token in cookie)
  - Session not persisted in database (minor issue)

**Priority:** Critical

---

## 5. Data Description

### Registration Workflow

The registration workflow begins when a student accesses the signup page. The form implements cascading dropdowns where selecting a university dynamically filters the available faculties to only show faculties belonging to that university, preventing invalid university-faculty combinations. The student uploads a photo of their student ID card via UploadThing, which validates the file type (images only) and size (maximum 4MB), then uploads to a CDN (S3) and returns a secure URL.

Upon form submission, client-side validation using Zod schemas checks all required fields, email format, and password strength (minimum 8 characters). The server receives the form data and performs secondary validation (never trust client input). The server queries the database to check if the email already exists using a unique index on the email column for fast lookup. If the email is unique, the server passes the plaintext password to bcrypt with 12 salt rounds, which generates a 60-character hash string containing the salt, cost factor, and encrypted password.

The server then creates a new User record with role set to PENDING, stores the UploadThing URL in studentIdUrl field, and sets createdAt/updatedAt timestamps automatically via Prisma. After successful database insertion, the server prepares an HTML email using a template with the university's name and sends it via Nodemailer through Gmail's SMTP server. The email confirms registration and explains that the student will receive another email once an admin approves their application. Finally, the server responds with success, and the frontend redirects the student to a waiting approval page that displays their pending status.

### Admin Approval Workflow

Admins access the approval dashboard after logging in with their ADMIN role account. The dashboard displays a list of all users where role equals PENDING, sorted by registration date (newest first). Each row shows the student's name, email, university name, faculty name, and registration date. The list supports searching by name or email for quick filtering when there are many pending students.

When an admin clicks on a student row, the detail page loads displaying all registration information plus the uploaded student ID image fetched from UploadThing via the stored URL. The admin verifies that the student ID shows the correct university logo, the name on the ID matches the registered name, and the ID appears authentic (checking for signs of tampering or Photoshop). The admin also verifies that the selected faculty logically belongs to the selected university.

Upon clicking "Approve," a confirmation dialog appears to prevent accidental approvals. After confirmation, the server updates the user record: sets role from PENDING to APPROVED and sets approvedAt to the current timestamp. Prisma generates and executes the UPDATE query, and the database returns the number of affected rows (should be 1). The server then prepares an approval email with an HTML template containing congratulations, a link to the login page, and basic getting-started instructions. Nodemailer sends the email through SMTP, and upon successful delivery, the server returns success to the admin dashboard, which shows a success toast and removes the approved student from the pending list.

If the admin clicks "Reject" instead, a dialog appears asking for an optional rejection reason. Upon confirmation, the server either deletes the user record entirely (cascade delete automatically removes associated Account and Session records) or updates the role to REJECTED (requires adding REJECTED to the Role enum in a future sprint). The server sends a rejection email explaining that the registration was not approved, optionally including the admin's reason. The admin dashboard shows a success toast and refreshes the pending list.

### Login Authentication Workflow

The login workflow begins when a user navigates to the login page and enters their email and password. Client-side validation checks that both fields are not empty and that the email matches a valid format. Upon clicking "Login," the form submits credentials to NextAuth's authorize function.

NextAuth queries the database for a user record matching the provided email. If no user is found, NextAuth returns an error "Invalid credentials" without revealing whether the email exists (security best practice to prevent email enumeration attacks). If a user is found, NextAuth extracts the hashed password from the user record and passes both the plaintext password and the hash to bcrypt's compare function.

Bcrypt extracts the salt from the stored hash (the salt is embedded in the hash string), hashes the plaintext password using the extracted salt and the same cost factor (12 rounds), and compares the resulting hash with the stored hash. If they match, bcrypt returns true; otherwise, false. If the password is incorrect, NextAuth returns "Invalid credentials," and the failed attempt is logged for security monitoring (future feature: implement account lockout after 5 failed attempts).

If the password is correct, NextAuth creates a JWT token containing the user's id, email, name, role, universityId, and facultyId. The token is signed with the `NEXTAUTH_SECRET` environment variable to prevent tampering. NextAuth also creates a session record in the database storing the session token and expiration date (30 days from now if "Remember me" is checked, otherwise session expires when browser closes). The JWT token is set as an HttpOnly cookie in the user's browser, preventing JavaScript access and protecting against XSS attacks.

Next.js middleware then reads the JWT from the cookie, decodes it to extract the user's role, and implements role-based redirection: PENDING users are redirected to `/waiting-approval` where they see a message explaining their status; APPROVED users are redirected to `/courses` (the main application entry point); ADMIN users are redirected to `/admin` (the admin dashboard). The session persists across browser tabs and survives browser restarts (if "Remember me" was checked). Sessions automatically expire after 30 days, at which point the user must login again.

---

## 6. Data Dictionary

### Entity: User

**Description:** Stores student and admin information including authentication credentials, role-based permissions, and institutional associations. Sprint 2 adds active usage for registration and authentication workflows.

| Attribute | Datatype | Description | Constraints | Sprint 2 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier for user | Primary Key, Auto-generated | Created during registration |
| name | String | Full name of student/admin | Not Null, Min: 2, Max: 100 | Entered in registration form |
| email | String | Email address (login identifier) | Unique, Not Null, Valid format | Used for login, uniqueness check |
| password | String | Bcrypt hashed password | Not Null, Hash length: 60 chars | Hashed with bcrypt (12 rounds) during registration |
| profileImage | String? | URL to profile avatar | Optional, Valid URL | Not used in Sprint 2 (future) |
| avatarIndex | Int | Avatar color index (0-9) | Default: 0 | Not used in Sprint 2 (future) |
| role | Enum (Role) | User access level | Default: PENDING | Set to PENDING on registration, APPROVED on admin approval |
| universityId | String | Reference to university | Foreign Key, Not Null | Selected in registration form dropdown |
| facultyId | String | Reference to faculty | Foreign Key, Not Null | Selected in registration form (filtered by university) |
| studentIdUrl | String | UploadThing URL for student ID | Not Null | Uploaded via UploadThing during registration |
| approvedAt | DateTime? | Timestamp of admin approval | Nullable | Set when admin approves, NULL for PENDING users |
| createdAt | DateTime | Registration timestamp | Auto-generated | Set automatically when user created |
| updatedAt | DateTime | Last update timestamp | Auto-updated | Updated when role changes to APPROVED |

**Sprint 2 Workflows:**
- **Registration:** User created with role=PENDING, studentIdUrl uploaded, password hashed
- **Admin Approval:** role updated from PENDING to APPROVED, approvedAt set
- **Login:** Email/password validated, role checked for redirect

---

### Entity: University

**Description:** Stores information about educational institutions.

| Attribute | Datatype | Description | Sprint 2 Usage |
|-----------|----------|-------------|----------------|
| id | String (CUID) | Unique identifier | Used in registration form for university selection |
| name | String (Unique) | Official university name | Displayed in dropdown, used in emails |
| logo | String? | University logo URL | Future: Display in emails |
| description | String? | Brief description | Not used in Sprint 2 |
| website | String? | Official website | Not used in Sprint 2 |
| location | String? | City/region | Not used in Sprint 2 |
| createdAt | DateTime | Record creation | Auto-generated |
| updatedAt | DateTime | Last update | Auto-updated |

**Relationships:**
- **Has Many:** Faculty (1:N) - Used for cascading dropdown
- **Has Many:** User (1:N) - Students belong to universities

---

### Entity: Faculty

**Description:** Stores information about academic faculties/departments within universities.

| Attribute | Datatype | Description | Sprint 2 Usage |
|-----------|----------|-------------|----------------|
| id | String (CUID) | Unique identifier | Used in registration form for faculty selection |
| name | String | Faculty name | Displayed in dropdown filtered by university |
| code | String? | Faculty abbreviation | Not used in Sprint 2 |
| description | String? | Brief description | Not used in Sprint 2 |
| universityId | String | Reference to university | Used to filter faculties by university in registration |
| createdAt | DateTime | Record creation | Auto-generated |
| updatedAt | DateTime | Last update | Auto-updated |

**Relationships:**
- **Belongs To:** University (N:1) - Each faculty belongs to one university
- **Has Many:** User (1:N) - Students belong to faculties

**Sprint 2 Implementation:**
- Dropdown loads faculties WHERE universityId = {selectedUniversity}
- Validates that selected faculty belongs to selected university

---

### Entity: Account (NextAuth)

**Description:** NextAuth account table for managing authentication providers.

| Attribute | Datatype | Description | Sprint 2 Usage |
|-----------|----------|-------------|----------------|
| id | String (CUID) | Unique identifier | Auto-generated |
| userId | String | Reference to user | Links to User.id |
| type | String | Account type | Set to "credentials" for email/password |
| provider | String | Auth provider name | Set to "credentials" |
| providerAccountId | String | Provider-specific ID | Same as userId for credentials |
| refresh_token | String? | OAuth refresh token | NULL for credentials provider |
| access_token | String? | OAuth access token | NULL for credentials provider |
| expires_at | Int? | Token expiration | NULL for credentials provider |
| token_type | String? | Type of token | NULL for credentials provider |
| scope | String? | OAuth scope | NULL for credentials provider |
| id_token | String? | OAuth ID token | NULL for credentials provider |
| session_state | String? | OAuth session state | NULL for credentials provider |

**Sprint 2 Usage:**
- Created automatically on first login
- Currently only used for credentials provider
- Future: Support Google OAuth, Discord OAuth

---

### Entity: Session (NextAuth)

**Description:** NextAuth session table for JWT session management.

| Attribute | Datatype | Description | Sprint 2 Usage |
|-----------|----------|-------------|----------------|
| id | String (CUID) | Unique identifier | Auto-generated |
| sessionToken | String (Unique) | JWT session token | Unique token stored in HttpOnly cookie |
| userId | String | Reference to user | Links to User.id |
| expires | DateTime | Session expiration | Set to 30 days from login (if "Remember me" checked) |

**Sprint 2 Usage:**
- Created on successful login
- Token stored in browser cookie (HttpOnly, Secure, SameSite)
- Expires after 30 days or browser close
- Queried on each protected route access to verify session

**Indexes:**
- sessionToken (unique) - Fast lookup for session validation
- expires - For cleanup cron jobs

---

### Entity: VerificationToken (NextAuth)

**Description:** NextAuth verification token table for email verification and password reset.

| Attribute | Datatype | Description | Sprint 2 Usage |
|-----------|----------|-------------|----------------|
| identifier | String | User identifier (email) | Not used in Sprint 2 (future feature) |
| token | String (Unique) | Unique verification token | Not used in Sprint 2 |
| expires | DateTime | Token expiration | Not used in Sprint 2 |

**Sprint 2 Usage:** Not implemented yet. Future use cases:
- Email verification on registration (send link to verify email)
- Password reset workflow (send link to reset password)

---

### Enum: Role

**Description:** Defines user permission levels in the system.

| Value | Description | Sprint 2 Permissions | Redirect On Login |
|-------|-------------|----------------------|-------------------|
| ADMIN | Administrator | View/approve/reject pending registrations, access admin dashboard, approve students | `/admin` |
| APPROVED | Verified Student | Full access to all student features: create courses, upload resources, share courses, collaborate on notes (Sprint 3+) | `/courses` |
| PENDING | Awaiting Approval | No access to main features, can only view waiting approval page, can login but immediately redirected | `/waiting-approval` |

**Sprint 2 Workflow:**
1. Student registers → role set to PENDING
2. Admin approves → role updated to APPROVED
3. Student logs in → redirected based on role

---

## Sprint 2 Success Criteria

✅ **Student Registration:**
- [x] Registration form with university/faculty cascading dropdowns
- [x] Zod schema validation for all form fields
- [x] Email uniqueness check before creating user
- [x] Student ID upload via UploadThing (4MB max, images only)
- [x] Password hashing with bcrypt (12 salt rounds)
- [x] User created with role=PENDING
- [x] Confirmation email sent via Nodemailer
- [x] Redirect to waiting approval page after registration

✅ **Admin Approval:**
- [x] Admin dashboard with pending users list
- [x] Student detail page showing uploaded student ID
- [x] Approve functionality (update role to APPROVED, set approvedAt)
- [x] Reject functionality (delete user or mark rejected)
- [x] Approval email sent via Nodemailer
- [x] Rejection email sent (optional reason)
- [x] Search/filter pending users by name or email

✅ **Authentication:**
- [x] Login form with email and password
- [x] NextAuth Credentials provider integration
- [x] Bcrypt password comparison on login
- [x] JWT session creation with user id and role
- [x] 30-day session expiration
- [x] HttpOnly secure cookies for session storage
- [x] Role-based redirects:
  - PENDING → `/waiting-approval`
  - APPROVED → `/courses`
  - ADMIN → `/admin`
- [x] Logout functionality with session cleanup

✅ **Email System:**
- [x] Nodemailer configured with Gmail SMTP
- [x] HTML email templates for branding
- [x] Registration confirmation emails
- [x] Approval notification emails with login link
- [x] Rejection notification emails
- [x] Error handling for failed email delivery

✅ **Security:**
- [x] Passwords never stored in plaintext
- [x] Bcrypt salt rounds set to 12 (industry standard)
- [x] Failed login attempts logged (foundation for rate limiting)
- [x] Email enumeration prevented (same error for invalid email/password)
- [x] HttpOnly cookies prevent XSS token theft
- [x] SameSite cookies prevent CSRF attacks

---

## Technical Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend Framework** | Next.js (App Router) | 15.1+ | React-based UI with server actions |
| **Language** | TypeScript | 5.0+ | Type-safe development |
| **Database** | PostgreSQL (NeonDB) | 16+ | User, session, and registration data |
| **ORM** | Prisma | 6.5+ | Type-safe database queries |
| **Authentication** | NextAuth.js | 5.0 (beta) | JWT sessions, credentials provider |
| **Password Hashing** | bcrypt | 5.1+ | Secure password hashing (12 rounds) |
| **Form Validation** | Zod | 3.22+ | Client and server-side validation |
| **File Upload** | UploadThing | Latest | Student ID image uploads (S3 CDN) |
| **Email Service** | Nodemailer | 6.9+ | SMTP email delivery (Gmail) |
| **Styling** | Tailwind CSS + Shadcn UI | Latest | Modern responsive UI components |

---

## Next Sprint Preview (Sprint 3)

Sprint 3 will implement the core course management features:

### 1. Student-Led Course Creation:
- Empty course list initially (students start with zero courses)
- "Create Course" button and modal form
- Course fields: title, description, color (color picker)
- Courses are private by default (only creator can see)
- Course detail page with tabs for resources

### 2. Resource Cards System:
- Auto-create 4 predefined resource cards per course:
  - **Assignments:** File uploads enabled, starts empty
  - **Tasks:** No file uploads, text-based to-do items
  - **Content:** File uploads for slides, readings, PDFs
  - **Notes:** Links to collaborative note editor
- Custom resource card creation
- File upload via UploadThing (16MB max, multiple file types)
- Resource organization by card type

### 3. Course Detail Pages:
- View all resources for a course
- Upload files to resource cards
- Edit course information (title, description, color)
- Delete courses (owner only)

---

**End of Sprint 2 Iteration Report**
