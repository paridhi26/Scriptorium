// Import necessary libraries and hooks
import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  // State for storing email, password, and any error messages
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Use Next.js router for navigation
  const router = useRouter();

  // Access the login function from the AuthContext
  const { login } = useAuth();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission
    setError(""); // Reset any previous error messages

    try {
      // Send login request to the backend
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Check if the response is not successful
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Extract token and userId from the response
      const { token: authToken, userId } = data;

      // Fetch user details with the token
      const userResponse = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const user = await userResponse.json();

      // Check if fetching user details failed
      if (!userResponse.ok) {
        throw new Error(user.message || "Failed to fetch user details");
      }

      // Call the login function from AuthContext
      login(authToken, userId, user);

      // Navigate to the user's page after successful login
      router.push(`/${userId}`);
    } catch (err) {
      console.error("Error during login:", err); // Log the error
      setError(err instanceof Error ? err.message : "An unexpected error occurred."); // Set the error message
    }
  };

  return (
    // Center the login form on the page
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Login</h1>

        {/* Display any error messages */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            {/* Input field for email */}
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            {/* Input field for password */}
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update password state
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        {/* Link to the signup page */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up!</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;






