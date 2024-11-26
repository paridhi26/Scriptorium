import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      // Step 1: Authenticate and get authToken + userId
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      const { token: authToken, userId } = data;

      console.log("Auth Token:", authToken, "User ID:", userId);

      // Step 2: Fetch user details using userId
      const userResponse = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const user = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(user.message || "Failed to fetch user details");
      }

      console.log("User Info:", user);

      // Step 3: Save to localStorage and update context
      login(authToken, userId, user);
      router.push(`/${userId}`);
    } catch (err) {
      console.error("Error during login:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">
          {isLogin ? "Login" : "Create an Account"}
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded w-full hover:bg-blue-700"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
