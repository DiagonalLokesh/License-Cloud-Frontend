const BASE_URL = "https://license.aryabhat.ai/api";
const SUB_URL = "https://license.aryabhat.ai";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    SIGNUP: `${BASE_URL}/auth/signup`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    RESEND: `${BASE_URL}/auth/resend`,
    FORGOT_PASSWORD: `${BASE_URL}/forgot-password`,
    OTP_VALIDATION: `${BASE_URL}/otp/validate`,
    UPDATED_PASSWORD: `${BASE_URL}/updated-password`,
    REFRESH_ACTIVITY: `${BASE_URL}/refresh`,
    UPDATE_ACTIVITY: `${BASE_URL}/update_activity`
  },
  DASHBOARD: {
    DASHBOARD: `${BASE_URL}/dashboard`,
    NEW_LICENSE: `${BASE_URL}/dashboard/new-license`,
    LICENSE_DETAILS: `${BASE_URL}/dashboard/license-details`,
    USER_DETAILS: `${BASE_URL}/UserDetails`,
    INVITE_USERS: `${BASE_URL}/invite-users`,
    GET_LICENSE: `${BASE_URL}/get-license`,
    CLIENTS: `${SUB_URL}/get_all_license`,
    GET_LICENSE_DETAILS: (licenseNumber: string) => `/api/dashboard/license/${encodeURIComponent(licenseNumber)}`,
    CREATE_CLIENTS: `${BASE_URL}/create_client`,
    CREATE_LICENSE: `${BASE_URL}/create-license`,
    DELETE_USER: `${BASE_URL}/delete-user`,
  }
};