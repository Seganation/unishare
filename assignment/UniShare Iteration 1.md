**UniShare - Sprint 1 Iteration Report**

**Application Development - SCSJ3104** 

**Qaiwan International University**

**Prepared by:**

**Matric **

**Team Members**

**Number**

Rawa Dara Radha

Parwar Yassin 

qadr

Drud Zmnako

Muhamad ahmad

Aland haval

**Table of Contents**

1. 

Use Case Diagrams

2. 

Domain Model \(UML Diagram\)

3. 

Sequence Diagrams

4. 

Use Case Scenarios

5. 

Data Description

6. 

Data Dictionary



**1. Use Case Diagrams**

**System Administrator Use Case**

**The system administrator use case illustrates the initial platform setup where the admin** **configures the database, seeds initial data \(universities and faculties\), sets up authentication** **providers, and configures file storage. The system validates configurations and initializes** **the NextAuth session management with JWT tokens. **



**Database Administrator Use Case**

The database administrator use case shows how Prisma migrations are executed to create database tables, establish relationships between entities \(University, Faculty, User, Account, Session\), and validate schema integrity. The workflow includes running migrations, seeding data, and verifying database connections. 



**2. Domain Model \(UML Diagram\)**

The domain model illustrates the core entities for Sprint 1: **User**, **University**, **Faculty**, **Account**, **Session**, and **VerificationToken** tables. Key relationships include:

•

User belongs to one University and one Faculty

•

User has one or more Accounts \(NextAuth authentication\)

•

User has multiple Sessions \(JWT-based session management\)

•

Faculty belongs to one University

•

University has multiple Faculties and Users

•

User can have multiple VerificationTokens for email verification The model establishes the foundational data structure that enables student registration, admin approval workflows, and role-based access control to be implemented in Sprint 2. 

**3. Sequence Diagrams**

**Platform Initialization Sequence**



The 

initialization sequence shows the interaction between Developer, Terminal, Prisma CLI, Database, and Configuration Files. The flow includes:



1. 

Developer runs npm install to install dependencies 2. 

Developer configures .env file with DATABASE\_URL and NextAuth settings 3. 

Developer executes npx prisma migrate dev to create database schema 4. 

Prisma CLI connects to PostgreSQL \(NeonDB\) 5. 

Database creates tables based on Prisma schema 6. 

Developer runs npx prisma db seed to populate initial data 7. 

Seed script inserts universities and faculties 8. 

Database confirms successful data insertion 9. 

Developer verifies setup by checking database tables **NextAuth Session Creation Sequence**

This 

sequence 



demonstrates how NextAuth creates and manages user sessions using JWT: 1. 

User attempts to access protected route

2. 

Next.js middleware checks for session token 3. 

NextAuth verifies JWT token validity

4. 

If valid, NextAuth decodes token to extract user information 5. 

NextAuth queries database for current user data 6. 

Database returns user record with role information 7. 

NextAuth creates session object with user details 8. 

Session is passed to protected route

9. 

User gains access based on role \(PENDING/APPROVED/ADMIN\) **UploadThing Configuration Sequence**

The UploadThing sequence illustrates the setup and configuration process: 1. 

Developer creates UploadThing API route handler 2. 

Developer configures file upload middleware with size limits 3. 

Developer defines upload endpoints \(studentIdUploader, resourceUploader\) 4. 

UploadThing validates API key from environment variables 5. 

System registers upload endpoints with UploadThing service 6. 

UploadThing returns endpoint URLs for client usage 7. 

Developer integrates UploadThing components in frontend 8. 

System is ready to handle file uploads

**4. Use Case Scenarios**

**Use Case 1: Database Schema Migration**

**ID:** UC001 

**Actors:** Developer, Database Administrator **Description:** Execute Prisma migrations to create the database schema with all required tables and relationships. 

**Preconditions:**

•

PostgreSQL database provisioned \(NeonDB\)

•

DATABASE\_URL configured in .env file

•

Prisma schema defined in prisma/schema.prisma **Flow of Events:**

1. 

Developer opens terminal

2. 

Developer navigates to project directory

3. 

Developer runs npx prisma migrate dev --name init 4. 

Prisma CLI reads schema file

5. 

Prisma generates SQL migration file

6. 

Prisma connects to PostgreSQL database

7. 

Prisma executes CREATE TABLE statements

8. 

Database creates User, University, Faculty, Account, Session, VerificationToken tables 9. 

Database establishes foreign key constraints 10. Prisma confirms migration success

11. Prisma generates Prisma Client

12. Developer verifies tables exist in database **Postconditions:** Database schema created with all tables, relationships, and constraints in place **Alternative Flows:**

•

If database connection fails, show connection error and halt migration

•

If schema has errors, display validation errors and prevent migration

•

If migration already exists, prompt to reset or create new migration **Priority:** Critical

**Use Case 2: Seed Universities and Faculties** **ID:** UC002 

**Actors:** Developer, Database Administrator **Description:** Populate the database with initial university and faculty data to enable student registration. 

**Preconditions:**

•

Database schema migrated successfully

•

Seed script defined in prisma/seed.ts

•

Seed data prepared \(university names and associated faculties\) **Flow of Events:**

1. Developer runs npx prisma db seed

2. Prisma executes seed script

3. Seed script connects to database via Prisma Client 4. Script creates University records:

◦

Qaiwan International University

◦

Salahaddin University

◦

University of Sulaimani

5. For each university, script creates Faculty records:

◦

Computer Science, Engineering, Business, Medicine, etc. 

6. Database stores university and faculty records 7. Database assigns CUIDs to all records

8. Seed script confirms successful insertion 9. Developer queries database to verify data **Postconditions:** Database contains universities and faculties ready for student selection during registration

**Alternative Flows:**

•

If university name already exists, skip duplicate and continue

•

If foreign key constraint fails, log error and rollback transaction

•

If database connection lost, retry seed operation once **Priority:** High

**Use Case 3: Configure NextAuth with Credentials Provider**

**ID:** UC003 

**Actors:** Developer 

**Description:** Set up NextAuth with credentials provider for email/password authentication and configure JWT session strategy. 

**Preconditions:**

•

NextAuth package installed \(npm install next-auth\)

•

Database schema includes Account and Session tables

•

Environment variables configured \(NEXTAUTH\_URL, NEXTAUTH\_SECRET\) **Flow of Events:**

1. 

Developer creates /app/api/auth/\[...nextauth\]/route.ts 2. 

Developer imports NextAuth and Prisma Client 3. 

Developer configures Credentials Provider

4. 

Developer defines authorize function with email/password validation 5. 

Developer sets session strategy to JWT

6. 

Developer configures callbacks \(jwt, session\) 7. 

Developer defines pages \(signIn, signOut, error\) 8. 

Developer configures adapter for Prisma

9. 

Developer tests authentication flow

10. NextAuth generates JWT secret if not provided 11. System creates session table entries on login 12. Developer verifies session persistence **Postconditions:** NextAuth configured and ready for user authentication with role-based access control

**Alternative Flows:**

•

If NEXTAUTH\_SECRET missing, generate and prompt developer to add to .env

•

If database adapter fails, show error and use JWT-only mode

•

If session callback fails, log error and return default session **Priority:** Critical

**Use Case 4: Setup UploadThing for File Uploads** **ID:** UC004 

**Actors:** Developer 

**Description:** Configure UploadThing for secure file uploads including student ID verification and resource files. 

**Preconditions:**

•

UploadThing account created

•

UPLOADTHING\_SECRET and UPLOADTHING\_APP\_ID in environment variables

•

UploadThing package installed

**Flow of Events:**

1. 

Developer creates /app/api/uploadthing/core.ts 2. Developer imports createUploadthing

3. Developer defines upload endpoints:

◦

studentIdUploader: Max 4MB, images only

◦

resourceUploader: Max 16MB, PDF/images/docs 4. Developer sets middleware for authentication checks 5. 

Developer creates /app/api/uploadthing/route.ts route handler 6. Developer configures UploadThing client in /lib/uploadthing.ts 7. Developer creates UploadButton and UploadDropzone components 8. Developer tests file upload to UploadThing CDN

9. UploadThing returns file URL

10. Developer stores URL in database

**Postconditions:** UploadThing configured and ready for student ID and resource file uploads **Alternative Flows:**

•

If API key invalid, display error and prompt developer to check credentials

•

If file size exceeds limit, reject upload and show error message

•

If upload fails, retry once then show error to user **Priority:** High

**Use Case 5: Create Base User Model with Roles** **ID:** UC005 

**Actors:** Developer 

**Description:** Define User model in Prisma schema with role-based access control \(PENDING, APPROVED, ADMIN\). 

**Preconditions:**

•

Prisma CLI installed

•

Database connection established

**Flow of Events:**

1. 

Developer opens prisma/schema.prisma

2. Developer defines Role enum with values: PENDING, APPROVED, ADMIN

3. Developer creates User model with fields:

◦

id \(CUID primary key\)

◦

name, email, password

◦

role \(default: PENDING\)

◦

universityId, facultyId \(foreign keys\)

◦

studentIdUrl

◦

approvedAt \(nullable\)

◦

createdAt, updatedAt

4. Developer defines relationships to University and Faculty 5. Developer adds unique constraint on email 6. Developer adds indexes for performance

7. Developer runs npx prisma format to validate schema 8. Developer runs migration to create User table 9. Database creates User table with Role enum 10. Developer verifies table structure

**Postconditions:** User model created with role-based access control ready for authentication system

**Alternative Flows:**

•

If schema syntax invalid, display error and prevent migration

•

If foreign key references missing tables, create dependencies first

•

If enum values conflict, choose new enum name **Priority:** Critical

**5. Data Description**

**Core Entities**

**User Entity:** The User entity represents all system users including students and administrators. 

Each user has authentication credentials \(email and hashed password\), role-based permissions \(PENDING for newly registered students awaiting approval, APPROVED for verified students with full access, ADMIN for administrators with approval privileges\), and institutional associations \(linked to a specific university and faculty\). The entity includes fields for profile information, student ID verification URL, approval timestamp, and audit timestamps. 

**University Entity:** The University entity stores information about educational institutions registered on the UniShare platform. Each university record includes a unique identifier, official name, optional logo URL, and descriptive text. Universities serve as the primary organizational unit, grouping faculties and students. The entity supports the hierarchical structure necessary for faculty-restricted course sharing in later sprints. 

**Faculty Entity:** The Faculty entity represents academic departments or faculties within universities. Each faculty record belongs to exactly one university \(enforced through foreign key constraint\) and contains the faculty name, optional faculty code, and descriptive information. 

Faculties provide granular organization, enabling students to identify their specific academic department and restricting course sharing to students within the same faculty. 

**Account Entity \(NextAuth\):** The Account entity is part of NextAuth's database schema and stores authentication provider information. For credential-based authentication \(email/password\), this table links users to their authentication method. The entity supports multiple authentication 

providers per user, stores provider-specific tokens, and manages OAuth-related data when external providers are used. 

**Session Entity \(NextAuth\):** The Session entity manages user sessions with JWT tokens. Each session record links to a specific user and contains the session token, expiration timestamp, and session state. NextAuth uses this table to track active sessions, implement secure logout, and enforce session timeouts. The JWT strategy stores minimal data in the database while encoding user information in the token itself. 

**VerificationToken Entity \(NextAuth\):** The VerificationToken entity supports email verification workflows. Each token record contains a unique identifier, token string, and expiration timestamp. NextAuth generates these tokens for email confirmation during registration and password reset flows. Tokens expire after a set period to maintain security. 

**Relationships**

**University-Faculty Relationship:**

**•**

**Type:** One-to-Many \(1:N\)

**•**

**Description:** A single university contains multiple faculties, but each faculty belongs to exactly one university

**•**

**Implementation:** Faculty table contains universityId foreign key referencing University.id

**•**

**Cascade Rules:** When a university is deleted, associated faculties are cascade deleted **User-University Relationship:**

**•**

**Type:** Many-to-One \(N:1\)

**•**

**Description:** Multiple users can be associated with one university, but each user belongs to exactly one university

**•**

**Implementation:** User table contains universityId foreign key referencing University.id

**•**

**Constraint:** User cannot be created without valid universityId **User-Faculty Relationship:**

**•**

**Type:** Many-to-One \(N:1\)

**•**

**Description:** Multiple users can belong to one faculty, but each user is associated with exactly one faculty

**•**

**Implementation:** User table contains facultyId foreign key referencing Faculty.id

**•**

**Constraint:** User cannot be created without valid facultyId **User-Account Relationship:**

**•**

**Type:** One-to-Many \(1:N\)

**•**

**Description:** A user can have multiple authentication accounts \(for different providers\), but each account belongs to one user

**•**

**Implementation:** Account table contains userId foreign key referencing User.id

**•**

**Usage:** Supports multi-provider authentication in future

**User-Session Relationship:**

**•**

**Type:** One-to-Many \(1:N\)

**•**

**Description:** A user can have multiple active sessions \(different devices/browsers\), but each session belongs to one user

**•**

**Implementation:** Session table contains userId foreign key referencing User.id

**•**

**Management:** Old sessions are automatically cleaned up on expiration **6. Data Dictionary**

**Entity: User**

**Description:** Stores user information including authentication credentials, institutional associations, and role-based permissions. 

**Attribute**

**Datatype**

**Description**

**Constraints**

String 

id

Unique identifier for user

Primary Key, Auto-generated

\(CUID\)

Not Null, Min: 2 chars, Max: 100 

name

String

Full name of the user

chars

email

String

Email address \(login identifier\) Unique, Not Null, Valid email format

password

String

Bcrypt hashed password

Not Null, Min hash length: 60 chars

profileImag String? 

URL to profile avatar

Optional, Valid URL

e

role

Enum \(Role\) User access level

Not Null, Default: PENDING

universityI String

Reference to parent university Foreign Key, Not Null d

facultyId

String

Reference to user's faculty

Foreign Key, Not Null

studentIdU

UploadThing URL for student 

String? 

Optional \(required for students\)

rl

ID

approvedA

Timestamp when admin 

DateTime? 

Nullable \(null = not approved yet\)

t

approved

createdAt

DateTime

Account creation timestamp

Auto-generated, Not Null

updatedAt DateTime

Last update timestamp

Auto-updated, Not Null

**Indexes:**

•

Primary: id

•

Unique: email

•

Foreign: universityId references University\(id\)

•

Foreign: facultyId references Faculty\(id\)

•

Composite: \(universityId, facultyId\) for query optimization **Relationships:**

**•**

**Belongs To:** University \(N:1\)

**•**

**Belongs To:** Faculty \(N:1\)

**•**

**Has Many:** Account \(1:N\)

**•**

**Has Many:** Session \(1:N\)

**Entity: University**

**Description:** Stores information about educational institutions participating in UniShare. 

**Attribute**

**Datatype**

**Description**

**Constraints**

String 

id

Unique identifier for university Primary Key, Auto-generated \(CUID\)

Unique, Not Null, Min: 3 

name

String

Official name of the university chars

logo

String? 

URL to university logo image

Optional, Valid URL

descriptio String? 

Brief description of university

Optional, Max: 500 chars

n

Official university website 

website

String? 

Optional, Valid URL

URL

location

String? 

City or region of university

Optional, Max: 100 chars

createdAt DateTime

Record creation timestamp

Auto-generated, Not Null

updatedAt DateTime

Last update timestamp

Auto-updated, Not Null

**Indexes:**

•

Primary: id

•

Unique: name

•

Index: name for search optimization

**Relationships:**

**•**

**Has Many:** Faculty \(1:N\)

**•**

**Has Many:** User \(1:N\)

**Entity: Faculty**

**Description:** Stores information about academic faculties/departments within universities. 

**Attribute**

**Datatype**

**Description**

**Constraints**

String 

Primary Key, Auto-

id

Unique identifier for faculty

\(CUID\)

generated

name

String

Name of faculty/department

Not Null, Min: 3 chars

code

String? 

Faculty abbreviation code

Optional, Max: 10 chars

description String? 

Brief description of faculty

Optional, Max: 300 chars

universityI

Reference to parent 

String

Foreign Key, Not Null

d

university

createdAt

DateTime

Record creation timestamp

Auto-generated, Not Null

updatedAt DateTime

Last update timestamp

Auto-updated, Not Null

**Indexes:**

•

Primary: id

•

Foreign: universityId references University\(id\)

•

Unique: \(universityId, name\) prevents duplicate faculty names within same university

•

Index: universityId for efficient queries

**Relationships:**

**•**

**Belongs To:** University \(N:1\)

**•**

**Has Many:** User \(1:N\)

**Entity: Account \(NextAuth\)**

**Description:** NextAuth account table for managing authentication providers and tokens. 

**Attribute**

**Datatype**

**Description**

**Constraints**

String 

id

Unique identifier

Primary Key, Auto-generated

\(CUID\)

userId

String

Reference to user

Foreign Key, Not Null

type

String

Account type

Not Null, e.g., "oauth", "email" 

Not Null, e.g., "credentials", 

provider

String

Auth provider name

"google" 

providerAccount

Provider-specific account 

String

Not Null

Id

ID

refresh\_token

String? 

OAuth refresh token

Optional

access\_token

String? 

OAuth access token

Optional

expires\_at

Int? 

Token expiration 

Optional

timestamp

token\_type

String? 

Type of token

Optional, e.g., "Bearer" 

scope

String? 

OAuth scope

Optional

id\_token

String? 

OAuth ID token

Optional

session\_state

String? 

OAuth session state

Optional

**Indexes:**

•

Primary: id

•

Foreign: userId references User\(id\) with CASCADE delete

•

Unique: \(provider, providerAccountId\) prevents duplicate provider accounts

**Relationships:**

**•**

**Belongs To:** User \(N:1\)

**Entity: Session \(NextAuth\)**

**Description:** NextAuth session table for JWT-based session management. 

**Attribute**

**Datatype**

**Description**

**Constraints**

String 

Primary Key, Auto-

id

Unique identifier

\(CUID\)

generated

sessionToke String

JWT session token

Unique, Not Null

n

userId

String

Reference to user

Foreign Key, Not Null

Session expiration 

expires

DateTime

Not Null

timestamp

**Indexes:**

•

Primary: id

•

Unique: sessionToken

•

Foreign: userId references User\(id\) with CASCADE delete

•

Index: expires for cleanup queries

**Relationships:**

**•**

**Belongs To:** User \(N:1\)

**Entity: VerificationToken \(NextAuth\)**

**Description:** NextAuth verification token table for email verification and password reset. 

**Attribut Datatyp**

**Description**

**Constraints**

**e**

**e**

identifier String

User identifier \(email\)

Not Null

Unique, Not 

token

String

Unique verification token

Null

DateTim Token expiration 

expires

Not Null

e

timestamp

**Indexes:**

•

Primary: Composite \(identifier, token\)

•

Unique: token

•

Index: expires for cleanup

**Relationships:**

•

No direct foreign keys \(tokens reference users by email\) **Enum: Role**

**Description:** Defines user permission levels in the system. 

**Value**

**Description**

**Permissions**

ADMIN

Administrator Full system access, approve/reject student registrations, manage all users

APPROV Verified 

Full feature access: create courses, upload resources, share courses, ED

Student

collaborate on notes

PENDIN Awaiting 

Limited access: waiting page only, cannot access main features until G

Approval

admin approval

**Prisma Schema \(Sprint 1\)**

generator client \{

provider = "prisma-client-js" 

\}

datasource db \{

provider = "postgresql" 

url = env\("DATABASE\_URL"\)

\}

// Enum for user roles

enum Role \{

ADMIN

APPROVED

PENDING

\}

// University Model

model University \{

id String @id @default\(cuid\(\)\) name String @unique

logo String? 

description String? 

website String? 

location String? 



// Relationships

faculties Faculty\[\]

users User\[\]



// Timestamps

createdAt DateTime @default\(now\(\)\)

updatedAt DateTime @updatedAt



@@index\(\[name\]\)

@@map\("universities"\)

\}

// Faculty Model

model Faculty \{

id String @id @default\(cuid\(\)\) name String

code String? 

description String? 

universityId String



// Relationships

university University @relation\(fields: \[universityId\], references: \[id\], onDelete: Cascade\)

users User\[\]



// Timestamps

createdAt DateTime @default\(now\(\)\) updatedAt DateTime @updatedAt



@@unique\(\[universityId, name\]\)

@@index\(\[universityId\]\)

@@map\("faculties"\)

\}

// User Model

model User \{

id String @id @default\(cuid\(\)\) name String

email String @unique

password String

profileImage String? 

role Role @default\(PENDING\)

universityId String

facultyId String

studentIdUrl String? 

approvedAt DateTime? 



// Relationships

university University @relation\(fields: 

\[universityId\], references: \[id\]\)

faculty Faculty @relation\(fields: \[facultyId\], references: \[id\]\)

accounts Account\[\]

sessions Session\[\]



// Timestamps

createdAt DateTime @default\(now\(\)\)

updatedAt DateTime @updatedAt



@@index\(\[email\]\)

@@index\(\[universityId, facultyId\]\)

@@map\("users"\)

\}

// NextAuth Account Model

model Account \{

id String @id @default\(cuid\(\)\) userId String

type String

provider String

providerAccountId String

refresh\_token String? 

access\_token String? 

expires\_at Int? 

token\_type String? 

scope String? 

id\_token String? 

session\_state String? 



// Relationships

user User @relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)



@@unique\(\[provider, providerAccountId\]\)

@@index\(\[userId\]\)

@@map\("accounts"\)

\}

// NextAuth Session Model

model Session \{

id String @id @default\(cuid\(\)\) sessionToken String @unique

userId String

expires DateTime



// Relationships

user User @relation\(fields: \[userId\], references: 

\[id\], onDelete: Cascade\)



@@index\(\[userId\]\)

@@index\(\[expires\]\)

@@map\("sessions"\)

\}

// NextAuth VerificationToken Model

model VerificationToken \{

identifier String

token String @unique

expires DateTime



@@unique\(\[identifier, token\]\)

@@index\(\[expires\]\)

@@map\("verification\_tokens"\)

\}

**Seed Script Structure \(prisma/seed.ts\)**

import \{ PrismaClient \} from '@prisma/client'; const prisma = new PrismaClient\(\); 

async function main\(\) \{

// Seed Universities

const universities = \[

\{

name: 'Qaiwan International University', 

description: 'UTM Franchise in Kurdistan', location: 'Sulaymaniyah', 

faculties: \[

\{ name: 'Computer Science', code: 'CS' \}, 

\{ name: 'Engineering', code: 'ENG' \}, 

\{ name: 'Business Administration', code: 'BA' \}, 

\{ name: 'Medicine', code: 'MED' \}

\]

\}, 

\{

name: 'Salahaddin University', 

description: 'Public university in Erbil', location: 'Erbil', 

faculties: \[

\{ name: 'Science', code: 'SCI' \}, 

\{ name: 'Engineering', code: 'ENG' \}, 

\{ name: 'Arts', code: 'ARTS' \}, 

\{ name: 'Law', code: 'LAW' \}

\]

\}, 

\{

name: 'University of Sulaimani', 

description: 'Public university in Sulaymaniyah', location: 'Sulaymaniyah', 

faculties: \[

\{ name: 'Science and Engineering', code: 'SE' \}, 

\{ name: 'Humanities', code: 'HUM' \}, 

\{ name: 'Medical Sciences', code: 'MED' \}

\]

\}

\]; 

for \(const uni of universities\) \{

const \{ faculties, ...universityData \} = uni; await prisma.university.create\(\{

data: \{

...universityData, 

faculties: \{

create: faculties

\}

\}

\}\); 

\}

console.log\('Seeding completed successfully\!'\); 

\}

main\(\)

.catch\(\(e\) => \{

console.error\(e\); 

process.exit\(1\); 

\}\)

.finally\(async \(\) => \{

await prisma.$disconnect\(\); 

\}\); 

**Environment Variables Configuration**

**File:** .env

\# Database

DATABASE\_URL="postgresql://username:password@host:port/

database?sslmode=require" 

\# NextAuth

NEXTAUTH\_URL="http://localhost:3000" 

NEXTAUTH\_SECRET="your-secret-key-generate-using-openssl-rand-base64-32" 

\# UploadThing

UPLOADTHING\_SECRET="your-uploadthing-secret-key" 

UPLOADTHING\_APP\_ID="your-uploadthing-app-id" 

\# Environment

NODE\_ENV="development" 

**API Routes Structure \(Sprint 1\)**

**GET /api/universities**

**Description:** Retrieves all universities with their faculties **Implementation File:** app/api/universities/route.ts **Request:** No parameters

**Response:**

\{

success: boolean; 

data: Array<\{

id: string; 

name: string; 

logo?: string; 

description?: string; 

location?: string; 

faculties: Array<\{

id: string; 

name: string; 

code?: string; 

\}>; 

\}>; 

\}

**Status Codes:**

•

200: Success

•

500: Server error

**GET /api/faculties**

**Description:** Retrieves faculties, optionally filtered by university **Implementation File:** app/api/faculties/route.ts **Request:**

// Query Parameters

\{

universityId?: string; // Optional filter

\}

**Response:**

\{

success: boolean; 

data: Array<\{

id: string; 

name: string; 

code?: string; 

universityId: string; 

university: \{

id: string; 

name: string; 

\}; 

\}>; 

\}

**Status Codes:**

•

200: Success

•

400: Invalid universityId

•

500: Server error

**NextAuth Configuration Structure**

**File:** app/api/auth/\[...nextauth\]/route.ts

import NextAuth from 'next-auth'; import CredentialsProvider from 'next-auth/providers/

credentials'; 

import \{ PrismaAdapter \} from '@auth/prisma-adapter'; import \{ prisma \} from '@/lib/prisma'; 

import bcrypt from 'bcrypt'; 

const handler = NextAuth\(\{

adapter: PrismaAdapter\(prisma\), 

providers: \[

CredentialsProvider\(\{

name: 'Credentials', 

credentials: \{

email: \{ label: "Email", type: "email" \}, password: \{ label: "Password", type: "password" \}

\}, 

async authorize\(credentials\) \{

// Validation logic to be implemented in Sprint 2

return null; 

\}

\}\)

\], 

session: \{

strategy: 'jwt', 

maxAge: 30 \* 24 \* 60 \* 60, // 30 days

\}, 

pages: \{

signIn: '/login', 

signOut: '/logout', 

error: '/auth/error', 

\}, 

callbacks: \{

async jwt\(\{ token, user \}\) \{

if \(user\) \{

token.id = user.id; 

token.role = user.role; 

\}

return token; 

\}, 

async session\(\{ session, token \}\) \{

if \(session.user\) \{

session.user.id = token.id; 

session.user.role = token.role; 

\}

return session; 

\}

\}, 

secret: process.env.NEXTAUTH\_SECRET, 

\}\); 

export \{ handler as GET, handler as POST \}; **UploadThing Configuration Structure**

**File:** app/api/uploadthing/core.ts

import \{ createUploadthing, type FileRouter \} from 

'uploadthing/next'; 

const f = createUploadthing\(\); 

export const ourFileRouter = \{

studentIdUploader: f\(\{ image: \{ maxFileSize: '4MB', maxFileCount: 1 \} \}\)

.middleware\(async \(\) => \{

// Authentication check to be implemented in Sprint 2

return \{\}; 

\}\)

.onUploadComplete\(async \(\{ file \}\) => \{

console.log\('Student ID uploaded:', file.url\); return \{ url: file.url \}; 

\}\), 



resourceUploader: f\(\{ 

image: \{ maxFileSize: '16MB' \}, 

pdf: \{ maxFileSize: '16MB' \}, 

'application/msword': \{ maxFileSize: '16MB' \}, 

'application/vnd.openxmlformats-

officedocument.wordprocessingml.document': \{ maxFileSize: 

'16MB' \}

\}\)

.middleware\(async \(\) => \{

// Authentication check to be implemented in Sprint 2

return \{\}; 

\}\)

.onUploadComplete\(async \(\{ file \}\) => \{

console.log\('Resource file uploaded:', file.url\); return \{ url: file.url \}; 

\}\), 

\} satisfies FileRouter; 

export type OurFileRouter = typeof ourFileRouter; **File:** app/api/uploadthing/route.ts

import \{ createRouteHandler \} from 'uploadthing/next'; import \{ ourFileRouter \} from './core'; 

export const \{ GET, POST \} = createRouteHandler\(\{

router: ourFileRouter, 

\}\); 

**Development Setup Instructions**

**1. Install Dependencies**

npm install next@14 react react-dom typescript npm install prisma @prisma/client

npm install next-auth @auth/prisma-adapter npm install bcrypt @types/bcrypt

npm install uploadthing @uploadthing/react npm install tailwindcss postcss autoprefixer npm install -D @types/node @types/react

**2. Initialize Prisma**

npx prisma init

**3. Configure Database**

Edit .env file with NeonDB connection string **4. Create Prisma Schema**

Copy the schema provided above to prisma/schema.prisma **5. Run Migrations**

npx prisma migrate dev --name init

**6. Create Seed Script**

Create prisma/seed.ts with the seed structure provided above **7. Run Seed**

npx prisma db seed

**8. Generate Prisma Client**

npx prisma generate

**9. Verify Setup**

npx prisma studio

**Sprint 1 Success Criteria**

•

\[x\] Next.js 14 project initialized with TypeScript

•

\[x\] PostgreSQL database provisioned on NeonDB

•

\[x\] Prisma ORM configured with database connection

•

\[x\] Database schema created with all entities \(User, University, Faculty, Account, Session, VerificationToken\)

•

\[x\] Database seeded with 3\+ universities and 3-5 faculties each

•

\[x\] NextAuth configured with Credentials provider and JWT strategy

•

\[x\] UploadThing configured with studentIdUploader and resourceUploader endpoints

•

\[x\] Role enum \(ADMIN, APPROVED, PENDING\) implemented in database

•

\[x\] All foreign key relationships established and working

•

\[x\] API routes created for universities and faculties

•

\[x\] Environment variables properly configured

•

\[x\] Prisma Studio accessible for database verification

•

\[x\] All TypeScript types properly defined

•

\[x\] Documentation complete with use cases and data dictionary **Technical Stack Summary**

**Category**

**Technology**

**Purpose**

Frontend 

React-based web framework with server-side Next.js 14 \(App Router\)

Framework

rendering

Language

TypeScript

Type-safe JavaScript for better development experience

Database

PostgreSQL \(NeonDB\)

Serverless PostgreSQL for cloud-based data storage

ORM

Prisma

Type-safe database client and migration tool Authentication

NextAuth.js

Authentication library with JWT session 

management

Password 

bcrypt

Secure password hashing \(12 rounds\)

Hashing

Cloud file storage and CDN for student IDs and File Storage

UploadThing

resources

Styling

Tailwind CSS \+ Shadcn UI Utility-first CSS with pre-built components Development 

Git, VSCode, Browser 

Version control and development environment Tools

DevTools

**Next Sprint Preview \(Sprint 2\)**

Sprint 2 will build upon this foundation by implementing: 1. **Student Registration System:**

◦

Registration form with university/faculty selection

◦

Student ID upload via UploadThing

◦

Password hashing with bcrypt

◦

User creation with PENDING role

2. **Admin Approval Workflow:**

◦

Admin dashboard to view pending students

◦

Student details page with uploaded ID verification

◦

Approve/reject functionality

◦

Role update from PENDING to APPROVED

3. **Email Notifications:**

◦

Nodemailer integration

◦

Registration confirmation emails

◦

Approval/rejection notification emails

4. **Authentication System:**

◦

Login page with NextAuth

◦

Role-based redirects \(PENDING → waiting page, APPROVED → courses, ADMIN → admin dashboard\)

◦

Session management with JWT tokens

◦

Logout functionality

**End of Sprint 1 Iteration Report**



