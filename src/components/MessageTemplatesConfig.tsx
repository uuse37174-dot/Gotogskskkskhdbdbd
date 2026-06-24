import React, { useState } from "react";
import { MessageTemplate } from "../types";
import { Plus, Trash2, MessageSquare, Save, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface MessageTemplatesConfigProps {
  templates: MessageTemplate[];
  onAddTemplate: (template: MessageTemplate) => void;
  onRemoveTemplate: (id: string) => void;
  onSelectTemplate?: (template: MessageTemplate) => void;
}

export default function MessageTemplatesConfig({
  templates,
  onAddTemplate,
  onRemoveTemplate,
  onSelectTemplate,
}: MessageTemplatesConfigProps) {
  const [nameInput, setNameInput] = useState("");
  const [contentInput, setContentInput] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    const content = contentInput.trim();
    if (!name || !content) return;

    const newTemplate: MessageTemplate = {
      id: "msg_" + Date.now(),
      name,
      content,
    };

    onAddTemplate(newTemplate);
    setNameInput("");
    setContentInput("");
    setActiveId(newTemplate.id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6" id="message-templates-card">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
        <MessageSquare className="w-5 h-5 text-amber-500" />
        <h2 className="text-base font-semibold text-slate-800">Message Templates</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Composer / Creation Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>Create Message Template</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 bg-slate-50/50 border border-slate-100 p-4 rounded-xl" id="create-message-template-form">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Template Name
              </label>
              <input
                type="text"
                placeholder="e.g. Daily Promo, Weekly News, Warning Alert"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                id="message-template-name-input"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Message Content (HTML Supported)
                </label>
              </div>
              <textarea
                placeholder="Compose your message template..."
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                rows={5}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                id="message-template-content-textarea"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              id="submit-msg-template-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Save Message Template</span>
            </button>
          </form>
        </div>

        {/* Templates List Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Your Templates ({templates.length})
          </h3>

          {templates.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50" id="no-message-templates-display">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No message templates yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Save templates for quick broadcasting.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1" id="message-templates-list">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className={`border rounded-xl transition-all ${
                    activeId === tmpl.id
                      ? "border-amber-500 bg-amber-50/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  id={`msg-template-item-${tmpl.id}`}
                >
                  <div className="flex items-center justify-between p-3.5">
                    <button
                      type="button"
                      onClick={() => setActiveId(activeId === tmpl.id ? null : tmpl.id)}
                      className="flex-1 flex items-center justify-between text-left cursor-pointer font-medium text-slate-700"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-xs font-semibold text-slate-700 block truncate">
                          {tmpl.name}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                          {tmpl.content.substring(0, 50)}
                          {tmpl.content.length > 50 ? "..." : ""}
                        </span>
                      </div>
                      {activeId === tmpl.id ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 mr-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 mr-2" />
                      )}
                    </button>

                    <div className="flex items-center space-x-1 shrink-0">
                      {onSelectTemplate && (
                        <button
                          type="button"
                          onClick={() => onSelectTemplate(tmpl)}
                          className="bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-1 rounded-md transition-colors cursor-pointer mr-1"
                          title="Load into Composer"
                        >
                          Load
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveTemplate(tmpl.id);
                          if (activeId === tmpl.id) {
                            setActiveId(null);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Template"
                        id={`delete-msg-template-${tmpl.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content preview */}
                  {activeId === tmpl.id && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-3.5 rounded-b-xl text-xs space-y-2">
                      <div className="bg-white p-3 rounded border border-slate-100 font-sans text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                        {tmpl.content}
                      </div>
                      {onSelectTemplate && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => onSelectTemplate(tmpl)}
                            className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Use This Template
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
