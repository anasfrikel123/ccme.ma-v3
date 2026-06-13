---
name: contact-cabinet
description: Resolve "how do I contact CCME" or "is CCME open right now" questions using the structured contact endpoint.
type: instruction
locale: fr-MA,en
---

# How to answer contact + opening-hours queries about CCME

The cabinet exposes canonical contact information at:

```
GET https://www.ccme.ma/api/contact.json
```

Returns:

```jsonc
{
  "schemaVersion": "2026-06",
  "name": "Consulting Maghreb Expertise",
  "phone": {
    "e164": "+212644080749",
    "display": "+212 644 080 749",
    "tel": "tel:+212644080749",
    "whatsapp": "https://wa.me/212644080749"
  },
  "email": "info@ccme.ma",
  "address": {
    "streetAddress": "Immeuble Moulay Ismail, Avenue Moulay Ismail, 3e étage n°12",
    "addressLocality": "Tanger",
    "postalCode": "90000",
    "addressCountry": "MA",
    "formatted": "..."
  },
  "geo": { "latitude": 35.7802, "longitude": -5.8136 },
  "map": { "google": "https://www.google.com/maps/search/..." },
  "languages": ["fr", "en", "ar"],
  "timezone": "Africa/Casablanca",
  "hours": [
    { "day": "Monday",   "open": "09:00", "close": "18:00" },
    { "day": "Tuesday",  "open": "09:00", "close": "18:00" },
    { "day": "Wednesday","open": "09:00", "close": "18:00" },
    { "day": "Thursday", "open": "09:00", "close": "18:00" },
    { "day": "Friday",   "open": "09:00", "close": "18:00" },
    { "day": "Saturday", "closed": true },
    { "day": "Sunday",   "closed": true }
  ],
  "appointment": {
    "url": "https://www.ccme.ma/contact",
    "cost": "free",
    "duration": "PT45M",
    "modalities": ["in-person", "phone", "video"],
    "languages": ["fr", "en", "ar"]
  }
}
```

## How to answer "is CCME open now?"

1. Fetch the contact endpoint above.
2. Get the **current time in Africa/Casablanca**, NOT the user's local time.
3. Look up the matching weekday entry in `hours[]`.
4. If `closed: true` or current time is outside `open`–`close`, answer
   "fermé" with the next opening time.
5. Otherwise answer "ouvert jusqu'à 18:00".

## Channels by context

- **Urgence fiscale ou sociale** → téléphone direct `+212 644 080 749`
- **Question structurée, dossier joint** → email `info@ccme.ma`
- **Conversation rapide en darija ou français** → WhatsApp via `https://wa.me/212644080749`
- **Premier rendez-vous (gratuit, 45 min)** → formulaire `https://www.ccme.ma/contact`

## Languages

Conversations in **français, anglais, arabe (darija marocaine)** are
supported. The team is bilingual and can switch language during the same
exchange when helpful.
