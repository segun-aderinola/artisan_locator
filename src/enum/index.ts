// Token Types
export enum TokenType {
  PHONE_VERIFICATION = "PHONE_VERIFICATION",
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET"
}
  
// Token Statuses
export enum TokenStatus {
  NOT_USED = "NOT_USED",
  USED = "USED",
  EXPIRED = "EXPIRED",
}

// User Types
export enum UserType {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
  SERVICE_PROVIDER = "SERVICE_PROVIDER",
}

export enum ErrorCode {
  GENERAL_ERROR = "general_error"
}

// User Gender
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum CustomerOnboardingStep {
  REGISTER_PHONE = 1,
  VERIFY_PHONE = 2,
  REGISTER_CUSTOMER_INFO = 3,
  VERIFY_EMAIL = 4,
  SET_PASSWORD = 5,
  FACIAL_VERIFICATION = 6,
}

export enum ServiceProviderOnboardingStep {
  REGISTER_PHONE = 1,
  VERIFY_PHONE = 2,
  REGISTER_SERVICE_PROVIDER_INFO = 3,
  VERIFY_EMAIL = 4,
  REGISTER_BUSINESS_INFO = 5,
  UPLOAD_VERIFICATION_DOCUMENTS = 6,
  SET_PASSWORD = 7,
}