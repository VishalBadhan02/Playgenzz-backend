const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    caption: { type: String },
    media: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true }
    }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
    belongsTo: {
        kind: { type: String, enum: ['user', 'team', 'tournament'], required: true },
        item: { type: mongoose.Schema.Types.ObjectId, required: true }
    },
    createdAt: { type: Date, default: Date.now }
});

const MediaModel = mongoose.model("media", MediaSchema);

module.exports = MediaModel;
