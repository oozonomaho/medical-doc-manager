import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Clock,
  Ban,
  FileText,
  Wallet,
  AlertCircle,
  LogOut,
  FileCheck,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAdmin, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
                <FileText className="h-6 w-6" />
                <span className="ml-2 font-semibold">医療文書管理システム</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <NavLink to="/" icon={<Users className="h-5 w-5" />} text="患者一覧" isActive={isActive('/')} />
                <NavLink to="/deadlines" icon={<Clock className="h-5 w-5" />} text="期限管理" isActive={isActive('/deadlines')} />
                <NavLink to="/medical-certificates" icon={<FileCheck className="h-5 w-5" />} text="診断書" isActive={isActive('/medical-certificates')} />
                <NavLink to="/life-insurance" icon={<Wallet className="h-5 w-5" />} text="生保管理" isActive={isActive('/life-insurance')} />
                <NavLink to="/pending-claims" icon={<AlertCircle className="h-5 w-5" />} text="保留リスト" isActive={isActive('/pending-claims')} />
                <NavLink to="/insurance-change" icon={<RefreshCw className="h-5 w-5" />} text="保険変更" isActive={isActive('/insurance-change')} />
                <NavLink to="/stop-list" icon={<Ban className="h-5 w-5" />} text="停止リスト" isActive={isActive('/stop-list')} />
                <NavLink to="/message-board" icon={<MessageSquare className="h-5 w-5" />} text="申送り" isActive={isActive('/message-board')} />
                {isAdmin && (
                  <NavLink to="/audit-logs" icon={<FileText className="h-5 w-5" />} text="操作履歴" isActive={isActive('/audit-logs')} />
                )}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={signOut}
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, text, isActive }) => (
  <Link
    to={to}
    className={`flex items-center px-3 py-2 rounded-md ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="ml-2">{text}</span>
  </Link>
);

export default Layout;