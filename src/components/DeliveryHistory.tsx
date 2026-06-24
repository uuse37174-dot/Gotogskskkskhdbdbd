import { useState } from "react";
import { DeliveryLog } from "../types";
import { History, CheckCircle, XCircle, ChevronDown, ChevronUp, Clock, Bot, Eye, Trash2 } from "lucide-react";

interface DeliveryHistoryProps {
  logs: DeliveryLog[];
  onClearHistory: () => void;
  onRemoveLog: (id: string) => void;
}

export default function DeliveryHistory({ logs, onClearHistory, onRemoveLog }: DeliveryHistoryProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5" id="delivery-history-card">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-pink-500" />
          <h2 className="text-base font-semibold text-slate-800">Delivery History Logs</h2>
        </div>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2.5 py-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
          >
            Clear All History
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50" id="no-history-display">
          <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No broadcast history yet.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Your past broadcasts and delivery logs will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1" id="history-logs-list">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const successRate = log.targetsCount.total > 0
              ? Math.round((log.targetsCount.success / log.targetsCount.total) * 100)
              : 0;

            return (
              <div
                key={log.id}
                className={`border rounded-xl overflow-hidden transition-all ${
                  isExpanded ? "border-slate-300 shadow-sm" : "border-slate-150 hover:border-slate-300 bg-white"
                }`}
                id={`log-item-${log.id}`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50/40 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleExpand(log.id)}
                    className="flex-1 flex items-center justify-between text-left cursor-pointer pr-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-slate-700">
                        <Bot className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{log.botName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">(@{log.botUsername})</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{log.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Success / Total chip */}
                      <div className="text-right">
                        <span className="font-semibold block text-slate-700">
                          {log.targetsCount.success}/{log.targetsCount.total} delivered
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            successRate === 100
                              ? "bg-emerald-100 text-emerald-800"
                              : successRate > 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {successRate}% Success
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveLog(log.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Details body */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-white space-y-4">
                    {/* Message Preview */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Broadcast Message Payload:
                      </span>
                      <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-lg text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                        {log.message}
                      </div>
                    </div>

                    {/* Target list logs */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Individual Delivery Receipts:
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {log.targets.map((target, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-lg text-xs bg-slate-50 border border-slate-150"
                          >
                            <div className="flex items-center space-x-2 truncate pr-4">
                              {target.success ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              )}
                              <div className="truncate">
                                <span className="font-semibold text-slate-700">
                                  {target.chatTitle || target.chat}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {target.resolvedChat}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              {target.success ? (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium px-2 py-0.5 rounded text-[10px]">
                                  Message Sent
                                </span>
                              ) : (
                                <span
                                  className="bg-rose-50 text-rose-700 border border-rose-100 font-medium px-2 py-0.5 rounded text-[10px] max-w-[160px] truncate block"
                                  title={target.error}
                                >
                                  {target.error}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
