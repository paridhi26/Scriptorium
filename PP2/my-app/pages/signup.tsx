// Import necessary libraries and hooks
import React, { useState } from "react";
import { useRouter } from "next/router";

const Signup = () => {
  // State for form fields and error message
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState("");

  // Use Next.js router for navigation
  const router = useRouter();

  // Handle the signup form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear any previous errors

    // Create a FormData object to handle file upload
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phone", phone);
    if (avatar) {
      formData.append("avatar", avatar); // Add avatar if provided
    }

    try {
      // Send signup request to the backend
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Check if signup request was unsuccessful
      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      // Redirect to login page after successful signup
      router.push("/login");
    } catch (err) {
      console.error("Error during signup:", err); // Log error to console
      setError(err instanceof Error ? err.message : "An unexpected error occurred."); // Set error message
    }
  };

  return (
    // Center the signup form on the page
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Create an Account</h1>

        {/* Display any error messages */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Signup form */}
        <form onSubmit={handleSignup}>
          {/* Email input field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Password input field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update password state
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* First name input field */}
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)} // Update first name state
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Last name input field */}
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)} // Update last name state
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Phone number input field (optional) */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone (Optional)
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)} // Update phone state
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Avatar upload input field (optional) */}
          <div className="mb-4">
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
              Avatar (Optional)
            </label>
            <input
              type="file"
              id="avatar"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)} // Update avatar state
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              accept="image/*" // Accept only image files
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-4 rounded w-full hover:bg-green-700"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;









