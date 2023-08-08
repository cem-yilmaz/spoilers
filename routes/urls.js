const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const URL = require('../models/URL');
const Media = mongoose.model('Media');
const Spoiler = mongoose.model('Spoiler');

// New URL form
router.get('/new', async (req, res) => {
  const media = await Media.find({});
  const spoilers = await Spoiler.find({});
  res.render('urls/new', { media, spoilers });
});

// Create URL
router.post('/', async (req, res) => {
  const url = new URL(req.body);

  const validationError = url.validateSync();
  if (validationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: validationError.errors
    });
  }

  await url.save();
  await Media.updateOne(
    { _id: url.media },
    { $push: { urls: url._id } }
  );
  await Spoiler.updateOne(
    { _id: url.spoiler },
    { $push: { urls: url._id } }
  );
  // Test compatability
  if (req.get('Accept') === 'application/json') {
    return res.status(200).json(url);
  }
  res.redirect('/urls');
});


// Edit URL form
router.get('/:id/edit', async (req, res) => {
  const url = await URL.findById(req.params.id);
  const media = await Media.find({});
  const spoilers = await Spoiler.find({});
  res.render('urls/edit', { url, media, spoilers });
});

// Update URL
router.put('/:id', async (req, res) => {
  await URL.findByIdAndUpdate(req.params.id, req.body);
  // Test compatability
  if (req.get('Accept') === 'application/json') {
    return res.status(200).send();
    // Currently only returning status code
    // .json data can be returned from a GET request
  }
  res.redirect('/urls');
});

// Delete URL
router.delete('/:id', async (req, res) => {
  await URL.findByIdAndDelete(req.params.id);
  // Test compatability
  if (req.get('Accept') === 'application/json') {
    return res.status(200).send();
    // No 404 status code implementation as of yet
  }
  res.redirect('/urls');
});

// List URLs
router.get('/', async (req, res) => {
  const urls = await URL.find({}).populate('media').populate('spoiler');
  res.render('urls/index', { urls, title: 'URLs' });
});

// Show URL
router.get('/:id', async (req, res) => {
  const url = await URL.findById(req.params.id).populate('media').populate('spoiler');
  // Test compatability
  if (req.get('Accept') === 'application/json') {
    return res.status(200).json(url);
  }
  res.render('urls/show', { url });
});

module.exports = router;
