export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>
        <form>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full mb-3 p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
