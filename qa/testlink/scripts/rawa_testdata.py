"""Rawa Dara's Project 1 test basis + test cases for UniShare (SECJ3343 25/26-2).

Scope (Iteration 4, UniShare_Iteration_4.md): UC-S4-001 Course Sharing & Permissions,
UC-S4-003 Public Articles, UC-S4-004 Notifications.
Each requirement cites its source: the Iteration 4 document and the implementing code.
"""

AUTHOR = "rawa"
TOP_SUITE = "Rawa Dara - Sharing, Articles & Notifications (Iteration 4)"
TOP_SUITE_DETAILS = (
    "<p><b>Tester:</b> Rawa Dara<br/><b>Software under test:</b> UniShare (github.com/Seganation/unishare)<br/>"
    "<b>Test basis:</b> UniShare_Iteration_4.md use cases UC-S4-001, UC-S4-003, UC-S4-004 and the tRPC routers "
    "course.ts, resource.ts, article.ts, notification.ts.<br/>"
    "<b>Techniques:</b> Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Decision Table (DT), "
    "State Transition (ST), Use Case / scenario testing (UC), Error Guessing (EG).</p>"
    "<p><b>Common test data</b><br/>"
    "Student A - Sarah Ahmed (sarah@student.utm.my), course owner, APPROVED, Faculty of Computing<br/>"
    "Student B - John Doe (john@student.utm.my), APPROVED, Faculty of Computing (same faculty as A)<br/>"
    "Student C - Michael Chen (michael@student.utm.my), APPROVED, Faculty of Engineering (different faculty)<br/>"
    "Student D - Alice Wong (alice@student.utm.my), role PENDING (not approved)<br/>Seed data: prisma/seed.ts (all seeded passwords documented there).<br/>"
    "Course: \"SECJ3343 Software Quality Assurance\" created by Student A with one resource card "
    "\"Lecture Slides\" (file uploads allowed) holding file week1.pdf.</p>"
)

# ---------------------------------------------------------------- requirements (test basis)
REQ_SPECS = [
    {
        "doc_id": "SRS-R-SHR",
        "title": "UC-S4-001 Course Sharing & Permissions",
        "scope": "Course owner shares a course with other students as VIEWER or CONTRIBUTOR. "
        "Source: UniShare_Iteration_4.md Use Case Diagram 1 + Use Case 1; src/server/api/routers/course.ts "
        "(inviteCollaborator, acceptInvitation, rejectInvitation, getPendingInvitations); resource.ts.",
        "reqs": [
            ("REQ-SHR-01", "Only the course owner can invite collaborators",
             "The system shall allow only the student who created a course to invite collaborators. Any other user "
             "shall receive 'Only the owner can invite collaborators'. Inviting to a non-existent course shall return "
             "'Course not found'."),
            ("REQ-SHR-02", "Invalid invitations are rejected",
             "The system shall reject an invitation to the owner himself ('You can't invite yourself') and a second "
             "invitation to a user already invited to the same course ('User already invited')."),
            ("REQ-SHR-03", "Invitation carries a permission level",
             "The owner shall choose exactly one permission level, VIEWER or CONTRIBUTOR. A new invitation is stored "
             "with status PENDING and the invitee receives a COURSE_INVITATION notification "
             "'<owner> invited you to collaborate on <course>'."),
            ("REQ-SHR-04", "Invitee accepts or declines a pending invitation",
             "The invitee shall see pending invitations under Settings > Pending Invitations and can Accept or "
             "Decline. Accept sets status ACCEPTED and joinedAt and the course appears in the invitee's course list; "
             "Decline sets REJECTED. The owner receives 'Invitation accepted' / 'Invitation declined'. Only PENDING "
             "invitations can be answered."),
            ("REQ-SHR-05", "VIEWER has read-only access",
             "A VIEWER collaborator can open the shared course, view all resource cards and download files but "
             "cannot add, edit or delete resources or upload files."),
            ("REQ-SHR-06", "CONTRIBUTOR can add but not delete",
             "A CONTRIBUTOR can add/update resources and upload files to cards that allow uploads, but cannot delete "
             "resources ('Only the course owner can delete resources') or delete the course."),
            ("REQ-SHR-07", "Owner manages collaborators",
             "On Courses > <course> > Collaborators the owner can invite by email, change a collaborator's "
             "permission (VIEWER <-> CONTRIBUTOR) and remove a collaborator."),
            ("REQ-SHR-08", "Faculty-restricted sharing",
             "The system shall validate that the invited student belongs to the same faculty as the owner "
             "(Iteration 4: 'System validates student is in same faculty')."),
        ],
    },
    {
        "doc_id": "SRS-R-ART",
        "title": "UC-S4-003 Public Articles",
        "scope": "Students write articles that move DRAFT -> PUBLISHED -> ARCHIVED and are readable publicly. "
        "Source: UniShare_Iteration_4.md Use Case Diagram 3 + Use Case 3; src/server/api/routers/article.ts; "
        "src/app/(student)/my-articles, src/app/articles.",
        "reqs": [
            ("REQ-ART-01", "Article input validation",
             "Title is mandatory, 1 to 200 characters; Excerpt optional, max 500 characters; Cover image optional "
             "and must be a valid URL; Tags optional, comma-separated. Empty title shows 'Please enter a title for "
             "your article'."),
            ("REQ-ART-02", "New article starts as DRAFT",
             "Saving a new article stores it with status DRAFT, the author as current user, an estimated read time "
             "(words/200, rounded up) and shows 'Article saved as draft'."),
            ("REQ-ART-03", "Unique URL slug",
             "The slug is generated from the title (lower-case, punctuation removed, spaces -> '-'). If the slug "
             "exists the system appends -1, -2, ... On title change the slug is regenerated."),
            ("REQ-ART-04", "Publish workflow",
             "Only the author can publish, and only a DRAFT article can be published ('Only draft articles can be "
             "published'). Publishing sets PUBLISHED and publishedAt and shows 'Article published!'."),
            ("REQ-ART-05", "Archive and delete own article",
             "Only the author can archive ('Article archived') or delete ('Article deleted successfully') an article; "
             "other users get 'You can only archive/delete your own articles'."),
            ("REQ-ART-06", "Edit own article",
             "Only the author can edit an article ('You can only edit your own articles'). Saving shows "
             "'Changes saved'. Tags supplied on edit replace the previous tags."),
            ("REQ-ART-07", "Public article listing",
             "The /articles page lists only PUBLISHED articles, newest publishedAt first, 12 per page by default "
             "(page size 1-50). Search matches title or excerpt case-insensitively; filter by tag; the tag list "
             "shows only tags having at least one published article."),
            ("REQ-ART-08", "Article access control",
             "A PUBLISHED article is readable by anyone, including visitors not logged in. DRAFT and ARCHIVED "
             "articles are readable only by the author; others get 'This article is not published'. Unknown slug "
             "gives 'Article not found'."),
            ("REQ-ART-09", "View counter",
             "Opening a PUBLISHED article increments its view count by 1; DRAFT/ARCHIVED articles are not counted."),
            ("REQ-ART-10", "My Articles",
             "My Articles lists all of the author's articles (any status), most recently updated first, filterable "
             "by DRAFT / PUBLISHED / ARCHIVED."),
        ],
    },
    {
        "doc_id": "SRS-R-NOT",
        "title": "UC-S4-004 Notifications",
        "scope": "In-app notifications with unread badge and user preferences. Source: UniShare_Iteration_4.md "
        "Use Case Diagram 4 + Use Case 4; src/server/api/routers/notification.ts; "
        "src/components/notification-bell.tsx; src/app/(student)/settings/page.tsx.",
        "reqs": [
            ("REQ-NOT-01", "Event notifications",
             "The system shall create a notification for the recipient when a course invitation is sent "
             "(COURSE_INVITATION), accepted (INVITATION_ACCEPTED) or declined (INVITATION_REJECTED)."),
            ("REQ-NOT-02", "Unread badge",
             "The bell icon shows the number of unread notifications; no badge at 0; values above 9 show '9+'."),
            ("REQ-NOT-03", "Recent notifications dropdown",
             "Opening the bell lists the user's 20 most recent notifications, newest first; with none it shows "
             "'No notifications yet'."),
            ("REQ-NOT-04", "Mark one as read",
             "Clicking a notification marks it read and decreases the badge by 1. A course/timetable invitation "
             "notification opens Settings > Pending Invitations (/settings?tab=invitations)."),
            ("REQ-NOT-05", "Mark all as read",
             "'Mark all as read' sets every unread notification of the user to read; badge disappears."),
            ("REQ-NOT-06", "Notification privacy",
             "A user can only list, count and mark his own notifications; another user's notification id gives "
             "'Notification not found'."),
            ("REQ-NOT-07", "Notification preferences",
             "Settings > Notification Preferences lets the user switch in-app and email notifications on/off for "
             "Class reminders, Collaboration invites, Audit log alerts and System notifications. Defaults are "
             "created on first visit; saved values persist after reload."),
            ("REQ-NOT-08", "Reminder timing range",
             "Class reminder timing accepts 5 to 30 minutes before class; the UI offers 5, 10, 15 and 30."),
            ("REQ-NOT-09", "Full notification history",
             "'View all' opens the full notification list, paginated (page size 1-100, default 20)."),
        ],
    },
]

# ---------------------------------------------------------------- test cases
# importance: 3 high, 2 medium, 1 low.  steps: (action, expected)
SUITES = [
    {
        "name": "TS-R1 Share Course (UC-S4-001)",
        "details": "Owner invites students to a course. Techniques: EP, DT, EG.",
        "cases": [
            {
                "name": "Owner invites same-faculty student as VIEWER",
                "technique": "Use case (main flow), EP valid class",
                "importance": 3,
                "reqs": ["REQ-SHR-03", "REQ-SHR-07", "REQ-NOT-01"],
                "pre": "Student A logged in and owns course SECJ3343. Student B exists, same faculty, not yet invited.",
                "steps": [
                    ("Open Courses > SECJ3343 Software Quality Assurance > Collaborators.",
                     "Collaborators page shows 'Manage who has access to SECJ3343 Software Quality Assurance'."),
                    ("Enter Student B's email in the invite field (colleague@university.edu placeholder).",
                     "Email accepted in the field."),
                    ("Select permission 'Viewer' and click Invite.",
                     "Success message shown; Student B listed with role Viewer and status Pending."),
                    ("Log in as Student B and open the notification bell.",
                     "Notification 'New course invitation': 'Student A invited you to collaborate on SECJ3343 Software Quality Assurance'."),
                ],
            },
            {
                "name": "Owner invites same-faculty student as CONTRIBUTOR",
                "technique": "EP (role = CONTRIBUTOR partition)",
                "importance": 3,
                "reqs": ["REQ-SHR-03", "REQ-SHR-07"],
                "pre": "Student A owns SECJ3343. Student B has no invitation for this course.",
                "steps": [
                    ("On the Collaborators page enter Student B's email, select 'Contributor', click Invite.",
                     "Invitation created with role Contributor, status Pending."),
                    ("Log in as Student B, open Settings > Pending Invitations.",
                     "Invitation for SECJ3343 is listed showing permission Contributor and owner Student A."),
                ],
            },
            {
                "name": "Non-owner cannot invite collaborators",
                "technique": "DT (actor = collaborator/other student), negative",
                "importance": 3,
                "reqs": ["REQ-SHR-01"],
                "pre": "Student B is an ACCEPTED CONTRIBUTOR of SECJ3343 (owner Student A). Student C exists.",
                "steps": [
                    ("Log in as Student B, open SECJ3343 > Collaborators.",
                     "Invite controls are hidden or disabled for a non-owner."),
                    ("As Student B send an invite request for Student C to SECJ3343 (e.g. via the API course.inviteCollaborator).",
                     "Request rejected with FORBIDDEN 'Only the owner can invite collaborators'; no invitation created."),
                ],
            },
            {
                "name": "Owner cannot invite himself",
                "technique": "EG / EP invalid class (invitee = owner)",
                "importance": 2,
                "reqs": ["REQ-SHR-02"],
                "pre": "Student A logged in, owns SECJ3343.",
                "steps": [
                    ("On the Collaborators page enter Student A's own email, choose Viewer, click Invite.",
                     "Error 'You can't invite yourself'; no collaborator row added."),
                ],
            },
            {
                "name": "Duplicate invitation to the same student is rejected",
                "technique": "EP invalid class (already invited), DT",
                "importance": 2,
                "reqs": ["REQ-SHR-02"],
                "pre": "Student B already has a PENDING (repeat with ACCEPTED) invitation to SECJ3343.",
                "steps": [
                    ("Invite Student B again to SECJ3343 as Contributor.",
                     "Error 'User already invited'; existing invitation unchanged (role and status not modified)."),
                    ("Repeat with Student B's invitation in ACCEPTED status.",
                     "Same error 'User already invited'."),
                ],
            },
            {
                "name": "Invite to a course that does not exist",
                "technique": "EG, EP invalid course id",
                "importance": 1,
                "reqs": ["REQ-SHR-01"],
                "pre": "Student A logged in.",
                "steps": [
                    ("Call course.inviteCollaborator with courseId 'does-not-exist', a valid user id and role VIEWER.",
                     "NOT_FOUND 'Course not found'; nothing stored."),
                ],
            },
            {
                "name": "Invitation to a student from a different faculty is blocked",
                "technique": "EP (same faculty / different faculty partitions)",
                "importance": 3,
                "reqs": ["REQ-SHR-08"],
                "pre": "Student A (Faculty of Computing) owns SECJ3343. Student C is in Faculty of Engineering.",
                "steps": [
                    ("Search/enter Student C's email on the Collaborators page and click Invite as Viewer.",
                     "System refuses the invitation with a message that only students of the same faculty can be invited; no invitation or notification is created."),
                    ("Invite Student B (same faculty) the same way.",
                     "Invitation created (valid partition) - confirms the rule is faculty based."),
                ],
            },
            {
                "name": "Owner changes collaborator permission and removes collaborator",
                "technique": "ST (VIEWER -> CONTRIBUTOR -> removed)",
                "importance": 2,
                "reqs": ["REQ-SHR-07"],
                "pre": "Student B is ACCEPTED VIEWER on SECJ3343.",
                "steps": [
                    ("As Student A open Collaborators, change Student B's role to Contributor and save.",
                     "Student B shown as Contributor; Student B can now add a resource (see TS-R3)."),
                    ("Change Student B back to Viewer.",
                     "Role shown as Viewer; Student B can no longer add resources."),
                    ("Click Remove for Student B and confirm.",
                     "Student B disappears from the list; SECJ3343 no longer appears in Student B's courses."),
                ],
            },
        ],
    },
    {
        "name": "TS-R2 Respond to Course Invitation",
        "details": "Invitee accepts / declines. Techniques: ST (PENDING -> ACCEPTED/REJECTED), DT.",
        "cases": [
            {
                "name": "Invitee accepts a pending course invitation",
                "technique": "ST (PENDING -> ACCEPTED), use case main flow",
                "importance": 3,
                "reqs": ["REQ-SHR-04", "REQ-NOT-01"],
                "pre": "Student B has a PENDING VIEWER invitation to SECJ3343 from Student A.",
                "steps": [
                    ("Log in as Student B, open Settings > Pending Invitations.",
                     "Invitation listed with course title, owner name and permission Viewer."),
                    ("Click Accept.",
                     "Invitation removed from Pending Invitations; success message shown."),
                    ("Open Courses.",
                     "SECJ3343 Software Quality Assurance is listed as a shared course with role Viewer."),
                    ("Log in as Student A and open the bell.",
                     "Notification 'Invitation accepted': 'Student B accepted your invitation to SECJ3343 Software Quality Assurance'."),
                ],
            },
            {
                "name": "Invitee declines a pending course invitation",
                "technique": "ST (PENDING -> REJECTED)",
                "importance": 2,
                "reqs": ["REQ-SHR-04", "REQ-NOT-01"],
                "pre": "Student B has a PENDING invitation to SECJ3343.",
                "steps": [
                    ("As Student B open Settings > Pending Invitations and click Decline.",
                     "Invitation removed from the list; when none remain 'No pending invitations' is shown."),
                    ("Open Courses as Student B.",
                     "SECJ3343 is NOT listed."),
                    ("As Student A open the bell.",
                     "Notification 'Invitation declined': 'Student B declined your invitation to SECJ3343 Software Quality Assurance'."),
                ],
            },
            {
                "name": "Answered invitation cannot be accepted or declined again",
                "technique": "ST (invalid transition from ACCEPTED/REJECTED), EG",
                "importance": 2,
                "reqs": ["REQ-SHR-04"],
                "pre": "Student B's invitation to SECJ3343 is already ACCEPTED.",
                "steps": [
                    ("Call course.acceptInvitation for SECJ3343 again as Student B.",
                     "Request fails (record not found for status PENDING); status stays ACCEPTED, joinedAt unchanged, no new notification to owner."),
                    ("Call course.rejectInvitation for SECJ3343 as Student B.",
                     "Request fails; status stays ACCEPTED."),
                ],
            },
        ],
    },
    {
        "name": "TS-R3 Shared Course Permissions (Viewer / Contributor)",
        "details": "Decision table: role {Owner, Contributor, Viewer} x action {view, download, add, upload, delete resource, delete course}.",
        "cases": [
            {
                "name": "VIEWER can view and download but cannot modify",
                "technique": "DT (role = VIEWER column)",
                "importance": 3,
                "reqs": ["REQ-SHR-05"],
                "pre": "Student B is ACCEPTED VIEWER on SECJ3343; card 'Lecture Slides' holds week1.pdf.",
                "steps": [
                    ("Log in as Student B and open SECJ3343.",
                     "Course and all resource cards are displayed."),
                    ("Download week1.pdf from 'Lecture Slides'.",
                     "File downloads successfully."),
                    ("Look for Add resource / Upload / Edit / Delete controls.",
                     "Controls are not shown (read-only view)."),
                    ("Attempt resource.create on SECJ3343 via API as Student B.",
                     "FORBIDDEN 'Only course owner and contributors can create resources'."),
                    ("Attempt to upload a file to 'Lecture Slides' via API as Student B.",
                     "FORBIDDEN 'You don't have permission to add files to this resource'."),
                ],
            },
            {
                "name": "CONTRIBUTOR can add resources and upload files",
                "technique": "DT (role = CONTRIBUTOR, allowed actions)",
                "importance": 3,
                "reqs": ["REQ-SHR-06"],
                "pre": "Student B is ACCEPTED CONTRIBUTOR on SECJ3343.",
                "steps": [
                    ("As Student B open SECJ3343 and add resource card 'Tutorial 1'.",
                     "Card created and visible to Student A as well."),
                    ("Upload tutorial1.pdf (2 MB) into 'Lecture Slides'.",
                     "File uploaded and listed in the card."),
                    ("Edit the title of 'Tutorial 1' to 'Tutorial 1 - BVA'.",
                     "Change saved."),
                ],
            },
            {
                "name": "CONTRIBUTOR cannot delete resources or the course",
                "technique": "DT (role = CONTRIBUTOR, forbidden actions)",
                "importance": 3,
                "reqs": ["REQ-SHR-06"],
                "pre": "Student B is ACCEPTED CONTRIBUTOR on SECJ3343.",
                "steps": [
                    ("As Student B try to delete resource 'Lecture Slides'.",
                     "Delete control hidden; API call returns FORBIDDEN 'Only the course owner can delete resources'. Resource still exists."),
                    ("As Student B open SECJ3343 > Settings and try 'Delete course'.",
                     "Not allowed; course still exists."),
                ],
            },
            {
                "name": "Non-collaborator and declined user cannot open a private course",
                "technique": "EP (no relation / REJECTED / PENDING partitions)",
                "importance": 2,
                "reqs": ["REQ-SHR-04", "REQ-SHR-05"],
                "pre": "Student C has no relation to SECJ3343; Student B's invitation is REJECTED.",
                "steps": [
                    ("As Student C open /courses/<SECJ3343 id> directly.",
                     "Access denied / course not found; no resources shown."),
                    ("As Student B (rejected) open the same URL.",
                     "Access denied."),
                ],
            },
        ],
    },
    {
        "name": "TS-R4 Create & Edit Article (UC-S4-003)",
        "details": "My Articles > New Article / Edit. Techniques: BVA on title (1..200) and excerpt (0..500), EP on cover URL.",
        "cases": [
            {
                "name": "Create article saved as draft (valid data)",
                "technique": "Use case main flow, EP valid",
                "importance": 3,
                "reqs": ["REQ-ART-02", "REQ-ART-10"],
                "pre": "Student A logged in.",
                "steps": [
                    ("Open My Articles > New Article.",
                     "Form shows Title*, Excerpt (Optional), Cover Image (Optional), Tags (Optional), Content."),
                    ("Title 'Intro to Boundary Value Analysis', Excerpt 'Short guide to BVA', Tags 'Testing, QA', some content; click Save Draft.",
                     "Toast 'Article saved as draft'."),
                    ("Open My Articles.",
                     "Article listed with status DRAFT, tags Testing and QA, read time >= 1 min."),
                ],
            },
            {
                "name": "Title length boundaries (0, 1, 200, 201 characters)",
                "technique": "BVA",
                "importance": 3,
                "reqs": ["REQ-ART-01"],
                "pre": "Student A on My Articles > New Article.",
                "steps": [
                    ("Leave Title empty (0 chars), click Save Draft.",
                     "Error 'Please enter a title for your article'; nothing saved."),
                    ("Title = 'A' (1 char), Save Draft.",
                     "Saved as draft."),
                    ("Title = 200 x 'a', Save Draft.",
                     "Saved as draft."),
                    ("Title = 201 x 'a', Save Draft.",
                     "Rejected with validation error (max 200); nothing saved."),
                    ("Title = 5 spaces only.",
                     "Treated as empty: 'Please enter a title for your article'."),
                ],
            },
            {
                "name": "Excerpt length boundaries (500 / 501 characters)",
                "technique": "BVA",
                "importance": 2,
                "reqs": ["REQ-ART-01"],
                "pre": "Student A on New Article with valid title 'Excerpt test'.",
                "steps": [
                    ("Leave Excerpt empty and save.", "Saved (excerpt optional)."),
                    ("Excerpt = 499 characters, save.", "Saved."),
                    ("Excerpt = 500 characters, save.", "Saved."),
                    ("Excerpt = 501 characters, save.", "Validation error (max 500); not saved."),
                ],
            },
            {
                "name": "Cover image URL validation",
                "technique": "EP (valid URL / invalid text / empty)",
                "importance": 2,
                "reqs": ["REQ-ART-01"],
                "pre": "Student A on New Article, title 'Cover test'.",
                "steps": [
                    ("Cover image = https://utfs.io/f/cover.png, save.", "Saved; cover shown on article card."),
                    ("Cover image = 'not a url', save via API article.create.", "Validation error (invalid url); not saved."),
                    ("Cover image empty, save.", "Saved without cover (optional)."),
                ],
            },
            {
                "name": "Duplicate titles get unique slugs",
                "technique": "EG, EP (new slug / existing slug)",
                "importance": 2,
                "reqs": ["REQ-ART-03"],
                "pre": "No article with slug 'software-testing-101' exists.",
                "steps": [
                    ("Create article 'Software Testing 101!' and publish.", "URL is /articles/software-testing-101 (punctuation removed, lower-case, dashes)."),
                    ("Create a second article with the same title and publish.", "URL is /articles/software-testing-101-1."),
                    ("Create a third one.", "URL is /articles/software-testing-101-2."),
                ],
            },
            {
                "name": "Author edits own article; tags are replaced",
                "technique": "Use case alternative flow",
                "importance": 2,
                "reqs": ["REQ-ART-06", "REQ-ART-03"],
                "pre": "Student A has DRAFT 'Intro to Boundary Value Analysis' with tags Testing, QA.",
                "steps": [
                    ("Open My Articles > Edit; change title to 'BVA Explained', tags to 'Testing'; Save.",
                     "Toast 'Changes saved'."),
                    ("Re-open the article.",
                     "Title 'BVA Explained', slug 'bva-explained', only tag Testing (QA removed)."),
                ],
            },
            {
                "name": "User cannot edit another user's article",
                "technique": "DT (actor = non-author), negative",
                "importance": 3,
                "reqs": ["REQ-ART-06"],
                "pre": "Student A authored 'BVA Explained'. Student B logged in.",
                "steps": [
                    ("As Student B open /my-articles/<A's article id>/edit.", "Edit not possible / redirected; no form for A's article."),
                    ("Call article.update for that id with a new title as Student B.", "FORBIDDEN 'You can only edit your own articles'; article unchanged."),
                ],
            },
        ],
    },
    {
        "name": "TS-R5 Article Lifecycle (Publish / Archive / Delete)",
        "details": "State transition: DRAFT -> PUBLISHED -> ARCHIVED, delete from any state.",
        "cases": [
            {
                "name": "Publish a draft article",
                "technique": "ST (DRAFT -> PUBLISHED)",
                "importance": 3,
                "reqs": ["REQ-ART-04"],
                "pre": "Student A has DRAFT 'BVA Explained'.",
                "steps": [
                    ("In My Articles click Publish on 'BVA Explained'.", "Toast 'Article published!'; status PUBLISHED, published date = today."),
                    ("Log out and open /articles.", "'BVA Explained' appears first in the list."),
                ],
            },
            {
                "name": "Only DRAFT articles can be published",
                "technique": "ST (invalid transitions PUBLISHED->PUBLISHED, ARCHIVED->PUBLISHED)",
                "importance": 2,
                "reqs": ["REQ-ART-04"],
                "pre": "Student A has one PUBLISHED and one ARCHIVED article.",
                "steps": [
                    ("Call article.publish on the PUBLISHED article.", "BAD_REQUEST 'Only draft articles can be published'; publishedAt unchanged."),
                    ("Call article.publish on the ARCHIVED article.", "BAD_REQUEST 'Only draft articles can be published'; status stays ARCHIVED."),
                ],
            },
            {
                "name": "Archive own published article",
                "technique": "ST (PUBLISHED -> ARCHIVED)",
                "importance": 2,
                "reqs": ["REQ-ART-05", "REQ-ART-07"],
                "pre": "'BVA Explained' is PUBLISHED by Student A.",
                "steps": [
                    ("Open the article as Student A and choose Archive.", "Toast 'Article archived'; status ARCHIVED."),
                    ("Open /articles as a visitor.", "'BVA Explained' no longer listed."),
                ],
            },
            {
                "name": "Delete own article",
                "technique": "ST (any -> deleted)",
                "importance": 2,
                "reqs": ["REQ-ART-05"],
                "pre": "Student A has article 'Delete me' (DRAFT).",
                "steps": [
                    ("Open the article and choose Delete, confirm.", "Toast 'Article deleted successfully'; redirected; article gone from My Articles."),
                    ("Open its old URL /articles/delete-me.", "'Article not found'."),
                ],
            },
            {
                "name": "Non-author cannot publish, archive or delete",
                "technique": "DT (actor x action), negative",
                "importance": 3,
                "reqs": ["REQ-ART-04", "REQ-ART-05"],
                "pre": "Student A authored DRAFT X and PUBLISHED Y. Student B logged in.",
                "steps": [
                    ("As Student B call article.publish on X.", "FORBIDDEN 'You can only publish your own articles'."),
                    ("As Student B call article.archive on Y.", "FORBIDDEN 'You can only archive your own articles'."),
                    ("As Student B call article.delete on Y.", "FORBIDDEN 'You can only delete your own articles'; Y still exists."),
                    ("As Student B open Y's page.", "No Edit / Archive / Delete buttons shown."),
                ],
            },
        ],
    },
    {
        "name": "TS-R6 Browse & Read Public Articles",
        "details": "/articles and /articles/[slug]. Techniques: EP, BVA on paging, DT on access.",
        "cases": [
            {
                "name": "Access control by status and viewer",
                "technique": "DT (status {PUBLISHED, DRAFT, ARCHIVED} x viewer {visitor, other student, author})",
                "importance": 3,
                "reqs": ["REQ-ART-08"],
                "pre": "Student A has PUBLISHED P, DRAFT D, ARCHIVED R.",
                "steps": [
                    ("Logged out, open /articles/<P slug>.", "Article P displayed."),
                    ("Logged out, open /articles/<D slug> and /articles/<R slug>.", "'This article is not published' for both."),
                    ("As Student B open D and R.", "'This article is not published'."),
                    ("As Student A open D and R.", "Both displayed with author controls."),
                    ("Open /articles/no-such-slug.", "'Article not found'."),
                ],
            },
            {
                "name": "Listing shows only published, newest first, with pagination",
                "technique": "EP + BVA (13 articles vs page size 12)",
                "importance": 2,
                "reqs": ["REQ-ART-07"],
                "pre": "Exactly 13 PUBLISHED articles (published on different times) and 2 DRAFT articles exist.",
                "steps": [
                    ("Open /articles.", "12 articles on page 1, newest first; no DRAFT articles."),
                    ("Go to page 2.", "Exactly 1 article (the oldest)."),
                    ("Call article.getAllPublished with limit 0, 1, 50, 51.", "0 and 51 rejected by validation; 1 and 50 accepted."),
                ],
            },
            {
                "name": "Search and tag filter",
                "technique": "EP (title match / excerpt match / no match / case)",
                "importance": 2,
                "reqs": ["REQ-ART-07"],
                "pre": "Published 'BVA Explained' (excerpt 'boundary values', tag Testing) and 'Docker Basics' (tag DevOps).",
                "steps": [
                    ("Type 'bva' in 'Search articles by title, content, or tags...'.", "Only 'BVA Explained' shown (case-insensitive title match)."),
                    ("Search 'BOUNDARY'.", "'BVA Explained' shown (excerpt match)."),
                    ("Search 'zzzz'.", "Empty result message."),
                    ("Clear search, filter by tag Testing.", "Only 'BVA Explained'."),
                    ("Open the tag filter list.", "Contains Testing and DevOps; tags used only by drafts are not listed."),
                ],
            },
            {
                "name": "View counter increments only for published articles",
                "technique": "EP (published / not published)",
                "importance": 1,
                "reqs": ["REQ-ART-09"],
                "pre": "'BVA Explained' PUBLISHED with 5 views; DRAFT D with 0 views.",
                "steps": [
                    ("Open 'BVA Explained' as a visitor.", "View count becomes 6."),
                    ("Refresh once.", "View count becomes 7."),
                    ("Author opens DRAFT D.", "View count of D stays 0."),
                ],
            },
            {
                "name": "My Articles status filter",
                "technique": "EP (filter = all / DRAFT / PUBLISHED / ARCHIVED)",
                "importance": 1,
                "reqs": ["REQ-ART-10"],
                "pre": "Student A has 1 DRAFT, 2 PUBLISHED, 1 ARCHIVED; Student B has 1 PUBLISHED.",
                "steps": [
                    ("Open My Articles (all).", "4 articles of Student A only, most recently updated first."),
                    ("Filter Draft / Published / Archived.", "1 / 2 / 1 articles respectively; Student B's article never shown."),
                ],
            },
        ],
    },
    {
        "name": "TS-R7 Notification Centre (UC-S4-004)",
        "details": "Bell icon in the header. Techniques: BVA on badge (0, 1, 9, 10), ST (unread -> read).",
        "cases": [
            {
                "name": "Unread badge boundaries (0, 1, 9, 10)",
                "technique": "BVA",
                "importance": 3,
                "reqs": ["REQ-NOT-02"],
                "pre": "Student B logged in with 0 unread notifications.",
                "steps": [
                    ("Look at the bell.", "No badge shown (0)."),
                    ("Generate 1 notification (Student A invites B to a course). Refresh.", "Badge shows 1."),
                    ("Generate notifications until B has 9 unread.", "Badge shows 9."),
                    ("Generate the 10th.", "Badge shows '9+'."),
                ],
            },
            {
                "name": "Dropdown lists 20 most recent, newest first",
                "technique": "BVA (20 / 21 notifications), EP (empty)",
                "importance": 2,
                "reqs": ["REQ-NOT-03"],
                "pre": "Student B has 0 notifications.",
                "steps": [
                    ("Open the bell.", "'No notifications yet'."),
                    ("Create 21 notifications for B, open the bell.", "Exactly 20 shown, newest at top; oldest (1st) not shown."),
                ],
            },
            {
                "name": "Click invitation notification marks read and opens Pending Invitations",
                "technique": "ST (unread -> read), use case",
                "importance": 3,
                "reqs": ["REQ-NOT-04", "REQ-SHR-04"],
                "pre": "Student B has 3 unread, one of them 'New course invitation'.",
                "steps": [
                    ("Open the bell and click 'New course invitation'.", "Navigates to /settings?tab=invitations showing the invitation."),
                    ("Look at the bell.", "Badge decreased from 3 to 2; the clicked item is shown as read."),
                ],
            },
            {
                "name": "Mark all as read",
                "technique": "ST (all unread -> read)",
                "importance": 2,
                "reqs": ["REQ-NOT-05"],
                "pre": "Student B has 5 unread notifications.",
                "steps": [
                    ("Open the bell and click 'Mark all as read'.", "All items shown as read; badge disappears."),
                    ("Reload the page.", "Still no badge (persisted)."),
                ],
            },
            {
                "name": "User cannot read or mark another user's notification",
                "technique": "EG, security negative",
                "importance": 3,
                "reqs": ["REQ-NOT-06"],
                "pre": "Student A has notification N (id known). Student B logged in.",
                "steps": [
                    ("As Student B open the bell.", "N is not listed; unread count excludes A's notifications."),
                    ("As Student B call notification.markAsRead with N's id.", "Error 'Notification not found'; N stays unread for Student A."),
                ],
            },
            {
                "name": "View all notifications page with paging",
                "technique": "EP + BVA (limit 0, 1, 100, 101)",
                "importance": 2,
                "reqs": ["REQ-NOT-09"],
                "pre": "Student B has 25 notifications.",
                "steps": [
                    ("Open the bell and click 'View all'.", "Full notification page opens (/notifications) showing the first 20 and a way to load more."),
                    ("Load more.", "Remaining 5 shown; no duplicates."),
                    ("Call notification.getAll with limit 0, 1, 100, 101.", "0 and 101 rejected; 1 and 100 accepted."),
                ],
            },
        ],
    },
    {
        "name": "TS-R8 Notification Preferences",
        "details": "Settings > Notification Preferences. Techniques: EP, BVA (5..30 minutes), DT (channel x type).",
        "cases": [
            {
                "name": "Default preferences are created on first visit",
                "technique": "EP (new user without preferences)",
                "importance": 2,
                "reqs": ["REQ-NOT-07"],
                "pre": "Newly approved Student E who never opened Settings.",
                "steps": [
                    ("Open Settings > Notification Preferences.", "Page loads with default toggles; reminder timing shows 10 minutes."),
                ],
            },
            {
                "name": "Save in-app / email preferences per type",
                "technique": "DT (2 channels x 4 types)",
                "importance": 2,
                "reqs": ["REQ-NOT-07"],
                "pre": "Student B on Notification Preferences.",
                "steps": [
                    ("Turn OFF email 'Collaboration invites' and in-app 'Audit log alerts', keep the rest ON; Save.", "Success message."),
                    ("Reload page.", "Exactly those two toggles are OFF."),
                    ("Student A invites Student B to a course.", "In-app notification appears; no invitation email is sent to Student B."),
                ],
            },
            {
                "name": "Class reminder timing boundaries",
                "technique": "BVA (4, 5, 30, 31 minutes)",
                "importance": 2,
                "reqs": ["REQ-NOT-08"],
                "pre": "Student B on Notification Preferences.",
                "steps": [
                    ("Open 'Reminder Timing' dropdown.", "Options 5, 10, 15, 30 minutes only."),
                    ("Select 5 minutes, save, reload.", "5 minutes persisted."),
                    ("Select 30 minutes, save, reload.", "30 minutes persisted."),
                    ("Call notification.updatePreferences with classReminderMinutes 4 and 31.", "Both rejected by validation; stored value unchanged (30)."),
                ],
            },
        ],
    },
]
