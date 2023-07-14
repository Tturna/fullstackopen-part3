const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
// eslint-disable-next-line no-undef
mongoose.connect(process.env.CONN_STRING)
    .then(() => {
        console.log('Connected to db!');
    })
    .catch(e => {
        console.log(e);
    });

const userEntrySchema = mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: [true, 'Name required']
    },
    number: {
        type: String,
        minLength: 8,
        validate: {
            validator: function(v) {
                return /^\d{2,3}-\d+$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: [true, 'Number required']
    }
});

userEntrySchema.set('toJSON', {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('UserEntry', userEntrySchema);