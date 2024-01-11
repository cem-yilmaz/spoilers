const express = require('express');
const router = express.Router();
const Spoiler = require('../models/spoiler');
const Media = require('../models/media');

// Get all spoilers
router.get('/', async (req, res) => {
  try {
    const spoilersList = await Spoiler.find({}).populate('media');
    // Test compatability
    if (req.get('Accept') === 'application/json') {
      return res.status(200).json(spoilersList);
    }
    res.render('spoilers/index', { spoilers: spoilersList, title: 'Spoilers List' });
  } catch(err) {
    console.log(err);
    res.redirect('/spoilers');
  }
});

// Get spoilers by media ID
router.get('/media/:mediaId', async (req, res) => {
  const spoilers = await Spoiler.find({ media: req.params.mediaId });
  // Test compatability
  if (req.get('Accept') === 'application/json') {
    return res.status(200).json(spoilers);
  }
  res.json(spoilers);
});

// Get the new spoiler form
router.get('/new', async (req, res) => {
  try {
    const mediaList = await Media.find({}).populate('parts');
    // Test compatability
    if (req.get('Accept') === 'application/json') {
      return res.status(200).json(mediaList);
    }
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
    const mediaList = await Media.find({}).populate('parts');
    // Test compatability
    if (req.get('Accept') === 'application/json') {
      return res.status(200).json({ spoiler, mediaList });
    }
    res.render('spoilers/edit', { spoiler, mediaList, title: 'Edit Spoiler' });
  } catch (err) {
    console.log(err);
    res.redirect('/spoilers');
  }
});

// Get a single spoiler
router.get('/:id', async (req, res) => {
  try {
    const spoiler = await Spoiler.findById(req.params.id).populate('media');
    if (!spoiler) return res.status(404).send('Spoiler not found.');
    // Test compatability
    if (req.get('Accept') === 'application/json') {
      return res.status(200).json(spoiler);
    }
    res.render('spoilers/show', { spoiler, title: spoiler.title });
  } catch (err) {
    console.log(err);
    res.redirect('/spoilers');
  }
});

// Get parts by media ID
router.get('/media/:mediaId/parts', async (req, res) => {
  const media = await Media.findById(req.params.mediaId).populate('parts');
  // Test compatability
  if (req.get('Accept') === 'application/json') {
    return res.status(200).json(media.parts);
  }
  res.json(media.parts);
});

// Create a new spoiler
router.post('/', async (req, res) => {
  const partId = req.body.part && req.body.part.trim() !== '' ? req.body.part : null;

  // If mediaId is not in the database, return an error and status 400
  const mediaFound = await Media.findById(req.body.mediaId);
  if (!mediaFound) {
    return res.status(400).json({
      status: 'error',
      message: 'Media not found',
      errors: { mediaId: 'Media not found' }
    });
  }

  const newSpoiler = new Spoiler({
    title: req.body.title,
    intensity: req.body.intensity,
    reference: req.body.reference,
    media: req.body.mediaId,
    part: partId
  });

  // Validate the model
  const validationError = newSpoiler.validateSync();
  if (validationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: validationError.errors
    });
  }

  try {
    await newSpoiler.save();
    await Media.updateOne(
      { _id: req.body.mediaId },
      { $push: { spoilers: newSpoiler._id } }
    );
    //console.log("New Spoiler saved successfully:", newSpoiler); //DEBUG
    return res.status(200).json(newSpoiler);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// Update a spoiler
router.put('/:id', async (req, res) => {
  try {
    let spoiler = await Spoiler.findById(req.params.id);

    const partId = req.body.part && req.body.part.trim() !== '' ? req.body.part : null;

    spoiler.title = req.body.title;
    spoiler.intensity = req.body.intensity;
    spoiler.reference = req.body.reference;
    spoiler.media = req.body.mediaId;
    spoiler.part = partId;

    // Validate the updated spoiler
    const validationError = spoiler.validateSync();
    if (validationError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validationError.errors
      });
    }

    // Ensure the mediaId is valid
    // Also ensure the part Id, if not null, is actually a part of the media
    if (partId) {
      const media = await Media.findById(req.body.mediaId);
      if (!media) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: { media: 'Media not found' }
        });
      } else {
        // Check if the partId matches any _id in media.parts
        const partExistsInMedia = media.parts.some(part => part._id.toString() === partId);
        if (!partExistsInMedia && media.parts.length > 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: { part: 'Part is not part of the media' }
          });
        }
      }
    }

    await spoiler.save();
    // Test compatability
    if (req.get('Accept') === 'application/json') {
      return res.status(200).json(spoiler);
    }
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
    // Test compatability
    if (req.get('Accept') === 'application/json') {
      return res.status(200).json({ message: 'Spoiler deleted successfully.' });
    }
    res.redirect('/spoilers');
  } catch (err) {
    console.log(err);
    res.redirect('/spoilers');
  }
});

module.exports = router;
