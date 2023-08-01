const express = require('express');
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

// Set the layout file
app.set('layout', 'layout');

// Set up body-parser to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

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

// Set up our media routes
app.use('/media', mediaRoutes);

// Set up our spoiler routes
app.use('/spoilers', spoilerRoutes);

// Set up our URL routes
app.use('/urls', URLRoutes);

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/spoilers_wiki', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  keepAlive: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

module.exports = app;
/* 
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));
 */