import AppRouter from "./routes/AppRouter";
import NotificationPopup from "./components/NotificationPopup";

function App() {
  return (
    <>
      <AppRouter />
      <NotificationPopup />
    </>
  );
}

export default App;