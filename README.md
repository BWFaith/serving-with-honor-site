# Serving With Honor — website

Open `index.html` to preview. Upload the whole folder to any host (Netlify, Vercel, GoDaddy, cPanel).

## 1. Make booking emails work (invoice to client + request to the company)

A static site cannot send email by itself, so this uses EmailJS (free tier, no server).

1. Create an account at https://www.emailjs.com
2. **Email Services → Add New Service** (Gmail works). Copy the **Service ID**.
3. **Email Templates → Create New Template**, twice:
   - Template A, "Client invoice"
   - Template B, "Cleaning request"
   In BOTH templates set:
   - To Email: `{{to_email}}`
   - Subject: `{{subject}}`
   - From Name: `{{from_name}}`
   - Reply To: `{{reply_to}}`
   - Content (switch to the code / HTML editor): `{{{html}}}`   ← three braces, so the invoice is not escaped
   Copy each template's **Template ID**.
4. **Account → General**: copy your **Public Key**.
5. Open `js/script.js` and fill the `CONFIG.emailjs` block:
   ```js
   emailjs:{serviceId:'service_xxx',publicKey:'xxxx',clientTemplateId:'template_aaa',businessTemplateId:'template_bbb'}
   ```
6. In EmailJS **Security**, restrict the key to your website's domain.
7. Test one booking with your own email before launch.

Until this is filled in, the booking page still works: it shows the invoice on screen (print or save as PDF) and offers a button that opens an email to the company.

## 2. Edit prices
Top of `js/script.js`: `PRICE` (base prices from the flier, add-ons, discounts, size multipliers) and `CONFIG` (phone, email, payment note, tax rate). The multipliers and add-on prices are placeholders; $125 / $155 / $65 / $80 come from the flier.

## 3. Before and after photos
Put JPG files in `images/gallery/` with these exact names. Each pair needs both files:
`pair1-before.jpg` / `pair1-after.jpg` … up to `pair6`. Use the same angle and the same size for both photos. Until then, gold placeholders show.
To change captions or categories, edit the `items` list in `build.py` and run `python3 build.py`, or edit `gallery.html` directly.

## 4. Things to confirm with the owner
- Phone number: the flier says (689) 201-7444, her Facebook says 689-318-6412. The site uses the flier number.
- Service area cities, payment methods, cancellation policy, insurance wording (Terms page is a template).
- Her own "About" story (marked with an EDIT comment in `about.html`).
