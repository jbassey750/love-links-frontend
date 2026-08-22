import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ModeratorLayout from "../components/layout/ModeratorLayout";

import Login from "../page/Login";
import SignUp from "../page/SignUp";

import Home from "../page/Home";
import DiscoverUsers from "../page/DiscoverUsers"
import Matches from "../page/Matches";
import ConversationsList from "../page/ConversationsList";
import Chat from "../page/Chat";
import Profile from "../page/Profile";
import Notifications from "../page/user/Notifications";
import NotFound from "../page/user/NotFound";
import BuyCoins from "../page/user/BuyCoins";
import DatePlannerPage from "../page/user/DatePlannerPage";
import MusicPage from "../page/user/MusicPage";
import DiaryPage from "../page/user/DiaryPage";

import MessagesPage from "../page/moderator/MessagesPage";
import StatsPage from "../page/moderator/StatsPage";

import AdminDashboard from "../page/admin/AdminDashboard";
import FakeDashboard from "../page/admin/fakeuser/FakeDashboard";
import AdminPendingLikes from "../page/admin/AdminPendingLikes";
import ADminNotifications from "../page/admin/AdminNotifications";
import AdminMatches from "../page/admin/AdminMatches";
import AdminChat from "../page/admin/AdminChat";
import { ModeratorProvider } from "../context/ModeratorContext";

function AppRouter() {
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="register" element={<SignUp />} />
      <Route path="admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/fake-accounts/dashboard" element={<FakeDashboard />} />
      <Route path="/admin/pending-likes" element={<AdminPendingLikes />} />
      <Route path="/admin/matches" element={<AdminMatches />} />
      <Route path="/admin/notifications" element={<ADminNotifications />} />
      <Route path="/admin/chats/:chatId" element={<AdminChat />} />
      <Route path="chat/:chatId" element={<Chat />} />
      <Route path="buy-coins" element={<BuyCoins />} />
      <Route path="*" element={<NotFound />} />

      <Route
        path="/moderator/workspace"
        element={
          <ModeratorProvider>
            <ModeratorLayout />
          </ModeratorProvider>
        }
      >
        <Route index element={<Navigate to="messages" replace />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="stats" element={<StatsPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="discover" element={<Home />} />
        <Route path="/more/people" element={<DiscoverUsers />} />
        {/* <Route path="matches" element={<Matches />} /> */}
        <Route path="conversations" element={<ConversationsList />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="my-date" element={<DatePlannerPage />} />
        <Route path="music" element={<MusicPage />} />
        <Route path="diary" element={<DiaryPage />} />
        
      </Route>

      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default AppRouter;
