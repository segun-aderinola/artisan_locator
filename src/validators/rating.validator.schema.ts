import * as yup from 'yup';

export const ratingSchema = yup.object({
  rate: yup.string().trim().required(),
  message: yup.string().trim().required(),
});
