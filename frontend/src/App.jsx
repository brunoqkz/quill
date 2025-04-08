import "./App.css";
import { AuthProvider } from "./components/AuthProvider";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SignInForm from "./components/SignInForm";
import Dashboard from "./components/Dashboard";
import NotFoundPage from "./components/NotFoundPage";
import NewAuthorForm from "./components/NewAuthorForm";
import NewUserForm from "./components/NewUserForm";
import UserManagement from "./components/UserManagement";
import User from "./components/User";
import SideMenu from "./components/SideMenu";
import Manuscript from "./components/Manuscript";
import BookDashboard from "./components/BookDashboard";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <Header />
      <main className="flex">
        <SideMenu />
        <Routes>
          <Route path="/" element={<SignInForm />} />
          <Route path="/register-author" element={<NewAuthorForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/users/:userId" element={<User />} />
          <Route path="/register/user" element={<NewUserForm />} />
          <Route path="/manuscript/:manuscriptId" element={<Manuscript />} />
          <Route path="/book/:manuscriptId" element={<BookDashboard />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
