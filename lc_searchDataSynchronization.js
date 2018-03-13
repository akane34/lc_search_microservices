const AWS = require("aws-sdk");
const DOC = require("dynamodb-doc");
const uuidv4 = require('uuid/v4');

AWS.config.update({region: process.env.REGION});
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback){
    
    var done = function() {
        console.log('exiting');
        context.done();
    }
    
    var message = JSON.parse(event.message.replace(/'/g, '"'));
    var keys = Object.keys(message);
    var items = {};
    
    for (var i = 0; i < keys.length; i++){
      if (message[keys[i]] !== '')
        items[keys[i]] = message[keys[i]];
    }
    
    eventProcess(formatJson(items, event.table), event.queueUrl, event.action, event.table, done);
    
};

function eventProcess(items, queueUrl, action, table, done) {
  switch(action){
      case 'append':
        items.__ID = uuidv4() + '';
        
        var params = {
          TableName: table,
          Item: items
        };
        
        ddb.put(params, function(err, data) {
          if (err) {
            console.log("Error append data from queue: ", queueUrl, ' Detail: ', err);
          } 
          else {
            console.log("Success append data from queue: ", queueUrl, ' Data: ', params.Item);
          }
          
          done();
        });
        break;
      case 'remove':
        var params = {
          TableName: table,
          Key: {
            id: items.id
            //id: ""
          }
        };
                
        ddb.delete(params, function(err, data) {
          if (err) {
            console.log("Error delete data from queue: ", queueUrl, ' Detail: ', err);
          } 
          else {
            console.log("Success delete data from queue: ", queueUrl, ' Data: ', data);
          }
          
          done();
        });
        break;
      default:
        done();
        break;
    }
}

const isArray = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

const recursivelyLowercaseJSON = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      return obj.toLowerCase();
    }
    else{
      return obj;
    }
  }
  if (isArray(obj)) {
    return obj.map(o => recursivelyLowercaseJSON(o));
  }
  return Object.keys(obj).reduce((prev, curr) => {
    prev[curr.toLowerCase()] = recursivelyLowercaseJSON(obj[curr]);
    return prev;
  }, {});
};

const formatJson = (json, table) => {
  var formated = recursivelyLowercaseJSON(json);
  
  switch(table){
    case 'LC_Search_Offer':
      if (formated.offer_items){
        var product_references = [];
        var product_descriptions = [];
        var product_names = [];
        
        for (var i=0; i < formated.offer_items.length; i++){
          product_references[i] = formated.offer_items[i].product_reference;
          product_descriptions[i] = formated.offer_items[i].product_description;
          product_names[i] = formated.offer_items[i].product_name;
        }
        
        formated.product_references = product_references;
        formated.product_descriptions = product_descriptions;
        formated.product_names = product_names;
      }
      break;
    default: break;
  }
  
  return formated;
};
