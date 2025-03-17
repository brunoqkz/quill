import "./App.css";
import Header from "./components/Header";
import SignInForm from "./components/SignInForm";

function App() {
  return (
    <main className="flex flex-col h-screen">
      <Header />
      <SignInForm />
    </main>
  );
}

export default App;
