# In-App Legal Copy — FlushPin Mobile (Draft)

**DRAFT FOR ATTORNEY REVIEW**

Short disclaimers for mobile screens. Implement after counsel sign-off.

---

## A. Sign-up / account creation (checkbox required)

**Label (checkbox):**

> I agree to the [Terms of Service](https://www.flushpin.com/terms) and [Privacy Policy](https://www.flushpin.com/privacy), and I understand FlushPin is a community information service only.

**Optional expanded text (below checkbox):**

> FlushPin does not operate restrooms or guarantee access. Business rules and staff instructions always apply.

---

## B. Before viewing an access code (first time per session — optional modal)

**Title:** Community-shared access information

**Body:**

> This information was submitted by FlushPin community members, not by the business. It may be outdated or incorrect. Access is never guaranteed. Follow posted rules and staff instructions. If access is denied or an area is restricted, do not enter.

**Buttons:** `I understand` | `Learn more` → /safety

---

## C. PIN / access submission screen (above submit button)

**Notice box:**

> **Share only lawful access information**  
> Submit codes only from your own permitted visit. Do not share employee-only, private, or unauthorized codes. False or harmful submissions may result in account removal. By submitting, you grant FlushPin permission to display this information and confirm it is accurate to the best of your knowledge.  
> [Community Guidelines](https://www.flushpin.com/legal/community-guidelines) · [Terms](https://www.flushpin.com/terms)

**Checkbox (required before submit):**

> I confirm this information is from lawful access and I agree to the Terms of Service.

---

## D. Nearby screen — footer hint (optional, subtle)

> Listings combine community data and nearby places. Access codes are user-submitted and not verified by FlushPin.

---

## E. Restroom detail — access panel footer

> Community shared · Not verified · Business rules apply · [Report issue]

---

## F. Account screen — legal links (already partially implemented)

Ensure links to:
- Terms of Service
- Privacy Policy
- Safety Notice
- Community Guidelines (new)
- Business opt-out info (for business users)

---

## G. PIN publish success modal — add one line (below congratulations)

> Thanks for helping the community. Please only share information from lawful access.

---

## H. Turkish versions (optional — if app supports TR locale later)

Sign-up checkbox TR:

> [Kullanım Koşulları](https://www.flushpin.com/terms) ve [Gizlilik Politikası](https://www.flushpin.com/privacy)'nı kabul ediyorum. FlushPin yalnızca bir bilgi platformudur.

PIN submit TR:

> **Yalnızca yasal erişim bilgisi paylaşın**  
> Kodu yalnızca izinli ziyaretinizden paylaşın. Personel alanı veya yetkisiz kodları göndermeyin.

---

## Implementation checklist

- [ ] Sign-up: required checkbox + links
- [ ] PIN submit: notice + required checkbox
- [ ] Restroom detail: footer on access panel
- [ ] Account: add Community Guidelines link
- [ ] Success modal: one-line reminder
- [ ] Log acceptance timestamp (user_id, version, datetime) — discuss with counsel

---

*Draft for attorney review. Not legal advice.*
