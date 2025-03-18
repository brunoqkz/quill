import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SignInForm from "./components/SignInForm";

function App() {
  return (
    <>
      <Header />
      <main className="flex flex-col h-screen">
        <SignInForm />
      </main>
      <Footer />
    </>
  );
}

export default App;
