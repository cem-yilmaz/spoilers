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

// Get spoilers by media ID
router.get('/media/:mediaId', async (req, res) => {
  const spoilers = await Spoiler.find({ media: req.params.mediaId });
  res.json(spoilers);
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

// Get the spoiler edit form
router.get('/:id/edit', async (req, res) => {
  try {
      const spoiler = await Spoiler.findById(req.params.id).populate('media');
      const mediaList = await Media.find({});
      res.render('spoilers/edit', { spoiler, mediaList, title: 'Edit Spoiler' });
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
  const part = req.body.part ? { title: req.body.part } : null; // If a part was selected, create a part object

  const newSpoiler = new Spoiler({
    title: req.body.title,
    intensity: req.body.intensity,
    reference: req.body.reference,
    media: req.body.mediaId,
    part
  });

  try {
    await newSpoiler.save();
    await Media.updateOne(
      { _id: req.body.mediaId },
      { $push: { spoilers: newSpoiler._id } }
    )
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

    const part = req.body.part ? { title: req.body.part } : null; // If a part was selected, create a part object

    spoiler.title = req.body.title;
    spoiler.intensity = req.body.intensity;
    spoiler.reference = req.body.reference;
    spoiler.media = req.body.mediaId;
    spoiler.part = part;

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
