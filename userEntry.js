const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.CONN_STRING)
.then(res => {
    console.log('Connected to db!');
})
.catch(e => {
    console.log(e);
});

const userEntrySchema = mongoose.Schema({
    name: String,
    number: String
});

userEntrySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('UserEntry', userEntrySchema);