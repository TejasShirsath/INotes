import express from 'express';
import {
  createNote,
  getNoteById,
  getNotes,
  getNotesByAuth0Id,
  createNoteByAuth0Id,
  deleteNoteByAuth0Id,
  updateNoteByAuth0Id,
  deleteNoteById,
  updateNoteById,
} from '../controllers/notes';
import { authenticate } from '../middlewares/universalAuth';
import validateId from '../middlewares/validateId';
const router = express.Router();

router.route('/notes').post(authenticate, createNote).get(authenticate, getNotes);
router.route('/notes/user/:auth0Id').get(getNotesByAuth0Id); // Public route for Auth0 users
router.route('/notes/user/:auth0Id/create').post(createNoteByAuth0Id); // Public route for creating notes
router.route('/notes/user/:auth0Id/:noteId/delete').delete(deleteNoteByAuth0Id); // Public route for deleting notes
router.route('/notes/user/:auth0Id/:noteId/update').put(updateNoteByAuth0Id); // Public route for updating notes
router
  .route('/notes/:id')
  .get(authenticate, validateId('id'), getNoteById)
  .put(authenticate, validateId('id'), updateNoteById)
  .delete(authenticate, validateId('id'), deleteNoteById);

export default router;
