import mongoose from 'mongoose';

// Defining mongoose schema object
const msgSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: String,
    }
}, { versionKey: false, });

// create & export messageModel
const Message = mongoose.model('Message', msgSchema);
export default Message;