import React, { useContext, useState } from "react";
import "./login.css";
import "./signup.css";
import PageContext from "../../context/PageContext";
import StateContext from "../../context/StateContext";
import { useNavigate } from "react-router-dom";
import { login } from "../../assets/utils";
import PulchowkLogo from "../StaticComponents/PulchowkLogo";
const validator = require("validator");

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState(null);
  const stateContext = useContext(StateContext);
  const pageContext = useContext(PageContext);
  const navigate = useNavigate();

  const disableButton = () => {
    return !validator.isEmail(email) || !password;
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      // Use the updated login function from utils that handles session management
      await login({
        stateContext,
        email,
        password,
        rememberMe,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.error);
      }
      console.log("Login operation failed due to an error", error);
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <div className="logo-container">
          <PulchowkLogo style={{ marginBottom: "20px" }} />
        </div>
        <h2>Log in to your account</h2>
        {message && <div className="error-alert">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="form-group">
            <div className="form-group-2">
              <label>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Remember for 30 days
              </label>
              <button type="button" className="button-forgot-password " onClick={() => pageContext.navigateTo("forgotPassword")}>
                Forgot Password
              </button>
            </div>
          </div>
          <button type="submit" className="sign-in-button" disabled={disableButton()}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
