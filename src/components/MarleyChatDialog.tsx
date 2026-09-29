import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Bot, LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

type ChatMessage = { role: "user" | "assistant"; content: string };

const greeting = "Olá! Eu sou o Marley, assistente da YESOD. Posso ajudar com automação, inteligência artificial e AITOMat. O que você gostaria de saber?";

export function MarleyChatDialog({ buttonLabel }: { buttonLabel: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: greeting }]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || sending || content.length > 1200) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setSending(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("marley-chat", {
        body: { messages: nextMessages.slice(-10).map(({ role, content: text }) => ({ role, content: text })) },
      });
      if (invokeError) throw invokeError;
      if (typeof data?.reply !== "string" || !data.reply.trim()) throw new Error("Resposta vazia");
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
      requestAnimationFrame(() => transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" }));
    } catch {
      setError("Não consegui responder agora. Tente novamente em instantes.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shrink-0 bg-[#e86f22] text-white hover:bg-[#cf5c16]">
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[min(680px,88vh)] max-w-2xl flex-col gap-0 overflow-hidden border-white/10 bg-[#111214] p-0 text-white sm:rounded-2xl">
        <DialogHeader className="border-b border-white/10 px-5 py-4 pr-12 text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e86f22] text-white"><Bot className="h-5 w-5" /></span>
            <div>
              <DialogTitle className="text-white">Fale com o Marley</DialogTitle>
              <DialogDescription className="mt-1 text-white/60">Assistente virtual da YESOD Automation</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div ref={transcriptRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
          {messages.map((message, index) => (
            <div key={`${index}-${message.role}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-[#e86f22] text-white" : "bg-white/8 text-white/90"}`}>
                {message.content}
              </p>
            </div>
          ))}
          {sending && <div className="flex items-center gap-2 text-sm text-white/60"><LoaderCircle className="h-4 w-4 animate-spin" />Marley está respondendo…</div>}
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        </div>

        <form onSubmit={(event) => void sendMessage(event)} className="border-t border-white/10 p-4">
          <div className="flex items-end gap-3 rounded-xl border border-white/15 bg-black/20 p-2 focus-within:border-[#e86f22]/70">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva sua pergunta…"
              aria-label="Mensagem para Marley"
              maxLength={1200}
              rows={2}
              disabled={sending}
              className="max-h-32 min-h-12 resize-none border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
            />
            <Button type="submit" size="icon" aria-label="Enviar mensagem" disabled={sending || !draft.trim()} className="mb-0.5 shrink-0 bg-[#e86f22] text-white hover:bg-[#cf5c16]">
              {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-white/40">Enter envia · Shift + Enter quebra a linha</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
