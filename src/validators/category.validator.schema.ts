import * as yup from 'yup';

export const categorySchema = yup.object({
  name: yup.string().trim().required(),
  description: yup.string().trim().required(),
  image: yup.string().trim().required(),
});
