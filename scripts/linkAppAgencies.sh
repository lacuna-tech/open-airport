#!/bin/bash

#For each app package
Packages=("ui-common" "open-airport") 

echo "----------------------------------"
echo "Linking all apps to agency : $1"
echo "----------------------------------"
for pkg in ${Packages[*]}; do  
  echo $pkg
  echo "----------------------------------"
  # Call individual link script
  (cd "packages/$pkg" ; pnpm agency $1; cd ../..)  
done
