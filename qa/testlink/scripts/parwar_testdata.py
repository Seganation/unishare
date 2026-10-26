"""Parwar's Project 1 test basis + test cases for UniShare (SECJ3343 25/26-2).

Scope: UniShare_Iteration_3.md AI Learning Assistant (UC2 Chat with AI Assistant, UC-S3-011..020: chat,
quizzes, study plans, AI note enhancement) and UniShare_Iteration_4.md UC-S4-002 Real-Time Collaborative Notes.
Each requirement cites its source: the iteration document and the implementing code.
"""

AUTHOR = "parwar"
TOP_SUITE = "Parwar - AI Assistant, Quizzes, Study Plans & Collaborative Notes (Iterations 3-4)"
TOP_SUITE_DETAILS = (
    "<p><b>Tester:</b> Parwar<br/><b>Software under test:</b> UniShare (github.com/Seganation/unishare)<br/>"
    "<b>Test basis:</b> UniShare_Iteration_3.md AI Learning Assistant use cases (UC2 Chat with AI Assistant, "
    "UC-S3-011..UC-S3-020, Sequences 2-4, Use Case 3 Generate AI Quiz) and UniShare_Iteration_4.md UC-S4-002 "
    "Real-Time Collaborative Notes; code: src/server/api/routers/ai.ts, src/server/ai/*, src/app/api/chat, "
    "src/app/api/ai/generate-note, src/app/api/notes, src/app/api/liveblocks-auth, src/components/ai/*, "
    "src/components/notes/*, src/app/(student)/ai, src/app/(student)/courses/[id]/notes.<br/>"
    "<b>Techniques:</b> Equivalence Partitioning (EP), Boundary Value Analysis (BVA), Decision Table (DT), "
    "State Transition (ST), Use Case / scenario testing (UC), Error Guessing (EG).</p>"
    "<p><b>Common test data</b> (prisma/seed.ts, every seeded password is admin123)<br/>"
    "Student A - Sarah Ahmed (sarah@student.utm.my), APPROVED, course owner<br/>"
    "Student B - John Doe (john@student.utm.my), APPROVED, ACCEPTED CONTRIBUTOR on the test course<br/>"
    "Student C - David Kim (david@student.utm.my), APPROVED, ACCEPTED VIEWER on the test course<br/>"
    "Student D - Michael Chen (michael@student.utm.my), APPROVED, no relation to the test course<br/>"
    "Student E - Alice Wong (alice@student.utm.my), role PENDING (not approved)<br/>"
    "Course: \"SECJ3343 Software Quality Assurance\" created by Student A (default cards incl. Notes), "
    "description \"Testing techniques and quality models\".<br/>"
    "AI provider: Google Gemini (GOOGLE_GENERATIVE_AI_API_KEY set, chat badge 'Gemini 2.5 Flash'); "
    "Liveblocks configured (LIVEBLOCKS_SECRET_KEY). API calls are made from the browser session of the named user "
    "(tRPC /api/trpc/ai.*, REST /api/chat, /api/ai/generate-note, /api/notes, /api/liveblocks-auth).</p>"
)

# ---------------------------------------------------------------- requirements (test basis)
REQ_SPECS = [
    {
        "doc_id": "SRS-P-CHAT",
        "title": "UC-S3-011/012/013/019/020 Chat with AI Assistant",
        "scope": "Student chats with the AI tutor, keeps a conversation history, continues and deletes conversations. "
        "Source: UniShare_Iteration_3.md AI Learning Assistant Use Case, Sequence 2, Use Case 2 (UC-S3-012); "
        "src/app/(student)/ai/[[...id]]/page.tsx, src/components/ai/ai-chat-interface.tsx, "
        "conversation-history-sidebar.tsx, src/app/api/chat/route.ts, src/server/api/routers/ai.ts.",
        "reqs": [
            ("REQ-P-CHAT-01", "Only approved, logged-in students use the AI assistant",
             "The /ai page shall be available only to authenticated users with role APPROVED; a PENDING user is "
             "redirected to /waiting-approval. POST /api/chat without a session returns 401 'Unauthorized'."),
            ("REQ-P-CHAT-02", "Message validation",
             "A message shall not be empty (whitespace only counts as empty; the Send button stays disabled and nothing "
             "is sent) and shall be at most 5000 characters ('Message must be under 5000 characters', Iteration 3 A2). "
             "Implementation note: tRPC ai.sendMessage accepts 1-10000 characters."),
            ("REQ-P-CHAT-03", "New conversation is created on first message",
             "Sending the first message in a new chat creates an AiConversation owned by the user with the "
             "client-generated id, temperature 0-2 (default 0.7) and an AI-generated title of at most 6 words "
             "(fallback: first 50 characters of the message). The URL changes to /ai/<id> and the conversation "
             "appears at the top of the sidebar. A request without conversationId returns 400 "
             "'No conversation ID provided'."),
            ("REQ-P-CHAT-04", "Streaming response and persistence",
             "The AI answer (model badge 'Gemini 2.5 Flash') streams into the chat while a loader is shown; input "
             "submission is disabled while status is submitted/streaming. When the stream finishes the user and "
             "assistant messages are saved (assistant message with tokensUsed) and the conversation updatedAt is set."),
            ("REQ-P-CHAT-05", "Continue a previous conversation",
             "Opening /ai/<id> loads all messages of that conversation oldest first; a follow-up message is answered "
             "with the earlier messages as context and is appended to the same conversation."),
            ("REQ-P-CHAT-06", "Conversation history sidebar",
             "The sidebar lists only the user's conversations, most recently updated first, 5 at a time; 'Load More' "
             "adds 10 more and the footer shows 'Showing <n> of <total>'. A conversation without title shows "
             "'Untitled Chat'. 'New Chat' opens an empty chat at /ai. API page size 1-100."),
            ("REQ-P-CHAT-07", "Delete a conversation",
             "The delete icon asks 'Delete this conversation? This action cannot be undone.'; on OK the conversation and "
             "all its messages are deleted (cascade) and it disappears from the sidebar; on Cancel nothing changes."),
            ("REQ-P-CHAT-08", "Conversation privacy",
             "A user can read, continue or delete only his own conversations. Another user's conversation id gives "
             "NOT_FOUND 'Conversation not found' (Iteration 3 A3: no access to other users' conversations)."),
            ("REQ-P-CHAT-09", "AI unavailable handling",
             "If the AI server cannot be reached the chat shows 'Unable to connect to AI server. Please make sure Ollama "
             "is running.'; a server-side failure returns 500 'Failed to process AI request'. The user message is kept "
             "and the student can retry."),
        ],
    },
    {
        "doc_id": "SRS-P-QUIZ",
        "title": "UC-S3-014/015 Generate and Attempt AI Quiz",
        "scope": "Student generates a practice quiz with AI for a course and attempts it with automatic grading. "
        "Source: UniShare_Iteration_3.md Sequence 3, Use Case 3 (UC-S3-014), UC-S3-015; src/server/api/routers/ai.ts "
        "(generateQuiz, getQuizzes, getQuiz, submitQuizAttempt, deleteQuiz); src/server/ai/quiz-generator.ts; "
        "src/components/ai/quiz-generator-form.tsx, quiz-taker.tsx, quiz-results.tsx, quiz-list.tsx; "
        "course page tab 'Quizzes'.",
        "reqs": [
            ("REQ-P-QUIZ-01", "Quiz generation form and limits",
             "Course > Quizzes > Generate Quiz shows Topic * (required, trimmed; empty gives 'Please enter a topic'), "
             "Number of Questions slider 5-50 in steps of 5 (default 10), Difficulty Easy/Medium/Hard (default Medium) "
             "and Question Types Multiple Choice, True/False (checked by default) and Short Answer. The API accepts "
             "questionCount 1-50 and difficulty easy|medium|hard."),
            ("REQ-P-QUIZ-02", "At least one question type",
             "Submitting with no question type checked shows 'Please select at least one question type' and no quiz is "
             "generated."),
            ("REQ-P-QUIZ-03", "Course / note context access",
             "A quiz may be generated for a course or note only by the course owner or an ACCEPTED collaborator. "
             "Unknown course: 'Course not found'; no access: 'You don't have access to this course'. Unknown note: "
             "'Note not found'; no access: 'You don't have access to this note'."),
            ("REQ-P-QUIZ-04", "Successful generation is saved",
             "On success the quiz and its questions (in generated order) are stored for the user with the topic as "
             "prompt and token usage, toast 'Quiz generated successfully!' is shown and the quiz opens for taking. "
             "While generating, the form is disabled and the button shows 'Generating...'. If the AI answer is not "
             "valid quiz JSON the error 'Failed to generate quiz. The AI response was not in the expected format.' is "
             "shown and nothing is saved."),
            ("REQ-P-QUIZ-05", "Taking a quiz",
             "The quiz taker shows '<answered> of <total> answered', '<p>% complete', one button per question, "
             "Previous (disabled on question 1), Next, and on the last question 'Submit Quiz', which stays disabled "
             "until every question is answered ('Please answer all questions before submitting'). Multiple choice shows "
             "the generated options, True/False shows True and False, Short Answer shows 'Type your answer here...'."),
            ("REQ-P-QUIZ-06", "Automatic grading and score",
             "Multiple choice and True/False answers are correct only on exact match with the stored correct answer; "
             "Short Answer is compared trimmed and case-insensitive. Score = correct / total questions x 100. The "
             "attempt is saved with completedAt. Results show the score with message: >=90 'Excellent!', >=80 "
             "'Great job!', >=70 'Good work!', >=60 'Not bad!', otherwise 'Keep studying!'."),
            ("REQ-P-QUIZ-07", "Quiz list and repeated attempts",
             "The Quizzes tab lists the user's quizzes for the course newest first with 'Best Score: <n>%'; with none it "
             "shows 'No quizzes yet'. A quiz can be attempted any number of times ('Retake Quiz'); every attempt is "
             "kept."),
            ("REQ-P-QUIZ-08", "Quiz ownership and delete",
             "Only the creator can open, attempt or delete a quiz; otherwise 'Quiz not found'. Delete asks 'Are you sure "
             "you want to delete this quiz? This action cannot be undone.' and removes the quiz with its questions and "
             "attempts."),
        ],
    },
    {
        "doc_id": "SRS-P-PLAN",
        "title": "UC-S3-016/017 Generate and Track AI Study Plan",
        "scope": "Student generates a weekly study plan for a course and tracks task completion. "
        "Source: UniShare_Iteration_3.md Sequence 4, UC-S3-016, UC-S3-017, Data Description 'Study Plan Generation'; "
        "src/server/api/routers/ai.ts (generateStudyPlan, getStudyPlans, updateStudyPlanTask, deleteStudyPlan); "
        "src/server/ai/study-plan-generator.ts; src/components/ai/study-plan-generator-form.tsx, "
        "study-plan-viewer.tsx, study-plan-list.tsx; prisma/schema.prisma (AiStudyPlan).",
        "reqs": [
            ("REQ-P-PLAN-01", "Study plan form and limits",
             "Generate Study Plan requires a course ('Please select a course'); Number of Weeks 1-16 (default 4; "
             "Iteration 3 states 1-12), Hours Per Week 1-40 (default 5), Learning Goal (Optional) and Target Deadline "
             "(Optional, dates before today cannot be picked). Values outside the ranges are rejected by the API."),
            ("REQ-P-PLAN-02", "Course access for study plans",
             "Only the course owner or an ACCEPTED collaborator can generate a plan for a course. Unknown course: "
             "'Course not found'; no access: 'You don't have access to this course'."),
            ("REQ-P-PLAN-03", "Generated plan is saved with weeks and tasks",
             "On success the plan is saved with its weeks (ordered by week number) and tasks (in order), toast "
             "'Study plan generated successfully!' is shown. Without goal the stored prompt is 'Study plan for course'. "
             "With a deadline endDate = deadline and startDate = deadline - weeks x 7 days. Invalid AI JSON gives "
             "'Failed to generate study plan. The AI response was not in the expected format.'"),
            ("REQ-P-PLAN-04", "Track progress",
             "Ticking a task marks it completed (completedAt set, toast 'Task updated'); unticking clears completedAt. "
             "Overall Progress = completed tasks / all tasks x 100 (rounded, 0% when there are no tasks) and every week "
             "shows its Week Progress; a week at 100% is shown as complete."),
            ("REQ-P-PLAN-05", "Plan ownership and delete",
             "Only the owner of a plan can update its tasks ('Task not found' otherwise) or delete it ('Study plan not "
             "found'). Delete asks 'Are you sure you want to delete this study plan? This action cannot be undone.'. "
             "With no plans the tab shows 'No study plans yet'."),
            ("REQ-P-PLAN-06", "Plan kept when the course is deleted",
             "Study plans are linked to a course by an optional courseId with SET NULL on course delete, so plans are "
             "preserved (Iteration 3 Data Description)."),
        ],
    },
    {
        "doc_id": "SRS-P-AIN",
        "title": "UC-S3-018 Enhance Notes with AI",
        "scope": "Student uses AI to generate, improve, summarize or expand a course note. "
        "Source: UniShare_Iteration_3.md UC-S3-018, Data Description 'Note Enhancement'; "
        "src/app/api/ai/generate-note/route.ts; src/server/api/routers/ai.ts (generateNote, getNoteGenerations).",
        "reqs": [
            ("REQ-P-AIN-01", "Enhancement request validation",
             "Type must be one of GENERATE, IMPROVE, SUMMARIZE, EXPAND and prompt must be 1-5000 characters; otherwise "
             "400 'Invalid request'. Temperature, if given, 0-2."),
            ("REQ-P-AIN-02", "Only owner or contributor can enhance a note",
             "The course owner and ACCEPTED CONTRIBUTORs can enhance a note. A VIEWER or unrelated user gets 403 "
             "'Forbidden: You don't have permission to edit this note'; unknown note 404 'Note not found'; no session "
             "401 'Unauthorized'."),
            ("REQ-P-AIN-03", "Enhancement result and history",
             "A successful call returns success, generatedText (markdown) and tokensUsed and stores an AiGeneratedNote "
             "with prompt, type, content before and after. getNoteGenerations returns only the caller's generations "
             "for that note, newest first (page size 1-50, default 20). AI provider errors return 503."),
        ],
    },
    {
        "doc_id": "SRS-P-NOTE",
        "title": "UC-S4-002 Real-Time Collaborative Notes",
        "scope": "Course owner and collaborators edit nested note pages together in real time (Liveblocks + BlockNote). "
        "Source: UniShare_Iteration_4.md Use Case Diagram 2 and Use Case 2 (UC-S4-002), Data Description 'Note Table'; "
        "src/app/(student)/courses/[id]/notes/[[...pageId]]/page.tsx, src/components/notes/*, "
        "src/components/resources/resource-card.tsx, src/app/api/notes/create, src/app/api/notes/[id], "
        "src/app/api/liveblocks-auth/route.ts.",
        "reqs": [
            ("REQ-P-NOTE-01", "Open course notes",
             "'Open Collaborative Notes' on the Notes card opens /courses/<id>/notes. If the course has no pages and the "
             "user can edit, a page 'Getting Started' is created and opened; a VIEWER sees 'No pages have been created "
             "yet. Ask a contributor or owner to create one.'. Without page id, or with an unknown / other course page "
             "id, the first page is opened."),
            ("REQ-P-NOTE-02", "Only course members can open notes",
             "Only the owner and ACCEPTED collaborators can open the notes: others are redirected to /courses/<id>, "
             "logged-out users to /login, unknown course to /courses. Liveblocks auth: no session 401 'Unauthorized', "
             "missing room 400 'Bad Request - Room ID missing', unknown page 404 'Page not found', non-member 403 "
             "'Forbidden'."),
            ("REQ-P-NOTE-03", "Role-based editing (OWNER / CONTRIBUTOR / VIEWER)",
             "The header shows the role badge OWNER, CONTRIBUTOR or VIEWER. OWNER and CONTRIBUTOR can edit content, "
             "titles and pages. VIEWER sees 'Viewing in Read-Only Mode', cannot type in the editor or title and sees "
             "no add/delete page controls; the server must not accept a VIEWER's edits (Iteration 4: VIEWER read-only)."),
            ("REQ-P-NOTE-04", "Real-time synchronisation and persistence",
             "Text typed by one member appears for the other members of the same page in real time; concurrent edits, "
             "also of the same block, merge without conflict and all editors converge (Yjs CRDT). Content is persisted "
             "by Liveblocks ('All changes saved') and is still there after reload."),
            ("REQ-P-NOTE-05", "Presence of live collaborators",
             "The 'Active Collaborators' bar shows the current user ('<name> (You)') and up to 5 other online users as "
             "coloured initials, '+<n>' for more, and '<count> online'. When a user leaves, his avatar disappears."),
            ("REQ-P-NOTE-06", "Create pages and nested sub-pages",
             "The '+' button in 'Pages' creates an 'Untitled' page placed after the last page and opens it; 'Add sub-page' "
             "creates a child page shown indented under its parent (expand/collapse). Each page has its own room. The "
             "title is edited inline and saved on Enter or leaving the field."),
            ("REQ-P-NOTE-07", "Delete pages and server-side permission checks",
             "Delete asks 'Are you sure you want to delete this page?'; deleting a page also deletes its sub-pages; if "
             "the open page is deleted the first remaining page opens. A VIEWER calling the API gets 403 'You don't have "
             "permission to create pages' / 'You don't have permission to edit this page' / 'You don't have permission "
             "to delete this page'."),
            ("REQ-P-NOTE-08", "Network interruption",
             "If a member loses connection, edits are kept locally and synchronised when the connection returns "
             "(Iteration 4 UC-S4-002 A1)."),
        ],
    },
]

# ---------------------------------------------------------------- test cases
# importance: 3 high, 2 medium, 1 low.  steps: (action, expected)
SUITES = [
    {
        "name": "TS-P1 Chat with AI Assistant (UC-S3-012)",
        "details": "/ai chat page. Techniques: UC, EP, BVA on message length (0, 1, 5000, 5001), EG.",
        "cases": [
            {
                "name": "Start a new AI conversation (main flow)",
                "technique": "Use case (main flow), EP valid",
                "importance": 3,
                "reqs": ["REQ-P-CHAT-03", "REQ-P-CHAT-04"],
                "pre": "Student A logged in; AI provider reachable; Student A has 0 conversations.",
                "steps": [
                    ("Open AI Assistant (/ai).",
                     "Empty chat with suggestions, input 'Ask AI anything...', badge 'Gemini 2.5 Flash', sidebar button 'New Chat'."),
                    ("Type 'Explain the difference between let and const in JavaScript' and press Enter.",
                     "Message shown as user message; loader shown and Send disabled while the answer streams."),
                    ("Wait until the answer is complete.",
                     "Full AI answer shown; URL is now /ai/<conversation id>."),
                    ("Look at the sidebar.",
                     "New conversation on top with a short AI title (max 6 words, e.g. 'JavaScript let vs const'); footer 'Showing 1 of 1'."),
                    ("Reload the page.",
                     "Both messages are still shown (saved); assistant message has tokensUsed > 0 in the database."),
                ],
            },
            {
                "name": "Empty and whitespace-only message is not sent",
                "technique": "EP invalid class (empty), BVA (length 0)",
                "importance": 3,
                "reqs": ["REQ-P-CHAT-02"],
                "pre": "Student A on /ai with a new chat.",
                "steps": [
                    ("Leave the input empty.", "Send button disabled."),
                    ("Type 5 spaces and press Enter.",
                     "No message is sent and no conversation is created (Iteration 3 A1: 'Message cannot be empty')."),
                    ("Type 'a' (1 character) and send.", "Message sent and answered (lower valid boundary)."),
                ],
            },
            {
                "name": "Message length boundaries (4999, 5000, 5001 characters)",
                "technique": "BVA",
                "importance": 2,
                "reqs": ["REQ-P-CHAT-02"],
                "pre": "Student A on /ai, new chat.",
                "steps": [
                    ("Send a message of 4999 x 'a'.", "Accepted and answered."),
                    ("Send a message of exactly 5000 characters.", "Accepted and answered."),
                    ("Send a message of 5001 characters.",
                     "Rejected with 'Message must be under 5000 characters' and character count; nothing sent."),
                    ("Call ai.sendMessage on an existing conversation with content of 10000 and 10001 characters.",
                     "10000 accepted, 10001 rejected by validation (implementation limit)."),
                ],
            },
            {
                "name": "Continue a previous conversation with context",
                "technique": "Use case (UC-S3-013), ST (existing conversation)",
                "importance": 3,
                "reqs": ["REQ-P-CHAT-05", "REQ-P-CHAT-04"],
                "pre": "Student A has conversation 'JavaScript let vs const' with 2 messages.",
                "steps": [
                    ("Click the conversation in the sidebar.",
                     "URL /ai/<id>; the 2 earlier messages shown oldest first."),
                    ("Send 'Give me a code example of the second one'.",
                     "Answer refers to const (uses earlier context)."),
                    ("Reload.", "Conversation now has 4 messages; it is first in the sidebar (latest updated)."),
                ],
            },
            {
                "name": "Chat access without approval, session or conversation id",
                "technique": "EP (APPROVED / PENDING / logged out), EG (missing id)",
                "importance": 3,
                "reqs": ["REQ-P-CHAT-01", "REQ-P-CHAT-03"],
                "pre": "Logged out browser; Student A (APPROVED) and Student E (PENDING) accounts available.",
                "steps": [
                    ("Logged out, POST /api/chat with a message body.", "HTTP 401 'Unauthorized'."),
                    ("Logged out, open /ai.", "Redirected to the login page."),
                    ("Log in as Student A and POST /api/chat with a message but no conversationId.",
                     "HTTP 400 'No conversation ID provided'; no conversation created."),
                    ("Log in as Student E (PENDING) and open /ai.", "Redirected to /waiting-approval; chat not shown."),
                ],
            },
            {
                "name": "AI server unavailable",
                "technique": "EG (external system down)",
                "importance": 2,
                "reqs": ["REQ-P-CHAT-09"],
                "pre": "Student A on /ai. AI provider blocked (invalid GOOGLE_GENERATIVE_AI_API_KEY or network off).",
                "steps": [
                    ("Send 'Hello'.",
                     "Red alert shown: 'Unable to connect to AI server. Please make sure Ollama is running.' or the server error; page does not crash."),
                    ("Restore the AI provider and send 'Hello' again.", "Answer received; student could retry."),
                ],
            },
        ],
    },
    {
        "name": "TS-P2 Conversation History & Privacy (UC-S3-019/020)",
        "details": "Sidebar history, paging, delete, ownership. Techniques: BVA (5/6, 15/16 conversations), ST, DT.",
        "cases": [
            {
                "name": "Sidebar paging boundaries (5, 6 and 16 conversations)",
                "technique": "BVA (page size 5, step 10)",
                "importance": 2,
                "reqs": ["REQ-P-CHAT-06"],
                "pre": "Student A has exactly 5 conversations.",
                "steps": [
                    ("Open /ai.", "5 conversations, newest updated first; 'Showing 5 of 5'; no 'Load More'."),
                    ("Create a 6th conversation and reload.", "'Showing 5 of 6' and 'Load More' button."),
                    ("Click 'Load More'.", "'Showing 6 of 6'; 'Load More' disappears."),
                    ("With 16 conversations reload and click 'Load More' once.",
                     "'Showing 15 of 16'; Load More again gives 'Showing 16 of 16'."),
                    ("Call ai.getConversations with limit 0, 1, 100, 101.", "0 and 101 rejected; 1 and 100 accepted."),
                ],
            },
            {
                "name": "New Chat and untitled conversation",
                "technique": "EP (titled / untitled)",
                "importance": 1,
                "reqs": ["REQ-P-CHAT-06", "REQ-P-CHAT-03"],
                "pre": "Student A inside conversation /ai/<id>.",
                "steps": [
                    ("Click 'New Chat'.", "URL /ai; empty chat; previous conversation still in sidebar."),
                    ("Call ai.createConversation with title '' (empty) via API, reload.",
                     "Conversation listed as 'Untitled Chat'."),
                    ("Call ai.createConversation without title.", "Conversation titled 'New Conversation', temperature 0.7."),
                    ("Call ai.createConversation with temperature -0.1, 0, 2, 2.1.", "-0.1 and 2.1 rejected; 0 and 2 accepted."),
                ],
            },
            {
                "name": "Delete conversation - confirm and cancel",
                "technique": "ST (exists -> deleted), DT (OK / Cancel)",
                "importance": 3,
                "reqs": ["REQ-P-CHAT-07"],
                "pre": "Student A has conversation X with 4 messages, currently open.",
                "steps": [
                    ("Hover X in the sidebar, click the delete icon, choose Cancel in 'Delete this conversation? This action cannot be undone.'",
                     "Nothing deleted; X still listed."),
                    ("Repeat and choose OK.", "X removed from the sidebar; chat returns to a new empty chat at /ai."),
                    ("Open /ai/<X id>.", "No messages of X are shown (conversation and its 4 messages deleted)."),
                ],
            },
            {
                "name": "User cannot read, continue or delete another user's conversation",
                "technique": "DT (actor = other user x action), security negative",
                "importance": 3,
                "reqs": ["REQ-P-CHAT-08"],
                "pre": "Student A owns conversation X (id known). Student B logged in.",
                "steps": [
                    ("As Student B look at the sidebar.", "X is not listed."),
                    ("As Student B call ai.getConversation with X's id.", "NOT_FOUND 'Conversation not found'."),
                    ("As Student B call ai.sendMessage on X with 'hi'.", "NOT_FOUND 'Conversation not found'; no message added to X."),
                    ("As Student B call ai.deleteConversation with X's id.", "NOT_FOUND 'Conversation not found'; X still exists for Student A."),
                    ("As Student B POST /api/chat with conversationId = X's id.",
                     "Student A's messages are not returned or changed (must not create or reuse X for Student B)."),
                ],
            },
        ],
    },
    {
        "name": "TS-P3 Generate AI Quiz (UC-S3-014)",
        "details": "Course > Quizzes > Generate Quiz. Techniques: UC, BVA (questions 0/1/5/50/51), EP (difficulty, types), DT (access).",
        "cases": [
            {
                "name": "Generate a quiz for own course (main flow)",
                "technique": "Use case main flow, EP valid",
                "importance": 3,
                "reqs": ["REQ-P-QUIZ-01", "REQ-P-QUIZ-04"],
                "pre": "Student A logged in, owns SECJ3343; AI provider reachable.",
                "steps": [
                    ("Open SECJ3343 > tab Quizzes.", "'Course Quizzes' with 'Generate Quiz' button; list shows 'No quizzes yet'."),
                    ("Click Generate Quiz.",
                     "Form: Topic *, Number of Questions = 10 (slider 5-50), Difficulty = Medium, Multiple Choice and True/False checked, Short Answer unchecked."),
                    ("Topic 'Boundary Value Analysis', 10 questions, Medium; click Generate Quiz.",
                     "Button shows 'Generating...', fields disabled."),
                    ("Wait for completion.",
                     "Toast 'Quiz generated successfully!'; quiz taker opens with '0 of 10 answered' and badge '10 questions'."),
                ],
            },
            {
                "name": "Topic is required",
                "technique": "EP invalid (empty / whitespace), BVA (length 0/1)",
                "importance": 3,
                "reqs": ["REQ-P-QUIZ-01"],
                "pre": "Student A on Generate Quiz form of SECJ3343.",
                "steps": [
                    ("Leave Topic empty and click Generate Quiz.", "Toast 'Please enter a topic'; no request sent."),
                    ("Topic = 3 spaces, Generate Quiz.", "Toast 'Please enter a topic'."),
                    ("Topic = 'X' (1 character), Generate Quiz.", "Quiz generated (lower boundary valid)."),
                ],
            },
            {
                "name": "No question type selected",
                "technique": "DT (MC x TF x SA all unchecked)",
                "importance": 3,
                "reqs": ["REQ-P-QUIZ-02"],
                "pre": "Student A on Generate Quiz form, topic 'Equivalence Partitioning'.",
                "steps": [
                    ("Uncheck Multiple Choice and True/False (Short Answer unchecked), click Generate Quiz.",
                     "Toast 'Please select at least one question type'; no quiz generated."),
                    ("Check only Short Answer, Generate Quiz.", "Quiz generated with SHORT_ANSWER questions only."),
                ],
            },
            {
                "name": "Question count boundaries",
                "technique": "BVA (UI 5..50 step 5, API 1..50)",
                "importance": 2,
                "reqs": ["REQ-P-QUIZ-01"],
                "pre": "Student A on Generate Quiz form, topic 'Decision Tables'.",
                "steps": [
                    ("Drag slider to the far left.", "Value shows 5 (cannot go lower; labels '5 questions' / '50 questions')."),
                    ("Generate with 5.", "Quiz with 5 questions."),
                    ("Drag slider to the far right and generate.", "Value 50; quiz with 50 questions."),
                    ("Call ai.generateQuiz with questionCount 0, 1, 50, 51.", "0 and 51 rejected by validation; 1 and 50 accepted."),
                ],
            },
            {
                "name": "Difficulty and question type partitions",
                "technique": "EP (easy / medium / hard; MC / TF / SA)",
                "importance": 1,
                "reqs": ["REQ-P-QUIZ-01", "REQ-P-QUIZ-05"],
                "pre": "Student A on Generate Quiz form.",
                "steps": [
                    ("Generate 'SQL Joins', Easy, only True/False.", "All questions show the options True and False."),
                    ("Generate 'SQL Joins', Hard, only Multiple Choice.", "All questions show radio options from the AI."),
                    ("Call ai.generateQuiz with difficulty 'expert'.", "Rejected by validation (only easy, medium, hard)."),
                ],
            },
            {
                "name": "Quiz generation access by course relation",
                "technique": "DT (owner / contributor / viewer / unrelated / unknown course)",
                "importance": 3,
                "reqs": ["REQ-P-QUIZ-03"],
                "pre": "SECJ3343 owned by Student A; B CONTRIBUTOR, C VIEWER (both ACCEPTED); D unrelated.",
                "steps": [
                    ("As Student B generate a quiz in SECJ3343.", "Generated (accepted collaborator)."),
                    ("As Student C generate a quiz in SECJ3343.", "Generated (viewer is an accepted collaborator)."),
                    ("As Student D call ai.generateQuiz with courseId of SECJ3343.",
                     "FORBIDDEN 'You don't have access to this course'; nothing saved."),
                    ("As Student A call ai.generateQuiz with courseId 'does-not-exist'.", "NOT_FOUND 'Course not found'."),
                    ("As Student D call ai.generateQuiz with noteId of a SECJ3343 note; then with noteId 'nope'.",
                     "'You don't have access to this note'; then 'Note not found'."),
                ],
            },
            {
                "name": "Invalid AI response is not saved",
                "technique": "EG (malformed JSON from AI)",
                "importance": 2,
                "reqs": ["REQ-P-QUIZ-04"],
                "pre": "Student A on Generate Quiz form; AI stubbed to return plain text instead of JSON.",
                "steps": [
                    ("Generate a quiz on 'Mutation testing'.",
                     "Toast 'Failed to generate quiz. The AI response was not in the expected format.'; form enabled again."),
                    ("Open the Quizzes list.", "No new quiz was added."),
                ],
            },
        ],
    },
    {
        "name": "TS-P4 Attempt Quiz & Grading (UC-S3-015)",
        "details": "Quiz taker and results. Techniques: ST (not started -> answering -> submitted), BVA on score bands, EP on answer matching.",
        "cases": [
            {
                "name": "Submit is enabled only when all questions are answered",
                "technique": "ST, BVA (answered n-1 / n)",
                "importance": 3,
                "reqs": ["REQ-P-QUIZ-05"],
                "pre": "Student A opens a 5-question quiz 'BVA Quiz'.",
                "steps": [
                    ("Look at the header and navigation.", "'0 of 5 answered', '0% complete'; Previous disabled on question 1."),
                    ("Answer questions 1-4 using Next.", "'4 of 5 answered', '80% complete'; answered buttons show a check icon."),
                    ("Go to question 5 without answering.",
                     "'Submit Quiz' disabled and text 'Please answer all questions before submitting'."),
                    ("Answer question 5.", "'5 of 5 answered', '100% complete'; Submit Quiz enabled."),
                    ("Click Submit Quiz.", "Button shows 'Submitting...', then the results page."),
                ],
            },
            {
                "name": "Score bands on the results page",
                "technique": "BVA (scores 100, 90, 80, 70, 60, 50)",
                "importance": 2,
                "reqs": ["REQ-P-QUIZ-06"],
                "pre": "Student A has a 10-question multiple-choice quiz with known correct answers.",
                "steps": [
                    ("Submit with 10 correct.", "Score 100%, 'Excellent!'."),
                    ("Retake: 9 correct.", "90%, 'Excellent!' (boundary 90)."),
                    ("Retake: 8 correct.", "80%, 'Great job!'."),
                    ("Retake: 7 correct.", "70%, 'Good work!'."),
                    ("Retake: 6 correct.", "60%, 'Not bad!'."),
                    ("Retake: 5 correct.", "50%, 'Keep studying!'."),
                ],
            },
            {
                "name": "Answer matching rules per question type",
                "technique": "EP (exact / different case / extra spaces) x type",
                "importance": 3,
                "reqs": ["REQ-P-QUIZ-06"],
                "pre": "Quiz with Q1 SHORT_ANSWER correct 'Boundary Value Analysis', Q2 TRUE_FALSE correct 'True', Q3 MULTIPLE_CHOICE correct option 'B. Black-box'.",
                "steps": [
                    ("Answer Q1 '  boundary value analysis  ', Q2 True, Q3 option 'B. Black-box'; submit.",
                     "All 3 correct (short answer trimmed and case-insensitive); score 100%."),
                    ("Retake: Q1 'BVA', others correct.", "Q1 incorrect; score 66.67% shown rounded, not 66.666...%."),
                    ("Retake on a quiz where the stored True/False answer is 'true' (lower case) and choose True.",
                     "Answer counted correct (True/False must not fail on letter case)."),
                ],
            },
            {
                "name": "Attempt is saved, best score and retake",
                "technique": "ST (attempt 1 -> attempt 2), use case",
                "importance": 2,
                "reqs": ["REQ-P-QUIZ-07", "REQ-P-QUIZ-06"],
                "pre": "Student A has quiz 'BVA Quiz' with one attempt of 60%.",
                "steps": [
                    ("On the results page click 'Retake Quiz' and score 80%.", "New attempt saved with completion time; results 80%."),
                    ("Go back to the Quizzes list.", "'BVA Quiz' shows 'Best Score: 80%'; newest quiz listed first."),
                    ("Open the attempts of 'BVA Quiz'.", "Two attempts listed (80% newest, 60%)."),
                ],
            },
            {
                "name": "Another user's quiz cannot be opened, attempted or deleted",
                "technique": "DT (actor = non-owner), security negative",
                "importance": 3,
                "reqs": ["REQ-P-QUIZ-08"],
                "pre": "Student A owns quiz Q in SECJ3343; Student B (contributor) logged in.",
                "steps": [
                    ("As Student B open SECJ3343 > Quizzes.", "Q is not listed (list shows only B's quizzes)."),
                    ("As Student B call ai.getQuiz with Q's id.", "NOT_FOUND 'Quiz not found'."),
                    ("As Student B call ai.submitQuizAttempt for Q.", "NOT_FOUND 'Quiz not found'; no attempt stored."),
                    ("As Student B call ai.deleteQuiz for Q.", "NOT_FOUND 'Quiz not found'; Q still exists."),
                ],
            },
            {
                "name": "Delete own quiz",
                "technique": "ST (exists -> deleted), DT (OK / Cancel)",
                "importance": 2,
                "reqs": ["REQ-P-QUIZ-08", "REQ-P-QUIZ-07"],
                "pre": "Student A has exactly one quiz 'BVA Quiz' with 2 attempts.",
                "steps": [
                    ("Click delete on 'BVA Quiz' and Cancel 'Are you sure you want to delete this quiz? This action cannot be undone.'",
                     "Quiz still listed."),
                    ("Delete again and confirm.", "Quiz removed; list shows 'No quizzes yet'."),
                    ("Call ai.getQuiz with the old id.", "'Quiz not found' (questions and attempts deleted too)."),
                ],
            },
        ],
    },
    {
        "name": "TS-P5 AI Study Plans (UC-S3-016/017)",
        "details": "Course > Study Plans. Techniques: UC, BVA (weeks 0/1/16/17, hours 0/1/40/41), ST (task open <-> done), DT.",
        "cases": [
            {
                "name": "Generate a study plan (main flow)",
                "technique": "Use case main flow, EP valid",
                "importance": 3,
                "reqs": ["REQ-P-PLAN-01", "REQ-P-PLAN-03"],
                "pre": "Student A owns SECJ3343; AI reachable; no study plans yet.",
                "steps": [
                    ("Open SECJ3343 > Study Plans.", "'Study Plans' header, 'Generate Plan' button, 'No study plans yet'."),
                    ("Click Generate Plan.",
                     "Course preselected; Number of Weeks 4, Hours Per Week 5, Learning Goal (Optional), Target Deadline (Optional)."),
                    ("Weeks 4, Hours 10, goal 'Prepare for final exam', deadline today + 30 days; Generate.",
                     "Toast 'Study plan generated successfully!'; plan opens."),
                    ("Check the plan.",
                     "4 weeks in order Week 1..4 each with tasks; 'Overall Progress' 0%; endDate = deadline, startDate = deadline - 28 days."),
                ],
            },
            {
                "name": "Weeks and hours boundaries",
                "technique": "BVA (weeks 0/1/16/17, hours 0/1/40/41)",
                "importance": 3,
                "reqs": ["REQ-P-PLAN-01"],
                "pre": "Student A on Generate Study Plan for SECJ3343.",
                "steps": [
                    ("Move Number of Weeks slider fully left, then fully right.", "Minimum 1, maximum 16."),
                    ("Move Hours Per Week slider fully left, then fully right.", "Minimum 1, maximum 40."),
                    ("Generate with weeks 1, hours 1.", "Plan with exactly 1 week."),
                    ("Generate with weeks 16, hours 40.", "Plan with 16 weeks (Iteration 3 says max 12 - record deviation)."),
                    ("Call ai.generateStudyPlan with weekCount 0 and 17, hoursPerWeek 0 and 41.", "All four rejected by validation."),
                ],
            },
            {
                "name": "Course is required and deadline cannot be in the past",
                "technique": "EP invalid (no course, past date), EG",
                "importance": 2,
                "reqs": ["REQ-P-PLAN-01", "REQ-P-PLAN-03"],
                "pre": "Student A opens Generate Study Plan from AI pages without a preselected course.",
                "steps": [
                    ("Leave course empty.", "Generate button disabled; a forced submit shows 'Please select a course'."),
                    ("Open the deadline calendar.", "Yesterday and earlier dates are disabled; today+1 can be picked."),
                    ("Select SECJ3343, no goal, no deadline; Generate.",
                     "Plan created; stored prompt 'Study plan for course'; no start or end date."),
                ],
            },
            {
                "name": "Study plan access by course relation",
                "technique": "DT (owner / collaborator / unrelated / unknown course)",
                "importance": 3,
                "reqs": ["REQ-P-PLAN-02"],
                "pre": "SECJ3343 owned by Student A; Student B ACCEPTED contributor; Student D unrelated.",
                "steps": [
                    ("As Student B generate a plan for SECJ3343.", "Generated."),
                    ("As Student D call ai.generateStudyPlan with SECJ3343 id.", "FORBIDDEN 'You don't have access to this course'."),
                    ("As Student A call ai.generateStudyPlan with courseId 'does-not-exist'.", "NOT_FOUND 'Course not found'."),
                    ("AI stub returns invalid JSON; generate as Student A.",
                     "'Failed to generate study plan. The AI response was not in the expected format.'; nothing saved."),
                ],
            },
            {
                "name": "Track task completion and progress",
                "technique": "ST (open -> done -> open), BVA (0%, 100%)",
                "importance": 3,
                "reqs": ["REQ-P-PLAN-04"],
                "pre": "Student A has plan P: 2 weeks, 4 tasks each (8 tasks), none completed.",
                "steps": [
                    ("Open P.", "Overall Progress 0%; each Week Progress 0%."),
                    ("Tick 1 task in week 1.", "Toast 'Task updated'; Overall 13% (1/8 = 12.5 rounded); Week 1 25%."),
                    ("Tick the other 3 tasks of week 1.", "Week 1 Progress 100% and shown as complete; Overall 50%."),
                    ("Untick one task of week 1.", "Week 1 75%; Overall 38%; task completedAt cleared."),
                    ("Tick all 8 tasks.", "Overall Progress 100%."),
                ],
            },
            {
                "name": "Plan ownership and delete",
                "technique": "DT (actor x action), ST (exists -> deleted)",
                "importance": 2,
                "reqs": ["REQ-P-PLAN-05"],
                "pre": "Student A has plan P (task T id known). Student B logged in.",
                "steps": [
                    ("As Student B call ai.updateStudyPlanTask on T.", "NOT_FOUND 'Task not found'; T unchanged."),
                    ("As Student B call ai.deleteStudyPlan on P.", "NOT_FOUND 'Study plan not found'."),
                    ("As Student A delete P and confirm 'Are you sure you want to delete this study plan? This action cannot be undone.'",
                     "P removed; if it was the only plan, 'No study plans yet'."),
                ],
            },
            {
                "name": "Study plan survives course deletion",
                "technique": "EG, EP (course deleted)",
                "importance": 1,
                "reqs": ["REQ-P-PLAN-06"],
                "pre": "Student A owns course 'Temp Course' with study plan P2.",
                "steps": [
                    ("Delete 'Temp Course'.", "Course deleted."),
                    ("Call ai.getStudyPlans without courseId.",
                     "P2 still returned with course = null (SET NULL as in Iteration 3); fails if P2 was cascade-deleted."),
                ],
            },
        ],
    },
    {
        "name": "TS-P6 Enhance Notes with AI (UC-S3-018)",
        "details": "POST /api/ai/generate-note. Techniques: EP (4 types + invalid), BVA (prompt 0/1/5000/5001), DT (role).",
        "cases": [
            {
                "name": "Each enhancement type returns content and is recorded",
                "technique": "EP (GENERATE / IMPROVE / SUMMARIZE / EXPAND)",
                "importance": 3,
                "reqs": ["REQ-P-AIN-01", "REQ-P-AIN-03"],
                "pre": "Student A owns SECJ3343 with note page N 'Getting Started'.",
                "steps": [
                    ("POST /api/ai/generate-note {noteId: N, type: GENERATE, prompt: 'Black-box testing'}.",
                     "200 with success true, markdown generatedText, tokensUsed, generationId."),
                    ("Repeat with IMPROVE, SUMMARIZE and EXPAND.", "Each returns 200 and text matching the type."),
                    ("Call ai.getNoteGenerations for N.", "4 records newest first with types EXPAND, SUMMARIZE, IMPROVE, GENERATE."),
                ],
            },
            {
                "name": "Invalid enhancement requests",
                "technique": "BVA (prompt 0/1/5000/5001), EP invalid type",
                "importance": 2,
                "reqs": ["REQ-P-AIN-01"],
                "pre": "Student A, note N.",
                "steps": [
                    ("prompt '' (0 chars).", "400 'Invalid request'."),
                    ("prompt 'a' (1) and prompt of 5000 chars.", "Both 200."),
                    ("prompt of 5001 chars.", "400 'Invalid request'."),
                    ("type 'TRANSLATE'.", "400 'Invalid request'."),
                    ("temperature 2.5.", "400 'Invalid request'."),
                ],
            },
            {
                "name": "Enhancement permission by role",
                "technique": "DT (owner / contributor / viewer / unrelated / logged out / unknown note)",
                "importance": 3,
                "reqs": ["REQ-P-AIN-02", "REQ-P-AIN-03"],
                "pre": "Note N in SECJ3343; B contributor, C viewer, D unrelated.",
                "steps": [
                    ("As Student B, GENERATE on N.", "200."),
                    ("As Student C, GENERATE on N.", "403 'Forbidden: You don't have permission to edit this note'."),
                    ("As Student D, GENERATE on N.", "403 'Forbidden: You don't have permission to edit this note'."),
                    ("Logged out, GENERATE on N.", "401 'Unauthorized'."),
                    ("As Student A, noteId 'missing'.", "404 'Note not found'."),
                    ("As Student B call ai.getNoteGenerations for N.", "Only Student B's generation listed (not Student A's)."),
                ],
            },
        ],
    },
    {
        "name": "TS-P7 Collaborative Notes - Access & Roles (UC-S4-002)",
        "details": "Course > Notes card > /courses/<id>/notes. Techniques: DT (role x action), EP, EG.",
        "cases": [
            {
                "name": "Owner opens notes for the first time",
                "technique": "Use case (UC-S4-002 steps 1-9), ST (no page -> first page)",
                "importance": 3,
                "reqs": ["REQ-P-NOTE-01", "REQ-P-NOTE-03"],
                "pre": "Student A owns SECJ3343 which has no note pages.",
                "steps": [
                    ("Open SECJ3343 and click 'Open Collaborative Notes' on the Notes card.",
                     "Goes to /courses/<id>/notes and redirects to /courses/<id>/notes/<page id>."),
                    ("Look at the page.",
                     "Page 'Getting Started' in sidebar 'Pages'; header 'SECJ3343 Software Quality Assurance', 'Collaborative Notes', badge OWNER."),
                    ("Look at the editor.", "Editable, 'All changes saved', 'Real-time collaboration active!' help text."),
                ],
            },
            {
                "name": "Viewer opens a course without pages",
                "technique": "EP (role VIEWER, no pages)",
                "importance": 2,
                "reqs": ["REQ-P-NOTE-01"],
                "pre": "Course 'Empty Notes Course' of Student A has no pages; Student C is ACCEPTED VIEWER.",
                "steps": [
                    ("As Student C open /courses/<id>/notes.",
                     "'No pages have been created yet. Ask a contributor or owner to create one.' and 'Back to Course'; no page created."),
                ],
            },
            {
                "name": "Notes access by user relation",
                "technique": "DT (owner / contributor / viewer / pending invite / unrelated / logged out / unknown course)",
                "importance": 3,
                "reqs": ["REQ-P-NOTE-02"],
                "pre": "SECJ3343 has pages; B CONTRIBUTOR, C VIEWER (ACCEPTED); Student D has a PENDING invitation only.",
                "steps": [
                    ("As Student B open the notes.", "Opens, badge CONTRIBUTOR."),
                    ("As Student C open the notes.", "Opens, badge VIEWER."),
                    ("As Student D open /courses/<id>/notes.", "Redirected to /courses/<id>; notes not shown."),
                    ("Logged out open the notes URL.", "Redirected to /login."),
                    ("As Student A open /courses/unknown-id/notes.", "Redirected to /courses."),
                ],
            },
            {
                "name": "Viewer is read-only (UI and server)",
                "technique": "DT (role = VIEWER column), security negative",
                "importance": 3,
                "reqs": ["REQ-P-NOTE-03", "REQ-P-NOTE-07"],
                "pre": "Student C is ACCEPTED VIEWER on SECJ3343; page 'Getting Started' exists.",
                "steps": [
                    ("As Student C open the page.",
                     "Banner with eye icon 'Viewing in Read-Only Mode' ('You're a Viewer on this course...'); badge VIEWER; no '+' and no page menu."),
                    ("Try to type in the editor and in the title.", "Nothing can be typed; title field disabled."),
                    ("POST /api/notes/create {courseId}.", "403 'You don't have permission to create pages'."),
                    ("PATCH /api/notes/<page id> {title: 'Hacked'}.", "403 'You don't have permission to edit this page'."),
                    ("DELETE /api/notes/<page id>.", "403 'You don't have permission to delete this page'."),
                    ("With the Liveblocks token from /api/liveblocks-auth, send a document change to the room.",
                     "Change rejected (read-only access); owner does not see it. Fails if token grants full access."),
                ],
            },
            {
                "name": "Liveblocks authentication endpoint",
                "technique": "EP / EG on /api/liveblocks-auth inputs",
                "importance": 2,
                "reqs": ["REQ-P-NOTE-02"],
                "pre": "Page id P of SECJ3343 known.",
                "steps": [
                    ("Logged out POST {room: P}.", "401 'Unauthorized'."),
                    ("As Student A POST {} (no room).", "400 'Bad Request - Room ID missing'."),
                    ("As Student A POST body 'not json'.", "400 'Bad Request - Invalid JSON'."),
                    ("As Student A POST {room: 'nope'}.", "404 'Page not found'."),
                    ("As Student D (unrelated) POST {room: P}.", "403 'Forbidden'."),
                    ("As Student B POST {room: P}.", "200 with token; userInfo.role CONTRIBUTOR."),
                ],
            },
            {
                "name": "Unknown or other course page id",
                "technique": "EG, EP invalid page id",
                "importance": 1,
                "reqs": ["REQ-P-NOTE-01"],
                "pre": "SECJ3343 first page P1; course 'Other' (also owned by A) with page Q.",
                "steps": [
                    ("As Student A open /courses/<SECJ3343>/notes.", "Redirected to P1."),
                    ("Open /courses/<SECJ3343>/notes/does-not-exist.", "Redirected to P1."),
                    ("Open /courses/<SECJ3343>/notes/<Q>.", "Redirected to P1 (page of another course not shown)."),
                ],
            },
        ],
    },
    {
        "name": "TS-P8 Collaborative Notes - Real-Time Editing & Pages",
        "details": "Two browsers (A and B) on the same course. Techniques: UC, ST (online -> offline -> online), BVA (5/6 others), EG.",
        "cases": [
            {
                "name": "Two students edit the same page in real time",
                "technique": "Use case (UC-S4-002 steps 10-27)",
                "importance": 3,
                "reqs": ["REQ-P-NOTE-04", "REQ-P-NOTE-05"],
                "pre": "Student A (Chrome) and Student B (Firefox, CONTRIBUTOR) both on page 'Getting Started'.",
                "steps": [
                    ("A types heading 'Chapter 1: Introduction'.", "B sees the text appear without reloading."),
                    ("B clicks below and types 'Key Concepts:' and a bullet list.", "A sees B's text; both documents identical."),
                    ("Look at the Active Collaborators bar in both browsers.",
                     "Each shows own avatar ('<name> (You)') and the other user; '2 online'."),
                    ("Both reload.", "All text still present; 'All changes saved'."),
                ],
            },
            {
                "name": "Simultaneous edit of the same text converges",
                "technique": "EG (concurrency), Iteration 4 A2",
                "importance": 2,
                "reqs": ["REQ-P-NOTE-04"],
                "pre": "A and B on the same page containing the word 'Testing'.",
                "steps": [
                    ("At the same time A types 'Unit ' before and B types ' Basics' after 'Testing'.",
                     "Both editors end with the same text (e.g. 'Unit Testing Basics'); no error, no lost characters."),
                ],
            },
            {
                "name": "Presence list boundaries and leaving",
                "technique": "BVA (5 / 6 other users), ST (online -> left)",
                "importance": 1,
                "reqs": ["REQ-P-NOTE-05"],
                "pre": "Student A on a page; 6 other course members available (owner/collaborator accounts).",
                "steps": [
                    ("5 others join.", "5 other avatars shown, no '+'; '6 online'."),
                    ("6th other joins.", "5 avatars and '+1'; '7 online'."),
                    ("Student B closes the browser.", "B's avatar removed from A's bar; count decreases by 1."),
                ],
            },
            {
                "name": "Create page and nested sub-page",
                "technique": "Use case (steps 28-38), ST",
                "importance": 3,
                "reqs": ["REQ-P-NOTE-06"],
                "pre": "Student A on SECJ3343 notes with page 'Getting Started'; Student B on the same course.",
                "steps": [
                    ("A clicks '+' next to 'Pages'.", "Page 'Untitled' created after 'Getting Started' and opened."),
                    ("A changes the title to 'Week 1 Notes' and presses Enter.", "'Saving title...' then sidebar shows 'Week 1 Notes'."),
                    ("A opens the menu of 'Week 1 Notes' and clicks 'Add sub-page'.", "Child page 'Untitled' shown indented under 'Week 1 Notes'."),
                    ("Collapse 'Week 1 Notes'.", "Sub-page hidden; expand shows it again."),
                    ("B refreshes the sidebar.", "B sees 'Week 1 Notes' and its sub-page."),
                    ("A types in the sub-page while B stays on 'Getting Started'.", "B's page does not change (separate room)."),
                ],
            },
            {
                "name": "Delete a page with sub-pages",
                "technique": "ST (page -> deleted with children), DT (OK / Cancel)",
                "importance": 2,
                "reqs": ["REQ-P-NOTE-07"],
                "pre": "Student B (CONTRIBUTOR) on 'Week 1 Notes' which has one sub-page; 'Getting Started' is first page.",
                "steps": [
                    ("Delete 'Week 1 Notes' and Cancel 'Are you sure you want to delete this page?'", "Nothing deleted."),
                    ("Delete again and confirm.", "'Week 1 Notes' and its sub-page removed; 'Getting Started' opens."),
                    ("Open the old sub-page URL.", "Redirected to 'Getting Started' (sub-page deleted by cascade)."),
                ],
            },
            {
                "name": "Offline edits sync after reconnect",
                "technique": "ST (online -> offline -> online), Iteration 4 A1",
                "importance": 2,
                "reqs": ["REQ-P-NOTE-08", "REQ-P-NOTE-04"],
                "pre": "A and B on the same page.",
                "steps": [
                    ("B goes offline (DevTools > Network > Offline) and types 'offline line'.", "B can keep typing; A does not see it yet."),
                    ("A types 'online line' meanwhile.", "A's text saved."),
                    ("B goes back online.", "Both see 'offline line' and 'online line'; documents identical."),
                ],
            },
        ],
    },
]
