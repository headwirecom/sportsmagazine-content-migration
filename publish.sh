#!/bin/bash

workingDir=$(pwd)
credentialsFile=$workingDir/tools/importer/data/credentials/credentials.json

logsFolder=$workingDir/logs
cliProjectName=franklin-importer-tools
cliProjectRepo=https://github.com/headwirecom/$cliProjectName
gdriveFolderID="1OudSl2TFxb6fyr6j7KA1UQIb8On-jMAq"

if [ ! -d "$logsFolder" ]; then
    echo "Creating $logsFolder folder."
    mkdir -p "$logsFolder"
fi
echo "Logs folder $logsFolder"

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

publishLog="$logsFolder/publish.log"
publishErrorLog="$logsFolder/cleanup-error.log"

start_time=$(date +%s)

cd $cliProjectName

echo ""
echo "./index.js publish -t $gdriveFolderID --op preview -h main--helix-sportsmagazine--headwirecom.hlx -c $credentialsFile"
./index.js publish -t $gdriveFolderID --op preview -h main--helix-sportsmagazine--headwirecom.hlx -c $credentialsFile > $publishLog 2>>$publishErrorLog

echo ""
echo "./index.js publish -t $gdriveFolderID --op live -h main--helix-sportsmagazine--headwirecom.hlx -c $credentialsFile"
./index.js publish -t $gdriveFolderID--op live -h main--helix-sportsmagazine--headwirecom.hlx -c $credentialsFile > $publishLog 2>>$publishErrorLog

echo ""
echo "./index.js publish -t $gdriveFolderID --op index -h main--helix-sportsmagazine--headwirecom.hlx -c $credentialsFile"
./index.js publish -t $gdriveFolderID --op index -h main--helix-sportsmagazine--headwirecom.hlx -c $credentialsFile > $publishLog 2>>$publishErrorLog

cd $workingDir

end_time=$(date +%s)
total_time=$((end_time - start_time))
hours=$((total_time / 3600))
minutes=$(( (total_time % 3600) / 60 ))
seconds=$((total_time % 60))
echo "Total time taken: ${hours}h ${minutes}m ${seconds}s"