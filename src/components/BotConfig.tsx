import React, { useState } from "react";
import { Bot } from "../types";
import { Plus, Trash2, Key, CheckCircle, ShieldAlert, Check, Loader2, Bot as BotIcon } from "lucide-react";

interface BotConfigProps {
  bots: Bot[];
  activeBotId: string | null;
  onAddBot: (bot: Bot) => void;
  onRemoveBot: (id: string) => void;
  onSelectActiveBot: (id: string) => void;
}

export default function BotConfig({
  bots,
  activeBotId,
  onAddBot,
  onRemoveBot,
  onSelectActiveBot,
}: BotConfigProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleValidateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const token = tokenInput.trim();
    if (!token) {
      setErrorMsg("Please enter a bot token.");
      return;
    }

    // Check for duplicate token
    if (bots.some((b) => b.token === token)) {
      setErrorMsg("This bot is already added.");
      return;
    }

    setIsValidating(true);

    try {
      const response = await fetch("/api/telegram/validate-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        const newBot: Bot = {
          id: String(data.bot.id),
          token,
          name: data.bot.first_name,
          username: data.bot.username,
        };
        onAddBot(newBot);
        setTokenInput("");
        setSuccessMsg(`Successfully added @${newBot.username} (${newBot.name})!`);
        // Auto select if first bot
        if (bots.length === 0) {
          onSelectActiveBot(newBot.id);
        }
      } else {
        setErrorMsg(data.error || "Failed to validate bot token. Double check your token.");
      }
    } catch (err: any) {
      setErrorMsg("Network error validating bot token. Make sure the server is online.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5" id="bot-config-card">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
        <BotIcon className="w-5 h-5 text-pink-500" />
        <h2 className="text-base font-semibold text-slate-800">Bot Configuration</h2>
      </div>

      {/* Add Bot Token Form */}
      <form onSubmit={handleValidateAndAdd} className="space-y-3" id="add-bot-form">
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Add Telegram Bot Token
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Key className="w-4 h-4" />
            </span>
            <input
              type="password"
              placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full pl-9 pr-24 py-2 border border-slate-200 rounded-lg text-sm font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all text-slate-800"
              id="bot-token-input"
            />
            <button
              type="submit"
              disabled={isValidating}
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 text-white text-xs font-semibold px-4 rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
              id="validate-bot-btn"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Verify & Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg" id="bot-validate-error">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg" id="bot-validate-success">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </form>

      {/* List of Registered Bots */}
      <div>
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
          Your Connected Bots ({bots.length})
        </h3>

        {bots.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50" id="no-bots-display">
            <p className="text-xs text-slate-400">No bots configured yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Add a bot token above to get started.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1" id="bots-list">
            {bots.map((bot) => {
              const isActive = activeBotId === bot.id;
              return (
                <div
                  key={bot.id}
                  className={`group flex items-center justify-between p-3 border rounded-lg transition-all ${
                    isActive
                      ? "border-pink-500 bg-pink-50/40 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  id={`bot-item-${bot.id}`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectActiveBot(bot.id)}
                    className="flex-1 flex items-center space-x-3 text-left cursor-pointer"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isActive ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isActive ? <Check className="w-4 h-4" /> : <BotIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                        <span>{bot.name}</span>
                        {isActive && (
                          <span className="bg-pink-100 text-pink-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">@{bot.username}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveBot(bot.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Bot"
                    id={`remove-bot-${bot.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
