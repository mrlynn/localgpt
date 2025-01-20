// /backend/config/environments.js
export const environments = {
    development: {
      allowEmptyMessages: true,
      validateBeforeSave: false
    },
    staging: {
      allowEmptyMessages: true, 
      validateBeforeSave: true
    },
    production: {
      allowEmptyMessages: false,
      validateBeforeSave: true
    }
  };