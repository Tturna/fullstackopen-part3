require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const UserEntry = require('./userEntry.js');

morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
});

const morg = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ');
});

const errorHandler = (error, request, response, next) => {
    console.log(`Error: ${error.name}:\n${error.message}`);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }

    next(error);
}

// Middleware
app.use(express.static('build'));
app.use(express.json());
app.use(morg);

app.get('/info', (_req, res) => {
    UserEntry.find({})
    .then(entries => {
        res.send(`<p>Phonebook has info for ${entries.length} people.</p><p>${new Date()}</p>`)
    })
    .catch(e => {
        next(e);
    });
});

app.get('/api/persons', (_req, res) => {
    UserEntry.find({})
    .then(entries => {
        res.json(entries);
    })
    .catch(e => {
        next(e);
    });
});

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id;
    
    UserEntry.findById(id)
    .then(entry => {
        if (entry) {
            res.json(entry);
        } else {
            res.status(404).end();
        }
    })
    .catch(e => {
        console.log("ID based get failed oh nooooo...");
        next(e);
    });

    // const entry = entries.find(e => e.id == id)

    // if (entry) {
    //     res.json(entry)
    // } else {
    //     res.status(404).end('No entry with given id')
    // }
});

app.post('/api/persons', (req, res, next) => {
    const name = req.body.name
    const number = req.body.number

    if (!name || name.length == 0) {
        return res.status(400).json({
            error: 'name missing'
        })
    }

    if (!number || number.length == 0) {
        return res.status(400).json({
            error: 'number missing'
        })
    }

    const userEntry = new UserEntry({
        name: name,
        number: number
    });

    userEntry.save()
    .then(addedEntry => {
        res.json(addedEntry);
    })
    .catch(e => {
        next(e);
    });

    // const existing = entries.find(e => e.name === name)
    // if (existing) {
    //     return res.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }

    // let newEntry = {
    //     "id": Math.round(Math.random() * 1000),
    //     "name": name,
    //     "number": number
    // }

    // entries.push(newEntry)
    // res.json(newEntry)
})

app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id;
    
    UserEntry.findByIdAndRemove(id)
    .then(_ => {
        res.status(204).end();
    })
    .catch(e => {
        next(e);
    });

    // const entry = entries.find(e => e.id == id)

    // if (entry) {
    //     entries = entries.filter(e => e.id != id)
    //     res.status(204).end()
    // } else {
    //     res.status(404).end('No entry with given id')
    // }
});

app.put('/api/persons/:id', (req, res, next) => {
    const id = req.params.id;
    const updateValues = req.body;

    UserEntry.findByIdAndUpdate(id, updateValues, { new: true, runValidators: true, context: 'query' })
    .then(updatedEntry => {
        res.json(updatedEntry);
    })
    .catch(e => {
        next(e);
    });
});

app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} `)
})