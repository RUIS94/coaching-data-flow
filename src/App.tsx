import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider, useToastContext } from "@/contexts/ToastContext";
import ToastManager from "@/components/CommonComponents/ToastManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Heart, Plus, Bell, Mail, Menu, Gauge, Calendar, ClipboardList, LayoutDashboard, BarChart3, Users2, Video, Folder, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MeetingIntelligence from "./pages/MeetingIntelligence";
import MeetingList from "./pages/MeetingList/MeetingList";
import ManagerView from "./pages/Dashboard/LeaderDashboard";
import DealDrillDown from "./pages/DealAnalytics/DealDrillDown";
import DealAnalytics from "./pages/DealAnalytics/DealAnalytics";
import CoachingSession from "./pages/CoachingSession/Session";
import { FileManager } from "./pages/FileManager";
import ManagerPrep from "./pages/Prepare/LeaderPrep";
import LeaderUncover from "./pages/Uncover/LeaderUncover";
import SalesUncover from "./pages/Uncover/SalesUncover";
import LeaderLead from "./pages/Lead/LeaderLead";
import SalesLead from "./pages/Lead/SalesLead";
import LeaderSync from "./pages/Sync/LeaderSync";
import SalesSync from "./pages/Sync/SalesSync";
import LeaderEvaluate from "./pages/Evaluate/LeaderEvaluate";
import SalesEvaluate from "./pages/Evaluate/SalesEvaluate";
import SalesCoachingDashboard from "./pages/Dashboard/SalesDashboard";
import SalesPrep from "./pages/Prepare/SalesPrep";
import { mockAEReps } from "@/data/mock";

const queryClient = new QueryClient();

const ToastRenderer = () => {
  const { toasts, removeToast } = useToastContext();
  return <ToastManager toasts={toasts} onRemoveToast={removeToast} />;
};

const App = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [role, setRole] = useState<"leader" | "sales">("leader");
  const [isCoachingOpen, setIsCoachingOpen] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TooltipProvider>
          <BrowserRouter>
            <div className="h-screen bg-gray-50 overflow-hidden">
              <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-800 font-semibold">SAM</span>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-gray-600 flex items-center justify-center gap-1">
                    We would <Heart className="w-4 h-4 text-[#605BFF]" /> to hear your feedback!
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                    <Mail className="w-5 h-5" />
                  </button>
                  <span className="text-gray-700 font-medium">
                    {role === "leader" ? "Sales Leader" : (mockAEReps[0]?.name ?? "Sales Rep")}
                  </span>
                </div>
              </div>
              <div className={`fixed left-0 top-12 ${isNavCollapsed ? "w-20" : "w-64"} h-[calc(100vh-3rem)] bg-white border-r-[0.5px] border-gray-200 flex flex-col z-10 transition-all duration-300`}>
                <div className={`${isNavCollapsed ? "px-2 pb-0" : "px-4 pb-1"}`}>
                  <div className={`w-full flex items-center ${isNavCollapsed ? "justify-center" : "justify-between"} gap-2`}>
                    <button
                      onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                      className={`${isNavCollapsed ? "px-2" : "px-4"} py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center`}
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                    <div className={`${isNavCollapsed ? "hidden" : "flex"} items-center gap-2`}>
                      <span className="text-xs text-gray-600">Sales</span>
                      <Switch
                        checked={role === "leader"}
                        onCheckedChange={(v) => setRole(v ? "leader" : "sales")}
                        aria-label="Role Switch"
                      />
                      <span className="text-xs text-gray-800 font-medium">Leader</span>
                    </div>
                  </div>
                </div>
                <nav className={`flex-1 ${isNavCollapsed ? "px-2 pt-1 pb-2" : "px-4 pt-2 pb-4"} overflow-y-auto`}>
                  <Link
                    to="/meeting-intelligence"
                    className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                  >
                    <Gauge className="w-5 h-5 flex-shrink-0" />
                    {!isNavCollapsed && <span className="font-medium">Meeting Intelligence</span>}
                  </Link>
                  <Link
                    to="/meeting-list"
                    className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                  >
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    {!isNavCollapsed && <span className="font-medium">Meeting List</span>}
                  </Link>
                  <Link
                    to="/sam-drive"
                    className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                  >
                    <Folder className="w-5 h-5 flex-shrink-0" />
                    {!isNavCollapsed && <span className="font-medium">SAM Drive</span>}
                  </Link>
                  {!isNavCollapsed ? (
                    <>
                      <button
                        onClick={() => setIsCoachingOpen(prev => !prev)}
                        className="w-full flex items-center justify-between px-4 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                        aria-expanded={isCoachingOpen}
                        aria-controls="coaching-group"
                      >
                        <span>Coaching</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isCoachingOpen ? "" : "-rotate-90"}`} />
                      </button>
                      <div id="coaching-group" className={`${isCoachingOpen ? "block" : "hidden"}`}>
                        {role === "leader" ? (
                          <Link
                            to="/manager-dashboard"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Coaching Dashboard</span>}
                          </Link>
                        ) : (
                          <Link
                            to="/sales-coaching-dashboard"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Coaching Dashboard</span>}
                          </Link>
                        )}
                        {role === "leader" ? (
                          <Link
                            to="/manager-prep"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <ClipboardList className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Prepare</span>}
                          </Link>
                        ) : (
                          <Link
                            to="/sales-prep"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <ClipboardList className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Prepare</span>}
                          </Link>
                        )}
                        {role === "leader" ? (
                          <Link
                            to="/leader-uncover"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <ClipboardList className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Uncover</span>}
                          </Link>
                        ) : (
                          <Link
                            to="/sales-uncover"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <ClipboardList className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Uncover</span>}
                          </Link>
                        )}
                        {role === "leader" ? (
                          <Link
                            to="/leader-sync"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <ClipboardList className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Sync</span>}
                          </Link>
                        ) : (
                          <Link
                            to="/sales-sync"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <ClipboardList className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Sync</span>}
                          </Link>
                        )}
                        {role === "leader" ? (
                          <Link
                            to="/leader-evaluate"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <ClipboardList className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Evaluate</span>}
                          </Link>
                        ) : (
                          <Link
                            to="/sales-evaluate"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <ClipboardList className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Evaluate</span>}
                          </Link>
                        )}
                        {role === "leader" ? (
                          <Link
                            to="/leader-lead"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <ClipboardList className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Lead</span>}
                          </Link>
                        ) : (
                          <Link
                            to="/sales-lead"
                            className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                          >
                            <ClipboardList className="w-5 h-5 flex-shrink-0" />
                            {!isNavCollapsed && <span className="font-medium">Lead</span>}
                          </Link>
                        )}
                        <Link
                          to="/deal-drilldown/rep-1"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <Users2 className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Deal Drilldown</span>}
                        </Link>
                        <Link
                          to="/deal-analytics/deal-1"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <BarChart3 className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Deal Analytics</span>}
                        </Link>
                        <Link
                          to="/coaching-session"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <Video className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Coaching Session</span>}
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      {role === "leader" && (
                        <Link
                          to="/manager-dashboard"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Manager Dashboard</span>}
                        </Link>
                      )}
                      {role === "leader" ? (
                        <Link
                          to="/manager-prep"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <ClipboardList className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Prepare</span>}
                        </Link>
                      ) : (
                        <Link
                          to="/sales-prep"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <ClipboardList className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Prepare</span>}
                        </Link>
                      )}
                      {role === "leader" ? (
                        <Link
                          to="/leader-uncover"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <ClipboardList className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Uncover</span>}
                        </Link>
                      ) : (
                        <Link
                          to="/sales-uncover"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <ClipboardList className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Uncover</span>}
                        </Link>
                      )}
                      {role === "leader" ? (
                        <Link
                          to="/leader-sync"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <ClipboardList className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Sync</span>}
                        </Link>
                      ) : (
                        <Link
                          to="/sales-sync"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <ClipboardList className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Sync</span>}
                        </Link>
                      )}
                      {role === "leader" ? (
                        <Link
                          to="/leader-evaluate"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <ClipboardList className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Evaluate</span>}
                        </Link>
                      ) : (
                        <Link
                          to="/sales-evaluate"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <ClipboardList className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Evaluate</span>}
                        </Link>
                      )}
                      {role === "leader" ? (
                        <Link
                          to="/leader-lead"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <ClipboardList className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Lead</span>}
                        </Link>
                      ) : (
                        <Link
                          to="/sales-lead"
                          className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                        >
                          <ClipboardList className="w-5 h-5 flex-shrink-0" />
                          {!isNavCollapsed && <span className="font-medium">Lead</span>}
                        </Link>
                      )}
                      <Link
                        to="/deal-drilldown/rep-1"
                        className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                      >
                        <Users2 className="w-5 h-5 flex-shrink-0" />
                        {!isNavCollapsed && <span className="font-medium">Deal Drilldown</span>}
                      </Link>
                      <Link
                        to="/deal-analytics/deal-1"
                        className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                      >
                        <BarChart3 className="w-5 h-5 flex-shrink-0" />
                        {!isNavCollapsed && <span className="font-medium">Deal Analytics</span>}
                      </Link>
                      <Link
                        to="/coaching-session"
                        className={`w-full flex items-center ${isNavCollapsed ? "justify-center px-2" : "space-x-3 px-4"} py-3 rounded-lg text-left transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100`}
                      >
                        <Video className="w-5 h-5 flex-shrink-0" />
                        {!isNavCollapsed && <span className="font-medium">Coaching Session</span>}
                      </Link>
                    </>
                  )}
                </nav>
              </div>
              <div className={`${isNavCollapsed ? "ml-20" : "ml-64"} mt-12 h-[calc(100vh-3rem)] overflow-y-auto transition-all duration-300`}>
                <div className="h-full">
                  <Sonner />
                  <ToastRenderer />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/meeting-intelligence" element={<MeetingIntelligence />} />
                    <Route path="/meeting-list" element={<MeetingList />} />
                      <Route path="/sam-drive" element={<FileManager />} />
                    <Route path="/sales-prep" element={<SalesPrep />} />
                    <Route path="/manager-prep" element={<ManagerPrep />} />
                    <Route path="/leader-uncover" element={<LeaderUncover />} />
                    <Route path="/sales-uncover" element={<SalesUncover />} />
                    <Route path="/leader-sync" element={<LeaderSync />} />
                    <Route path="/sales-sync" element={<SalesSync />} />
                    <Route path="/leader-evaluate" element={<LeaderEvaluate />} />
                    <Route path="/sales-evaluate" element={<SalesEvaluate />} />
                    <Route path="/sales-coaching-dashboard" element={<SalesCoachingDashboard />} />
                    <Route path="/leader-lead" element={<LeaderLead />} />
                    <Route path="/sales-lead" element={<SalesLead />} />
                    <Route path="/manager-dashboard" element={<ManagerView />} />
                    <Route path="/deal-drilldown/:repId" element={<DealDrillDown />} />
                    <Route path="/deal-analytics/:dealId" element={<DealAnalytics />} />
                    <Route path="/coaching-session" element={<CoachingSession />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
