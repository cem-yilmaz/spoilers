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

router.get('/:id/edit', async (req, res) => {
  try {
    const mediaItem = await Media.findById(req.params.id);
    res.render('media/edit', { media: mediaItem, title: `Edit ${mediaItem.title}` });
  } catch (err) {
    console.log(err);
    res.redirect('/media');
  }
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

router.put('/:id', async (req, res) => {
  try {
    let mediaItem = await Media.findById(req.params.id);
    mediaItem.title = req.body.title;
    mediaItem.type = req.body.type;
    await mediaItem.save();
    res.redirect(`/media/${mediaItem.id}`);
  } catch (err) {
    console.log(err);
    res.redirect('/media');
  }
});

module.exports = router;