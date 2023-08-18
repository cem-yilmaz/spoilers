const express = require('express');
const router = express.Router();
const Media = require('../models/media');

router.get('/', async (req, res) => {
  // Get all media
  const mediaList = await Media.find({});
  return res.json(mediaList);
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
    if (!mediaItem) {
      return res.status(404).json({ error: 'Media not found' });
    } else {
      return res.json(mediaItem);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
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
    return res.status(200).json(savedMedia);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedSuccessfully = await Media.findByIdAndRemove(req.params.id);
    if (!deletedSuccessfully) return res.status(404).json({ error: 'Media not found' });
    return res.status(200).json({ success: 'Media deleted successfully' });
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
    return res.status(200).json(savedMedia);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


module.exports = router;