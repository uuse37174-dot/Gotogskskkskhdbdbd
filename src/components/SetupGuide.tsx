import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Bot as BotIcon, Users, MessageSquare, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function SetupGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6" id="setup-guide-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-left"
        id="toggle-guide-btn"
      >
        <div className="flex items-center space-x-3">
          <HelpCircle className="w-5 h-5 text-sky-500" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800">New to Telegram Bots? Read the Setup Guide</h3>
            <p className="text-xs text-slate-500">Learn how to create a bot, get group IDs, and ensure messages deliver.</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600 bg-white">
              <div className="space-y-3" id="guide-step-1">
                <div className="flex items-center space-x-2 font-semibold text-slate-800">
                  <BotIcon className="w-4 h-4 text-sky-500" />
                  <span>1. Create a Bot & Get Token</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs leading-relaxed text-slate-500 pl-1">
                  <li>Search for <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-600 hover:underline font-medium">@BotFather</a> on Telegram.</li>
                  <li>Send <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">/newbot</code> and follow instructions.</li>
                  <li>Copy the HTTP API Token (looks like <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">123456:ABC-def...</code>).</li>
                  <li>Go to the <strong>Bot Configuration</strong> section on this site and add it.</li>
                </ol>
              </div>

              <div className="space-y-3" id="guide-step-2">
                <div className="flex items-center space-x-2 font-semibold text-slate-800">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>2. Add Bot & Get Group Info</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-xs leading-relaxed text-slate-500 pl-1">
                  <li><strong>Add Bot to Group:</strong> You must add the bot as a member to the target group(s).</li>
                  <li><strong>For Public Groups:</strong> Use the group username (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">@my_public_group</code>) or link.</li>
                  <li><strong>For Private Groups:</strong> You need the Group Chat ID:
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-[11px]">
                      <li>Add <code className="text-slate-700 font-medium">@ShowJsonBot</code> or <code className="text-slate-700 font-medium">@getidsbot</code> to the group temporarily to get the chat ID.</li>
                      <li>Or paste a message link from the private group (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">https://t.me/c/1842051234/5</code>). The ID <code className="font-semibold text-slate-800">-1001842051234</code> will be auto-calculated!</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="space-y-3" id="guide-step-3">
                <div className="flex items-center space-x-2 font-semibold text-slate-800">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <span>3. HTML Formatting Guide</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your messages support basic HTML formatting tags to make broadcasts look professional:
                </p>
                <div className="bg-slate-50 p-2 rounded border border-slate-100 font-mono text-[10px] space-y-1 text-slate-600">
                  <div>&lt;b&gt;<b>Bold Text</b>&lt;/b&gt;</div>
                  <div>&lt;i&gt;<i>Italic Text</i>&lt;/i&gt;</div>
                  <div>&lt;code&gt;<code className="bg-slate-200 px-0.5 rounded">code snippet</code>&lt;/code&gt;</div>
                  <div>&lt;a href="url"&gt;<span className="text-sky-600 underline">Link Text</span>&lt;/a&gt;</div>
                </div>
                <div className="flex items-start space-x-1.5 text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Always ensure tags are correctly closed (e.g. &lt;b&gt;...&lt;/b&gt;) to avoid delivery failures.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
