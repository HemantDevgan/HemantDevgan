const mongoose = require("mongoose");

const Mongo_url = "mongodb://127.0.0.1:27017/new_CRM"

const db = ()=>{
    try{
        mongoose.connect(Mongo_url);
        console.log("connected to mongoDB");
    }catch(err){
        console.log(err);
        console.log("mongoDB disconnected");
    }
};

module.exports = db;