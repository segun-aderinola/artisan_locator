import * as yup from 'yup';

export const requestSchema = yup.object({
  deadline: yup.string().trim().required(),
  location: yup.string().trim().required(),
  latitude: yup.string().trim().required(),
  longitude: yup.string().trim().required(),
  message: yup.string().trim().required(),
});
