import mongoose from 'mongoose';

// Configure Mongodb connection with mongoose
const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            dbName:'chatApp',
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Mongodb connection established...');
    } catch (error) {
        console.log(error);
    }
}

export default connection;