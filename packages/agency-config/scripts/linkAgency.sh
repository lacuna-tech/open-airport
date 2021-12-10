#!/bin/bash
# $1 - agency folder name
# ASSUMES: "." is the app root you're setting up
# Usage: linkAgency LADOT

# if test -d "../../agency-config/src/$1"; then
#   echo "\nSetting up agency $1\n"
# else
#   echo "\nAGENCY $1 DOES NOT EXIST!!!\n"
#   exit 1
# fi

echo "symlinking ./src/agency -> agency-config/src/$1/public"
rm -rf ./src/agency
ln -s ../../agency-config/src/$1/public ./src/agency

if test -d "./public"; then
  echo "symlinking ./public/agency -> agency-config/src/$1/public"
  rm -rf ./public/agency
  ln -s ../../agency-config/src/$1/public ./public/agency
fi

if test -f "./.env"; then
  echo "updating REACT_APP_AGENCY=$1 in ./.env"
  if grep -q REACT_APP_AGENCY "./.env"; then
    sed -i '' -e '/REACT_APP_AGENCY=.*/d' ./.env    
  fi
  echo "REACT_APP_AGENCY=$1" >> ./.env
else
  echo "creating ./.env with REACT_APP_AGENCY=$1"
  # Create new env file
  touch ./.env
  { echo 'REACT_APP_AGENCY='$1; } > ./.env
  echo "SKIP_PREFLIGHT_CHECK=true" >> ./.env
fi

# Assign agency for test environment too which is separate
if test -f "./.env.test"; then
  echo "updating REACT_APP_AGENCY=$1 in ./.env.test"
  if grep -q REACT_APP_AGENCY "./.env.test"; then
    sed -i '' -e '/REACT_APP_AGENCY=.*/d' ./.env.test
  fi
  echo "REACT_APP_AGENCY=$1" >> ./.env.test
else
  echo "creating ./.env.test with REACT_APP_AGENCY=$1"
  # Create new env file
  touch ./.env.test
  { echo 'REACT_APP_AGENCY='$1; } > ./.env.test
  echo "SKIP_PREFLIGHT_CHECK=true" >> ./.env.test
fi

