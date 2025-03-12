const { mongoose } = require("mongoose");

const TempUserSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    phoneNumber: Number,
    email: String,
    address: String,
    password: String,
    conform_password: String,
    status: String,
},
    { timestamps: true })

const TempUserModel = mongoose.model("tempusers", TempUserSchema);

module.exports = TempUserModel;