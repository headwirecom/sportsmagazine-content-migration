#!/bin/bash
node -v
NODE_OPTIONS=--max-old-space-size=16384
export NODE_OPTIONS

workingDir=$(pwd)

urlsToImport=$workingDir/tools/importer/data/urls-cources.json
docsFolder=$workingDir/docs
logName=$workingDir/logs/import-all
logFile=$logName.log
errorLogFile=$logName-error.log
startIndex=2000
importTotal=17221
importIncrement=1000
importConcurrency=5
((loopEnd=($importTotal-$startIndex)/$importIncrement))
((endIndex=$startIndex+$importIncrement))

start_time=$(date +%s)

cliProjectName=franklin-importer-tools
cd $cliProjectName
for ((i = 0; i < $loopEnd; i++)); do
    if [[ $endIndex -gt $importTotal ]] 
    then
        echo "$i. Importing from $startIndex to end" >> $logFile
        ./index.js import -u $urlsToImport --ts $workingDir/tools/importer/import.mjs -t $docsFolder --async $importConcurrency --asyncPause 3000 --start $startIndex >> $logFile 2>>$errorLogFile
    else
        echo "$i. Importing from $startIndex to $endIndex" >> $logFile
        ./index.js import -u $urlsToImport --ts $workingDir/tools/importer/import.mjs -t $docsFolder --async $importConcurrency --asyncPause 3000 --start $startIndex --end $endIndex >> $logFile 2>>$errorLogFile
    fi
    end_time=$(date +%s)
    total_time=$((end_time - start_time))
    hours=$((total_time / 3600))
    minutes=$(( (total_time % 3600) / 60 ))
    seconds=$((total_time % 60))
    echo "Imported ${endIndex}. Total time taken: ${hours}h ${minutes}m ${seconds}s" >> $logFile
    ((startIndex=$endIndex))
    ((endIndex=$endIndex+$importIncrement))
done

if [[ $startIndex -lt $importTotal ]]
then
    echo "Importing ramaining from $startIndex to end" >> $logFile
    ./index.js import -u $urlsToImport --ts $workingDir/tools/importer/import.mjs -t $docsFolder --async $importConcurrency --asyncPause 3000 --start $startIndex >> $logFile 2>>$errorLogFile
fi
cd $workingDir
