const express = require('express');
const router = express.Router();
const Media = require('../models/media');

router.get('/', async (req, res) => {
  console.log('Get type:', req.get('Accept'));
  const mediaList = await Media.find({});
  // If the request accepts JSON, send the mediaList as the response
  if (req.get('Accept') === 'application/json') {
    console.log('Sending JSON');
    return res.json(mediaList);
  }
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
    if (!mediaItem) return res.status(404).json({ error: 'Media not found' });
    
    // Check if the request accepts JSON, and send JSON if so
    if (req.get('Accept') === 'application/json') {
      return res.json(mediaItem);
    }

    // Otherwise, render the view
    res.render('media/show', { media: mediaItem, title: mediaItem.title });
  } catch (err) {
    console.error(err);
    
    // If the request accepts JSON, send the error as the response
    if (req.get('Accept') === 'application/json') {
      return res.status(500).json(err);
    }

    // Otherwise, do the redirect
    res.redirect('/media');
  }
});


router.post('/', async (req, res) => {
  // Validate the type field
  if (!req.body.type || !['Video Game', 'TV Show', 'Film', 'Book', 'Sporting Event', 'Other'].includes(req.body.type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  // Validate the parts field
  let parts = [];
  if (req.body.parts) {
    if (!Array.isArray(req.body.parts) || req.body.parts.some(part => typeof part.title !== 'string')) {
      return res.status(400).json({ error: 'Invalid parts format' });
    }

    for (let i = 0; i < req.body.parts.length; i++) {
      parts.push({ title: req.body.parts[i].title });
    }
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
    if (req.get('Accept') === 'application/json') {
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
    const deletedSuccessfully = await Media.findByIdAndRemove(req.params.id);
    if (!deletedSuccessfully) return res.status(404).json({ error: 'Media not found' });
    res.redirect('/media');
  } catch (err) {
    console.log(err);
    res.redirect('/media');
  }
});


router.put('/:id', async (req, res) => {
  try {
    let mediaItem = await Media.findById(req.params.id);
    
    if (!mediaItem) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Validate the type field
    if (!req.body.type || !['Video Game', 'TV Show', 'Film', 'Book', 'Sporting Event', 'Other'].includes(req.body.type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    // Validate the parts field
    let parts = [];
    if (req.body.parts) {
      if (!Array.isArray(req.body.parts) || req.body.parts.some(part => typeof part.title !== 'string')) {
        return res.status(400).json({ error: 'Invalid parts format' });
      }

      for (let i = 0; i < req.body.parts.length; i++) {
        parts.push({ title: req.body.parts[i].title });
      }
    }

    mediaItem.title = req.body.title;
    mediaItem.type = req.body.type;
    mediaItem.parts = parts;
    const savedMedia = await mediaItem.save();

    // If the request accepts JSON, send the savedMedia as the response
    if (req.get('Accept') === 'application/json') {
      return res.status(200).json(savedMedia);
    }

    res.redirect(`/media/${mediaItem.id}`);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


module.exports = router;