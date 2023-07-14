// I made it so the password is not required as a parameter and instead the entire
// connection string is an environment variable. Passing the password every time
// the app is run is highly inconvenient and will drive anyone with a
// complex password insane.

const mongoose = require('mongoose');
require('dotenv').config();

console.log('Connecting to the database...');
mongoose.set('strictQuery', false);
mongoose.connect(process.env.CONN_STRING)
.then(async res => {
    console.log('Database connection successful');
    
    const userEntrySchema = new mongoose.Schema({
        name: String,
        number: String
    });
    
    const UserEntry = mongoose.model('UserEntry', userEntrySchema);
   
    if (process.argv.length < 3) {
        await UserEntry.find({})
        .then(res => {
            console.log('phonebook:')
            res.forEach(entry => {
                console.log(`${entry.name} ${entry.number}`);
            });
        })
        .catch(e => {
            console.log(e);
        });
        mongoose.connection.close();
        return;
    }
    
    const userEntry = new UserEntry({
        name: process.argv[2],
        number: process.argv[3]
    });
    
    console.log(`Trying to add the following entry to the database:\n${userEntry}`);
    
    userEntry.save().then(result => {
        console.log(`Added ${result.name} number ${result.number} to the phonebook`);
        mongoose.connection.close();
    });
})
.catch(e => {
    console.log(e);
});