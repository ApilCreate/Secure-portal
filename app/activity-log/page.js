'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Shield,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  BarChart3,
  ShieldCheck,
  ShieldX,
  Key,
} from 'lucide-react';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;

        const { id } = JSON.parse(storedUser);
        const res = await fetch(`/api/activity-log?userId=${id}`);
        const data = await res.json();

        if (res.ok) {
          setLogs(data.logs);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActionIcon = (action) => {
    const actionType = action.toLowerCase();

    if (actionType.includes('failed login')) return ShieldX;
    if (actionType.includes('reset password')) return Key;
    if (actionType.includes('login') || actionType.includes('sign in')) return Shield;
    if (actionType.includes('logout') || actionType.includes('sign out')) return LogOut;
    if (actionType.includes('create') || actionType.includes('add')) return Plus;
    if (actionType.includes('update') || actionType.includes('edit')) return Edit;
    if (actionType.includes('delete') || actionType.includes('remove')) return Trash2;
    if (actionType.includes('view') || actionType.includes('access')) return Eye;
    if (actionType.includes('2fa') && actionType.includes('enabled')) return ShieldCheck;
    if (actionType.includes('2fa') && actionType.includes('disabled')) return ShieldX;
    if (actionType.includes('password') && actionType.includes('changed')) return Key;

    return FileText;
  };

  const getActionColor = (action) => {
    const actionType = action.toLowerCase();

    if (actionType.includes('failed login')) return 'from-rose-500/20 to-rose-600/10 border-rose-500/30';
    if (actionType.includes('reset password')) return 'from-orange-500/20 to-orange-600/10 border-orange-500/30';
    if (actionType.includes('login') || actionType.includes('sign in')) return 'from-gray-500/20 to-gray-600/10 border-gray-500/30';
    if (actionType.includes('logout') || actionType.includes('sign out')) return 'from-red-500/20 to-red-600/10 border-red-500/30';
    if (actionType.includes('create') || actionType.includes('add')) return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
    if (actionType.includes('update') || actionType.includes('edit')) return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    if (actionType.includes('delete') || actionType.includes('remove')) return 'from-red-500/20 to-red-600/10 border-red-500/30';
    if (actionType.includes('2fa') && actionType.includes('enabled')) return 'from-green-500/20 to-green-600/10 border-green-500/30';
    if (actionType.includes('2fa') && actionType.includes('disabled')) return 'from-red-500/20 to-red-600/10 border-red-500/30';
    if (actionType.includes('password') && actionType.includes('changed')) return 'from-purple-500/20 to-purple-600/10 border-purple-500/30';

    return 'from-gray-500/20 to-gray-600/10 border-gray-500/30';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-gray-400">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative flex items-center justify-center mx-8 bg-gradient-to-r from-black via-gray-900 to-black border-b border-gray-800 px-4 py-8">
        <button
          onClick={() => router.push('/account')}
          className="absolute left-0 group px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
        >
          <span className="flex items-center space-x-2">
            <ArrowLeft size={20} />
            <span>Back</span>
          </span>
        </button>

        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Activity History
          </h1>
          <p className="text-gray-400 mt-2">
            Track your recent account activities and changes
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-900/50 rounded-2xl p-12 border border-gray-800">
              <div className="flex justify-center mb-4">
                <FileText size={64} className="text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-2">
                No Activity Yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Your activity history will appear here as you use the platform.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Total Activities</h2>
                  <p className="text-3xl font-bold text-white mt-1">{logs.length}</p>
                </div>
                <BarChart3 size={48} className="text-gray-400" />
              </div>
            </div>

            <div className="space-y-3">
              {logs.slice(0, visibleCount).map((log, index) => {
                const IconComponent = getActionIcon(log.action);
                return (
                  <div
                    key={log.id}
                    className={`group relative bg-gradient-to-r ${getActionColor(log.action)} backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-black/30 rounded-full flex items-center justify-center border border-gray-700">
                        <IconComponent size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">{log.action}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="bg-black/20 px-3 py-1 rounded-full">
                              {formatDate(log.timestamp)}
                            </span>
                            <span className="font-mono">{formatTime(log.timestamp)}</span>
                          </div>
                        </div>
                        {log.details && (
                          <p className="text-gray-300 text-sm">{log.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < logs.length && (
              <div className="text-center pt-8">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 border border-gray-700"
                >
                  View More Activities
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
