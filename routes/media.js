const express = require('express');
const router = express.Router();
const Media = require('../models/media');

router.get('/', async (req, res) => {
  const mediaList = await Media.find({});
  res.render('media/index', { media: mediaList, title: 'Media List' });
});

router.get('/new', (req, res) => {
  res.render('media/new', { title: 'Add New Media' });
});

router.get('/:id', async (req, res) => {
  try {
    const mediaItem = await Media.findById(req.params.id);
    res.render('media/show', { media: mediaItem, title: mediaItem.title });
    console.log("Success");
  } catch (err) {
    console.log(err);
    res.redirect('/media');
  }
});

router.post('/', async (req, res) => {
  const newMedia = new Media({
    title: req.body.title,
    type: req.body.type,
  });
  await newMedia.save();
  res.redirect('/media');
});

module.exports = router;