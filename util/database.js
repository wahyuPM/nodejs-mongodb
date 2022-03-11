const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = (callback) => {
  MongoClient.connect('mongodb+srv://wahyuPratama191:Ba929752@cluster0.mickw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
    .then(client => {
      console.log('connected to database');
      callback(client);
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = mongoConnect;