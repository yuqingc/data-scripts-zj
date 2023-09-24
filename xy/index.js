const fs = require('fs');

// You should replace the 'input.xy' with your real filename
const input = fs.readFileSync('./input.xy').toString();

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
  if (xyArr.length >=2 && currentData) {
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


fs.writeFileSync('./output.json', JSON.stringify(resultData, null, 2));

fs.writeFileSync('./output.csv', [titleLine, subtitleLine, ...contentLines].join('\n'));
