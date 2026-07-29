import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Login from "../page/Login"
import SignUp from "../page/SignUp"

import Home from "../page/Home";
import Matches from "../page/Matches"
import ConversationsList from "../page/ConversationsList";
import Chat from "../page/Chat";
import Profile from "../page/Profile";
import Notifications from "../page/user/Notifications";
import NotFound from "../page/user/NotFound";
import BuyCoins from "../page/user/BuyCoins";
import DatePlannerPage from "../page/user/DatePlannerPage";
import MusicPage from "../page/user/MusicPage";
import DiaryPage from "../page/user/DiaryPage";

//admin
// import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../page/admin/AdminDashboard";

function AppRouter() {
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="register" element={<SignUp />} />
      <Route path="admin" element={<AdminDashboard />} />
      
      <Route element={<MainLayout />}>
        <Route path="discover" element={<Home />} />
        <Route path="matches" element={<Matches />} />
        <Route path="conversations" element={<ConversationsList />} />
        <Route path="chat" element={<Chat />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="buy-coins" element={<BuyCoins />} />
        <Route path="my-date" element={<DatePlannerPage />} />
        <Route path="music" element={<MusicPage />} />
        <Route path="diary" element={<DiaryPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default AppRouter;