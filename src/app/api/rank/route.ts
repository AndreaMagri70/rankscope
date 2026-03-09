import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword, targetUrl } = await req.json();

    if (!keyword || !targetUrl) {
      return NextResponse.json(
        { error: "Keyword e targetUrl sono obbligatori" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey || apiKey === "inserisci_qui_la_tua_api_key") {
      return NextResponse.json(
        { error: "SERPAPI_KEY non configurata correttamente" },
        { status: 500 }
      );
    }

    // 1. Normalizziamo il target cercato (es: trasforma https://andreamagri.net in andreamagri.net)
    const targetClean = targetUrl
      .replace(/https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split('/')[0] // Prende solo il dominio, ignora eventuali path
      .toLowerCase();

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
      `https://serpapi.com{params.toString()}`,
      { next: { revalidate: 0 } }
    );

    const data = await response.json();

    // Gestione errori espliciti da SerpAPI (es. crediti esauriti)
    if (data.error) {
      return NextResponse.json(
        { error: `SerpAPI Error: ${data.error}` },
        { status: 500 }
      );
    }

    const organic = data.organic_results || [];
    let foundPosition = -1;
    let foundUrl = "";

    // 2. Regex per il match: cerca il dominio all'inizio della stringa o dopo un punto (sottodomini)
    // Escapa i punti nel dominio per la Regex (es: andreamagri\.net)
    const escapedTarget = targetClean.replace(/\./g, "\\.");
    const domainRegex = new RegExp(`(^|\\.)${escapedTarget}($|\\/)`, "i");

    for (let i = 0; i < organic.length; i++) {
      const link = organic[i].link;
      
      // Puliamo il link di Google dal protocollo e www per il confronto
      const linkToCompare = link.replace(/https?:\/\//i, "").replace(/^www\./i, "");

      if (domainRegex.test(linkToCompare)) {
        foundPosition = i + 1;
        foundUrl = link;
        break;
      }
    }

    if (foundPosition !== -1) {
      return NextResponse.json({
        success: true,
        position: foundPosition,
        url: foundUrl,
        keyword: keyword
      });
    } else {
      return NextResponse.json({
        success: true,
        position: 0,
        message: "Non trovato nelle prime 100 posizioni organiche"
      });
    }

  } catch (err: any) {
  return NextResponse.json(
    { 
      error: err.message || "Errore interno del server",
      detail: err.toString(),
      stack: err.stack?.split("\n").slice(0, 3),
    },
    { status: 500 }
  );
}
}