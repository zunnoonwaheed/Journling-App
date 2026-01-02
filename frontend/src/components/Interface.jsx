import { useAuth } from "../contexts/AuthContext";
import { useEffect, useContext, useState } from "react";
import { UserIdContext} from "./UserIdContext"
import Transcript from "./Transcript";
import EntryList from "./EntryList";
import Logout from "./Logout";
import axios from "axios";
import { API_BASE } from "../config/api";
import { supabase } from "../config/supabase";

const Sidebar = () => {
  const { user, token, login } = useAuth();
  const { userId, setUserId } = useContext(UserIdContext);
  const [syncing, setSyncing] = useState(false);

  // Sync Supabase user to local database and set userId
  useEffect(() => {
    const syncUser = async () => {
      if (!user || !token) return;
      
      // Check if this is a Supabase user (UUID format) or local user (integer)
      const isSupabaseUser = user.id && typeof user.id === 'string' && user.id.includes('-');
      
      if (isSupabaseUser && !syncing) {
        setSyncing(true);
        try {
          // Sync Supabase user to local database
          const response = await axios.post(
            `${API_BASE}/auth/sync-supabase-user`,
            {
              supabaseUserId: user.id,
              email: user.email,
              name: user.name,
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.data.status === 'success') {
            const localUser = response.data.data.user;
            // Update auth context with local user ID (integer)
            login(
              {
                id: localUser.id,
                email: localUser.email,
                name: localUser.name,
              },
              token
            );
            // Set the local integer user ID
            setUserId(localUser.id);
            console.log('User synced successfully. Local user ID:', localUser.id);
          } else {
            console.error('Sync failed:', response.data);
          }
        } catch (error) {
          console.error('Error syncing Supabase user:', error);
          console.error('Error details:', error.response?.data);
        } finally {
          setSyncing(false);
        }
      } else if (user.id && !isSupabaseUser) {
        // Local user (integer ID), just set the ID
        setUserId(user.id);
      }
    };

    syncUser();
  }, [user, token, login, setUserId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-lg border-b border-slate-600">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md border border-blue-500/30">
              <span className="text-white font-bold text-2xl">J</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Journal Ease</h1>
              <p className="text-sm text-slate-300">
                {syncing ? 'Syncing account...' : `Welcome back, ${user?.name || 'User'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600">
              <p className="text-sm font-medium text-white">{user?.email}</p>
              <p className="text-xs text-slate-300">Signed in</p>
            </div>
            <Logout />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Top Section - Recording Controls */}
        <EntryList showRecordingControls={true} />
        
        <div className="mt-6">
          {/* Transcript Panel - Full Width */}
          <Transcript />
        </div>
      </div>
    </div>
  );
} 

export default Sidebar;
