var express = require('express');

var app = express();

app.use(express.static(__dirname + '/client'));

app.post('/', function(req, res) {
  console.log(req.method + ' ' + req.url);
  res.type = 'text';
  res.statusCode = 201;
  var data = '';
  req.on('data', (chunk) => {
    data += chunk.toString();
  });
  req.on('end', () => {
    var dataObj = JSON.parse(data);
    var resObj = {results: csvConversion(dataObj)};
    res.end(JSON.stringify(resObj));
  });
});

app.listen(3000);


var csvConversion = function(obj) {
  var flattenedObj = flattenObj(obj);
  // var keysArr = createArrayOfKeys(flattenedObj);
  var keysArr = flattenedObj[1];
  flattenedObj = flattenedObj[0];
  var stringOfValues = createStringFromObj(flattenedObj, keysArr);
  var csv = keysArr.join(',') + '\n' + stringOfValues;
  return csv;
}

var flattenObj = function(parentObj) {

  var id = 1;
  var keysArr = [];
  var recursiveSearch = function(obj) {
    var arr = [];
    obj.id = id;
    id++;
    if(obj.children) {
      for(var i = 0; i < obj.children.length; i++) {
        obj.children[i].parentId = obj.id;
        arr.push(...recursiveSearch(obj.children[i])[0]);
      }
  
      delete obj.children;
    }
    var keys = Object.keys(obj);
    for(var j = 0; j < keys.length; j++) {
      if(!keysArr.includes(keys[j])) {
        keysArr.push(keys[j]);
      }
    }
    arr.unshift(obj);
    return [arr, keysArr];

  }

  return recursiveSearch(parentObj);
}

var createStringFromObj = function(flattenedObj, keysArr) {
  var arrOfValues = [];
  for (var i = 0; i < flattenedObj.length; i++) {
    var currObj = flattenedObj[i];
    var currObjArr = [];
    for(var j = 0; j < keysArr.length; j++) {
      var currKey = keysArr[j];
      var value = currObj[currKey] || '';
      currObjArr.push(value);
    }
    arrOfValues.push(currObjArr.join(','));
  }
  return arrOfValues.join('\n');
}
