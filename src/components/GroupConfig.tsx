import React, { useState } from "react";
import { GroupTemplate } from "../types";
import { Plus, Trash2, Users, FolderPlus, Link, Tag, HelpCircle, X } from "lucide-react";

interface GroupConfigProps {
  templates: GroupTemplate[];
  onAddTemplate: (template: GroupTemplate) => void;
  onRemoveTemplate: (id: string) => void;
  onUpdateTemplate: (template: GroupTemplate) => void;
}

export default function GroupConfig({
  templates,
  onAddTemplate,
  onRemoveTemplate,
  onUpdateTemplate,
}: GroupConfigProps) {
  const [templateName, setTemplateName] = useState("");
  const [chatsInput, setChatsInput] = useState("");
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [newChatInput, setNewChatInput] = useState("");

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = templateName.trim();
    if (!name) return;

    // Split input by commas or newlines and clean them up
    const chats = chatsInput
      .split(/[\n,]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const newTemplate: GroupTemplate = {
      id: "tmpl_" + Date.now(),
      name,
      chats,
    };

    onAddTemplate(newTemplate);
    setTemplateName("");
    setChatsInput("");
    setActiveTemplateId(newTemplate.id);
  };

  const handleAddChatToTemplate = (templateId: string, e: React.FormEvent) => {
    e.preventDefault();
    const chatVal = newChatInput.trim();
    if (!chatVal) return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    // Check if duplicate in same template
    if (template.chats.includes(chatVal)) {
      setNewChatInput("");
      return;
    }

    const updatedTemplate = {
      ...template,
      chats: [...template.chats, chatVal],
    };

    onUpdateTemplate(updatedTemplate);
    setNewChatInput("");
  };

  const handleRemoveChatFromTemplate = (templateId: string, chatToRemove: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const updatedTemplate = {
      ...template,
      chats: template.chats.filter((c) => c !== chatToRemove),
    };

    onUpdateTemplate(updatedTemplate);
  };

  const activeTemplate = templates.find((t) => t.id === activeTemplateId);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6" id="group-config-card">
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
        <Users className="w-5 h-5 text-pink-500" />
        <h2 className="text-base font-semibold text-slate-800">Group Templates</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Creation Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create New Template</span>
          </h3>

          <form onSubmit={handleCreateTemplate} className="space-y-3 bg-slate-50/50 border border-slate-100 p-4 rounded-xl" id="create-group-template-form">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Template Name
              </label>
              <input
                type="text"
                placeholder="e.g. My Channel List, Admin Groups"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800"
                id="template-name-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Add Group Links / IDs (One per line or comma-separated)
              </label>
              <textarea
                placeholder="e.g.&#10;@my_group_username&#10;https://t.me/c/12345678/12&#10;-100987654321"
                value={chatsInput}
                onChange={(e) => setChatsInput(e.target.value)}
                rows={4}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 text-slate-800"
                id="template-chats-textarea"
              />
              <p className="text-[10px] text-slate-400 mt-1 flex items-start space-x-1">
                <HelpCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>You can enter public links, usernames, or private chat IDs.</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              id="submit-template-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </form>
        </div>

        {/* Existing Templates Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Your Templates ({templates.length})
          </h3>

          {templates.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50" id="no-group-templates-display">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No group templates yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Define your blast target groups above.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1" id="group-templates-list">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className={`border rounded-xl transition-all ${
                    activeTemplateId === tmpl.id
                      ? "border-pink-500 bg-pink-50/10 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  id={`template-item-${tmpl.id}`}
                >
                  <div className="flex items-center justify-between p-3.5">
                    <button
                      type="button"
                      onClick={() => setActiveTemplateId(activeTemplateId === tmpl.id ? null : tmpl.id)}
                      className="flex-1 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div>
                        <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tmpl.name}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {tmpl.chats.length} group{tmpl.chats.length !== 1 ? "s" : ""} configured
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onRemoveTemplate(tmpl.id);
                        if (activeTemplateId === tmpl.id) {
                          setActiveTemplateId(null);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Template"
                      id={`delete-template-${tmpl.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Template Details & Individual Chat Manager */}
                  {activeTemplateId === tmpl.id && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-3 space-y-3 rounded-b-xl text-xs">
                      <div className="space-y-1.5">
                        <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider">
                          Group Links / Chat IDs:
                        </span>
                        {tmpl.chats.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">No groups added yet.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto" id={`chats-chips-${tmpl.id}`}>
                            {tmpl.chats.map((chat, idx) => (
                              <div
                                key={`${chat}-${idx}`}
                                className="flex items-center bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[11px] text-slate-600 font-mono shadow-xs"
                              >
                                <span className="truncate max-w-[150px]">{chat}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChatFromTemplate(tmpl.id, chat)}
                                  className="ml-1 text-slate-400 hover:text-rose-600 font-bold hover:bg-slate-100 rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Add individual chat form */}
                      <form
                        onSubmit={(e) => handleAddChatToTemplate(tmpl.id, e)}
                        className="flex gap-1.5"
                        id={`add-chat-form-${tmpl.id}`}
                      >
                        <input
                          type="text"
                          placeholder="Add link, @username, or chat ID"
                          value={newChatInput}
                          onChange={(e) => setNewChatInput(e.target.value)}
                          className="flex-1 px-2.5 py-1 border border-slate-200 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-800"
                        />
                        <button
                          type="submit"
                          className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-2.5 py-1 rounded-md text-xs flex items-center space-x-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </form>
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
