const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const path = require('path');

const mediaRoutes = require('./routes/media');
const spoilerRoutes = require('./routes/spoiler');
const URLRoutes = require('./routes/urls');

const Media = require('./models/media');

const app = express();

// Set up EJS as our templating engine
app.set('view engine', 'ejs');

// Set views directory
app.set('views', path.join(__dirname, 'views'));

// Set up express-ejs-layouts
app.use(expressLayouts);

// Enable all CORS requests
app.use(cors());

// Set the layout file
app.set('layout', 'layout');

// Set up body-parser to parse form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up method-override to allow PUT and DELETE requests to be sent via POST
app.use(methodOverride('_method'));

// Set up backup title incase we forget to pass once
app.locals.title = 'NO TITLE SET';

// Set up our home route
app.get('/', async (req, res) => {
  const mediaList = await Media.find().populate({ 
    path: 'spoilers',
    populate: {
      path: 'urls',
      model: 'URL'
    } 
  }).exec();
  res.render('index', { title: 'Spoiler Wiki', mediaList });
});

// Set up routes
app.use('/media', mediaRoutes);
app.use('/spoilers', spoilerRoutes);
app.use('/urls', URLRoutes);

// Start the server - FUNCTIONALITY MOVED TO server.js
/* app.listen(3000, () => {
  console.log('Server is running on port 3000');
}); */

const mongoose = require('mongoose');
const defaultConnection = 'mongodb://127.0.0.1:27017/spoilers_wiki';
let db_connection = defaultConnection;

mongoose.connect('mongodb://127.0.0.1:27017/spoilers_wiki', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // keepAlive: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

module.exports = app;