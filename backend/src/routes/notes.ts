import express from 'express';
import {
  createNote,
  getNoteById,
  getNotes,
  deleteNoteById,
  updateNoteById,
} from '../controllers/notes';
import { authenticate } from '../middlewares/universalAuth';
import validateId from '../middlewares/validateId';
const router = express.Router();

router.route('/notes').post(authenticate, createNote).get(authenticate, getNotes);
router
  .route('/notes/:id')
  .get(authenticate, validateId('id'), getNoteById)
  .put(authenticate, validateId('id'), updateNoteById)
  .delete(authenticate, validateId('id'), deleteNoteById);

export default router;
