const express = require('express');
const router = express.Router();
const Spoiler = require('../models/spoiler');
const Media = require('../models/media');

// Get all spoilers
router.get('/', async (req, res) => {
  try {
      const spoilersList = await Spoiler.find({}).populate('media');
      res.render('spoilers/index', { spoilers: spoilersList, title: 'Spoilers List' });
  } catch(err) {
      console.log(err);
      res.redirect('/spoilers');
  }
});


// New spoiler form
router.get('/new', async (req, res) => {
  try {
      const mediaList = await Media.find({});
      res.render('spoilers/new', { mediaList: mediaList, title: 'Create Spoiler' });
  } catch (err) {
      console.log(err);
      res.redirect('/spoilers');
  }
});

  
// Get a single spoiler
router.get('/:id', async (req, res) => {
    try {
        const spoiler = await Spoiler.findById(req.params.id);
        res.render('spoilers/show', { spoiler, title: spoiler.title });
    } catch (err) {
        console.log(err);
        res.redirect('/spoilers');
    }
});

// Create a new spoiler
router.post('/', async (req, res) => {
  const newSpoiler = new Spoiler({
      title: req.body.title,
      intensity: req.body.intensity,
      reference: req.body.reference,
      media: req.body.mediaId
  });
  try {
      await newSpoiler.save();
      res.redirect('/spoilers');
  } catch (err) {
      console.log(err);
      res.redirect('/spoilers/new');
  }
});

  

// Update a spoiler
router.put('/:id', async (req, res) => {
    try {
      let spoiler = await Spoiler.findById(req.params.id);
      spoiler.title = req.body.title;
      spoiler.intensity = req.body.intensity;
      spoiler.reference = req.body.reference;
      spoiler.media = req.body.mediaId;
      await spoiler.save();
      res.redirect(`/spoilers/${spoiler.id}`);
    } catch (err) {
      console.log(err);
      res.redirect('/spoilers');
    }
});
  
// Delete a spoiler
router.delete('/:id', async (req, res) => {
    try {
      await Spoiler.findByIdAndRemove(req.params.id);
      res.redirect('/spoilers');
    } catch (err) {
      console.log(err);
      res.redirect('/spoilers');
    }
  });
  
module.exports = router;
