import "./App.css";
import { AuthProvider } from "./components/AuthProvider";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SignInForm from "./components/SignInForm";

function App() {
  return (
    <AuthProvider>
      <Header />
      <main className="flex flex-col h-screen">
        <SignInForm />
      </main>
      <Footer />
    </AuthProvider>
  );
}

export default App;
