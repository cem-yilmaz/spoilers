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
    let partDesignator = 'None';
    let numParts = 0;
    let customDesignator = '';
    if(mediaItem.parts.length > 0) {
      numParts = mediaItem.parts.length;
      let prefix = mediaItem.parts[0].title.split(' ')[0];
      if(['Chapter', 'Episode', 'Level', 'Part'].includes(prefix)) {
        partDesignator = prefix;
      } else {
        let allStartWithSamePrefix = mediaItem.parts.every(part => part.title.startsWith(prefix));
        if(allStartWithSamePrefix) {
          partDesignator = 'Custom';
          customDesignator = prefix;
        }
      }
    }
    res.render('media/edit', { 
      media: mediaItem, 
      title: `Edit ${mediaItem.title}`, 
      partDesignator,
      numParts,
      customDesignator 
    });
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
  console.log(req.body);
  const parts = req.body.parts ? req.body.parts.map(title => ({ title })) : []; // Map the parts titles to parts objects
  const newMedia = new Media({
    title: req.body.title,
    type: req.body.type,
    parts,
    urls: [],
    spoilers: []
  });
  await newMedia.save();
  res.redirect('/media');
});


router.delete('/:id', async (req, res) => {
  try {
    await Media.findByIdAndRemove(req.params.id);
    res.redirect('/media');
  } catch (err) {
    console.log(err);
    res.redirect('/media');
  }
});


router.put('/:id', async (req, res) => {
  try {
    console.log(req.body);
    let mediaItem = await Media.findById(req.params.id);
    const parts = req.body.parts ? req.body.parts.map(title => ({ title })) : []; // Map the parts titles to parts objects
    mediaItem.title = req.body.title;
    mediaItem.type = req.body.type;
    mediaItem.parts = parts;
    await mediaItem.save();
    res.redirect(`/media/${mediaItem.id}`);
  } catch (err) {
    console.log(err);
    res.redirect('/media');
  }
});

module.exports = router;