#!/bin/bash

workingDir=$(pwd)

lastUpdateTimestamp="2023-12-01T00:00:00-00:00"
credentialsFile=$workingDir/tools/importer/data/credentials.json

if [ $# -eq 0 ]; then
    echo "No arguments provided. Using default timestamp $lastUpdateTimestamp"
else
    lastUpdateTimestamp=$1
fi

docsFolder=$workingDir/docs
logsFolder=$workingDir/logs
cliProjectName=franklin-importer-tools
cliProjectRepo=https://github.com/headwirecom/$cliProjectName

siteMapUrl=https://www.golfdigest.golf-prod.sports.aws.discovery.com/sitemaps/sitemap_golfdigest_index.xml
gdriveFolderID=1OudSl2TFxb6fyr6j7KA1UQIb8On-jMAq

if [ ! -d "$docsFolder" ]; then
    echo "Creating $docsFolder folder."
    mkdir -p "$docsFolder"
fi

if [ ! -d "$logsFolder" ]; then
    echo "Creating $logsFolder folder."
    mkdir -p "$logsFolder"
fi

if [ ! -d "$cliProjectName" ]; then
    echo "Cloning $cliProjectName project."
    git clone $cliProjectRepo
    cd $cliProjectName
    npm install
    cd $workingDir
else 
    echo "Updating $cliProjectName project."
    cd $cliProjectName
    git fetch
    git pull
    npm install
    cd $workingDir
fi

outputFile="$workingDir/tools/importer/data/urls-$lastUpdateTimestamp.json"
urlsLog="$logsFolder/urls-$lastUpdateTimestamp.log"
urlsErrorLog="$logsFolder/urls-error-$lastUpdateTimestamp.log"
uploadLog="$logsFolder/upload-$lastUpdateTimestamp.log"
uploadErrorLog="$logsFolder/upload-error-$lastUpdateTimestamp.log"
importLog="$logsFolder/import-$lastUpdateTimestamp.log"
importErrorLog="$logsFolder/import-error-$lastUpdateTimestamp.log"

start_time=$(date +%s)

cd $cliProjectName
echo "Executing commands $cliProjectName/index.js"
./index.js urls -s $siteMapUrl -o $outputFile --mappingScript $workingDir/tools/importer/longurlsmapping.js -t $lastUpdateTimestamp > $urlsLog 2>>$urlsErrorLog
./index.js import -u $outputFile --ts $workingDir/tools/importer/import.mjs -t $docsFolder --async 5 --asyncPause 3000 >> $importLog 2>>$importErrorLog
./index.js upload -t $gdriveFolderID -s $docsFolder -c $credentialsFile --mode overwriteOlder > $uploadLog 2>>$uploadErrorLog
cd $workingDir

end_time=$(date +%s)
total_time=$((end_time - start_time))
hours=$((total_time / 3600))
minutes=$(( (total_time % 3600) / 60 ))
seconds=$((total_time % 60))
echo "Total time taken: ${hours}h ${minutes}m ${seconds}s"