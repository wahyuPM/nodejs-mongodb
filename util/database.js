const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  // conecting to mongodb
  MongoClient.connect('mongodb+srv://wahyuPratama191:Ba929752@cluster0.mickw.mongodb.net/shop?retryWrites=true&w=majority')
    .then(client => {
      console.log('connected to database');
      _db = client.db(); // storing connection to database
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
}

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;