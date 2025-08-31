import express from 'express';
import {
  createNote,
  getNoteById,
  getNotes,
  deleteNoteById,
  updateNoteById,
} from '../controllers/notes';
import protect from '../middlewares/protect';
import validateId from '../middlewares/validateId';
const router = express.Router();

router.route('/notes').post(protect, createNote).get(protect, getNotes);
router
  .route('/notes/:id')
  .get(protect, validateId('id'), getNoteById)
  .put(protect, validateId('id'), updateNoteById)
  .delete(protect, validateId('id'), deleteNoteById);

export default router;
