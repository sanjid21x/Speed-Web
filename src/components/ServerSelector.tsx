import React, { useState } from 'react';
import { SpeedTestServer } from '../types/speedtest';
import {
  getAllServers,
  saveCustomServer,
  deleteCustomServer,
  setSelectedServerId,
} from '../services/servers';
import { Server, Plus, Globe, Trash2, X, CheckCircle, MapPin } from 'lucide-react';

interface ServerSelectorProps {
  activeServer: SpeedTestServer;
  onServerChange: (server: SpeedTestServer) => void;
  disabled: boolean;
  theme: 'dark' | 'light';
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  activeServer,
  onServerChange,
  disabled,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [servers, setServers] = useState<SpeedTestServer[]>(getAllServers());

  // Form state for custom server
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPingUrl, setFormPingUrl] = useState('');
  const [formDownloadUrl, setFormDownloadUrl] = useState('');
  const [formUploadUrl, setFormUploadUrl] = useState('');

  const refreshList = () => {
    const list = getAllServers();
    setServers(list);
  };

  const handleSelect = (server: SpeedTestServer) => {
    setSelectedServerId(server.id);
    onServerChange(server);
    setIsOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteCustomServer(id);
    refreshList();
    if (activeServer.id === id) {
      const remaining = getAllServers();
      handleSelect(remaining[0]);
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPingUrl) return;

    const newServer = saveCustomServer({
      id: `custom-${Date.now()}`,
      name: formName.trim(),
      location: formLocation.trim() || 'Custom Regional Node',
      provider: 'Custom Dedicated Node',
      pingUrl: formPingUrl.trim(),
      downloadBaseUrl: formDownloadUrl.trim() || formPingUrl.trim(),
      uploadUrl: formUploadUrl.trim() || formPingUrl.trim(),
    });

    refreshList();
    setShowAddModal(false);
    handleSelect(newServer);

    // Reset form
    setFormName('');
    setFormLocation('');
    setFormPingUrl('');
    setFormDownloadUrl('');
    setFormUploadUrl('');
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-cyan-500/50'
        } ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}
      >
        <Server className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-[180px]">
          {activeServer.name}
        </span>
        <span className="text-slate-500 hidden sm:inline">({activeServer.location})</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 rounded-2xl border p-2 shadow-2xl z-40 animate-fade-in ${
              theme === 'dark'
                ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-xl'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-200'
            }`}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/40">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Test Endpoint
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Node</span>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/20 py-1">
              {servers.map((srv) => {
                const isSelected = srv.id === activeServer.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => handleSelect(srv)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? theme === 'dark'
                          ? 'bg-cyan-500/10 text-cyan-300'
                          : 'bg-cyan-50 text-cyan-900'
                        : theme === 'dark'
                        ? 'hover:bg-slate-800/60 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs truncate">
                          {srv.name}
                        </span>
                        {srv.isCustom && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate">
                        {srv.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      {srv.isCustom && (
                        <button
                          onClick={(e) => handleDelete(e, srv.id)}
                          type="button"
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete custom node"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2 border-t border-slate-800/40 text-[10px] text-slate-500 italic">
              Supports dedicated local speed-test endpoints (e.g., Dhaka, Chittagong, Sylhet, etc.) with custom CORS endpoints.
            </div>
          </div>
        </>
      )}

      {/* Add Custom Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold">Add Custom Regional Node</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Server Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka Fiber Node or Local ISP"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka, Chittagong, Sylhet, Rajshahi"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Ping Probe URL (HEAD/GET with CORS) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/ping"
                  value={formPingUrl}
                  onChange={(e) => setFormPingUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Download Chunk URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/download?bytes={bytes}"
                  value={formDownloadUrl}
                  onChange={(e) => setFormDownloadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Upload Endpoint URL (POST with CORS)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/upload"
                  value={formUploadUrl}
                  onChange={(e) => setFormUploadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  Save Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
