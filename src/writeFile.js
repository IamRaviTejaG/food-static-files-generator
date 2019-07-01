// const filePath = require('../files')
const fs = require('fs');
const PATH = require('path');
const srcUtils = require('./../src/utils');
// const { promisify } = require('util') // ?? it's utils of not *** Answer : NO. It's using for writing data in json
// const { promisify } = require('util')
// const _ = require('lodash')

/**
 * for makeReadable()
 * @param {Object} data a json object
 * */


function makeReadable(data) {
  let dataStr = JSON.stringify(data);
  dataStr = dataStr.replace(/{"/g, '{ "');
  dataStr = dataStr.replace(/{"/g, '{ " ');
  dataStr = dataStr.replace(/},{/g, ' },\n{');
  dataStr = dataStr.replace(/":/g, '": ');
  dataStr = dataStr.replace(/,"/g, ',\n "');
  return dataStr;
}
/**
 * Write in file
 * @param {String} path
 * @param {Object} data
 */
function writeFile(path, data) {
  const dataStr = makeReadable(data);
  // dataStr = '[' + dataStr + ']'
  // console.log(dataStr)
  return new Promise((resolve, reject) => {
    fs.writeFile(path, dataStr, (err) => {
      if (err) reject(err);

      else resolve(path);
    });
  });
}

function test() {
  // console.log(filePath["groceryFilePath"]);
  // console.log(JSON.parse("src/data/Grocery/grocery.json"));
  // console.log(grocery);
  // writeFiles()
  // console.log(typeof require(filePath.groceryFilePath));

  console.log('ok');
}

// execute function
// writeFiles()

/**
 * For fixPath()
 * @param {String} path
 */
function fixPath(path) {
  path = PATH.resolve(__dirname, path); // absolute path
  if (path[-1] !== '/') { path += '/'; } // path correction
  return path;
}

/**
 * readData()
 * @param {string} path
 * @param {string} file
 * */
function readData(path, file) {
  console.log(path + file);

  const data = fs.readFileSync(path + file);
  console.log(data);

  const fileData = JSON.parse(data);
  return fileData;
}

/**
 * @param {String} folderNamePath
 * @param {String} file
 * @param {Object} fileData
 * @param {var} flag
 * */
function saveFile(folderNamePath, file, fileData, flag) {
  const fileDataLength = fileData.length;
  for (let i = 0; i < fileDataLength; i++) {
    const fileName = getFileName(file, fileData[i], flag, i);
    const elementPath = `${folderNamePath}/${fileName}`;
    writeFile(elementPath, fileData[i]);
  }
}

/**
 * @param {String} path
 * @param {String} file
 */
function makeFolder(path, file) {
  const folderName = `${file.slice(0, -5)}_elements`;
  const folderNamePath = path + folderName;
  if (isDirectory(folderNamePath)) {
    fs.mkdirSync(folderNamePath);
  }
  return folderNamePath;
}
/**
 * For splitObject
 * @param {String} path
 * @param {String} file
 * @param {var} flag
 * @param {var} callback
 * @param {var} keys
 */
function splitObject(path, file, flag = 1, callback, keys = []) { // split large files into single elements
  /*
        flag=1 ==> name according to index
        flag=0 ==> name according to "name" attribute
      */
  if (file.slice(-5) !== '.json') {
    console.log('Require .json file.');
    return;
  }
  path = fixPath(path);
  const fileData = readData(path, file); // Reading data...
  const folderNamePath = makeFolder(path, file); // new folder to save splitted files
  saveFile(folderNamePath, file, fileData, flag); // saving files
  if (callback instanceof Function) {
    setTimeout(() => {
      callback(folderNamePath, keys);
    }, 1000);
  }
}
// execute function
// splitObject()

/**
 * fixFileName()
 * @param {string} fileName
 */
function fixFileName(fileName) {
  fileName = fileName.replace(/ /g, '_'); // Replace space with underscore
  fileName = fileName.toLowerCase(); // Maintain Uniformity
  return fileName;
}

/**
 * isDirectory()
 * @param {string} folderNamePath
 *  */
function isDirectory(folderNamePath) {
  if (fs.existsSync(folderNamePath)) {
    return false;
  }
  return true;
}

/**
 * getFileName()
 * @param {string} file
 * @param {Object} fileData
 * @param {var} flag
 * @param {var} index
 */
function getFileName(file, fileData, flag, index) {
  let fileName;
  if (flag === 1) fileName = `${index}-${file}`; // for example: 23-someJsonFile.json
  else fileName = `${fileData.name}.json`; // for example: someValueOfName.json
  fileName = fixFileName(fileName);
  return fileName;
}

/**
 * For combineObjects()
 * @param {String} path Path of folder where all splitted files are stored
 * @param {var} keys List of keys that are to be removed
 */
function combineObject(path, keys) {
  path = fixPath(path);
  let content = srcUtils.readAllFiles(path); // read all json files
  content = updateContent(content, keys); // modifying structure
  const fileNamePath = `${path + PATH.basename(path)}_combined.json`; // for example: elements_combined,json
  writeFile(fileNamePath, content); // saving
}

/**
 * For updateContent()
 * @param {var} content
 * @param {var} keys
 */
function updateContent(content, keys) {
  const len = content.length;
  for (let itr = 0; itr < len; itr++) {
    const elementLen = content[itr].length;
    for (let i = 0; i < elementLen; i++) {
      for (let j = 0; j < keys.length; j++) {
        // console.log(content[itr][i][keys[j]]);
        delete content[itr][i][keys[j]];
      }
    }
  }
  return content;
}
module.exports = {
  writeFile,
  test,
  splitObject,
  combineObject,
  makeReadable,
  readData,
};
