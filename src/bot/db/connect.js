const mongoose = require('mongoose');

const MONGO_USER = 'schedule_bot';
const MONGO_PASSWORD = 'schedule_pass';
const MONGO_DB = 'schedule_DB';

const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster.5pkto.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`;

mongoose.connect(uri).then((res, err) => {
  if (err) console.log(err);
});

const Users = mongoose.model('users', {
  _id: String,
  name: String,
  last_name: String,
  username: String,
  default_value: String,
  default_role: String,
});

module.exports = { Users };
