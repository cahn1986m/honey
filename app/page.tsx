"use client"
import { useState, useRef, useEffect } from "react"

// ===== TYPES =====
type Message = { role: "user" | "assistant"; content: string }
type HoneyCategory = "floral" | "wild" | "medicinal"
type HoneyType = { name: string; emoji: string; category: HoneyCategory; origin: string }
type CartItem = { name: string; price: number }

// ===== DATA =====
const ALL_HONEY: HoneyType[] = [
  { name: "سدر يمني", emoji: "🌿", category: "medicinal", origin: "اليمن" },
  { name: "سدر سعودي", emoji: "🌿", category: "medicinal", origin: "السعودية" },
  { name: "مانوكا", emoji: "🌺", category: "medicinal", origin: "نيوزيلندا" },
  { name: "حبة البركة", emoji: "🖤", category: "medicinal", origin: "الشرق الأوسط" },
  { name: "طلح", emoji: "🌾", category: "wild", origin: "أفريقيا/الخليج" },
  { name: "قره داغ", emoji: "⛰️", category: "wild", origin: "أذربيجان" },
  { name: "زيزفون", emoji: "🌸", category: "floral", origin: "تركيا/أوروبا" },
  { name: "برسيم", emoji: "☘️", category: "floral", origin: "مصر/أوروبا" },
  { name: "بنفسج جبلي", emoji: "💜", category: "floral", origin: "الجبال الأوروبية" },
  { name: "أكاسيا", emoji: "🤍", category: "floral", origin: "أوروبا" },
  { name: "عباد الشمس", emoji: "🌻", category: "floral", origin: "عالمي" },
  { name: "غابة معمّاة", emoji: "🌲", category: "wild", origin: "المغرب/الجزائر" },
]

const CATEGORY_STYLE: Record<HoneyCategory, { bg: string; border: string; text: string; ring: string }> = {
  floral:   { bg: "rgba(255,180,0,0.1)",  border: "rgba(255,180,0,0.3)",  text: "#ffc433", ring: "#ffc433" },
  wild:     { bg: "rgba(180,100,0,0.12)", border: "rgba(180,100,0,0.35)", text: "#d4832a", ring: "#d4832a" },
  medicinal:{ bg: "rgba(100,60,0,0.15)",  border: "rgba(120,80,10,0.4)",  text: "#b87333", ring: "#b87333" },
}

const CATEGORY_LABELS: Record<HoneyCategory, string> = {
  floral:    "أعسال زهرية 🌸",
  wild:      "أعسال برية 🌿",
  medicinal: "أعسال طبية 💊",
}

const SUGGESTIONS = [
  "أفضل عسل لتقوية المناعة 🛡️",
  "كيف أفرق الأصلي من المغشوش؟ 🔍",
  "عسل للبشرة والجمال ✨",
  "وصفة عسل وزنجبيل للشتاء 🫚",
]

// ===== COMPONENT =====
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedHoney, setSelectedHoney] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<"guide" | "cart">("guide")
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { name: "سدر يمني درجة A – 500g", price: 280 },
    { name: "مانوكا UMF 10+ – 250g", price: 195 },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function toggleHoney(name: string) {
    setSelectedHoney(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  async function sendMessage(text?: string) {
    const content = text || input.trim()
    if (!content || loading) return

    const honeyCtx = selectedHoney.size > 0
? `[أنواع العسل المختارة: ${Array.from(selectedHoney).join("، ")}]\n\n${content}`

    const newMessages: Message[] = [...messages, { role: "user", content: honeyCtx }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      const reply = data.content?.text || "عذراً، حصل خطأ."
      setMessages(prev => [...prev, { role: "assistant", content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "مشكلة بالاتصال، جرب مرة ثانية 🙏" }])
    } finally {
      setLoading(false)
    }
  }

  const cartTotal = cartItems.reduce((s, i) => s + i.price, 0)

  return (
    <div className="flex h-screen overflow-hidden hex-bg" style={{ background: "#0d0800", color: "#f5e8c0" }}>
      <div className="honey-bar" />

      {/* ===== SIDEBAR LEFT: Honey Types ===== */}
      <aside className="w-72 flex flex-col overflow-y-auto"
        style={{ background: "rgba(20,10,0,0.85)", borderLeft: "1px solid rgba(232,148,10,0.15)" }}>

        {/* Logo */}
        <div className="text-center py-7 px-4" style={{ borderBottom: "1px solid rgba(232,148,10,0.15)" }}>
          <div className="text-6xl mb-2 bee-float">🍯</div>
          <div className="text-4xl mb-1" style={{ fontFamily: "'Lateef', serif", color: "#e8940a", letterSpacing: 2 }}>
            العسّال
          </div>
          <div className="text-xs tracking-widest" style={{ color: "#9a7a40", fontFamily: "'Noto Naskh Arabic', serif" }}>
            مساعد العسل الذكي
          </div>
        </div>

        <div className="p-4 flex flex-col gap-5 flex-1">
          {(["medicinal", "wild", "floral"] as HoneyCategory[]).map(cat => (
            <div key={cat}>
              <div className="text-xs font-semibold mb-2" style={{ color: "#9a7a40" }}>
                {CATEGORY_LABELS[cat]}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_HONEY.filter(h => h.category === cat).map(honey => {
                  const s = CATEGORY_STYLE[cat]
                  const selected = selectedHoney.has(honey.name)
                  return (
                    <button
                      key={honey.name}
                      onClick={() => toggleHoney(honey.name)}
                      className="px-2.5 py-1.5 rounded-lg text-xs border transition-all duration-200"
                      style={{
                        background: selected ? s.bg : "rgba(255,255,255,0.02)",
                        borderColor: selected ? s.ring : s.border,
                        color: selected ? s.text : "#9a7a40",
                        transform: selected ? "scale(1.05)" : "scale(1)",
                        boxShadow: selected ? `0 0 8px ${s.ring}40` : "none",
                        fontFamily: "'Noto Naskh Arabic', serif",
                      }}
                    >
                      {honey.emoji} {honey.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Selected count */}
          {selectedHoney.size > 0 && (
            <div className="text-xs text-center py-2 rounded-lg"
              style={{ background: "rgba(232,148,10,0.08)", border: "1px solid rgba(232,148,10,0.25)", color: "#e8940a" }}>
              🍯 {selectedHoney.size} نوع محدد
              <button onClick={() => setSelectedHoney(new Set())}
                className="mr-2 opacity-50 hover:opacity-100">✕</button>
            </div>
          )}
        </div>
      </aside>

      {/* ===== MAIN CHAT ===== */}
      <main className="flex-1 flex flex-col" style={{ borderRight: "1px solid rgba(232,148,10,0.08)", borderLeft: "1px solid rgba(232,148,10,0.08)" }}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ background: "rgba(20,10,0,0.6)", borderBottom: "1px solid rgba(232,148,10,0.12)" }}>
          <div>
            <div style={{ fontFamily: "'Lateef', serif", fontSize: 26, color: "#e8940a", letterSpacing: 1 }}>
              أهلاً في العسّال 🐝
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#9a7a40" }}>اسألني عن أي نوع عسل أو فائدة صحية</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#9a7a40" }}>متصل</span>
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-lg animate-pulse"
              style={{ boxShadow: "0 0 8px #f9c84a" }} />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">

          {/* Welcome */}
          {messages.length === 0 && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: "linear-gradient(135deg, #7a4500, #e8940a)", boxShadow: "0 0 16px rgba(232,148,10,0.3)" }}>
                🍯
              </div>
              <div className="rounded-2xl rounded-tr-sm px-5 py-4 max-w-lg text-sm leading-8"
                style={{ background: "rgba(30,15,0,0.9)", border: "1px solid rgba(232,148,10,0.18)", color: "#f0dec0" }}>
                أهلاً وسهلاً! 🐝<br />
                أنا <strong style={{ color: "#f9c84a" }}>العسّال</strong>، دليلك الذكي في عالم العسل الطبيعي.<br />
                اختر نوع عسل من القائمة اليسرى أو اسألني مباشرة!
                <div className="flex flex-wrap gap-2 mt-4">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105"
                      style={{
                        background: "rgba(232,148,10,0.08)",
                        border: "1px solid rgba(232,148,10,0.28)",
                        color: "#e8940a",
                        fontFamily: "'Noto Naskh Arabic', serif",
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={msg.role === "user"
                  ? { background: "rgba(232,148,10,0.12)", border: "1px solid rgba(232,148,10,0.25)" }
                  : { background: "linear-gradient(135deg, #7a4500, #e8940a)", boxShadow: "0 0 12px rgba(232,148,10,0.25)" }
                }>
                {msg.role === "user" ? "👤" : "🍯"}
              </div>
              <div className="rounded-2xl px-5 py-3 max-w-lg text-sm leading-8 whitespace-pre-wrap"
                style={msg.role === "user"
                  ? { background: "rgba(232,148,10,0.1)", border: "1px solid rgba(232,148,10,0.22)", borderRadius: "14px 4px 14px 14px", color: "#f0dec0" }
                  : { background: "rgba(30,15,0,0.9)", border: "1px solid rgba(232,148,10,0.14)", borderRadius: "4px 14px 14px 14px", color: "#ecddb8" }
                }
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f9c84a">$1</strong>')
                    .replace(/\n/g, "<br/>")
                }}
              />
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "linear-gradient(135deg, #7a4500, #e8940a)" }}>
                🍯
              </div>
              <div className="px-5 py-3 rounded-2xl flex items-center gap-1.5"
                style={{ background: "rgba(30,15,0,0.9)", border: "1px solid rgba(232,148,10,0.14)" }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: "#e8940a", animationDelay: `${d}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4" style={{ background: "rgba(20,10,0,0.6)", borderTop: "1px solid rgba(232,148,10,0.12)" }}>
          <div className="flex gap-3 items-end">
            <button onClick={() => sendMessage()}
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7a4500, #e8940a)", fontSize: 18, boxShadow: "0 0 12px rgba(232,148,10,0.3)" }}>
              ➤
            </button>
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px" }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="اسأل عن أنواع العسل، الفوائد، الأسعار..."
              rows={1}
              className="flex-1 rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
              style={{
                background: "rgba(35,18,0,0.9)",
                border: "1px solid rgba(232,148,10,0.2)",
                color: "#f0dec0",
                fontFamily: "'Noto Naskh Arabic', serif",
                maxHeight: 120,
              }}
            />
          </div>
        </div>
      </main>

      {/* ===== SIDEBAR RIGHT ===== */}
      <aside className="w-64 flex flex-col overflow-y-auto"
        style={{ background: "rgba(20,10,0,0.85)", borderRight: "1px solid rgba(232,148,10,0.15)" }}>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid rgba(232,148,10,0.15)" }}>
          {(["guide", "cart"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-xs font-semibold transition-all"
              style={{
                color: activeTab === tab ? "#e8940a" : "#9a7a40",
                borderBottom: activeTab === tab ? "2px solid #e8940a" : "2px solid transparent",
                background: "transparent",
                fontFamily: "'Noto Naskh Arabic', serif",
              }}>
              {tab === "guide" ? "📖 دليل العسل" : "🛒 الطلب"}
            </button>
          ))}
        </div>

        {/* Guide tab */}
        {activeTab === "guide" && (
          <div className="p-4 flex flex-col gap-4">
            <div className="text-xs font-semibold" style={{ color: "#9a7a40" }}>🌡️ درجات جودة العسل</div>

            {[
              { label: "درجة A+", desc: "عسل مفرز طازج", pct: 95, color: "#f9c84a" },
              { label: "درجة A", desc: "جودة ممتازة", pct: 80, color: "#e8940a" },
              { label: "درجة B", desc: "جودة جيدة", pct: 55, color: "#b87333" },
            ].map(g => (
              <div key={g.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: "#c09050" }}>{g.label}</span>
                  <span style={{ color: g.color, fontSize: 10 }}>{g.desc}</span>
                </div>
                <div className="h-2 rounded-full mb-1" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${g.pct}%`, background: `linear-gradient(90deg, #7a4500, ${g.color})` }} />
                </div>
              </div>
            ))}

            <div style={{ borderTop: "1px solid rgba(232,148,10,0.1)" }} className="pt-3">
              <div className="text-xs font-semibold mb-2" style={{ color: "#9a7a40" }}>✅ اختبار الأصالة</div>
              {[
                "اغمس ملعقة — يسقط قطرة واحدة",
                "أضفه للماء — لا يذوب فوراً",
                "لا رغوة عند الاهتزاز",
                "يتبلور بالبرد (طبيعي!)",
              ].map((tip, i) => (
                <div key={i} className="text-xs py-1.5 flex gap-2 items-start"
                  style={{ color: "#b09070", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span style={{ color: "#e8940a", flexShrink: 0 }}>🍯</span>
                  {tip}
                </div>
              ))}
            </div>

            <div className="text-xs p-3 rounded-lg"
              style={{ background: "rgba(232,148,10,0.05)", border: "1px solid rgba(232,148,10,0.12)", color: "#9a7a40", lineHeight: 1.7 }}>
              💡 اختر نوع العسل من القائمة اليسرى واسأل العسّال عن أفضل استخدام له
            </div>
          </div>
        )}

        {/* Cart tab */}
        {activeTab === "cart" && (
          <div className="p-4 flex flex-col gap-3">
            <div className="text-xs font-semibold" style={{ color: "#9a7a40" }}>📦 سلة الطلب</div>

            <div className="flex flex-col gap-2">
              {cartItems.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-xs p-2.5 rounded-lg gap-2"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(232,148,10,0.1)" }}>
                  <span style={{ color: "#e8d5b8", lineHeight: 1.5 }}>{item.name}</span>
                  <span style={{ color: "#e8940a", flexShrink: 0, fontWeight: 600 }}>{item.price} د.إ</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm font-bold pt-2"
              style={{ borderTop: "1px solid rgba(232,148,10,0.15)" }}>
              <span style={{ color: "#c09050" }}>المجموع</span>
              <span style={{ color: "#f9c84a" }}>{cartTotal} د.إ</span>
            </div>

            <button className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-85 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7a4500, #e8940a)",
                color: "#0d0800",
                fontFamily: "'Noto Naskh Arabic', serif",
                boxShadow: "0 0 16px rgba(232,148,10,0.3)",
              }}
              onClick={() => alert("🍯 تم إرسال طلبك! سيتواصل معك فريقنا قريباً")}>
              اطلب الآن 🐝
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
