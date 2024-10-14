const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

app.use(express.urlencoded({ extended: true }));


let users = [{ name: 'abc', email: 'abc@gmail.com', password: '12345' }];
let loggedInUser = null;

app.get('/',(req,res)=>{
  res.send("Hello World!");
});
app.get('/about', (req, res) => {
  res.send('Hello from the about page!');
});

app.get('/contact', (req, res) => {
  res.send('Get contact from the contact page!');
});

app.get('/services', (req, res) => {
  res.send('Services provided by us!');
});
const customMiddleware = (req, res, next) => {
  console.log(`Method: ${req.method}, Request URL: ${req.url}`);
  next();
};

app.use(customMiddleware);
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.get('/',(req,res)=>{
  res.render("index",{name:"Pratiksha Bhadalkar"});
})

app.use(express.urlencoded({ extended: true }));
app.post('/submit-form', (req, res) => {
  console.log(req.body);
  res.send('Form submitted successfully!');
});

app.use((req, res, next) => {
  res.status(404).send('Page not found');
});
app.post('/users', (req, res) => {
  users.push(req.body);
  res.send('User added');
});

app.get('/users', (req, res) => {
  res.json(users);
});
app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users', (req, res) => {
  const user = { id: Date.now(), name: req.body.name, email: req.body.email };
  users.push(user);
  res.json(user);
});

app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

app.put('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  user.name = req.body.name;
  user.email = req.body.email;
  res.json(user);
});

app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).send('User not found');
  users.splice(userIndex, 1);
  res.send('User deleted');
});


app.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: true
}));
app.post('/login', (req, res) => {
  const { name, email, password } = req.body;
  const user = users.find(u => u.name === name && u.email === email && u.password === password);
  if (user) {
    req.session.user = user;
    loggedInUser = user;
    res.send('Logged in successfully!');
  } else {
    res.status(401).send('Invalid credentials');
  }
});
app.post('/logout', (req, res) => {
  req.session.destroy();
  loggedInUser = null;
  res.send('Logged out successfully!');
});

const validateFormData = (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).send('All fields are required!');
  }
  next();
};



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Too many requests from this IP, please try again later'
});


const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log' })
  ]
});

 
app.use(morgan('dev'));   
app.use(cors());            
app.use(limiter);                   

app.use((err, req, res, next) => {
  logger.error(err.message); 
  res.status(500).send({ error: 'Something went wrong', details: err.message });
});
app.get('/message', (req, res) => {
  res.render('message', { message: "Hello, from EJS!" });
});
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
