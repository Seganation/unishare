"""Karoz's Project 1 test basis + test cases for UniShare (SECJ3343 25/26-2).

Scope: Course & resource management (UniShare_Iteration_3.md, Use Case 1 / UC-S3-001 "Create Course with Default
Resources" and its Data Dictionary) and the weekly timetable (UniShare_Iteration_4.md, UC-S4-005).
Each requirement cites its source: the iteration document and the implementing code.
Where the code differs from the iteration document the CODE is the test basis and the difference is stated in the
requirement text (reported as an issue for Project 2).
"""

AUTHOR = "karoz"
TOP_SUITE = "Karoz - Course, Resource & Timetable Management (Iteration 3 UC1, Iteration 4 UC-S4-005)"
TOP_SUITE_DETAILS = (
    "<p><b>Tester:</b> Karoz<br/><b>Software under test:</b> UniShare (github.com/Seganation/unishare)<br/>"
    "<b>Test basis:</b> UniShare_Iteration_3.md Use Case 1 (UC-S3-001) and UniShare_Iteration_4.md UC-S4-005, "
    "and the code that implements them: tRPC routers course.ts, resource.ts, timetable.ts; "
    "src/components/courses/course-form.tsx, src/components/resources/*, src/components/timetable/*, "
    "src/app/(student)/courses/*, src/app/(student)/timetable/page.tsx, src/app/api/uploadthing/core.ts, "
    "src/app/api/cron/class-reminders/route.ts, middleware.ts.<br/>"
    "<b>Techniques:</b> Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Decision Table (DT), "
    "State Transition (ST), Use Case / scenario testing (UC), Error Guessing (EG).</p>"
    "<p><b>Common test data</b> (prisma/seed.ts, all seeded passwords are <i>admin123</i>)<br/>"
    "Student A - Sarah Ahmed (sarah@student.utm.my), APPROVED, Faculty of Computing. Owns \"Data Structures &amp; "
    "Algorithms\" (John = accepted CONTRIBUTOR) and \"Web Development\"; accepted VIEWER of \"Machine Learning\" (owner John); "
    "favourites: Data Structures &amp; Algorithms, Web Development, Machine Learning; default timetable \"Fall 2024 Schedule\" "
    "(John = accepted VIEWER, David = PENDING).<br/>"
    "Student B - John Doe (john@student.utm.my), APPROVED. Owns \"Machine Learning\" and \"Database Systems\"; own timetable "
    "\"Fall 2024 Schedule\" on which Sarah is an accepted CONTRIBUTOR and Lisa has a PENDING invitation.<br/>"
    "Student C - Michael Chen (michael@student.utm.my), APPROVED, Faculty of Engineering, no access to Sarah's courses.<br/>"
    "Student D - Alice Wong (alice@student.utm.my), role PENDING (not approved).<br/>"
    "Other approved students: David Kim, Lisa Martinez, Emily Rodriguez.<br/>"
    "Fresh data used in the cases (created by the tester): course \"SECJ3343 Software Quality Assurance\" owned by Sarah; "
    "empty timetable \"SQA Week\" owned by Sarah; course colours = the 8 swatches of src/lib/course-colors.ts "
    "(Purple #a855f7, Blue #3b82f6, Green #10b981, Orange #f97316, Red #ef4444, Pink #ec4899, Teal #14b8a6, Indigo #6366f1).<br/>"
    "API checks can be done with the browser DevTools console or a tRPC client logged in as the stated student "
    "(procedures course.*, resource.*, timetable.*).</p>"
)

# ---------------------------------------------------------------- requirements (test basis)
REQ_SPECS = [
    {
        "doc_id": "SRS-K-CRS",
        "title": "UC-S3-001 Create Course with Default Resources",
        "scope": "An approved student creates a course (title, description, colour); the system creates four default "
        "resource cards. Source: UniShare_Iteration_3.md Use Case 1 (UC-S3-001) and Sequence 1; "
        "src/server/api/routers/course.ts (create); src/components/courses/course-form.tsx; "
        "src/app/(student)/courses/new/page.tsx; middleware.ts; src/app/(student)/layout.tsx. "
        "Differences from the document: code has no course code / semester / icon fields; minimum title length is 1 "
        "(document: 2); an invalid colour is rejected, not defaulted; after creation the student is redirected to "
        "/courses (document: /courses/<id>).",
        "reqs": [
            ("REQ-CRS-01", "Course title validation",
             "Title is mandatory, 1 to 100 characters (input has maxLength 100; API z.string().min(1,'Title is required')"
             ".max(100)). The form trims the title; an empty or whitespace-only title is not submitted and shows the "
             "message 'Please enter a course title'."),
            ("REQ-CRS-02", "Course description validation",
             "Description is optional, maximum 500 characters (textarea maxLength 500, API max(500)). An empty "
             "description is stored as no description."),
            ("REQ-CRS-03", "Course colour",
             "Colour is mandatory and chosen from 8 swatches (Purple, Blue, Green, Orange, Red, Pink, Teal, Indigo); "
             "the first (Purple #a855f7) is preselected. The API accepts only '#' followed by exactly 6 hex digits "
             "(case-insensitive) and otherwise returns 'Invalid color format'."),
            ("REQ-CRS-04", "Four default resource cards",
             "Creating a course automatically creates exactly 4 resource cards: Assignments (type ASSIGNMENT, files "
             "allowed), Tasks (TASK, no files), Content (CONTENT, files allowed), Notes (NOTES, no files)."),
            ("REQ-CRS-05", "Successful creation",
             "After a valid submission the system shows 'Course created successfully!', redirects to /courses and the "
             "course appears under 'My Courses' with the creator as owner (role OWNER, createdBy = current user). "
             "Duplicate titles are allowed."),
            ("REQ-CRS-06", "Only approved, logged-in students can create courses",
             "Visitors who are not logged in are redirected to /login; users with role PENDING are redirected to "
             "/waiting-approval and cannot use /courses/new. The API requires a session (UNAUTHORIZED otherwise). "
             "Iteration 3 alternative flow A3 additionally requires a 403 'Your account is pending approval' from the server."),
        ],
    },
    {
        "doc_id": "SRS-K-MAN",
        "title": "Course management (list, open, edit, delete, favourite)",
        "scope": "Owner and collaborator handling of an existing course. Source: UniShare_Iteration_3.md Use Case 1 "
        "postconditions and Data Dictionary (Course, Favorite); src/server/api/routers/course.ts (getAll, getUserCourses, "
        "getById, update, delete, toggleFavorite); src/app/(student)/courses/page.tsx, courses/[id]/page.tsx, "
        "courses/[id]/settings/page.tsx; src/components/courses/*.",
        "reqs": [
            ("REQ-MAN-01", "Course list: owned and shared",
             "/courses lists the student's own courses under 'My Courses' and courses where the student is an ACCEPTED "
             "collaborator under 'Shared With Me'. PENDING or REJECTED invitations and other students' courses are not "
             "listed. A student without courses sees 'No courses yet'."),
            ("REQ-MAN-02", "Course access control",
             "A course can be opened only by its owner or an ACCEPTED collaborator; the page shows the role badge OWNER / "
             "CONTRIBUTOR / VIEWER. Others get 'You don't have access to this course'; an unknown id gives 'Course not "
             "found' (page 'Course Not Found')."),
            ("REQ-MAN-03", "Edit course (owner only)",
             "The owner can change title, description and colour in Course Settings > General (same validation as "
             "creation) and sees 'Course updated successfully!'. Any other user gets 'Only the course owner can update "
             "course details'; the settings page shows 'Access Denied - Only the course owner can access settings.' to "
             "non-owners. Clearing the description must remove it."),
            ("REQ-MAN-04", "Delete course (owner only)",
             "Course Settings > Danger Zone asks 'Are you sure you want to delete \"<title>\"? This action cannot be undone "
             "and will delete all resources and collaborator access.'. OK deletes the course with its resources, "
             "collaborators and favourites and shows 'Course deleted successfully'; Cancel changes nothing. Non-owners get "
             "'Only the course owner can delete the course'."),
            ("REQ-MAN-05", "Favourite toggle",
             "The star on the course page toggles the favourite flag of the current student only (unique per student and "
             "course): 'Added to favorites' / 'Removed from favorites'. Favourites feed the timetable course list."),
        ],
    },
    {
        "doc_id": "SRS-K-RES",
        "title": "Resource cards and files",
        "scope": "Custom resource cards, deadlines and file attachments inside a course. Source: UniShare_Iteration_3.md "
        "Use Case 1 step 26 + Data Dictionary (ResourceCard, Resource); src/server/api/routers/resource.ts; "
        "src/components/resources/resource-form.tsx, resource-card.tsx, file-upload-modal.tsx; "
        "src/app/api/uploadthing/core.ts (courseResourceUploader); src/app/(student)/courses/[id]/page.tsx.",
        "reqs": [
            ("REQ-RES-01", "Create custom resource card",
             "'Add Custom Resource' opens 'Create Custom Resource'. Title is mandatory 1-100 characters (empty shows "
             "'Please enter a title'), description optional max 500, 'Allow File Uploads' toggle (default ON), optional "
             "deadline ('Set a Deadline'). The card is stored with type CUSTOM and 'Resource created successfully!' is shown."),
            ("REQ-RES-02", "Who may create or update resources",
             "Only the course owner and ACCEPTED CONTRIBUTORs can create/update resources and see 'Add Custom Resource'. "
             "VIEWERs and outsiders get 'Only course owner and contributors can create resources' / 'Only course owner and "
             "contributors can update resources'; unknown course/resource gives 'Course not found' / 'Resource not found'."),
            ("REQ-RES-03", "Delete resource (owner only)",
             "Only the owner can delete resources: the API returns 'Only the course owner can delete resources' to "
             "everybody else. In the UI the delete button exists only for CUSTOM cards, asks 'Are you sure you want to "
             "delete this resource?' and shows 'Resource deleted successfully'. The 4 default cards have no delete button."),
            ("REQ-RES-04", "Attach files to a card",
             "Files can be added (button 'Add Files' / 'Add More Files') only to cards with allowFiles = true and only "
             "by the owner or a CONTRIBUTOR. Otherwise the API returns 'This resource does not allow file uploads' or "
             "'You don't have permission to add files to this resource'. File URLs must be valid URLs. Success shows "
             "'Files added successfully'. Cards without files show 'No files uploaded yet'."),
            ("REQ-RES-05", "Upload size, type and count limits",
             "courseResourceUploader accepts images, PDF and text up to 16MB (max 10 files), Word/Excel/PowerPoint up to "
             "16MB (max 10 files), video up to 64MB (max 5 files), ZIP up to 32MB (max 5 files); anything else, any "
             "larger file or more files is rejected ('Failed to upload files: ...'). Upload requires a logged-in user "
             "('Unauthorized')."),
            ("REQ-RES-06", "Remove a file",
             "Owner and CONTRIBUTOR can remove a file URL from a card; others get 'You don't have permission to remove "
             "files from this resource'. Only the chosen file is removed."),
            ("REQ-RES-07", "Deadline display",
             "A card with a deadline shows 'Due: <MMM dd, yyyy 'at' h:mm a>'. Within the next 3 days it additionally shows "
             "the badge 'Soon' (amber); after the deadline it shows 'Overdue: <date>' (red) and no 'Soon' badge."),
        ],
    },
    {
        "doc_id": "SRS-K-TT",
        "title": "UC-S4-005 Weekly Timetable with Events",
        "scope": "Student creates timetables, adds weekly class events for favourite courses, detects conflicts, shares "
        "the timetable and receives class reminders. Source: UniShare_Iteration_4.md Use Case 5 (UC-S4-005); "
        "src/server/api/routers/timetable.ts; src/components/timetable/*; src/app/(student)/timetable/page.tsx; "
        "src/app/api/cron/class-reminders/route.ts. Differences from the document: events are weekly recurring "
        "by day-of-week (no recurrence rule JSON, end date or multiple days per event); the conflict message is "
        "'Time conflict detected / Overlaps with <title> (start - end)'; reminders use the user's reminder timing "
        "(5-30 min, default 10) not a fixed 1 hour; the check 'start before end' and the conflict check are done "
        "only in the browser, not in the API.",
        "reqs": [
            ("REQ-TT-01", "Create timetable",
             "'Create Timetable' (or 'Create Your First Timetable' when the student has none: 'No Timetables Yet') needs "
             "a Name of 1-100 characters (API message 'Name is required') and an optional Description of max 500. "
             "The new timetable is listed under 'My Timetables' and the creator is the owner."),
            ("REQ-TT-02", "Default timetable",
             "Timetable Settings > 'Set as Default' makes the timetable the student's default (button changes to "
             "'Currently Default', badge 'Default'); /timetable opens the default timetable first. Only owner or accepted "
             "collaborator may set it ('You don't have access to this timetable'). Deleting or leaving the timetable "
             "clears the default."),
            ("REQ-TT-03", "Only favourite courses can be scheduled",
             "'Add Class' lists only the student's favourite courses ('Only your favorited courses are shown'). Without "
             "favourites the modal shows 'No Favorite Courses - You need to favorite courses before adding them to your "
             "timetable'. The API returns 'You can only add favorited courses to your timetable' for other courses."),
            ("REQ-TT-04", "Class event data",
             "A class has Course (required), Title (required, 1-100), Day of Week (Sunday=0 ... Saturday=6), Start Time and "
             "End Time (HH:MM) and optional Location (max 100). It is stored as weekly recurring and appears in the week "
             "view on that weekday in the course colour. API: dayOfWeek 0-6, times must match ^\\d{2}:\\d{2}$ "
             "('Invalid time format (HH:MM)')."),
            ("REQ-TT-05", "End time must be after start time",
             "If End Time is not later than Start Time the form shows 'End time must be after start time' and 'Add Class' "
             "is disabled; the equal-times case is also invalid. Dragging/resizing to an invalid range shows 'Invalid time "
             "range'. The API must also reject such events."),
            ("REQ-TT-06", "Time conflict detection",
             "Two classes on the same weekday must not overlap (A.start < B.end and B.start < A.end). The form shows "
             "'Time conflict detected' and 'Overlaps with <title> (<start> - <end>)' and disables 'Add Class'. Back-to-back "
             "classes (end = next start) and the same time on another weekday are allowed."),
            ("REQ-TT-07", "Maximum 3 classes per course per day",
             "A course can have at most 3 classes on one weekday. With 3 existing the form shows 'Maximum 3 classes per "
             "course per day. This course already has 3 classes on this day.' and blocks submit; with 1 or 2 it shows "
             "'This course has N class(es) on this day. You can add M more.'."),
            ("REQ-TT-08", "Edit and move a class",
             "Owner and CONTRIBUTORs can edit a class (Class Details > Edit Class > 'Save Changes') or drag/resize it in the "
             "calendar. The same time-range and conflict rules apply, ignoring the class itself. Conflict while dragging "
             "shows 'Cannot move event: Time conflict with another class' / 'Cannot resize event: Time conflict with "
             "another class'."),
            ("REQ-TT-09", "Delete a class",
             "Owner and CONTRIBUTORs can delete a class: 'Delete this class?' with 'Yes, Delete' / 'Cancel'. Yes removes "
             "the class from every week; Cancel keeps it."),
            ("REQ-TT-10", "Timetable permissions",
             "Owner: everything. CONTRIBUTOR: add/edit/delete classes. VIEWER: read only, no 'Add Class'. Users without "
             "an accepted role cannot open the timetable ('You don't have access to this timetable'). API messages: "
             "'You don't have permission to add events to this timetable' / '... update this event' / '... delete this event'."),
            ("REQ-TT-11", "Invite students to a timetable",
             "Only the owner can invite ('Only the owner can invite collaborators') through Share > 'Search for students': "
             "the query needs at least 3 characters ('Search query must be at least 3 characters'), only APPROVED users "
             "are found (max 10), the owner and already invited users are excluded, role Viewer or Contributor. Inviting "
             "yourself ('You can't invite yourself') or an invited user ('User already invited') is rejected. A "
             "TIMETABLE_INVITATION notification 'New timetable invitation' is sent."),
            ("REQ-TT-12", "Accept, reject and leave a shared timetable",
             "A PENDING invitation appears under 'Timetable Invitations' with Accept / Reject. Accept -> ACCEPTED and the "
             "timetable shows under 'Shared with Me'; Reject -> REJECTED. The owner is notified ('Invitation accepted' / "
             "'Invitation declined'). A collaborator can 'Leave Timetable' (Confirm Leave); the owner cannot ('You cannot "
             "leave a timetable you own. Delete it instead.')."),
            ("REQ-TT-13", "Class reminders",
             "The cron endpoint /api/cron/class-reminders (Authorization: Bearer CRON_SECRET, else 401) creates a "
             "CLASS_REMINDER notification 'Class starting in <N> minutes' / '<course> at <HH:MM>' for owners and accepted "
             "collaborators when the class starts in N minutes (+-1), N = the user's reminder timing (default 10). "
             "At most one reminder per class and day."),
            ("REQ-TT-14", "Update and delete timetable (owner only)",
             "Only the owner can rename/describe ('Only the owner can update this timetable') and delete ('Only the owner "
             "can delete this timetable') a timetable. Deleting removes its classes and collaborators and clears the default "
             "for every user who had it."),
        ],
    },
]

# ---------------------------------------------------------------- test cases
# importance: 3 high, 2 medium, 1 low.  steps: (action, expected)
SUITES = [
    # ======================================================================== K1
    {
        "name": "TS-K1 Create Course (UC-S3-001)",
        "details": "Create-course form and API. Techniques: UC, BVA (title 100, description 500), EP (colour), DT, EG.",
        "cases": [
            {
                "name": "Create a course with title, description and colour (main flow)",
                "technique": "Use case (main flow), EP valid classes",
                "importance": 3,
                "reqs": ["REQ-CRS-01", "REQ-CRS-02", "REQ-CRS-03", "REQ-CRS-05"],
                "pre": "Student A (sarah@student.utm.my / admin123) logged in, role APPROVED, on /courses.",
                "steps": [
                    ("Click 'Create New Course'.",
                     "Page 'Create New Course' opens at /courses/new with the form and the tip about 4 predefined resource cards."),
                    ("Enter title 'SECJ3343 Software Quality Assurance' and description 'Test design techniques and TestLink'.",
                     "Both texts accepted; character counters update."),
                    ("Leave the colour unchanged.", "Purple is preselected ('Selected Color: Purple')."),
                    ("Click the create button.",
                     "Toast 'Course created successfully!'; redirect to /courses; the course is listed under 'My Courses' with a purple header."),
                ],
            },
            {
                "name": "Title length boundaries (0, 1, 100, 101 characters)",
                "technique": "BVA",
                "importance": 3,
                "reqs": ["REQ-CRS-01"],
                "pre": "Student A on /courses/new, description empty, colour Purple.",
                "steps": [
                    ("Leave title empty and submit.", "Not created; toast 'Please enter a course title'."),
                    ("Enter 1 character 'A' and submit.", "Course 'A' created (minimum length 1 accepted) - 'Course created successfully!'."),
                    ("Open /courses/new, enter a 100-character title and submit.", "Created; full 100-character title shown in the list."),
                    ("Open /courses/new and type/paste a 101-character title.",
                     "Input stops at 100 characters (maxLength); counter shows 100/100."),
                    ("Call course.create via API with a 101-character title.", "Rejected by validation (too_big, max 100); no course created."),
                ],
            },
            {
                "name": "Whitespace-only and padded title",
                "technique": "Error guessing",
                "importance": 2,
                "reqs": ["REQ-CRS-01"],
                "pre": "Student A on /courses/new.",
                "steps": [
                    ("Enter 5 spaces as title and submit.", "Toast 'Please enter a course title'; nothing created (title is trimmed)."),
                    ("Enter '  Networks  ' (leading/trailing spaces) and submit.", "Course created with title 'Networks' (trimmed)."),
                    ("Create a course titled 'C++ & <b>Java</b> \"quotes\"'.",
                     "Created; the title is displayed as plain text exactly as typed (no HTML rendering)."),
                ],
            },
            {
                "name": "Description length boundaries (empty, 500, 501 characters)",
                "technique": "BVA",
                "importance": 2,
                "reqs": ["REQ-CRS-02"],
                "pre": "Student A on /courses/new, valid title entered.",
                "steps": [
                    ("Leave description empty and submit.", "Course created without description."),
                    ("Create another course with a 500-character description.", "Created; description saved completely."),
                    ("Type/paste a 501-character description.", "Textarea stops at 500 characters (counter 500/500)."),
                    ("Call course.create via API with a 501-character description.", "Rejected by validation (max 500); nothing created."),
                ],
            },
            {
                "name": "Colour selection - each swatch",
                "technique": "EP (8 swatches, default)",
                "importance": 2,
                "reqs": ["REQ-CRS-03"],
                "pre": "Student A on /courses/new with title 'Colour test'.",
                "steps": [
                    ("Look at the colour section.", "8 swatches: Purple, Blue, Green, Orange, Red, Pink, Teal, Indigo; Purple selected."),
                    ("Click 'Select Teal color', submit.", "Course created; course card header/colour is teal (#14b8a6)."),
                    ("Repeat for Blue (#3b82f6) and Indigo (#6366f1).", "Each course shows the chosen colour; 'Selected Color' label matched the swatch before submit."),
                ],
            },
            {
                "name": "Colour format validation in the API",
                "technique": "EP / BVA (valid and invalid hex strings)",
                "importance": 3,
                "reqs": ["REQ-CRS-03"],
                "pre": "Student A logged in; course.create callable from the browser console or a tRPC client.",
                "steps": [
                    ("Call course.create with color '#3B82F6' (upper-case).", "Accepted (case-insensitive)."),
                    ("Call with color '#3b82f6' (lower-case).", "Accepted."),
                    ("Call with '#3B82F' (5 digits) and '#3B82F6A' (7 digits).", "Both rejected: 'Invalid color format'."),
                    ("Call with '3B82F6' (no #), '#GGGGGG' and ''.", "All rejected: 'Invalid color format'; no course created."),
                ],
            },
            {
                "name": "Four default resource cards are created",
                "technique": "Decision table (card x file-upload flag), use case",
                "importance": 3,
                "reqs": ["REQ-CRS-04", "REQ-CRS-05"],
                "pre": "Student A just created course 'SECJ3343 Software Quality Assurance'.",
                "steps": [
                    ("Open the course from 'My Courses'.", "Course page opens with role badge OWNER and the Resources tab."),
                    ("Count the resource cards.", "Exactly 4 cards: Assignments, Tasks, Content, Notes (in this order of creation)."),
                    ("Check the file buttons.", "'Add Files' is shown on Assignments and Content only; Tasks and Notes have no file upload."),
                    ("Inspect each card.", "Cards without files show 'No files uploaded yet' / empty state; no delete button on any default card."),
                ],
            },
            {
                "name": "Duplicate course titles are allowed",
                "technique": "Error guessing",
                "importance": 1,
                "reqs": ["REQ-CRS-05"],
                "pre": "Student A already owns 'SECJ3343 Software Quality Assurance'.",
                "steps": [
                    ("Create a second course with exactly the same title.", "Created ('Course created successfully!')."),
                    ("Open /courses.", "Two separate cards with the same title under 'My Courses', each with its own 4 resource cards."),
                ],
            },
            {
                "name": "Course creation blocked for visitors and PENDING students",
                "technique": "Decision table (login state x role)",
                "importance": 3,
                "reqs": ["REQ-CRS-06"],
                "pre": "Browser logged out. Student D (alice@student.utm.my / admin123) has role PENDING.",
                "steps": [
                    ("Logged out, open /courses/new.", "Redirected to /login."),
                    ("Log in as Student D and open /courses/new.", "Redirected to /waiting-approval; the form is not shown."),
                    ("Logged in as Student D open /courses and /timetable.", "Both redirect to /waiting-approval."),
                    ("Log in as Student A and open /courses/new.", "Form is shown (APPROVED allowed)."),
                ],
            },
            {
                "name": "course.create called without a session or with a PENDING session",
                "technique": "Error guessing (API bypass)",
                "importance": 2,
                "reqs": ["REQ-CRS-06"],
                "pre": "Student D (PENDING) logged in; separately a logged-out client.",
                "steps": [
                    ("Logged-out client calls course.create with a valid payload.", "Rejected with UNAUTHORIZED; nothing created."),
                    ("As Student D call course.create with a valid payload.",
                     "Expected per Iteration 3 A3: 403 FORBIDDEN 'Your account is pending approval'; no course created. "
                     "(Code only checks the session, so the course is created - defect to report.)"),
                ],
            },
        ],
    },
    # ======================================================================== K2
    {
        "name": "TS-K2 Manage Courses",
        "details": "List, open, edit, delete and favourite a course. Techniques: DT (role x action), EP, ST, EG.",
        "cases": [
            {
                "name": "Course list shows owned and shared courses only",
                "technique": "EP (owned / accepted shared / pending / other)",
                "importance": 2,
                "reqs": ["REQ-MAN-01"],
                "pre": "Seed data. Student A owns Data Structures & Algorithms and Web Development and is accepted VIEWER of Machine Learning (owner John).",
                "steps": [
                    ("Log in as Student A and open /courses.", "'My Courses' contains Data Structures & Algorithms and Web Development."),
                    ("Look at 'Shared With Me'.", "Contains Machine Learning (owned by John). Database Systems / Operating Systems are not listed."),
                    ("Log in as an approved student E who has no courses and open /courses.", "Message 'No courses yet' with the create-course call to action."),
                ],
            },
            {
                "name": "Course access by role",
                "technique": "Decision table (owner / contributor / viewer / outsider / unknown id)",
                "importance": 3,
                "reqs": ["REQ-MAN-02"],
                "pre": "Course 'Data Structures & Algorithms' (owner Sarah, John accepted CONTRIBUTOR). Michael has no relation to it.",
                "steps": [
                    ("Sarah opens the course.", "Opens; badge OWNER; 'Add Custom Resource' and the three-dots menu (Course Settings, Manage Collaborators) visible."),
                    ("John opens the course.", "Opens; badge CONTRIBUTOR; 'Add Custom Resource' visible; no owner menu."),
                    ("Sarah opens Machine Learning (she is VIEWER).", "Opens; badge VIEWER; no 'Add Custom Resource' button."),
                    ("Michael opens the Data Structures course URL.", "Access refused: 'You don't have access to this course' (no course content shown)."),
                    ("Open /courses/does-not-exist as Sarah.", "'Course Not Found' page with a 'Back to Courses' button (API: 'Course not found')."),
                ],
            },
            {
                "name": "Owner edits title, description and colour",
                "technique": "Use case, EP",
                "importance": 3,
                "reqs": ["REQ-MAN-03"],
                "pre": "Student A owns 'SECJ3343 Software Quality Assurance' (Purple).",
                "steps": [
                    ("Course page > three-dots > Course Settings.", "Settings page with tabs General and Danger Zone."),
                    ("Change title to 'SECJ3343 SQA', description to 'Updated', colour to Green; save.", "Toast 'Course updated successfully!'."),
                    ("Return to /courses.", "Card shows the new title and the green colour; resource cards unchanged (still 4)."),
                    ("Set title to 101 characters via API (course.update).", "Rejected (max 100); course keeps its title."),
                ],
            },
            {
                "name": "Non-owner cannot edit or open settings",
                "technique": "Decision table (role x action), negative",
                "importance": 3,
                "reqs": ["REQ-MAN-03"],
                "pre": "John is CONTRIBUTOR and Sarah is VIEWER of other courses (seed); Michael has no access.",
                "steps": [
                    ("John opens /courses/<DSA id>/settings.", "Page shows 'Access Denied' and 'Only the course owner can access settings.'."),
                    ("John calls course.update on the DSA course.", "FORBIDDEN 'Only the course owner can update course details'; data unchanged."),
                    ("Sarah (VIEWER of Machine Learning) calls course.update on it.", "FORBIDDEN with the same message."),
                    ("Call course.update with an unknown id.", "NOT_FOUND 'Course not found'."),
                ],
            },
            {
                "name": "Clearing the description when editing a course",
                "technique": "Error guessing",
                "importance": 2,
                "reqs": ["REQ-MAN-03"],
                "pre": "Student A's course 'SECJ3343 SQA' has description 'Updated'.",
                "steps": [
                    ("Open Course Settings > General, delete the whole description text and save.", "'Course updated successfully!'."),
                    ("Reload the course/list.", "Description is empty/removed. (Code sends undefined for an empty description, so the old text may remain - defect to report.)"),
                ],
            },
            {
                "name": "Delete course - confirm and cancel",
                "technique": "State transition (exists -> deleted), use case",
                "importance": 3,
                "reqs": ["REQ-MAN-04"],
                "pre": "Student A owns course 'To delete' with 1 custom resource; John is an accepted collaborator; Student A favourited it.",
                "steps": [
                    ("Course Settings > Danger Zone > 'Delete Course Permanently'.", "Browser confirm: 'Are you sure you want to delete \"To delete\"? This action cannot be undone and will delete all resources and collaborator access.'."),
                    ("Click Cancel.", "Course still exists; nothing changed."),
                    ("Repeat and click OK.", "Toast 'Course deleted successfully'; redirected away; course no longer in 'My Courses'."),
                    ("Log in as John.", "Course no longer under 'Shared With Me'; opening its old URL shows 'Course Not Found'."),
                    ("Open Sarah's favourites / timetable course dropdown.", "Deleted course not listed (favourite removed with the course)."),
                ],
            },
            {
                "name": "Non-owner cannot delete a course",
                "technique": "Decision table, negative",
                "importance": 3,
                "reqs": ["REQ-MAN-04"],
                "pre": "John is CONTRIBUTOR of Sarah's 'Data Structures & Algorithms'.",
                "steps": [
                    ("John calls course.delete with the course id.", "FORBIDDEN 'Only the course owner can delete the course'; course still exists."),
                    ("John opens the course page.", "No settings/delete entry point is offered."),
                ],
            },
            {
                "name": "Toggle favourite on and off",
                "technique": "State transition (not favourite <-> favourite)",
                "importance": 2,
                "reqs": ["REQ-MAN-05"],
                "pre": "Student A has not favourited the new SQA course.",
                "steps": [
                    ("Click the star on the course page.", "Toast 'Added to favorites'; star filled yellow."),
                    ("Open Timetable > Add Class.", "The course now appears in the course dropdown."),
                    ("Click the star again.", "Toast 'Removed from favorites'; star empty; course no longer in the Add Class dropdown."),
                    ("Student B opens the same course (if shared) and checks the star.", "Student B's star is independent of Student A's."),
                ],
            },
        ],
    },
    # ======================================================================== K3
    {
        "name": "TS-K3 Resources & Files",
        "details": "Custom resource cards, permissions, deadlines and file uploads. Techniques: BVA, DT, EP, EG.",
        "cases": [
            {
                "name": "Owner creates a custom resource card",
                "technique": "Use case (main flow)",
                "importance": 3,
                "reqs": ["REQ-RES-01", "REQ-RES-02"],
                "pre": "Student A owns SECJ3343 SQA course (4 default cards).",
                "steps": [
                    ("Click 'Add Custom Resource'.", "Dialog 'Create Custom Resource' opens; 'Allow File Uploads' is ON, 'Set a Deadline' OFF."),
                    ("Enter title 'Midterm Exam Study Guide' and description 'Chapters 1-5'; click create.", "Toast 'Resource created successfully!'; dialog closes."),
                    ("Look at the grid.", "5 cards; the new card 'Midterm Exam Study Guide' with a delete button and 'Add Files' button."),
                ],
            },
            {
                "name": "Resource title and description boundaries",
                "technique": "BVA (title 0/1/100/101; description 500/501)",
                "importance": 2,
                "reqs": ["REQ-RES-01"],
                "pre": "Student A in the 'Create Custom Resource' dialog.",
                "steps": [
                    ("Leave title empty and submit.", "Not created (required field / toast 'Please enter a title')."),
                    ("Create resource with a 1-character title and one with a 100-character title.", "Both created."),
                    ("Type a 101-character title.", "Field stops at 100 characters."),
                    ("Call resource.create with a 101-character title and with a 501-character description.", "Both rejected by validation; nothing created."),
                    ("Create a resource with a 500-character description.", "Created."),
                ],
            },
            {
                "name": "Deadline states: future, within 3 days, overdue",
                "technique": "BVA/EP (deadline = +4 days, +2 days, -1 day)",
                "importance": 2,
                "reqs": ["REQ-RES-07", "REQ-RES-01"],
                "pre": "Student A owns the SQA course; today's date known.",
                "steps": [
                    ("Create resource 'D1' with 'Set a Deadline' = today + 4 days.", "Card shows 'Due: <date> at <time>' in neutral colour, no 'Soon' badge."),
                    ("Create resource 'D2' with deadline today + 2 days.", "Card shows 'Due: ...' with amber style and badge 'Soon'."),
                    ("Update 'D3' via resource.update with a deadline yesterday.", "Card shows 'Overdue: <date>' in red, no 'Soon' badge."),
                    ("Create a resource without a deadline.", "No deadline badge."),
                ],
            },
            {
                "name": "Create/update permission matrix",
                "technique": "Decision table (role x action)",
                "importance": 3,
                "reqs": ["REQ-RES-02"],
                "pre": "Course DSA: owner Sarah, John accepted CONTRIBUTOR. Course Machine Learning: owner John, Sarah accepted VIEWER. Michael unrelated.",
                "steps": [
                    ("John (CONTRIBUTOR) creates a custom resource in DSA.", "Allowed - 'Resource created successfully!'."),
                    ("John updates the title of a resource in DSA.", "Allowed."),
                    ("Sarah (VIEWER) opens Machine Learning.", "No 'Add Custom Resource' button."),
                    ("Sarah calls resource.create for Machine Learning.", "FORBIDDEN 'Only course owner and contributors can create resources'."),
                    ("Sarah calls resource.update on a Machine Learning resource.", "FORBIDDEN 'Only course owner and contributors can update resources'."),
                    ("Michael calls resource.create for DSA; call resource.create with an unknown courseId.", "FORBIDDEN (same message); 'Course not found'."),
                ],
            },
            {
                "name": "Delete resource - owner only, custom cards only in the UI",
                "technique": "Decision table (role x card type)",
                "importance": 3,
                "reqs": ["REQ-RES-03"],
                "pre": "Course DSA: owner Sarah, John CONTRIBUTOR; it has a CUSTOM card 'Extra' and the 4 default cards.",
                "steps": [
                    ("Sarah looks at the default cards (Assignments, Tasks, Content, Notes).", "No delete button on them."),
                    ("Sarah clicks delete on 'Extra'.", "Confirm 'Are you sure you want to delete this resource?'; Cancel keeps the card."),
                    ("Click delete again and confirm.", "Toast 'Resource deleted successfully'; card removed."),
                    ("John (CONTRIBUTOR) opens the course.", "No delete button on any card."),
                    ("John calls resource.delete for a resource of DSA.", "FORBIDDEN 'Only the course owner can delete resources'; resource still exists."),
                    ("Call resource.delete with an unknown id.", "NOT_FOUND 'Resource not found'."),
                ],
            },
            {
                "name": "Attach files to a card that allows uploads",
                "technique": "Use case, DT (allowFiles x role)",
                "importance": 3,
                "reqs": ["REQ-RES-04"],
                "pre": "Student A owns the SQA course; Assignments card allows files. File week1.pdf (1 MB) available. John is CONTRIBUTOR of DSA.",
                "steps": [
                    ("Click 'Add Files' on Assignments, drop week1.pdf and upload.", "Progress shown; toast 'Successfully uploaded 1 file!' then 'Files added successfully'."),
                    ("Look at the card.", "week1.pdf listed as a file link; the button now reads 'Add More Files'."),
                    ("John uploads a file to a DSA card that allows files.", "Allowed; file listed."),
                    ("A VIEWER (Sarah in Machine Learning) looks at a card.", "No 'Add Files' button; existing files can be opened/downloaded."),
                    ("Sarah calls resource.addFile for a Machine Learning resource.", "FORBIDDEN 'You don't have permission to add files to this resource'."),
                ],
            },
            {
                "name": "File upload refused for cards without uploads and invalid URLs",
                "technique": "EP (allowFiles false / invalid URL), error guessing",
                "importance": 2,
                "reqs": ["REQ-RES-04"],
                "pre": "Student A owns the SQA course; Tasks card has allowFiles = false; Assignments allows files.",
                "steps": [
                    ("Open the Tasks card.", "No 'Add Files' button is offered."),
                    ("Call resource.addFile on the Tasks card.", "BAD_REQUEST 'This resource does not allow file uploads'."),
                    ("Call resource.addFile on Assignments with fileUrls 'not-a-url'.", "Rejected by validation (invalid url); no file stored."),
                    ("Call resource.addFile with an array of two valid URLs.", "Both URLs added; card lists 2 files."),
                ],
            },
            {
                "name": "Upload limits: size, type and count",
                "technique": "BVA (16MB-1, 16MB, 16MB+1; 10/11 files; video 64MB; zip 32MB) and EP (types)",
                "importance": 3,
                "reqs": ["REQ-RES-05"],
                "pre": "Student A on 'Add Files' of an upload-enabled card. Test files prepared: pdf 15.9MB, pdf 16MB, pdf 16.1MB, mp4 64MB, mp4 65MB, zip 32MB, zip 33MB, .exe 1MB, 10 and 11 small PDFs.",
                "steps": [
                    ("Upload the 15.9MB and the 16MB PDF.", "Both accepted."),
                    ("Upload the 16.1MB PDF.", "Rejected: toast 'Failed to upload files: ...' (file too large); file marked error."),
                    ("Upload the 64MB mp4, then the 65MB mp4.", "64MB accepted; 65MB rejected."),
                    ("Upload the 32MB zip, then the 33MB zip.", "32MB accepted; 33MB rejected."),
                    ("Upload the .exe file.", "Rejected (type not allowed)."),
                    ("Upload 10 small PDFs together, then 11.", "10 accepted; 11 rejected (max file count)."),
                    ("Log out and call the upload endpoint courseResourceUploader.", "Rejected 'Unauthorized'."),
                ],
            },
            {
                "name": "Remove a file from a card",
                "technique": "DT (role x action)",
                "importance": 2,
                "reqs": ["REQ-RES-06"],
                "pre": "Assignments card of the SQA course holds files A and B; John is not a collaborator; Sarah (course DSA) is not CONTRIBUTOR of SQA.",
                "steps": [
                    ("Owner calls resource.removeFile with the URL of file A.", "Card now lists only file B; A is gone."),
                    ("A VIEWER or outsider calls resource.removeFile for file B.", "FORBIDDEN 'You don't have permission to remove files from this resource'; B stays."),
                    ("Owner calls removeFile with a valid URL that is not on the card.", "No change, no error; list unchanged."),
                ],
            },
        ],
    },
    # ======================================================================== K4
    {
        "name": "TS-K4 Timetable (UC-S4-005)",
        "details": "Timetables and weekly classes. Techniques: UC, BVA (time ranges, 3 per day, names), DT (roles), ST (invitation).",
        "cases": [
            {
                "name": "Create a timetable (first-time and name boundaries)",
                "technique": "Use case + BVA (name 0/1/100/101, description 500/501)",
                "importance": 3,
                "reqs": ["REQ-TT-01"],
                "pre": "Approved student E without any timetable (or Student A for the boundary steps).",
                "steps": [
                    ("Student E opens /timetable.", "'No Timetables Yet' and button 'Create Your First Timetable'."),
                    ("Create timetable 'SQA Week' with description 'Semester 1'.", "Timetable created and listed under 'My Timetables'; calendar week view shown (Monday-Sunday columns)."),
                    ("As Student A open Create Timetable and submit an empty name.", "Not submitted (required field); API 'Name is required'."),
                    ("Create timetables named with 1 and with 100 characters.", "Both created."),
                    ("Type 101 characters in the name; call timetable.create with a 501-character description.", "Name field stops at 100; API rejects the 501-character description."),
                ],
            },
            {
                "name": "Set, keep and lose the default timetable",
                "technique": "State transition (not default -> default -> cleared)",
                "importance": 2,
                "reqs": ["REQ-TT-02"],
                "pre": "Student A has default 'Fall 2024 Schedule' and the new owned timetable 'SQA Week'.",
                "steps": [
                    ("Open /timetable.", "'Fall 2024 Schedule' is selected first and has the 'Default' badge."),
                    ("Select 'SQA Week' > Timetable Settings > 'Set as Default'.", "Button becomes 'Currently Default' (disabled); badge 'Default' moves to 'SQA Week'."),
                    ("Reload /timetable.", "'SQA Week' opens first."),
                    ("Delete 'SQA Week' (Delete Timetable, confirm).", "Default is cleared; /timetable falls back to the first owned timetable."),
                    ("Student C calls timetable.setDefaultTimetable with Sarah's timetable id.", "FORBIDDEN 'You don't have access to this timetable'."),
                ],
            },
            {
                "name": "Add a weekly class to the timetable (main flow)",
                "technique": "Use case, EP valid classes",
                "importance": 3,
                "reqs": ["REQ-TT-03", "REQ-TT-04"],
                "pre": "Student A owns empty timetable 'SQA Week' (selected); favourites include Data Structures & Algorithms.",
                "steps": [
                    ("Click 'Add Class'.", "Modal 'Add Class' with Course, Title, Day of Week, Start Time, End Time, Location (Optional)."),
                    ("Open the Course dropdown.", "Only favourites listed (Data Structures & Algorithms, Web Development, Machine Learning); hint 'Only your favorited courses are shown'."),
                    ("Select Data Structures & Algorithms, title 'Application Development Lecture', Monday, 08:00-10:00, location 'Room 301'; click 'Add Class'.", "Modal closes without error."),
                    ("Look at the week view.", "Class shown on Monday 08:00-10:00 in the course colour (blue); clicking it opens 'Class Details' with Course, Day Monday, Time 08:00 - 10:00, Location Room 301."),
                    ("Move to the next week.", "The same class appears again on Monday (weekly recurring)."),
                ],
            },
            {
                "name": "Add Class with no favourite courses",
                "technique": "EP (no favourites)",
                "importance": 2,
                "reqs": ["REQ-TT-03"],
                "pre": "Student E owns a timetable but has no favourite courses.",
                "steps": [
                    ("Click 'Add Class'.", "Notice 'No Favorite Courses' / 'You need to favorite courses before adding them to your timetable'; no form."),
                    ("Click 'Go to Courses'.", "Modal closes."),
                ],
            },
            {
                "name": "API refuses classes for non-favourite courses",
                "technique": "Error guessing (API bypass)",
                "importance": 2,
                "reqs": ["REQ-TT-03"],
                "pre": "Student A owns 'SQA Week'; course 'SECJ3343 SQA' is NOT a favourite of A.",
                "steps": [
                    ("Call timetable.createEvent for 'SQA Week' with that course, Monday 13:00-14:00.", "BAD_REQUEST 'You can only add favorited courses to your timetable'; no event."),
                    ("Favourite the course (star) and repeat the call.", "Event created."),
                ],
            },
            {
                "name": "Class title and location length boundaries",
                "technique": "BVA (title 0/1/100/101, location 100/101)",
                "importance": 2,
                "reqs": ["REQ-TT-04"],
                "pre": "Student A, 'SQA Week' selected, favourite course available.",
                "steps": [
                    ("Leave Title empty.", "'Add Class' stays disabled (title required)."),
                    ("Add classes with a 1-character title and with a 100-character title on different days.", "Both added."),
                    ("Type 101 characters into Title and Location.", "Both inputs stop at 100 characters."),
                    ("Call timetable.createEvent with a 101-character title, then with a 101-character location.", "Both rejected by validation."),
                    ("Call timetable.createEvent with dayOfWeek -1 and 7.", "Both rejected (valid range 0-6); dayOfWeek 0 (Sunday) and 6 (Saturday) accepted."),
                    ("Call timetable.createEvent with startTime '9:00' and '0900'.", "Rejected 'Invalid time format (HH:MM)'."),
                ],
            },
            {
                "name": "End time must be after start time",
                "technique": "BVA (end = start-1min, = start, = start+1min) and error guessing",
                "importance": 3,
                "reqs": ["REQ-TT-05"],
                "pre": "Student A in 'Add Class' with course and title filled, Tuesday, start 10:00.",
                "steps": [
                    ("Set end time 09:59.", "Red message 'End time must be after start time'; 'Add Class' disabled."),
                    ("Set end time 10:00.", "Same message and disabled (equal times invalid)."),
                    ("Set end time 10:01.", "No message; 'Add Class' enabled; class (10:00-10:01) can be added."),
                    ("Call timetable.createEvent with startTime '10:00', endTime '09:00'.", "Expected: rejected. (API has no check and stores it - defect to report.)"),
                    ("Call timetable.createEvent with startTime '99:99'.", "Expected: rejected as invalid time. (Only the regexp ^\\d{2}:\\d{2}$ is checked - defect to report.)"),
                ],
            },
            {
                "name": "Time conflict detection boundaries",
                "technique": "BVA (overlap by 1 minute, back-to-back, other day)",
                "importance": 3,
                "reqs": ["REQ-TT-06"],
                "pre": "'SQA Week' has 'App Dev Lecture' Monday 08:00-10:00 (course DSA).",
                "steps": [
                    ("Add class Monday 09:00-11:00 (Web Development).", "Message 'Time conflict detected' and 'Overlaps with App Dev Lecture (08:00 - 10:00)'; 'Add Class' disabled."),
                    ("Change to Monday 09:59-11:00.", "Still a conflict (1-minute overlap)."),
                    ("Change to Monday 10:00-12:00.", "No conflict (back-to-back allowed); class can be added."),
                    ("Change to Monday 06:00-08:00.", "No conflict (ends exactly at 08:00)."),
                    ("Change the day to Tuesday 08:00-10:00.", "No conflict on another weekday; can be added."),
                    ("Add a class fully inside 08:30-09:00 on Monday.", "Conflict reported (contained interval)."),
                ],
            },
            {
                "name": "Maximum 3 classes per course per day",
                "technique": "BVA (0, 1, 2, 3 existing classes)",
                "importance": 3,
                "reqs": ["REQ-TT-07", "REQ-TT-06"],
                "pre": "'SQA Week' empty; favourite course Web Development.",
                "steps": [
                    ("Add Web Development class Wednesday 08:00-09:00.", "Added (0 existing)."),
                    ("Open Add Class again, pick Web Development, Wednesday.", "Info 'This course has 1 class on this day. You can add 2 more.'."),
                    ("Add Wednesday 09:00-10:00; then open the form again.", "Info 'This course has 2 classes on this day. You can add 1 more.'."),
                    ("Add Wednesday 10:00-11:00 (the 3rd).", "Added."),
                    ("Open the form for Web Development, Wednesday, 12:00-13:00.", "Orange message 'Maximum 3 classes per course per day. This course already has 3 classes on this day.'; 'Add Class' disabled."),
                    ("Select Thursday for the same course.", "Message disappears; class can be added."),
                ],
            },
            {
                "name": "Edit a class in the details dialog",
                "technique": "Use case (alternative flow A1), BVA",
                "importance": 2,
                "reqs": ["REQ-TT-08", "REQ-TT-05", "REQ-TT-06"],
                "pre": "'SQA Week' has 'App Dev Lecture' Monday 08:00-10:00 and 'Lab' Monday 10:00-12:00.",
                "steps": [
                    ("Click 'App Dev Lecture' > Edit Class.", "Dialog 'Edit Class' with current values."),
                    ("Change location to 'Room 302' and Save Changes.", "Saved; Class Details shows Room 302."),
                    ("Change end time to 10:01 (overlaps 'Lab').", "'Time conflict detected' / 'Overlaps with Lab (10:00 - 12:00)'; Save Changes disabled."),
                    ("Change end time to 10:00 again.", "No conflict (the class itself is ignored; back-to-back OK); Save works."),
                    ("Change end time before start time.", "'End time must be after start time'; Save disabled."),
                ],
            },
            {
                "name": "Drag and resize a class in the calendar",
                "technique": "Error guessing (UI gestures)",
                "importance": 2,
                "reqs": ["REQ-TT-08"],
                "pre": "'SQA Week' has Monday 08:00-10:00 'App Dev Lecture' and Tuesday 08:00-10:00 'Lab'.",
                "steps": [
                    ("Drag 'App Dev Lecture' to Wednesday 08:00.", "Moved; class now on Wednesday 08:00-10:00."),
                    ("Drag 'Lab' to overlap the lecture on Wednesday.", "Alert 'Cannot move event: Time conflict with another class'; Lab stays on Tuesday."),
                    ("Resize the lecture so it overlaps another class on its day.", "Alert 'Cannot resize event: Time conflict with another class'; unchanged."),
                    ("Resize it to 08:00-11:00 where free.", "Saved; Class Details shows 08:00 - 11:00."),
                    ("As a VIEWER try to drag a class.", "Not draggable / no change."),
                ],
            },
            {
                "name": "Delete a class",
                "technique": "Use case (alternative flow A2), state transition",
                "importance": 2,
                "reqs": ["REQ-TT-09"],
                "pre": "'SQA Week' has class 'Lab' on Tuesday.",
                "steps": [
                    ("Click 'Lab' > Delete.", "Confirmation 'Delete this class?' with 'Yes, Delete' and 'Cancel'."),
                    ("Click Cancel.", "Class still on the calendar."),
                    ("Delete again and click 'Yes, Delete'.", "Class disappears from this and all other weeks."),
                    ("Call timetable.deleteEvent with the deleted id.", "NOT_FOUND 'Event not found'."),
                ],
            },
            {
                "name": "Timetable role matrix (owner, contributor, viewer, outsider)",
                "technique": "Decision table (role x action)",
                "importance": 3,
                "reqs": ["REQ-TT-10", "REQ-TT-08", "REQ-TT-09"],
                "pre": "Seed: John's 'Fall 2024 Schedule' - Sarah CONTRIBUTOR (accepted). Sarah's 'Fall 2024 Schedule' - John VIEWER (accepted). Michael has no access to either.",
                "steps": [
                    ("Sarah opens John's timetable under 'Shared with Me'.", "Role shown as Contributor; 'Add Class' available; she can add, edit and delete a class."),
                    ("John opens Sarah's timetable under 'Shared with Me'.", "Role shown as Viewer; no 'Add Class'; classes only viewable."),
                    ("John calls timetable.createEvent / updateEvent / deleteEvent on Sarah's timetable.", "FORBIDDEN 'You don't have permission to add events to this timetable' / '... update this event' / '... delete this event'."),
                    ("Michael calls timetable.getById for Sarah's timetable.", "FORBIDDEN 'You don't have access to this timetable'."),
                    ("Call timetable.getById with an unknown id.", "NOT_FOUND 'Timetable not found'."),
                ],
            },
            {
                "name": "Invite a student to a timetable (search length, role, duplicates)",
                "technique": "BVA (query 2/3 chars), EP (roles), error guessing",
                "importance": 3,
                "reqs": ["REQ-TT-11"],
                "pre": "Student A owns 'SQA Week'. Alice (PENDING) and Emily are in the database; David already has a PENDING invitation to Sarah's 'Fall 2024 Schedule'.",
                "steps": [
                    ("Select 'SQA Week' > Share.", "Dialog with 'Invite as' Viewer/Contributor and 'Search for students' (min 3 characters)."),
                    ("Type 'em'.", "No search is run; hint 'Type at least 3 characters to search'."),
                    ("Type 'ema'.", "Results include Emily Rodriguez; Student A herself is not listed."),
                    ("Search 'ali'.", "Alice Wong (PENDING, not approved) is not listed."),
                    ("Choose Contributor and click Invite for Emily.", "Invitation created (PENDING); Emily gets notification 'New timetable invitation: Sarah Ahmed invited you to collaborate on SQA Week'."),
                    ("Call timetable.inviteCollaborator again for Emily.", "BAD_REQUEST 'User already invited'."),
                    ("Call inviteCollaborator with Sarah's own user id.", "BAD_REQUEST 'You can't invite yourself'."),
                    ("John (not owner) calls inviteCollaborator for 'SQA Week'.", "FORBIDDEN 'Only the owner can invite collaborators'."),
                    ("Call timetable.searchUsers with query 'ab'.", "Rejected 'Search query must be at least 3 characters'."),
                ],
            },
            {
                "name": "Timetable invitation lifecycle: accept, reject, leave",
                "technique": "State transition (PENDING -> ACCEPTED/REJECTED; ACCEPTED -> left)",
                "importance": 3,
                "reqs": ["REQ-TT-12", "REQ-TT-02"],
                "pre": "Sarah's timetable has a PENDING invitation for David (seed); Lisa has a PENDING invitation on John's timetable; Emily was invited to 'SQA Week' as Contributor.",
                "steps": [
                    ("David opens /courses.", "'Timetable Invitations' lists Sarah's 'Fall 2024 Schedule' with Accept and Reject."),
                    ("David clicks Accept.", "Timetable appears under 'Shared with Me' in /timetable; Sarah gets 'Invitation accepted: David Kim accepted your invitation to Fall 2024 Schedule'."),
                    ("Lisa clicks Reject.", "Invitation disappears; John gets 'Invitation declined'; timetable not shared with Lisa."),
                    ("David sets the shared timetable as default and then Timetable Settings > Leave Timetable > Confirm Leave.", "Timetable removed from 'Shared with Me' and the default is cleared."),
                    ("Sarah (owner) calls timetable.leaveTimetable on her own timetable.", "BAD_REQUEST 'You cannot leave a timetable you own. Delete it instead.'."),
                    ("David calls acceptInvitation again for the already handled invitation.", "Fails (no PENDING invitation); status is not changed."),
                ],
            },
            {
                "name": "Class reminder is created at the configured time",
                "technique": "EP / BVA (minutes until class = reminder time -2, -1, 0, +1, +2), use case",
                "importance": 2,
                "reqs": ["REQ-TT-13"],
                "pre": "Student A has a class today starting at HH:MM = now + 10 min on 'SQA Week' (default timetable), reminder timing at its default of 10 minutes. CRON_SECRET known.",
                "steps": [
                    ("GET /api/cron/class-reminders without Authorization header.", "401 'Unauthorized'."),
                    ("GET it with 'Authorization: Bearer <CRON_SECRET>'.", "JSON success; message 'Sent 1 reminder(s)' (or more)."),
                    ("Student A opens the notification bell.", "Notification 'Class starting in 10 minutes' with message '<course> at <HH:MM>'."),
                    ("Call the endpoint again in the same minute.", "No duplicate notification is created for the same class that day."),
                    ("Change the class to start in 13 minutes (3 min off) and call the endpoint.", "No reminder (outside +-1 minute of the 10-minute setting)."),
                    ("Set reminder timing to 5 minutes (Settings) with the class 5 minutes away and call again.", "Reminder 'Class starting in 5 minutes' created."),
                ],
            },
            {
                "name": "Rename and delete a timetable (owner only)",
                "technique": "Decision table (role x action), state transition",
                "importance": 3,
                "reqs": ["REQ-TT-14", "REQ-TT-02"],
                "pre": "Student A owns 'SQA Week' with 2 classes and Emily as accepted Contributor; 'SQA Week' is A's default and also Emily's default.",
                "steps": [
                    ("Emily calls timetable.update (new name) on 'SQA Week'.", "FORBIDDEN 'Only the owner can update this timetable'."),
                    ("Emily calls timetable.delete on 'SQA Week'.", "FORBIDDEN 'Only the owner can delete this timetable'."),
                    ("Student A renames the timetable via timetable.update to 'SQA Week 2' (101 characters is rejected).", "Name changed; 101-character name rejected."),
                    ("Student A: Timetable Settings > Delete Timetable and confirm.", "Timetable is deleted with its 2 classes."),
                    ("Student A and Emily open /timetable.", "'SQA Week 2' is gone for both; neither has it as default; Emily no longer sees it under 'Shared with Me'."),
                    ("Call timetable.delete with an unknown id.", "NOT_FOUND 'Timetable not found'."),
                ],
            },
        ],
    },
]


def _selfcheck():
    ids = [rid for spec in REQ_SPECS for rid, _, _ in spec["reqs"]]
    assert len(ids) == len(set(ids)), "duplicate requirement id"
    covered = {rid for s in SUITES for c in s["cases"] for rid in c["reqs"]}
    assert not set(ids) - covered, f"uncovered: {sorted(set(ids) - covered)}"
    assert not covered - set(ids), f"unknown refs: {sorted(covered - set(ids))}"


_selfcheck()
