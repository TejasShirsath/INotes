import { Request } from 'express';
import catchAsync from '../middlewares/catchAsync';
import Note, { NoteSchema } from '../models/Note';
import CaptureError from '../utils/CaptureError';
import httpStatus from '../utils/httpStatus';
import {
  validateCreateNoteData,
  validateUpdateNoteData,
} from '../validations/notes';

/**
 * @route   /notes
 * @method  POST
 * @access  Private
 * @desc    Create a note by providing a title and a description.
 */
export const createNote = catchAsync(async (req, res, next) => {
  const { data: noteData, error } = await validateCreateNoteData(req.body);
  if (error)
    return res.json({
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: error.message,
      error,
    });

  const newNote = new Note({ ...noteData, user: req.user!._id });
  await newNote.save();

  return res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'A new note has been created',
    note: newNote,
  });
});

interface NotesQueryParams {
  page?: string;
}

type Count = [{ count: number }];

/**
 * @route   /notes
 * @method  GET
 * @access  Private
 * @desc    Get list of notes for current logged in user.
 */
export const getNotes = catchAsync(
  async (req: Request<{}, {}, {}, NotesQueryParams>, res, next) => {
    const user = req.user;

    const notesRes = await Note.aggregate<{
      count: Count;
      notes: NoteSchema[];
    }>([
      {
        $match: {
          user: user._id,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          count: [{ $count: 'count' }],
          notes: [],
        },
      },
    ]);

    const totalResults = notesRes[0].count[0]?.count ?? 0;
    const notes = notesRes[0].notes ?? [];

    return res.json({
      success: true,
      statusCode: httpStatus.OK,
      totalResults,
      notes: notes,
    });
  }
);

/**
 * @route   /notes/:id
 * @method  GET
 * @access  Private
 * @desc    Get notes details.
 */
export const getNoteById = catchAsync(
  async (req: Request<{ id?: string }, {}, {}, {}>, res, next) => {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note)
      throw new CaptureError('Note does not exist', httpStatus.NOT_FOUND);

    return res.json({
      success: true,
      statusCode: httpStatus.OK,
      note,
    });
  }
);

/**
 * @route   /notes/:id
 * @method  PUT
 * @access  Private
 * @desc    Update a note by id.
 */
export const updateNoteById = catchAsync(
  async (req: Request<{ id?: string }, {}, {}, {}>, res, next) => {
    const { data: noteData, error } = await validateUpdateNoteData(req.body);
    if (error)
      return res.json({
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.message,
        error,
      });

    const updateNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { ...noteData } },
      { new: true }
    );

    if (!updateNote)
      throw new CaptureError('Note does not exist', httpStatus.NOT_FOUND);

    return res.json({
      success: true,
      statusCode: httpStatus.OK,
      message: 'Note has been updated!',
      note: updateNote,
    });
  }
);

/**
 * @route   /notes/:id
 * @method  DELETE
 * @access  Private
 * @desc    Delete a note by id.
 */
export const deleteNoteById = catchAsync(
  async (req: Request<{ id?: string }, {}, {}, {}>, res, next) => {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note)
      throw new CaptureError('Note does not exist', httpStatus.NOT_FOUND);

    const deletion = await Note.deleteOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (deletion.deletedCount === 0)
      throw new CaptureError('Note does not exist', httpStatus.BAD_REQUEST);

    return res.json({
      success: true,
      statusCode: httpStatus.OK,
      message: 'Note has been deleted!',
      note,
    });
  }
);
