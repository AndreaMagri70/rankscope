import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword, targetUrl } = await req.json();

    if (!keyword || !targetUrl) {
      return NextResponse.json(
        { error: "keyword e targetUrl sono obbligatori" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey || apiKey === "inserisci_qui_la_tua_api_key") {
      return NextResponse.json(
        { error: "SERPAPI_KEY non configurata nel file .env.local" },
        { status: 500 }
      );
    }

    // Estrai il dominio dall'URL
    const domain = targetUrl
      .replace(/https?:\/\//, "")
      .replace(/\/.*/, "")
      .replace(/^www\./, "")   // normalizza input utente
      .toLowerCase();           // case-insensitive

    const params = new URLSearchParams({
      q: keyword,
      location: "Italy",
      hl: "it",
      gl: "it",
      google_domain: "google.it",
      num: "100",
      api_key: apiKey,
    });

    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`,
      { next: { revalidate: 0 } }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `SerpAPI error ${response.status}: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const organic: any[] = data.organic_results || [];

    // Cerca il dominio nei risultati
    let result = null;
    for (let i = 0; i < organic.length; i++) {
      const r = organic[i];
      const linkDomain = (r.link || "")
        .replace(/https?:\/\//, "")
        .replace(/\/.*/, "")
        .replace(/^www\./, "")   // normalizza risultato Google
        .toLowerCase();           // case-insensitive

      if (linkDomain === domain || linkDomain.endsWith(`.${domain}`)) {
        result = {
          found: true,
          position: i + 1,
          url: r.link,
          title: r.title,
          snippet: r.snippet || "",
          displayed_link: r.displayed_link || "",
        };
        break;
      }
    }

    if (!result) {
      result = {
        found: false,
        position: null,
        url: null,
        title: null,
        snippet: "Dominio non trovato nei primi 100 risultati.",
        displayed_link: null,
      };
    }

    return NextResponse.json({ keyword, domain, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Errore interno del server" },
      { status: 500 }
    );
  }
}
