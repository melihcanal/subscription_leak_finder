import {Link as RouterLink, Route, Routes, useLocation} from "react-router-dom";
import {Link, Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@heroui/react";
import {useAuth, UserButton} from "@clerk/react";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

const navItems = [
  { label: "Upload", path: "/" },
  { label: "Dashboard", path: "/dashboard" }
];

function Header() {
  const location = useLocation();
    const {isLoaded, isSignedIn} = useAuth();

  return (
      <Navbar className="border-b border-slate-200/70 bg-white/80">
          <NavbarBrand>
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Subscription Leak Finder</p>
          <h1 className="text-2xl font-semibold text-ink">Keep recurring spending visible.</h1>
        </div>
          </NavbarBrand>
          <NavbarContent className="gap-2" justify="end">
              {navItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                      <NavbarItem key={item.path}>
              <Link
                  as={RouterLink}
                to={item.path}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                      active ? "bg-ink text-white" : "text-slate-500 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
                      </NavbarItem>
                  );
              })}
          </NavbarContent>
          <NavbarContent justify="end">
              {isLoaded && isSignedIn ? (
                  <UserButton afterSignOutUrl="/"/>
              ) : null}
              {isLoaded && !isSignedIn ? (
                  <Link as={RouterLink} to="/sign-in" className="text-sm text-slate-500">
                      Sign in
                  </Link>
              ) : null}
          </NavbarContent>
      </Navbar>
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
            <Route path="/sign-in/*" element={<SignInPage/>}/>
            <Route path="/sign-up/*" element={<SignUpPage/>}/>
        </Routes>
      </main>
    </div>
  );
}
