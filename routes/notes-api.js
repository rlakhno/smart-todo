// notes-appi.js
/*
 * All routes for User Data are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /api/users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();
const notesQueries = require('../db/queries/notes');

// CRUD
// Create - POST
router.post('/', (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User is not logged in' });
  }

  const { note } = req.body;

  if ((!note) || (note === '')) {
    return res
      .status(400)
      .json({ message: 'All properties must be provided to create a note' });
  }

  notesQueries
    .create(note)
    .then((note) => {
      res.status(201).json({ message: 'Note created!', note });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: 'Error creating note', error: err.message });
    });
});

// Read all - GET
router.get('/', (req, res) => {
  let dbQuery = undefined;
  const { user_id } = req.query;

  if (user_id) {
    dbQuery = notesQueries.getByUserId(user_id);
  } else {
    dbQuery = notesQueries.getAll();
  }

  dbQuery
    .then((notes) => {
      res.status(201).json({ message: 'Here all notes!', notes });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: 'Error reading notes', error: err.message });
    });
});

// Read one - GET
router.get('/:id', (req, res) => {
  notesQueries
    .getNote(req.params.id)
    .then((note) => {
      if (!note) {
        return res.status(400).json({ message: 'Note not found!' });
      }

      res.status(201).json({ message: 'Here is your note!', note });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: 'Error reading note', error: err.message });
    });
});

// Update - POST
router.post('/:id', (req, res) => {
  const { user } = req.session;
  const updatedNote = req.body;

  if (!user) {
    return res.status(401).json({ message: 'User is not logged in' });
  }

  if (!updatedNote.content) {
    return res
      .status(400)
      .json({ message: 'All properties must be provided to update a note' });
  }

  notesQueries
    .getNote(updatedNote.id)
    .then((note) => {
      if (!note) {
        return res.status(404).json({ message: 'Note not found!' });
      }

      const noteBelongsToUser = note.user_id === user.id;

      if (!noteBelongsToUser) {
        return res
          .status(401)
          .json({ message: 'Note does not belongs to you!' });
      }

      return notesQueries.update(updatedNote);
    })
    .then((note) => {
      res.status(201).json({ message: 'Note updated!', note: note });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: 'Error updating note', error: err.message });
    });
});

// Delete - POST
router.delete('/:id/delete', (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({ message: 'User is not logged in' });
  }

  const { id } = req.params;

  notesQueries
    .getNote(id)
    .then((note) => {
      if (!note) {
        return res.status(404).json({ message: 'Note not found!' });
      }

      const noteBelongsToUser = note.user_id === user.id;
      if (!noteBelongsToUser) {
        return res
          .status(401)
          .json({ message: 'Note does not belongs to you!' });
      }

      return notesQueries.deleteNote(id);
    })
    .then(() => {
      res.status(204).json();
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: 'Error deleting note', error: err.message });
    });
});

module.exports = router;
