# Prompts for teammates (paste into Claude Code / any coding agent, on macOS)

## Aland and Karoz

```text
Do my part of our university group assignment end to end on my Mac. Don't stop to ask me things you can find out yourself.

Context: UTM SECJ3343 Software Quality Assurance, Project 1 "Test Case Design", due 27/10/2026. Group: Aland, Karoz, Parwar, Rawa. Software under test: UniShare, repo https://github.com/Seganation/unishare. Rawa already did their part and set everything up; my part is the same kind of work for my own use cases.

1. GitHub invite: make sure `gh` is installed and logged in (`brew install gh`, `gh auth login` - I'll do the login if needed). Accept the pending invitation to Seganation/unishare: `gh api user/repository_invitations`, then `gh api -X PATCH user/repository_invitations/<id>`.
2. Work out who I am from `gh api user -q .login`: Aland95 = aland, karozzz = karoz.
3. Clone: `git clone https://github.com/Seganation/unishare.git ~/dev/unishare` and work there.
4. Read qa/project1/README.md fully (task, rubric, who tests what, ID prefixes). Find my row. Then read my use cases in the assignment/ iteration documents and the code that implements them (src/server/api/routers/*, src/app/*, prisma/schema.prisma, prisma/seed.ts).
5. Start TestLink: `qa/testlink/setup.sh` (needs Docker Desktop: `brew install --cask docker` and open it if missing). TestLink: http://localhost:8090, my login and password are my lowercase name.
6. Write qa/testlink/scripts/<myname>_testdata.py in exactly the same format as qa/testlink/scripts/rawa_testdata.py (read it first and copy its structure and quality):
   - AUTHOR = my lowercase name; TOP_SUITE = "<My Name> - <my area>"; TOP_SUITE_DETAILS with tester, test basis, techniques and common test data (use the seeded accounts from prisma/seed.ts).
   - REQ_SPECS: the test basis. One spec per use case, doc_id SRS-<my letter>-..., requirement IDs REQ-<my letter>-...; each requirement is testable and cites its source (iteration doc + code file), with exact rules/limits/messages taken from the code.
   - SUITES: TS-<my letter>1, TS-<my letter>2, ... About 30-45 test cases. Every requirement covered by at least one case (100% traceability). Each case names its technique (EP, BVA, Decision Table, State Transition, Use Case, Error Guessing). Include valid, invalid/negative and boundary/edge cases with concrete values (e.g. min-1/min/max/max+1), clear preconditions with test data, and numbered steps each with an expected result quoting the exact UI/error text.
7. Load and print: `python3 -I qa/testlink/scripts/load.py <myname>` then `python3 -I qa/testlink/scripts/report.py <myname>`. Open the two PDFs in qa/project1/<myname>/ and check them. To fix something: delete my top suite in TestLink, edit the data file, load again, report again.
8. Commit only my files (qa/testlink/scripts/<myname>_testdata.py and qa/project1/<myname>/), message "Project 1: <My Name> test cases", then `git pull --rebase` and `git push` to main.
9. Tell me how many requirements and test cases I have and where the PDFs are.
```

## Parwar (already a collaborator)

```text
Do my part of our university group assignment end to end on my Mac. Don't stop to ask me things you can find out yourself. I'm Parwar (name in files: parwar).

Context: UTM SECJ3343 Software Quality Assurance, Project 1 "Test Case Design", due 27/10/2026. Group: Aland, Karoz, Parwar, Rawa. Software under test: UniShare, repo https://github.com/Seganation/unishare (I already have access). Rawa already did their part and set everything up; my part is the same kind of work for my own use cases.

1. Get the repo: if I already have a clone, `git pull` in it; otherwise `git clone https://github.com/Seganation/unishare.git ~/dev/unishare` and work there. (`gh`/git must be logged in to push - `brew install gh`, `gh auth login`, I'll do the login if needed.)
2. Read qa/project1/README.md fully (task, rubric, who tests what, ID prefixes). My row is Parwar: AI assistant, quizzes, study plans, collaborative notes. Then read those use cases in the assignment/ iteration documents and the code that implements them (src/server/api/routers/*, src/app/*, prisma/schema.prisma, prisma/seed.ts).
3. Start TestLink: `qa/testlink/setup.sh` (needs Docker Desktop: `brew install --cask docker` and open it if missing). TestLink: http://localhost:8090, login parwar / parwar.
4. Write qa/testlink/scripts/parwar_testdata.py in exactly the same format as qa/testlink/scripts/rawa_testdata.py (read it first and copy its structure and quality):
   - AUTHOR = "parwar"; TOP_SUITE = "Parwar - <my area>"; TOP_SUITE_DETAILS with tester, test basis, techniques and common test data (use the seeded accounts from prisma/seed.ts).
   - REQ_SPECS: the test basis. One spec per use case, doc_id SRS-P-..., requirement IDs REQ-P-...; each requirement is testable and cites its source (iteration doc + code file), with exact rules/limits/messages taken from the code.
   - SUITES: TS-P1, TS-P2, ... About 30-45 test cases. Every requirement covered by at least one case (100% traceability). Each case names its technique (EP, BVA, Decision Table, State Transition, Use Case, Error Guessing). Include valid, invalid/negative and boundary/edge cases with concrete values (e.g. min-1/min/max/max+1), clear preconditions with test data, and numbered steps each with an expected result quoting the exact UI/error text.
5. Load and print: `python3 -I qa/testlink/scripts/load.py parwar` then `python3 -I qa/testlink/scripts/report.py parwar`. Open the two PDFs in qa/project1/parwar/ and check them. To fix something: delete my top suite in TestLink, edit the data file, load again, report again.
6. Commit only my files (qa/testlink/scripts/parwar_testdata.py and qa/project1/parwar/), message "Project 1: Parwar test cases", then `git pull --rebase` and `git push` to main.
7. Tell me how many requirements and test cases I have and where the PDFs are.
```
