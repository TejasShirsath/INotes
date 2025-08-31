import mongoose from 'mongoose';
type ObjectId = mongoose.Types.ObjectId;

export interface NoteSchema extends Document {
  title: string;
  description: string;
  user: ObjectId;
}

const noteSchema = new mongoose.Schema<NoteSchema>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for a note'],
    },
    title: {
      type: String,
      trim: true,
      unique: true,
      maxlength: 128,
      required: [true, 'Title is required'],
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Note = mongoose.model<NoteSchema>('Note', noteSchema);

export default Note;
