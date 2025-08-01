const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// name and description

// In-memory dummy database
let dummyDB = [];

// Read all items
app.get('/items', (req, res) => {
  res.status(200).send(dummyDB);
});


// Create a new item
app.post('/items', (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).send({ message: 'Name and description are required' });
  }
  const newItem = { id: dummyDB.length + 1, name, description };
  dummyDB.push(newItem);
  res.status(201).send(newItem);
});

// Update an item by ID
app.put('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const { name, description } = req.body;
  const index = dummyDB.findIndex(i => i.id === itemId);
  if (index !== -1) {
    if (name) dummyDB[index].name = name;
    if (description) dummyDB[index].description = description;
    res.status(200).send(dummyDB[index]);
  } else {
    res.status(404).send({ message: 'Item not found' });
  }
});



// Read a single item by ID
app.get('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const item = dummyDB.find(i => i.id === itemId);
  if (item) {
    res.status(200).send(item);
  } else {
    res.status(404).send({ message: 'Item not found' });
  }
});


// Delete an item by ID
app.delete('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const index = dummyDB.findIndex(i => i.id === itemId);
  if (index !== -1) {
    dummyDB.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).send({ message: 'Item not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
