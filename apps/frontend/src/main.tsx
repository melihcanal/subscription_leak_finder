import React from "react";
import ReactDOM from "react-dom/client";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, useNavigate} from "react-router-dom";
import {ClerkProvider} from "@clerk/react";
import {HeroUIProvider} from "@heroui/react";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

function ClerkProviderWithRoutes() {
    const navigate = useNavigate();

    return (
        <ClerkProvider
            publishableKey={clerkPublishableKey}
            routerPush={(to) => navigate(to)}
            routerReplace={(to) => navigate(to, {replace: true})}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
        >
            <HeroUIProvider>
                <App/>
            </HeroUIProvider>
        </ClerkProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
          <ClerkProviderWithRoutes/>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
