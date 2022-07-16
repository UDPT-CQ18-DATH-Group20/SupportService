const mongoose = require('mongoose')
var config = require('./config');

mongoose.connect(process.env.MONGODB_URL || config.MONGODB_URL)