#!/bin/bash

MONGO_DATABASE="movies"
DB_NAME="biodata"
MONGO_HOST="127.0.0.1"
MONGO_PORT="27017"
TIMESTAMP=`date +"%d%b%Y__%H:%M"`                     #--out `date +"%m%b%Y--%H:%M"`
MONGODUMP_PATH="/usr/bin/mongodump"
BACKUPS_DIR=`~/Desktop/mongo/bk/mongodbbackups/backups`
BACKUP_NAME="$DB_NAME-$TIMESTAMP"
$MONGODUMP_PATH -d $MONGO_DATABASE --out ~/Desktop/mongo/bk/mongodbbackups/backups/$BACKUP_NAME
