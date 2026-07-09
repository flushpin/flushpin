# FlushPin — Attorney Brief (Draft for Counsel Review)

**DRAFT — NOT LEGAL ADVICE — FOR ATTORNEY REVIEW ONLY**

| Field | Value |
|-------|-------|
| Company | FlushPin |
| Product | Community restroom access information platform (web + mobile) |
| Jurisdiction | Orange County, California, USA |
| Entity | [LEGAL ENTITY NAME — LLC / sole proprietorship TBD] |
| Contact | hello@flushpin.com |
| Date | June 2026 |

---

## 1. Executive summary

FlushPin is a **user-generated content (UGC) platform** that helps people find restroom access information at third-party businesses and locations. Users submit access methods (keypad codes, “ask staff,” “customers only,” “no code needed,” etc.). FlushPin **does not operate, own, inspect, or control** any restroom or business.

We seek counsel to review our Terms, Privacy Policy, takedown procedures, and mobile product flows to **reduce platform liability** while operating a lawful community information service.

---

## 2. Business model

### 2.1 Data sources
- **Community submissions** (primary value): users submit access information via mobile app
- **Database** (Supabase): stored restroom records, moderation, business opt-out flags
- **Google Places API**: nearby venue discovery (no access codes from Google)

### 2.2 User flows
1. User finds nearby location
2. Authenticated user may view community-submitted access details
3. User may submit or update access information
4. Business owner may claim listing or request removal/opt-out via web forms

### 2.3 Revenue (current / planned)
- Free consumer app
- Potential future: business promotions, QR tools, analytics (disclosed in Terms §11)

---

## 3. Existing legal documents (live)

| URL | Status |
|-----|--------|
| https://www.flushpin.com/terms | Live — comprehensive ToS (June 16, 2026) |
| https://www.flushpin.com/privacy | Live — CCPA-oriented (June 8, 2026) |
| https://www.flushpin.com/safety | Live — safety notice |
| https://www.flushpin.com/optout | Live — business opt-out form |
| https://www.flushpin.com/business/claim | Live — business claim form |

---

## 4. Legal risk areas (seeking guidance)

### 4.1 Access code sharing
Users may submit keypad PINs for restrooms at chain retailers, cafes, etc. Concerns:
- **Trespass facilitation** — encouraging entry without customer status
- **CFAA / unauthorized access** — if code is part of security system
- **Theft of services** — using facilities without purchase where required
- **Platform vs. user liability** — Section 230 scope

### 4.2 Business opposition
Businesses may request removal. We intend to:
- Remove or suppress access codes promptly upon verified request
- Block re-publication for opted-out locations where feasible
- Maintain audit logs

### 4.3 Moderation
We reserve right to remove content, ban users (reputation system planned), and enforce opt-out. Need guidance on whether moderation affects Section 230 protection.

### 4.4 California-specific
- CCPA compliance
- Unfair competition / false advertising if listings inaccurate
- Arbitration clause enforceability (Terms §18)

---

## 5. Protective measures already implemented

- Platform disclaimer: information only, no guarantee
- User attestation: lawful access only; no staff-only / hacked codes
- Business opt-out and claim channels
- Limitation of liability, indemnification, arbitration (Terms)
- Section 230 reference (Terms §8)
- Access code view logging (Privacy §7)
- Safety notice page
- No sale of personal information (Privacy)

---

## 6. Draft documents in this pack (for review)

1. DMCA / Copyright Policy
2. Business Removal & Takedown Policy
3. Community Guidelines
4. In-App Legal Copy (disclaimers)
5. Proposed Terms amendments
6. Questions for Counsel

---

## 7. Requested deliverables from counsel

1. Review and revise Terms, Privacy, and new policies
2. Advise on **Section 230** and **CFAA/trespass** exposure for access-code UGC
3. Recommend **entity structure** (LLC) and **insurance** (GL, E&O)
4. **DMCA agent** registration guidance
5. **App Store / Google Play** compliance checklist
6. **Opt-out SLA** and re-submission blocking — best practice
7. Sign-off before publication of updated documents

---

## 8. Attachments checklist for meeting

- [ ] This brief
- [ ] Live Terms / Privacy / Safety (URLs above)
- [ ] Draft policies in `/docs/legal/`
- [ ] Screenshots of mobile: Nearby, restroom detail, PIN submit, success modal
- [ ] Entity formation documents (if any)
- [ ] Sample opt-out request workflow

---

*Prepared as a draft briefing document. Not legal advice.*
