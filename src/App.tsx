import { useState, useEffect, ChangeEvent } from "react";
import { Bot, GroupTemplate, MessageTemplate, DeliveryLog } from "./types";
import SetupGuide from "./components/SetupGuide";
import BotConfig from "./components/BotConfig";
import GroupConfig from "./components/GroupConfig";
import MessageTemplatesConfig from "./components/MessageTemplatesConfig";
import MessageComposer from "./components/MessageComposer";
import DeliveryHistory from "./components/DeliveryHistory";
import { Send, Sparkles, BookOpen, AlertCircle, RefreshCw, Download, Upload, MonitorSmartphone, X } from "lucide-react";

export default function App() {
  // State lists initialized from localStorage
  const [bots, setBots] = useState<Bot[]>(() => {
    const saved = localStorage.getItem("tg_sender_bots");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeBotId, setActiveBotId] = useState<string | null>(() => {
    const saved = localStorage.getItem("tg_sender_active_bot_id");
    return saved || null;
  });

  const [groupTemplates, setGroupTemplates] = useState<GroupTemplate[]>(() => {
    const saved = localStorage.getItem("tg_sender_group_templates");
    return saved ? JSON.parse(saved) : [];
  });

  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(() => {
    const saved = localStorage.getItem("tg_sender_message_templates");
    return saved ? JSON.parse(saved) : [];
  });

  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>(() => {
    const saved = localStorage.getItem("tg_sender_delivery_logs");
    return saved ? JSON.parse(saved) : [];
  });

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Communication state to load template from TemplatesConfig into Composer
  const [selectedTemplateForComposer, setSelectedTemplateForComposer] = useState<MessageTemplate | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("tg_sender_bots", JSON.stringify(bots));
  }, [bots]);

  useEffect(() => {
    if (activeBotId) {
      localStorage.setItem("tg_sender_active_bot_id", activeBotId);
    } else {
      localStorage.removeItem("tg_sender_active_bot_id");
    }
  }, [activeBotId]);

  useEffect(() => {
    localStorage.setItem("tg_sender_group_templates", JSON.stringify(groupTemplates));
  }, [groupTemplates]);

  useEffect(() => {
    localStorage.setItem("tg_sender_message_templates", JSON.stringify(messageTemplates));
  }, [messageTemplates]);

  useEffect(() => {
    localStorage.setItem("tg_sender_delivery_logs", JSON.stringify(deliveryLogs));
  }, [deliveryLogs]);

  // Handle PWA installation prompts
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  // Bot actions
  const handleAddBot = (newBot: Bot) => {
    setBots((prev) => [...prev, newBot]);
  };

  const handleRemoveBot = (id: string) => {
    setBots((prev) => prev.filter((b) => b.id !== id));
    if (activeBotId === id) {
      setActiveBotId(null);
    }
  };

  const handleSelectActiveBot = (id: string) => {
    setActiveBotId(id);
  };

  // Group Template actions
  const handleAddGroupTemplate = (newTemplate: GroupTemplate) => {
    setGroupTemplates((prev) => [...prev, newTemplate]);
  };

  const handleRemoveGroupTemplate = (id: string) => {
    setGroupTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateGroupTemplate = (updated: GroupTemplate) => {
    setGroupTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Message Template actions
  const handleAddMessageTemplate = (newTemplate: MessageTemplate) => {
    setMessageTemplates((prev) => [...prev, newTemplate]);
  };

  const handleRemoveMessageTemplate = (id: string) => {
    setMessageTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectMessageTemplate = (template: MessageTemplate) => {
    setSelectedTemplateForComposer(template);
  };

  // Delivery logs actions
  const handleAddDeliveryLog = (newLog: DeliveryLog) => {
    setDeliveryLogs((prev) => [newLog, ...prev]);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire delivery history?")) {
      setDeliveryLogs([]);
    }
  };

  const handleRemoveDeliveryLog = (id: string) => {
    setDeliveryLogs((prev) => prev.filter((l) => l.id !== id));
  };

  // Export Data Backup JSON file
  const handleExportData = () => {
    const backupObj = {
      bots,
      activeBotId,
      groupTemplates,
      messageTemplates,
      deliveryLogs,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telegram_blaster_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import / Restore data from Backup JSON
  const handleImportData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (
          importedData &&
          (Array.isArray(importedData.bots) || 
           Array.isArray(importedData.groupTemplates) || 
           Array.isArray(importedData.messageTemplates))
        ) {
          if (window.confirm("Restore this backup? This will merge with your existing bots, group templates, and message templates.")) {
            if (Array.isArray(importedData.bots)) {
              // Deduplicate and merge bots
              setBots(prev => {
                const combined = [...prev, ...importedData.bots];
                const unique = combined.filter((b, idx, self) => self.findIndex(item => item.id === b.id || item.token === b.token) === idx);
                return unique;
              });
            }
            if (importedData.activeBotId) {
              setActiveBotId(importedData.activeBotId);
            }
            if (Array.isArray(importedData.groupTemplates)) {
              setGroupTemplates(prev => {
                const combined = [...prev, ...importedData.groupTemplates];
                const unique = combined.filter((t, idx, self) => self.findIndex(item => item.id === t.id) === idx);
                return unique;
              });
            }
            if (Array.isArray(importedData.messageTemplates)) {
              setMessageTemplates(prev => {
                const combined = [...prev, ...importedData.messageTemplates];
                const unique = combined.filter((t, idx, self) => self.findIndex(item => item.id === t.id) === idx);
                return unique;
              });
            }
            if (Array.isArray(importedData.deliveryLogs)) {
              setDeliveryLogs(prev => {
                const combined = [...prev, ...importedData.deliveryLogs];
                const unique = combined.filter((l, idx, self) => self.findIndex(item => item.id === l.id) === idx);
                return unique;
              });
            }
            alert("Backup restored successfully!");
          }
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        alert("Failed to parse the backup file. Please ensure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-pink-500/10" id="main-app-container">
      {/* Top Header Navigation bar */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/10">
              <Send className="w-5.5 h-5.5 transform -rotate-12 translate-x-px -translate-y-px" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight flex items-center space-x-1.5">
                <span>Telegram Blaster</span>
                <span className="bg-pink-500/10 text-pink-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  v1.2 Full-Stack
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">Multi-Group Broadcast Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Install Standalone Web App CTA button (If available) */}
            {showInstallBanner && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="hidden sm:flex items-center space-x-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                id="header-install-btn"
              >
                <MonitorSmartphone className="w-4 h-4" />
                <span>Install Application</span>
              </button>
            )}

            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-slate-500">Connected Proxy Server</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* PWA Mobile/Desktop Install Promotion Banner */}
        {showInstallBanner && (
          <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl flex items-center justify-between shadow-xs" id="install-promotion-banner">
            <div className="flex items-center space-x-3 text-pink-900">
              <div className="bg-pink-500 text-white p-2 rounded-lg hidden sm:block">
                <MonitorSmartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Set Telegram Blaster to Home Screen</h3>
                <p className="text-xs text-slate-500 mt-0.5">Install as a standalone application for instant access, offline workspace access, and zero-distraction experience.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Install App
              </button>
              <button
                type="button"
                onClick={() => setShowInstallBanner(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Setup documentation */}
        <SetupGuide />

        {/* Multi-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="dashboard-grid">
          {/* Left Column: Composer Workspace */}
          <div className="lg:col-span-7 space-y-6" id="composer-column">
            <MessageComposer
              bots={bots}
              activeBotId={activeBotId}
              groupTemplates={groupTemplates}
              messageTemplates={messageTemplates}
              onAddDeliveryLog={handleAddDeliveryLog}
              selectedTemplateFromParent={selectedTemplateForComposer}
              clearSelectedTemplate={() => setSelectedTemplateForComposer(null)}
            />
          </div>

          {/* Right Column: Configurations */}
          <div className="lg:col-span-5 space-y-6" id="configs-column">
            {/* Backup & Restore Panel for robust "Stores all the data" support */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="backup-restore-card">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Download className="w-5 h-5 text-pink-500" />
                <h2 className="text-base font-semibold text-slate-800">Backup & Sync Data</h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                All configuration is saved locally in your browser. Download a backup file to import on other devices or restore in case of cache clear.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-lg shadow-2xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  id="export-backup-btn"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup</span>
                </button>

                <label
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-lg shadow-2xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-center"
                  id="import-backup-label"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Bots configuration list */}
            <BotConfig
              bots={bots}
              activeBotId={activeBotId}
              onAddBot={handleAddBot}
              onRemoveBot={handleRemoveBot}
              onSelectActiveBot={handleSelectActiveBot}
            />

            {/* Message Templates Manager */}
            <MessageTemplatesConfig
              templates={messageTemplates}
              onAddTemplate={handleAddMessageTemplate}
              onRemoveTemplate={handleRemoveMessageTemplate}
              onSelectTemplate={handleSelectMessageTemplate}
            />
          </div>
        </div>

        {/* Full width Group Configuration */}
        <GroupConfig
          templates={groupTemplates}
          onAddTemplate={handleAddGroupTemplate}
          onRemoveTemplate={handleRemoveGroupTemplate}
          onUpdateTemplate={handleUpdateGroupTemplate}
        />

        {/* Full width delivery logs */}
        <DeliveryHistory
          logs={deliveryLogs}
          onClearHistory={handleClearHistory}
          onRemoveLog={handleRemoveDeliveryLog}
        />
      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 space-y-2">
          <p className="font-medium text-slate-500">
            Telegram Multi-Group Message Sender Dashboard
          </p>
          <p>
            Secure offline-first local state storage • High-performance server-side Telegram API proxying
          </p>
        </div>
      </footer>
    </div>
  );
}
