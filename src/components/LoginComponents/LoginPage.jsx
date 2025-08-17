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
        rememberMe
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
          <PulchowkLogo style={{ marginBottom: '20px' }} />
        </div>
        <h2>Log in to your account</h2>
        {message && <div className="error-alert">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <div className="form-group-2">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember for 30 days
              </label>
              <button
                type="button"
                className="button-forgot-password "
                onClick={() => pageContext.navigateTo("forgotPassword")}
              >
                Forgot Password
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="sign-in-button"
            disabled={disableButton()}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
