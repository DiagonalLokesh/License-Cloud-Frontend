const STORAGE_KEYS = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    SESSION_TOKEN: "session_token",
    FORGOT_PASSWORD_EMAIL: "forgot_password_email",
    SIGNUP_EMAIL: "signup_email",
    USER_NAME: "user_name",
  };
  
  const storageService = {
    setItem: (key: string, value: any) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
  
    getItem: (key: string) => {
      const item = localStorage.getItem(key);
      try {
        return item ? JSON.parse(item) : null;
      } catch {
        return item;
      }
    },
  
    removeItem: (key: string) => {
      localStorage.removeItem(key);
    },
  
    clear: () => {
      localStorage.clear();
    },
  
    KEYS: STORAGE_KEYS,
  };
  
  export default storageService;
