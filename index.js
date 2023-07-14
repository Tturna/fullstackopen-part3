require('dotenv').config();
const express = require('express')
const morgan = require('morgan')
const app = express()
const UserEntry = require('./userEntry.js');

morgan.token('body', (req, res) => {
    return JSON.stringify(req.body)
})

const morg = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ')
})

// Middleware
app.use(express.json())
app.use(morg)
app.use(express.static('build'))

let entries = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Daniel Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (req, res) => {
    UserEntry.find({})
    .then(entries => {
        res.send(`<p>Phonebook has info for ${entries.length} people.</p><p>${new Date()}</p>`)
    })
    .catch(e => {
        console.log(e);
    });
});

app.get('/api/persons', (_req, res) => {
    UserEntry.find({})
    .then(entries => {
        res.json(entries);
    })
    .catch(e => {
        console.log(e);
    });
});

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    
    UserEntry.findById(id)
    .then(entry => {
        res.json(entry);
    })
    .catch(e => {
        console.log(e);
    });

    // const entry = entries.find(e => e.id == id)

    // if (entry) {
    //     res.json(entry)
    // } else {
    //     res.status(404).end('No entry with given id')
    // }
});

app.post('/api/persons', (req, res) => {
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
        console.log(e);
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

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const entry = entries.find(e => e.id == id)

    if (entry) {
        entries = entries.filter(e => e.id != id)
        res.status(204).end()
    } else {
        res.status(404).end('No entry with given id')
    }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} `)
})