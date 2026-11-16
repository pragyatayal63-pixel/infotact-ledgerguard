import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <ShieldCheck size={30} className="text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white tracking-tight">
            LedgerGuard
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Secure. Smart. Reliable.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>

            <p className="text-slate-500 text-sm mt-2">
              Sign in to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                Remember me
              </label>

              <button
                type="button"
                className="text-blue-600 font-medium hover:text-blue-700"
                onClick={() => alert("Password recovery will be added later.")}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg shadow-blue-600/20"
            >
              Sign In
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-7 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Protected by LedgerGuard Security
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-7">
          © 2026 LedgerGuard. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
