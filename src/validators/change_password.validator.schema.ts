import * as yup from 'yup';

export const changePasswordSchema = yup.object({
  old_password: yup.string().trim().required(),
  new_password: yup.string().trim().required(),
});
