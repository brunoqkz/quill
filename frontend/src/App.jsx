import "./App.css";
import { AuthProvider } from "./components/AuthProvider";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SignInForm from "./components/SignInForm";
import Dashboard from "./components/Dashboard";
import NotFoundPage from "./components/NotFoundPage";
import NewAuthorForm from "./components/NewAuthorForm";
import UserManagement from "./components/UserManagement";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <Header />
      <main className="flex flex-col h-screen">
        <Routes>
          <Route path="/" element={<SignInForm />} />
          <Route path="/register-author" element={<NewAuthorForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
