import * as yup from 'yup';

export const servicesSchema = yup.object({
  category_id: yup.string().trim().required(),
  name: yup.string().trim().required(),
  description: yup.string().trim().required(),
  starting_price: yup.string().required(),
  images: yup.array().required(),
});
