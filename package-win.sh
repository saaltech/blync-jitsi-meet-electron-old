#!/usr/bin/env bash
set -e
set -x
# echo '{ "HTTP_PORT": "8000", "API_URL": "'$1'" }' > electron/config.json
docker run --rm \
  -v ${PWD}:/app \
  -w /app \
  node:14 \
  sh -c "apt-get update -y && apt-get install -y libx11-dev libxtst-dev libpng++-dev && npm run clean && npm install && npm run build"
docker run --rm -ti \
 --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 -v ${PWD}:/app \
 -w /app \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 electronuserland/builder:wine \
 bash -c "npm run package-win"