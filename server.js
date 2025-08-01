// const http = require('http')

// const server = http.createServer((req, res) => {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end('Hello, World!\n');
// });

// server.listen(3000, () => {
//   console.log('Server running at http://localhost:3000/');
// });




const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/post', (req, res) => {
  res.send('Got a POST request')
})

app.put('/user', (req, res) => {
  res.send('Got a PUT request at /user')
})

app.delete('/delete/user', (req, res) => {
  res.send('Got a DELETE request at /user')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
