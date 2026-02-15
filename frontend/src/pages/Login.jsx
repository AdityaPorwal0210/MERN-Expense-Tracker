import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { APIUrl, handleError, handleSuccess } from '../utils';
import '../login.css';

const FaSun = () => <span>☀️</span>;
const FaMoon = () => <span>🌙</span>;
const FaSignInAlt = () => <span>🔑</span>;

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });

    const [darkMode, setDarkMode] = useState(false);
    const [shake, setShake] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            triggerShake();
            return handleError('Email and password are required');
        }
        try {
            const url = `${APIUrl}/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;
            if (success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000)
            } else if (error) {
                const details = error?.details[0].message;
                triggerShake();
                handleError(details);
            } else if (!success) {
                triggerShake();
                handleError(message);
            }
        } catch (err) {
            triggerShake();
            handleError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className={`auth-page ${darkMode ? 'dark-theme' : 'light-theme'}`}>
            <div className="login-background"></div>

            <button
                className="theme-toggle"
                onClick={toggleDarkMode}
                aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
                {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <div className={`login-container ${shake ? 'shake-animation' : ''}`}>
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={handleChange}
                            value={loginInfo.email}
                            type="email"
                            name="email"
                            id="email"
                            className="form-input"
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={handleChange}
                            value={loginInfo.password}
                            type="password"
                            name="password"
                            id="password"
                            className="form-input"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="login-button">
                        <FaSignInAlt className="login-icon" />
                        <span>Login</span>
                    </button>
                </form>

                <div className="signup-link">
                    Don't have an account? <Link to="/signup">Signup</Link>
                </div>
            </div>

            <ToastContainer theme={darkMode ? 'dark' : 'light'} />
        </div>
    );
}

export default Login;
