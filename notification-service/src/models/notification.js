const mongoose = require("mongoose")

const NotificationSchema = mongoose.Schema({
    receiverId: String,
    actorId: String,
    type: String,
    entityId: String,
    message: String,
    status: Number,
    data: Object,
}, { timestamps: true })

// NotificationSchema.schema.index({ receiverId: 1, status: 1, createdAt: -1 });


const NotificationModel = mongoose.model("notifications", NotificationSchema)

module.exports = { NotificationModel }