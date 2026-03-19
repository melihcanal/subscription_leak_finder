import { Link, Route, Routes, useLocation } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";

const navItems = [
  { label: "Upload", path: "/" },
  { label: "Dashboard", path: "/dashboard" }
];

function Header() {
  const location = useLocation();

  return (
    <header className="w-full border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Subscription Leak Finder</p>
          <h1 className="text-2xl font-semibold text-ink">Keep recurring spending visible.</h1>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-full px-4 py-2 transition ${
                  active
                    ? "bg-ink text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}
