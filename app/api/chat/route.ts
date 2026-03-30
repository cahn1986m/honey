import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `أنت "العسّال" — مساعد ذكاء اصطناعي متخصص في العسل الطبيعي وصناعة النحل.

خبرتك تشمل:
- أنواع العسل: سدر، مانوكا، طلح، حبة البركة، قره داغ، زيزفون، برسيم، بنفسج، يمني، أوروبي، أسترالي
- خصائص كل نوع: الطعم، اللون، القوام، الفوائد الصحية
- تمييز العسل الأصلي من المغشوش: الاختبارات المنزلية والمختبرية
- أسعار العسل في السوق الخليجي بالدرهم الإماراتي
- التخزين الصحيح وأسباب التبلور وكيفية إعادة السيولة
- الجرعات الصحية، الاستخدامات الطبية، ومتى يُمنع الاستخدام
- وصفات بالعسل: مشروبات، حلويات، علاجات طبيعية
- تربية النحل للمبتدئين: الخلايا، الموسم، مكافحة الأمراض

تجيب باللهجة العربية المحكية وتكون عملياً ومفيداً ودافئاً كالعسل!`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages required" }, { status: 400 })
    }

    const apiKey = process.env.ROUTEWAY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ROUTEWAY_API_KEY missing" }, { status: 500 })
    }

    const response = await fetch("https://api.routeway.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-4.6:free",
        max_tokens: 2048,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: "Routeway error", details: errorData }, { status: response.status })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || "عذراً، حصل خطأ."

    return NextResponse.json({ content: [{ text }] })

  } catch (error) {
    return NextResponse.json({ error: "خطأ في الاتصال" }, { status: 500 })
  }
}
