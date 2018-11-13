const fs = require('fs');
const moment = require('moment')

let path = './data/';
let accumulatedData = [];

function addFileDataToSet(fileName){
    console.log(fileName);
    try{
        let data = JSON.parse(fs.readFileSync(path + fileName));
        data.forEach(timepoint => {
            accumulatedData.push(`${moment(timepoint.timestamp*1000).format()}|${timepoint.x}|${timepoint.y}|${timepoint.z}\n`)
        });
    } catch(err){
        console.log(`error ${err} in ${fileName}`);
    }
    
};

let fileNames = fs.readdirSync(path);
fileNames.forEach(file => {
    addFileDataToSet(file);
})
fs.writeFileSync('./' + 'summary.txt',accumulatedData);