import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const apiUrl = 'http://127.0.0.1:8000/api';

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            // --- تم إرجاع الكونسول لوغ هنا ---
            console.log("Google Success Response:", tokenResponse);
            const accessToken = tokenResponse.access_token;
            console.log("Extracted Access Token:", accessToken);

            setIsLoading(true);
            setMessage('Authenticating with Google...');
            
            const apiFormData = new FormData();
            apiFormData.append('token', accessToken);

            try {
                const backendResponse = await axios.post(`${apiUrl}/auth/callback/google`, apiFormData);
                if (backendResponse.data.status === 'success') {
                    localStorage.setItem('token', backendResponse.data.data.authorization.token);
                    setMessage('Logged in successfully! Redirecting...');
                    setTimeout(() => navigate('/home'), 2000);
                } else {
                    setMessage(backendResponse.data.message || 'Backend authentication failed.');
                }
            } catch (error) {
                console.error("Backend login error:", error.response || error);
                setMessage('Authentication failed when contacting the server.');
            } finally {
                setIsLoading(false);
            }
        },
        onError: (error) => {
            console.error('Google Login Failed:', error);
            setMessage('An error occurred during Google login.');
        },
        flow: 'implicit', 
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setErrors({});

        try {
            const response = await axios.post(`${apiUrl}/user/register`, formData);
            
            if (response.data.status === 'success') {
                const token = response.data.data.authorization.token;
                localStorage.setItem('token', token);
                setMessage('You are registered successfully! Redirecting...');
                setTimeout(() => {
                    navigate('/home'); 
                }, 2000);
            }
        } catch (error) {
            console.error("Registration error:", error.response || error);
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || {}); 
                setMessage('Please check the form for errors.');
            } else {
                setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-transparent backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl space-y-6" noValidate>
                <h2 className="text-3xl font-bold text-center text-white">
                    User <span className="text-orange-500">Register</span>
                </h2>

                {message && (
                    <div className={`p-4 rounded-lg text-sm ${(errors && Object.keys(errors).length > 0) || message.includes('failed') ? 'bg-red-900/50 border border-red-500/40 text-red-200' : 'bg-green-900/50 border border-green-500/40 text-green-200'}`}>
                        {message}
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" className={`w-full px-4 py-3 bg-black/40 text-white border rounded-lg ${errors.name ? 'border-red-500' : 'border-white/10'}`} />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name[0]}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className={`w-full px-4 py-3 bg-black/40 text-white border rounded-lg ${errors.email ? 'border-red-500' : 'border-white/10'}`} />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className={`w-full px-4 py-3 bg-black/40 text-white border rounded-lg ${errors.password ? 'border-red-500' : 'border-white/10'}`} />
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password[0]}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50">
                    {isLoading ? 'Processing...' : 'Register'}
                </button>

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-neutral-700"></div>
                    <span className="flex-shrink mx-4 text-neutral-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-neutral-700"></div>
                </div>

                <button 
                    type="button" 
                    onClick={() => login()} 
                    disabled={isLoading}
                    className="w-full py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center border border-gray-300/50 shadow-sm disabled:opacity-50"
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                         <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,36.216,44,30.563,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    Continue with Google
                </button>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-orange-500 hover:text-orange-400">Sign In</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;