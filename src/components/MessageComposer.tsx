import React, { useState, useEffect } from "react";
import { Bot, GroupTemplate, MessageTemplate, DeliveryLog, DeliveryTargetLog } from "../types";
import { Send, FileText, CheckCircle, XCircle, Loader2, Sparkles, Plus, AlertCircle, Info, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MessageComposerProps {
  bots: Bot[];
  activeBotId: string | null;
  groupTemplates: GroupTemplate[];
  messageTemplates: MessageTemplate[];
  onAddDeliveryLog: (log: DeliveryLog) => void;
  selectedTemplateFromParent: MessageTemplate | null;
  clearSelectedTemplate: () => void;
}

export default function MessageComposer({
  bots,
  activeBotId,
  groupTemplates,
  messageTemplates,
  onAddDeliveryLog,
  selectedTemplateFromParent,
  clearSelectedTemplate,
}: MessageComposerProps) {
  // Main composition states
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Targets management
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [extraChats, setExtraChats] = useState("");
  const [finalTargets, setFinalTargets] = useState<string[]>([]);

  // Sending / Progress states
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [sendingResults, setSendingResults] = useState<{
    total: number;
    success: number;
    failed: number;
    details: DeliveryTargetLog[];
  } | null>(null);
  const [currentSendingIndex, setCurrentSendingIndex] = useState<number>(-1);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Synchronize active bot from parent
  useEffect(() => {
    if (activeBotId) {
      setSelectedBotId(activeBotId);
    } else if (bots.length > 0 && !selectedBotId) {
      setSelectedBotId(bots[0].id);
    }
  }, [activeBotId, bots, selectedBotId]);

  // Handle selected template from external loaders
  useEffect(() => {
    if (selectedTemplateFromParent) {
      setMessage(selectedTemplateFromParent.content);
      setSelectedTemplateId(selectedTemplateFromParent.id);
      clearSelectedTemplate(); // Clear so user can load others later
    }
  }, [selectedTemplateFromParent, clearSelectedTemplate]);

  // Recalculate combined final list of distinct target chats
  useEffect(() => {
    const targetsSet = new Set<string>();

    // 1. Add chats from selected group templates
    selectedTemplateIds.forEach((id) => {
      const template = groupTemplates.find((t) => t.id === id);
      if (template) {
        template.chats.forEach((chat) => {
          if (chat.trim()) {
            targetsSet.add(chat.trim());
          }
        });
      }
    });

    // 2. Add extra chats typed directly in composer
    extraChats
      .split(/[\n,]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .forEach((chat) => {
        targetsSet.add(chat);
      });

    setFinalTargets(Array.from(targetsSet));
  }, [selectedTemplateIds, extraChats, groupTemplates]);

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    if (!id) {
      setMessage("");
      return;
    }
    const template = messageTemplates.find((t) => t.id === id);
    if (template) {
      setMessage(template.content);
    }
  };

  const toggleGroupTemplate = (id: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearComposer = () => {
    setMessage("");
    setSelectedTemplateId("");
    setSelectedTemplateIds([]);
    setExtraChats("");
    setSendStatus("idle");
    setSendingResults(null);
    setCurrentSendingIndex(-1);
    setErrorDetails(null);
  };

  const activeBot = bots.find((b) => b.id === selectedBotId);

  const handleSendBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBot) {
      setErrorDetails("Please select a configured Telegram Bot first.");
      setSendStatus("error");
      return;
    }
    if (finalTargets.length === 0) {
      setErrorDetails("Please select or add at least one target group/chat.");
      setSendStatus("error");
      return;
    }
    if (!message.trim()) {
      setErrorDetails("Message content cannot be blank.");
      setSendStatus("error");
      return;
    }

    setSendStatus("sending");
    setErrorDetails(null);
    setSendingResults(null);
    setCurrentSendingIndex(0);

    // To make it feel super-fast but still clear and visible, we can send to our server
    // which processes them quickly. But since the user wants to send in "seconds" and see progress,
    // let's do the request to our backend server!
    try {
      const response = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: activeBot.token,
          chats: finalTargets,
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const results: DeliveryTargetLog[] = data.results;
        const total = results.length;
        const successCount = results.filter((r) => r.success).length;
        const failedCount = total - successCount;

        setSendingResults({
          total,
          success: successCount,
          failed: failedCount,
          details: results,
        });
        setSendStatus("success");

        // Save delivery to parent history logs list
        const newLog: DeliveryLog = {
          id: "log_" + Date.now(),
          botName: activeBot.name,
          botUsername: activeBot.username,
          timestamp: new Date().toLocaleString(),
          message: message,
          targetsCount: {
            total,
            success: successCount,
            failed: failedCount,
          },
          targets: results,
        };
        onAddDeliveryLog(newLog);
      } else {
        setErrorDetails(data.error || "A server error occurred during message transmission.");
        setSendStatus("error");
      }
    } catch (err: any) {
      setErrorDetails(err.message || "Failed to establish server connection. Message not sent.");
      setSendStatus("error");
    } finally {
      setCurrentSendingIndex(-1);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6" id="message-composer-card">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Send className="w-5 h-5 text-sky-500" />
          <h2 className="text-base font-semibold text-slate-800">Message Broadcast Composer</h2>
        </div>
        <button
          type="button"
          onClick={handleClearComposer}
          className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Clear Workspace
        </button>
      </div>

      <form onSubmit={handleSendBlast} className="space-y-6" id="composer-form">
        {/* Step 1: Active Bot Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              1. Sender Bot
            </label>
            {bots.length === 0 ? (
              <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg text-xs text-amber-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>No bots configured. Set up a bot token first in the configuration panel below.</span>
              </div>
            ) : (
              <select
                value={selectedBotId}
                onChange={(e) => setSelectedBotId(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 font-semibold cursor-pointer"
                id="composer-bot-select"
              >
                {bots.map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name} (@{bot.username})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: Select Saved Message Template or type manually */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              2. Load Message Template (Optional)
            </label>
            {messageTemplates.length === 0 ? (
              <div className="py-2.5 px-3.5 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400 italic">
                No templates created. You can write your message directly below, or save templates later.
              </div>
            ) : (
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700 cursor-pointer"
                id="composer-template-select"
              >
                <option value="">-- Manual Draft / Customize Message --</option>
                {messageTemplates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Step 3: Composer Text Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between items-center">
            <span>3. Compose Your Message</span>
            <span className="text-[10px] text-slate-400 font-mono normal-case">
              {message.length} characters • HTML format supported
            </span>
          </label>
          <textarea
            placeholder="Write your broadcast message here. E.g. <b>Hello World!</b> This is a broadcast."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // reset selected template indicator if edited
              if (selectedTemplateId) setSelectedTemplateId("");
            }}
            rows={6}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 leading-relaxed font-sans placeholder:text-slate-400"
            id="composer-message-textarea"
            required
          />
        </div>

        {/* Step 4: Targets (Groups Selection) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            4. Choose Target Groups & Channels
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Templates Selector Checkboxes */}
            <div className="md:col-span-1 space-y-2">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Select Templates
              </span>
              {groupTemplates.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400 text-center bg-slate-50/30">
                  No templates yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-100 p-2.5 rounded-lg bg-slate-50/50">
                  {groupTemplates.map((tmpl) => {
                    const isChecked = selectedTemplateIds.includes(tmpl.id);
                    return (
                      <label
                        key={tmpl.id}
                        className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          isChecked ? "bg-white border border-emerald-200/60" : "hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleGroupTemplate(tmpl.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-700 block truncate">{tmpl.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {tmpl.chats.length} chat{tmpl.chats.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Manual Ad-hoc Extra Chats */}
            <div className="md:col-span-2 space-y-2">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Or Paste Ad-Hoc Group Links / Usernames
              </span>
              <textarea
                placeholder="Paste extra group links, @usernames, or Chat IDs here (one per line or comma-separated)"
                value={extraChats}
                onChange={(e) => setExtraChats(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800"
                id="composer-extra-chats-textarea"
              />
            </div>
          </div>
        </div>

        {/* Resolved Targets Summary Counter */}
        <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium">
              Resolved target chats to deliver:
            </span>
            <span className="bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full text-xs">
              {finalTargets.length} group{finalTargets.length !== 1 ? "s" : ""}
            </span>
          </div>

          {finalTargets.length > 0 && (
            <div className="text-[10px] text-slate-400 font-mono truncate max-w-sm" title={finalTargets.join(", ")}>
              {finalTargets.slice(0, 3).join(", ")}
              {finalTargets.length > 3 ? "..." : ""}
            </div>
          )}
        </div>

        {/* Action Button & Loader */}
        <div className="flex flex-col space-y-3">
          <button
            type="submit"
            disabled={sendStatus === "sending" || bots.length === 0 || finalTargets.length === 0}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg disabled:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer"
            id="send-blast-btn"
          >
            {sendStatus === "sending" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>BLASTING MESSAGES TO {finalTargets.length} GROUPS...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>LAUNCH BROADCAST NOW</span>
              </>
            )}
          </button>

          {/* Inline Error alert */}
          {sendStatus === "error" && errorDetails && (
            <div className="flex items-start space-x-2 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs" id="composer-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Broadcast Stopped</p>
                <p className="mt-0.5 text-slate-600 font-medium">{errorDetails}</p>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Realtime Delivery Progress Visualizer */}
      <AnimatePresence>
        {sendStatus === "sending" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 text-white rounded-xl p-4 space-y-3 font-mono text-xs border border-slate-800"
            id="realtime-progress-visualizer"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center space-x-2 text-sky-400 font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Blaster Output Stream</span>
              </span>
              <span className="text-[10px] text-slate-500">
                Active Bot: @{activeBot?.username}
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              <div className="text-[11px] text-slate-300">
                &gt; Preparing message payload...
              </div>
              <div className="text-[11px] text-slate-300">
                &gt; Initiating batch parallel dispatch...
              </div>
              <div className="text-[11px] text-emerald-400">
                &gt; Request dispatched to server API. Awaiting delivery acknowledgement...
              </div>
              <div className="flex items-center space-x-2 pt-2 text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Communicating with Telegram Bot API endpoints...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Summary Visualizer */}
      <AnimatePresence>
        {sendStatus === "success" && sendingResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 space-y-4"
            id="success-summary-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold">Broadcast Complete!</h3>
                  <p className="text-xs text-emerald-600/90">
                    Dispatched in seconds via @{activeBot?.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSendStatus("idle")}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-lg transition-all"
              >
                Done
              </button>
            </div>

            {/* Grid Counter Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-2.5 border border-emerald-100 shadow-2xs">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Targets</span>
                <span className="text-lg font-extrabold text-slate-800">{sendingResults.total}</span>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-emerald-100 shadow-2xs">
                <span className="block text-[10px] text-emerald-600 uppercase font-semibold">Delivered</span>
                <span className="text-lg font-extrabold text-emerald-600">{sendingResults.success}</span>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-emerald-100 shadow-2xs">
                <span className="block text-[10px] text-rose-500 uppercase font-semibold">Failed</span>
                <span className="text-lg font-extrabold text-rose-500">{sendingResults.failed}</span>
              </div>
            </div>

            {/* Individual Targets Logs list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                Receipts per target
              </span>
              {sendingResults.details.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-lg text-xs bg-white border border-slate-100"
                >
                  <div className="flex items-center space-x-2 truncate">
                    {item.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <div className="truncate">
                      <span className="font-semibold text-slate-700">
                        {item.chatTitle || item.originalInput}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {item.resolvedChat}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {item.success ? (
                      <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                        Message ID: {item.messageId}
                      </span>
                    ) : (
                      <span
                        className="bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded text-[10px] max-w-[150px] truncate block"
                        title={item.error}
                      >
                        {item.error}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
