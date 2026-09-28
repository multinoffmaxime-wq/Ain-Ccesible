import { getStore } from "@netlify/blobs";

// Fonction de synchronisation : stocke une seule base de données partagée
// (celle de l'entreprise) et la sert à tous les appareils qui la demandent.
// GET  -> renvoie les données actuelles + horodatage
// POST -> remplace les données actuelles par celles envoyées

export default async (req) => {
  const store = getStore("gestion-everest");

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method === "GET") {
    const record = await store.get("db", { type: "json" });
    const meta = await store.getMetadata("db");
    const updatedAt = (meta && meta.metadata && meta.metadata.updatedAt) || null;
    return new Response(JSON.stringify({ data: record || null, updatedAt }), {
      headers: { "Content-Type": "application/json", ...cors },
    });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "JSON invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
    const updatedAt = Date.now();
    await store.setJSON("db", body, { metadata: { updatedAt } });
    return new Response(JSON.stringify({ ok: true, updatedAt }), {
      headers: { "Content-Type": "application/json", ...cors },
    });
  }

  return new Response("Method not allowed", { status: 405, headers: cors });
};

export const config = { path: "/api/gestion-data" };
