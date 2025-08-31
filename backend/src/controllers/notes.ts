import { Request } from 'express';
import catchAsync from '../middlewares/catchAsync';
import Note, { NoteSchema } from '../models/Note';
import User from '../models/User';
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

/**
 * @route   /notes/user/:auth0Id
 * @method  GET
 * @access  Public (for now, since we're bypassing auth middleware)
 * @desc    Get list of notes for a specific Auth0 user.
 */
export const getNotesByAuth0Id = catchAsync(
  async (req: Request<{ auth0Id?: string }, {}, {}, {}>, res, next) => {
    const { auth0Id } = req.params;
    
    if (!auth0Id) {
      throw new CaptureError('Auth0 ID is required', httpStatus.BAD_REQUEST);
    }

    // Find the user by Auth0 ID
    const user = await User.findOne({ auth0Id: decodeURIComponent(auth0Id) });
    
    if (!user) {
      return res.json({
        success: true,
        statusCode: httpStatus.OK,
        totalResults: 0,
        notes: [],
        message: 'User not found, but returning empty notes array'
      });
    }

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
 * @route   /notes/user/:auth0Id/create
 * @method  POST
 * @access  Public (for now, since we're bypassing auth middleware)
 * @desc    Create a note for a specific Auth0 user.
 */
export const createNoteByAuth0Id = catchAsync(
  async (req: Request<{ auth0Id?: string }, {}, { title: string; description: string }, {}>, res, next) => {
    const { auth0Id } = req.params;
    const { title, description } = req.body;
    
    if (!auth0Id) {
      throw new CaptureError('Auth0 ID is required', httpStatus.BAD_REQUEST);
    }

    // Validate note data
    const { data: noteData, error } = await validateCreateNoteData({ title, description });
    if (error) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.message,
        error,
      });
    }

    // Find the user by Auth0 ID
    const user = await User.findOne({ auth0Id: decodeURIComponent(auth0Id) });
    
    if (!user) {
      throw new CaptureError('User not found', httpStatus.NOT_FOUND);
    }

    const newNote = new Note({ ...noteData, user: user._id });
    await newNote.save();

    return res.status(httpStatus.CREATED).json({
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'A new note has been created',
      note: newNote,
    });
  }
);

/**
 * @route   /notes/user/:auth0Id/:noteId/delete
 * @method  DELETE
 * @access  Public (for now, since we're bypassing auth middleware)
 * @desc    Delete a note for a specific Auth0 user.
 */
export const deleteNoteByAuth0Id = catchAsync(
  async (req: Request<{ auth0Id?: string; noteId?: string }, {}, {}, {}>, res, next) => {
    const { auth0Id, noteId } = req.params;
    
    if (!auth0Id || !noteId) {
      throw new CaptureError('Auth0 ID and Note ID are required', httpStatus.BAD_REQUEST);
    }

    // Find the user by Auth0 ID
    const user = await User.findOne({ auth0Id: decodeURIComponent(auth0Id) });
    
    if (!user) {
      throw new CaptureError('User not found', httpStatus.NOT_FOUND);
    }

    // Find and delete the note
    const note = await Note.findOne({ _id: noteId, user: user._id });

    if (!note) {
      throw new CaptureError('Note does not exist', httpStatus.NOT_FOUND);
    }

    const deletion = await Note.deleteOne({ _id: noteId, user: user._id });

    if (deletion.deletedCount === 0) {
      throw new CaptureError('Note could not be deleted', httpStatus.BAD_REQUEST);
    }

    return res.json({
      success: true,
      statusCode: httpStatus.OK,
      message: 'Note has been deleted!',
      note,
    });
  }
);

/**
 * @route   /notes/user/:auth0Id/:noteId/update
 * @method  PUT
 * @access  Public (for now, since we're bypassing auth middleware)
 * @desc    Update a note for a specific Auth0 user.
 */
export const updateNoteByAuth0Id = catchAsync(
  async (req: Request<{ auth0Id?: string; noteId?: string }, {}, { title?: string; description?: string }, {}>, res, next) => {
    const { auth0Id, noteId } = req.params;
    const { title, description } = req.body;
    
    if (!auth0Id || !noteId) {
      throw new CaptureError('Auth0 ID and Note ID are required', httpStatus.BAD_REQUEST);
    }

    // Validate note data
    const { data: noteData, error } = await validateUpdateNoteData({ title, description });
    if (error) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: error.message,
        error,
      });
    }

    // Find the user by Auth0 ID
    const user = await User.findOne({ auth0Id: decodeURIComponent(auth0Id) });
    
    if (!user) {
      throw new CaptureError('User not found', httpStatus.NOT_FOUND);
    }

    // Find and update the note
    const updateNote = await Note.findOneAndUpdate(
      { _id: noteId, user: user._id },
      { $set: { ...noteData } },
      { new: true }
    );

    if (!updateNote) {
      throw new CaptureError('Note does not exist', httpStatus.NOT_FOUND);
    }

    return res.json({
      success: true,
      statusCode: httpStatus.OK,
      message: 'Note has been updated!',
      note: updateNote,
    });
  }
);
