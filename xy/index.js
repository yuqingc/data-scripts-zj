const fs = require('fs');
const path = require('path');
const _ = require('lodash');

// check if directory exists
function directoryExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

// See https://en.wikipedia.org/wiki/Newline
function getEOL(str) {
  // EOL(End of line)) for Windows is \r\n while others' is \n
  if (str.indexOf("\r\n") !== -1) {
    return "\r\n";
  } else if (str.indexOf("\n") !== -1) {
    return "\n";
  } else {
    return "";
  }
}

// Extract title from a line
function getTitle(str) {
  let pattern = /\#\s+Region:\s+([\s\S]+)/i;
  let match = pattern.exec(str);

  if (!match) {
    return "";
  }

  return match[1];
}

// returns [x, y]
function getXY(str) {
  let pattern = /-?\d+(\.\d+)?/g;
  let matches;
  let numbers = [];
  while ((matches = pattern.exec(str)) !== null) {
    numbers.push(matches[0]);
  }

  return numbers;
}


function processSingleFile(fileName) {

  const filePath = path.resolve('./input', fileName);
  const input = fs.readFileSync(filePath).toString();
  const eol = getEOL(input);

  // the origin string lines of the input file
  const lines = input.split(eol);

  // current meta data of the region processed in each traverses
  let currentData = null;

  // The result data for generating output.csv
  const resultData = [];

  // Generate result data
  lines.forEach((lineStr, index) => {
    // Whenever title is encountered, store previous region data
    if (/Region/i.test(lineStr)) {
      if (currentData) {
        resultData.push(currentData);
      }

      // Init for each region data
      currentTitle = getTitle(lineStr);
      currentData = {
        title: currentTitle,
        name: fileName,
        xyList: {
          x: [],
          y: [],
        }
      };
    }

    // Ignore lines staring with hash
    if (lineStr.startsWith('#')) {
      return;
    }

    // Fill region data
    const xyArr = getXY(lineStr);
    if (xyArr.length >= 2 && currentData) {
      currentData.xyList.x.push(xyArr[0]);
      currentData.xyList.y.push(xyArr[1]);
    }

    // Store the last region data
    if (index === lines.length - 1) {
      resultData.push(currentData);
    }

  });



  // console.log(resultData);

  // The title line string
  const titleLine = resultData.map(item => item.title).join(',,') + ',';

  // The subtitle line, ie., x,y,x,y...
  const subtitleLine = new Array(resultData.length).fill('x,y').join(',');

  console.log(titleLine);

  // Max row number among all regions
  const maxRowNumber = Math.max(...resultData.map(item => item.xyList.x.length));

  console.log('max row number is', maxRowNumber);

  // Generate content lines for csv
  const contentLines = [];
  for (let i = 0; i < maxRowNumber; i++) {
    let xyNumberList = [];
    resultData.forEach((item) => {
      xyNumberList.push(item.xyList.x[i] || '');
      xyNumberList.push(item.xyList.y[i] || '');
    });
    contentLines.push(xyNumberList.join(','));
  }

  if (!directoryExists('./output')) {
    fs.mkdirSync('output');
  }

  const fileNameWithoutSuffix = path.parse(fileName).name;

  fs.writeFileSync(`./output/${fileNameWithoutSuffix}.json`, JSON.stringify(resultData, null, 2));

  fs.writeFileSync(`./output/${fileNameWithoutSuffix}.csv`, [titleLine, subtitleLine, ...contentLines].join('\n'));

  return resultData;
}

function processCSVFilesInDirectory(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Fail reading directory', err);
      return;
    }

    const resultDataList = files.map((fileName) => {
      if (fileName.endsWith('.xy')) {
        return processSingleFile(fileName);
      }
      return [];
    });

    const allData = _.flatten(resultDataList);
    const dataGroupedByRegion = _.groupBy(allData, 'title')

    if (!directoryExists('./region_output')) {
      fs.mkdirSync('region_output');
    }

    Object.keys(dataGroupedByRegion).forEach(key => {
      const regionAllData = dataGroupedByRegion[key];
      const titleLine = regionAllData.map(item => `X(${item.name}),Y(${item.name})`).join(',');
      const maxRowNumber = Math.max(...regionAllData.map(item => item.xyList.x.length));
      const groupDataLines = [];
      for (let i = 0; i < maxRowNumber; i++) {
        const lineString = regionAllData.map(item => `${item.xyList.x[i] || ''},${item.xyList.y[i] || ''}`).join(',');
        groupDataLines.push(lineString);
      }

      fs.writeFileSync(`./region_output/${key}.csv`, [titleLine, ...groupDataLines].join('\n'));


    });
  });


}


// Main...
const inputDirectory = './input';

if (directoryExists(inputDirectory)) {
  processCSVFilesInDirectory(inputDirectory);
} else {
  console.error('input does not exist');
}








