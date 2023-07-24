const express = require('express');
const router = express.Router();
const Spoiler = require('../models/spoiler');

// Get all spoilers
router.get('/', async (req, res) => {
    const spoilersList = await Spoiler.find({});
    res.render('spoilers/index', { spoilers: spoilersList, title: 'Spoilers List' });
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
    await newSpoiler.save();
    res.redirect('/spoilers');
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
