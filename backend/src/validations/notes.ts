import * as yup from 'yup';

const createNotesSchema = yup.object({
  title: yup.string().min(3).max(128).required().label('Title'),
  description: yup.string().required().label('Description'),
});

export const validateCreateNoteData = async (payload: unknown) => {
  try {
    const validationResult = await createNotesSchema.validate(payload, {
      stripUnknown: true,
    });

    return { data: validationResult, error: null };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        data: null,
        error: {
          key: error.path,
          value: error?.params?.originalValue,
          message: error.message,
        },
      };
    } else {
      throw error;
    }
  }
};

const updateNoteSchema = yup.object({
  title: yup.string().min(3).max(128).notRequired().label('Title'),
  description: yup.string().notRequired().label('Description'),
});

export const validateUpdateNoteData = async (payload: unknown) => {
  try {
    const validationResult = await updateNoteSchema.validate(payload, {
      stripUnknown: true,
    });

    return { data: validationResult, error: null };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        data: null,
        error: {
          key: error.path,
          value: error?.params?.originalValue,
          message: error.message,
        },
      };
    } else {
      throw error;
    }
  }
};
