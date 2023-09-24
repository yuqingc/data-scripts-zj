const fs = require('fs');


const input = fs.readFileSync('./input.xy').toString();;

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

function getTitle(str) {
  let pattern = /\#\s+Region:\s+([\s\S]+)/i;
  let match = pattern.exec(str);

  if (!match) {
    return "";
  }

  return match[1];
}

function getXY(str) {
  // 使用正则表达式匹配字符串中的数字
  let pattern = /-?\d+(\.\d+)?/g;
  let matches;
  let numbers = [];
  while ((matches = pattern.exec(str)) !== null) {
    numbers.push(matches[0]);
  }

  // 返回提取出的数字数组
  return numbers;
}

const eol = getEOL(input);

const lines = input.split(eol);

console.log(lines.length);


const dataArr = [];

let currentData = null;

const resultData = [];

lines.forEach((lineStr, index) => {
  if (/Region/i.test(lineStr)) {
    currentTitle = getTitle(lineStr);
    if (currentData) {
      resultData.push(currentData);
    }

    console.log(currentTitle);
    currentData = {
      title: currentTitle,
      xyList: {
        x: [],
        y: [],
      }
    };
  }

  if (lineStr.startsWith('#')) {
    return;
  }

  const xyArr = getXY(lineStr);

  if (xyArr.length >=2 && currentData) {
    currentData.xyList.x.push(xyArr[0]);
    currentData.xyList.y.push(xyArr[1]);
  }

  if (index === lines.length - 1) {
    resultData.push(currentData);
  }

});



console.log(resultData);

const titleLine = resultData.map(item => item.title).join(',,') + ',';
const subtitleLine = new Array(resultData.length).fill('x,y').join(',');

console.log(titleLine);

const maxRowNumber = Math.max(...resultData.map(item => item.xyList.x.length));

console.log('max row number is', maxRowNumber);

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
