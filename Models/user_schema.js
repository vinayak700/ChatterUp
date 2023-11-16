import mongoose from 'mongoose';

// Defining userschema schema object
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    connected: {
        type: Boolean,
        required: true,
        default: false,
    }
}, { versionKey: false, });

// create & export messageModel
const User = mongoose.model('User', userSchema);
export default User;