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
    
    // Check if the request accepts JSON, and send JSON if so
    if (req.accepts('json')) {
      return res.json(mediaItem);
    }

    // Otherwise, render the view
    res.render('media/show', { media: mediaItem, title: mediaItem.title });
  } catch (err) {
    console.error(err);
    
    // If the request accepts JSON, send the error as the response
    if (req.accepts('json')) {
      return res.status(500).json(err);
    }

    // Otherwise, do the redirect
    res.redirect('/media');
  }
});


router.post('/', async (req, res) => {
  //console.log("Begin debug")
  //console.log(req.body);
  let parts = [];
  for (let i = 0; req.body[`parts[${i}]`]; i++) {
    parts.push({ title: req.body[`parts[${i}]`] });
  }
  const newMedia = new Media({
    title: req.body.title,
    type: req.body.type,
    parts,
    urls: [],
    spoilers: []
  });

  try {
    const savedMedia = await newMedia.save();
    
    // If the request accepts JSON, send the savedMedia as the response
    if (req.accepts('json')) {
      return res.status(200).json(savedMedia);
    }

    // Otherwise, do the redirect
    res.redirect('/media');
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
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
    //console.log(req.body);
    let mediaItem = await Media.findById(req.params.id);

    let parts = [];
    for (let i = 0; req.body[`parts[${i}]`]; i++) {
      parts.push({ title: req.body[`parts[${i}]`] });
    }

    mediaItem.title = req.body.title;
    mediaItem.type = req.body.type;
    mediaItem.parts = parts;
    const savedMedia = await mediaItem.save();

    // If the request accepts JSON, send the savedMedia as the response
    if (req.accepts('json')) {
      return res.status(200).json(savedMedia);
    }
    res.redirect(`/media/${mediaItem.id}`);
  } catch (err) {
    console.log(err);
    res.redirect('/media');
  }
});

module.exports = router;