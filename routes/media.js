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
  let parts = createParts(req.body, res);
  if (parts === null) {
    console.log("Its the parts the parts are fucky");
    return;
  }

  const newMedia = new Media({
    title: req.body.title,
    type: req.body.type,
    year: req.body.year,
    parts,
    urls: [],
    spoilers: []
  });

  // Check for duplicate media
  if (isDuplicateMedia(newMedia)) {
    return res.status(409).json({ error: 'Media already exists' });
  }
  
  //console.log(newMedia); //DEBUG

  try {
    const savedMedia = await newMedia.save();
    return res.status(200).json(savedMedia);
  } catch (err) {
    //console.error(err); //DEBUG
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

function isDuplicateMedia(media) {
  // Checks to see if a media with the same title, type, and year already exists
  return Media.find({ title: media.title, type: media.type, year: media.year }).length > 0;
}

function createParts(requestBody, res) {
  // Validate the parts field
  if (requestBody.parts) {
    // Validate that the parts field is an array
    if (!Array.isArray(requestBody.parts)) {
      return res.status(400).json({ error: 'Invalid parts format' });
    } else { // We know the parts field is an array
      // Validate each item in the parts array
      for (const part of requestBody.parts) {
        if (typeof part !== 'object' || !part.title || typeof part.title !== 'string') {
          // Checking the following:
          // 1. part is an object
          // 2. part has a title field
          // 3. part.title is a string
          return res.status(400).json({ error: 'Invalid parts format' });
        } // If we reach this point, the parts field is valid
      } // We can then continue
    }
  }


  let parts = [];
  for (let i = 0; i < requestBody.numParts; i++) {
    parts.push({ title: requestBody.parts[i].title });
  }
  return parts;
}


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
    let parts = createParts(req.body, res);
    if (parts === null) return; //Could also do if (!parts) return;

    mediaItem.title = req.body.title;
    mediaItem.type = req.body.type;
    mediaItem.parts = parts;
    mediaItem.year = req.body.year;

    if (isDuplicateMedia(mediaItem)) {
      return res.status(409).json({ error: 'Media already exists' });
    }

    const savedMedia = await mediaItem.save();
    return res.status(200).json(savedMedia);
  } catch (err) {
    //console.log(err); //DEBUG
    res.status(500).json(err);
  }
});


module.exports = router;