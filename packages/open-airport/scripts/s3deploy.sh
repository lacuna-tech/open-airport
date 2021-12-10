#!/bin/bash

#Get settings from agency-config
source "../agency-config/src/${REACT_APP_AGENCY}/settings.sh"

# Required environment variables
# REACT_APP_ENV - environment deploying to.  Passed into this script
# S3_BUCKET - loaded from agency-config settings file
# agency-config variables expected to use app and env prefixes
# [app identifier]_[env]_variablename e.g. AC_STAGING_S3_BUCKET

APP="OA"
PREFIX="${APP}_${REACT_APP_ENV^^}" #uppercase

S3_BUCKET_VAR="${PREFIX}_S3_BUCKET"
S3_BUCKET="${!S3_BUCKET_VAR}"
[ -z "$S3_BUCKET" ] && echo "Missing $S3_BUCKET_VAR" && exit 1;
echo "Using S3 bucket  :  $S3_BUCKET"

aws s3 rm --recursive $S3_BUCKET
aws s3 cp --recursive build/ $S3_BUCKET/ --cache-control no-cache --exclude "static/*"
aws s3 cp --recursive build/ $S3_BUCKET/ --cache-control max-age=31536000 --exclude "*" --include "static/*"
