"""Load one tester's requirements + test cases (scripts/<name>_testdata.py) into the local TestLink.

Usage: python3 -I qa/testlink/scripts/load.py <name>     e.g. load.py aland
Skips a tester whose top suite already exists. Writes the requirements XML to qa/project1/<name>/.
"""
import importlib
import html
import http.cookiejar
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request
import uuid
import xmlrpc.client

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
NAME = sys.argv[1].lower()
_data = importlib.import_module(f"{NAME}_testdata")
AUTHOR, REQ_SPECS, SUITES = _data.AUTHOR, _data.REQ_SPECS, _data.SUITES
TOP_SUITE, TOP_SUITE_DETAILS = _data.TOP_SUITE, _data.TOP_SUITE_DETAILS

BASE = "http://localhost:8090"
PROJECT = "UniShare"
PREFIX = "US"
PLAN = "Project 1 - Test Case Design"
BUILD = "UniShare main@b124314"
KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(os.path.dirname(KIT), "project1", NAME)
COMPOSE_DIR = KIT
ADMIN_PW = "admin"
KEY = None
api = xmlrpc.client.ServerProxy(f"{BASE}/lib/api/xmlrpc/v1/xmlrpc.php", allow_none=True)


def call(method, **kw):
    kw["devKey"] = KEY
    res = getattr(api.tl, method)(kw)
    if isinstance(res, list) and res and isinstance(res[0], dict) and "code" in res[0] and "message" in res[0]:
        raise RuntimeError(f"{method}: {res[0]['message']}")
    return res


def sql(q):
    out = subprocess.run(
        ["docker", "compose", "exec", "-T", "db", "mariadb", "-uroot", "-proot", "-N", "testlink", "-e", q],
        cwd=COMPOSE_DIR, capture_output=True, text=True, check=True,
    ).stdout
    return [line.split("\t") for line in out.strip().splitlines() if line]


KEY = sql("SELECT script_key FROM users WHERE login='admin'")[0][0]


def p(text):
    return f"<p>{html.escape(text)}</p>"


# ---------------------------------------------------------------- project
proj = next((x for x in call("getProjects") if x["name"] == PROJECT), None)
if not proj:
    call("createTestProject", testprojectname=PROJECT, testcaseprefix=PREFIX,
         notes="UniShare - university course sharing platform (Next.js / tRPC / Prisma). SECJ3343 Project 1 group project.",
         options={"requirementsEnabled": 1, "testPriorityEnabled": 1, "automationEnabled": 1, "inventoryEnabled": 0})
    proj = next(x for x in call("getProjects") if x["name"] == PROJECT)
PID = int(proj["id"])
sql(f"UPDATE users SET default_testproject_id={PID} WHERE login IN ('admin','{AUTHOR}')")
call("setUserRoleOnProject", userid=int(sql(f"SELECT id FROM users WHERE login='{AUTHOR}'")[0][0]),
     rolename="senior tester", testprojectid=PID)
print("project", PID)

# ---------------------------------------------------------------- requirements XML (test basis)
os.makedirs(OUT_DIR, exist_ok=True)
x = ['<?xml version="1.0" encoding="UTF-8"?>', "<requirement-specification>"]
for order, spec in enumerate(REQ_SPECS, 1):
    x.append(f'<req_spec title="{html.escape(spec["title"])}" doc_id="{spec["doc_id"]}">')
    x.append(f"<type><![CDATA[2]]></type><node_order><![CDATA[{order}]]></node_order>")
    x.append(f"<total_req><![CDATA[{len(spec['reqs'])}]]></total_req>")
    x.append(f"<scope><![CDATA[{p(spec['scope'])}]]></scope>")
    for n, (doc, title, desc) in enumerate(spec["reqs"], 1):
        x.append("<requirement>")
        x.append(f"<docid><![CDATA[{doc}]]></docid><title><![CDATA[{title}]]></title>")
        x.append(f"<version>1</version><revision>1</revision><node_order>{n}</node_order>")
        x.append(f"<description><![CDATA[{p(desc)}]]></description>")
        x.append("<status><![CDATA[V]]></status><type><![CDATA[3]]></type>")
        x.append("<expected_coverage><![CDATA[1]]></expected_coverage>")
        x.append("</requirement>")
    x.append("</req_spec>")
x.append("</requirement-specification>")
req_xml = os.path.join(OUT_DIR, f"{NAME}-requirements.xml")
open(req_xml, "w").write("\n".join(x))

existing = {r[0] for r in sql("SELECT doc_id FROM req_specs")}
if not all(s["doc_id"] in existing for s in REQ_SPECS):
    jar = http.cookiejar.CookieJar()
    web = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

    def hidden(page):
        return dict(re.findall(r"name='(CSRF\w+)' value='([^']+)'", page))

    page = web.open(f"{BASE}/login.php").read().decode()
    form = {**hidden(page), "reqURI": "", "destination": "", "tl_login": "admin", "tl_password": ADMIN_PW}
    web.open(f"{BASE}/login.php?viewer=", urllib.parse.urlencode(form).encode()).read()
    web.open(f"{BASE}/lib/general/navBar.php?testproject={PID}").read()
    page = web.open(f"{BASE}/lib/requirements/reqImport.php?scope=tree&req_spec_id={PID}").read().decode()
    fields = {**hidden(page), "scope": "tree", "importType": "XML", "MAX_FILE_SIZE": "409600",
              "hitCriteria": "docid", "actionOnHit": "update_last_version", "uploadFile": "Upload file"}
    bnd = uuid.uuid4().hex
    body = b"".join(f"--{bnd}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode()
                    for k, v in fields.items())
    body += (f"--{bnd}\r\nContent-Disposition: form-data; name=\"uploadedFile\"; filename=\"reqs.xml\"\r\n"
             f"Content-Type: text/xml\r\n\r\n").encode() + open(req_xml, "rb").read() + f"\r\n--{bnd}--\r\n".encode()
    req = urllib.request.Request(f"{BASE}/lib/requirements/reqImport.php?req_spec_id={PID}", body,
                                 {"Content-Type": f"multipart/form-data; boundary={bnd}"})
    res = re.sub(r"<[^>]+>", " ", web.open(req).read().decode())
    print("req import:", " ".join(res.split())[-400:])

reqs = {r[0]: (int(r[1]), int(r[2])) for r in sql("SELECT r.req_doc_id, r.id, r.srs_id FROM requirements r")}
missing = [d for s in REQ_SPECS for d, _, _ in s["reqs"] if d not in reqs]
assert not missing, f"requirements not imported: {missing}"
print("requirements", len(reqs))

# ---------------------------------------------------------------- suites + test cases
suites = call("getFirstLevelTestSuitesForTestProject", testprojectid=PID) if call("getProjects") else []
if isinstance(suites, list) and any(isinstance(s, dict) and s.get("name") == TOP_SUITE for s in suites):
    sys.exit(f"{NAME}: top suite already in TestLink - skipped (delete it in TestLink to reload)")
top_id = int(call("createTestSuite", testprojectid=PID, testsuitename=TOP_SUITE, details=TOP_SUITE_DETAILS)[0]["id"])

created = []
for order, suite in enumerate(SUITES, 1):
    sid = int(call("createTestSuite", testprojectid=PID, testsuitename=suite["name"], details=p(suite["details"]),
                   parentid=top_id, order=order)[0]["id"])
    for corder, tc in enumerate(suite["cases"], 1):
        summary = p(tc["name"] + ".") + f"<p><b>Test design technique:</b> {html.escape(tc['technique'])}</p>" \
            + f"<p><b>Requirements:</b> {', '.join(tc['reqs'])}</p>"
        steps = [{"step_number": i, "actions": p(a), "expected_results": p(e), "execution_type": 1}
                 for i, (a, e) in enumerate(tc["steps"], 1)]
        r = call("createTestCase", testprojectid=PID, testsuiteid=sid, testcasename=tc["name"], authorlogin=AUTHOR,
                 summary=summary, preconditions=p(tc["pre"]), steps=steps, importance=tc["importance"],
                 executiontype=1, order=corder, checkduplicatedname=1, actiononduplicatedname="block")[0]
        ext = f"{PREFIX}-{r['additionalInfo']['external_id']}"
        by_spec = {}
        for d in tc["reqs"]:
            rid, spec = reqs[d]
            by_spec.setdefault(spec, []).append(rid)
        call("assignRequirements", testcaseexternalid=ext, testprojectid=PID,
             requirements=[{"req_spec": s, "requirements": ids} for s, ids in by_spec.items()])
        created.append(ext)
        print(ext, tc["name"])

# ---------------------------------------------------------------- plan, build, assignment
plans = call("getProjectTestPlans", testprojectid=PID) or []
plan = next((t for t in plans if isinstance(t, dict) and t.get("name") == PLAN), None)
if not plan:
    call("createTestPlan", testplanname=PLAN, testprojectname=PROJECT, active=1, public=1,
         notes="SECJ3343 Project 1 - test case design for UniShare. Each tester adds their own suites.")
    plan = next(t for t in call("getProjectTestPlans", testprojectid=PID) if t["name"] == PLAN)
TPID = int(plan["id"])
builds = call("getBuildsForTestPlan", testplanid=TPID) or []
if not any(isinstance(b, dict) and b.get("name") == BUILD for b in builds):
    call("createBuild", testplanid=TPID, buildname=BUILD,
         buildnotes=p("github.com/Seganation/unishare main branch, commit b124314 (2026-05-03)."))
for ext in created:
    tc = call("getTestCase", testcaseexternalid=ext)[0]
    call("addTestCaseToTestPlan", testprojectid=PID, testplanid=TPID, testcaseexternalid=ext, version=int(tc["version"]))
    call("assignTestCaseExecutionTask", testplanid=TPID, testcaseexternalid=ext, user=AUTHOR, buildname=BUILD)
print(f"done: {len(created)} test cases, plan {TPID}")
