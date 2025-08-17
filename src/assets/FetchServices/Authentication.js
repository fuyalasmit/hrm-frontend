import axios from "axios";
const BASE_URL = require("./BaseUrl.json").value; 

/**
 * logs in a potential user.
 * @param {*} loginCredentials  an object containing email and password properties.
 * @returns an object containing email address of the authenticated user and session token.
 */
export const login = async (loginCredentials) => {
  const url = `${BASE_URL}/api/login`;
  try {
    const res = await axios.post(url, loginCredentials);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const signup = async (signupData) => {
  const url = `${BASE_URL}/api/signup`;
  try {
    const res = await axios.post(url, signupData);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const logout = async () => {
  const url = `${BASE_URL}/api/logout`;
  try {
    // Get session token using SessionManager
    let sessionToken;
    try {
      const SessionManager = require("../../utils/sessionManager").default;
      sessionToken = SessionManager.getSessionToken();
    } catch (error) {
      console.error('Error getting session token:', error);
    }
    
    const headers = {};
    if (sessionToken) {
      headers['x-session-token'] = sessionToken;
    }
    
    const res = await axios.post(url, {}, { headers });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const forgotPassword = async (data) => {
  const url = `${BASE_URL}/api/forgotpassword`;
  try {
    const res = await axios.post(url, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const resetPassword = async (data, id) => {
  const url = `${BASE_URL}/api/resetpassword/${id}`;
  try {
    let res = await axios.patch(url, data);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const resetPasswordAuth = async (data) => {
  const url = `${BASE_URL}/api/resetPasswordauth`;
  try {
    // Get session token using SessionManager
    let sessionToken;
    try {
      const SessionManager = require("../../utils/sessionManager").default;
      sessionToken = SessionManager.getSessionToken();
    } catch (error) {
      console.error('Error getting session token:', error);
    }
    
    const headers = {};
    if (sessionToken) {
      headers['x-session-token'] = sessionToken;
    }
    
    let res = await axios.patch(url, data, { headers });
    return res.data;
  } catch (err) {
    throw err;
  }
};
