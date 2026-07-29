import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainLayout() {
  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 overflow-auto" style={{ paddingTop: "64px", paddingBottom: "72px" }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default MainLayout;
