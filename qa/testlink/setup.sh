#!/usr/bin/env bash
# Starts TestLink 1.9.20 for SECJ3343 on http://localhost:8090 (macOS + Docker Desktop).
set -euo pipefail
cd "$(dirname "$0")"

command -v docker >/dev/null || { echo "Install Docker Desktop first: brew install --cask docker, then open it"; exit 1; }
docker info >/dev/null 2>&1 || { open -a Docker; echo "Waiting for Docker Desktop..."; until docker info >/dev/null 2>&1; do sleep 3; done; }

if [ ! -d app ]; then
  git clone -q --depth 1 -b testlink_1_9_20_fixed https://github.com/TestLinkOpenSourceTRMS/testlink-code.git app
  rm -rf app/.git
fi
# gist edits (paths), API typo fix, DB config, report header
cp -R overlay/ app/
mkdir -p app/logs app/upload_area app/lib/ajax/logs app/gui/templates_c
chmod -R 777 app/logs app/upload_area app/lib/ajax/logs app/gui/templates_c

docker compose up -d --build
echo "Waiting for TestLink..."
until curl -sf -o /dev/null http://localhost:8090/login.php; do sleep 3; done
until docker compose exec -T db mariadb -uroot -proot -N testlink -e "SELECT 1 FROM users LIMIT 1" >/dev/null 2>&1; do sleep 3; done
echo "TestLink ready: http://localhost:8090  (login = your name, password = your name; admin/admin)"
