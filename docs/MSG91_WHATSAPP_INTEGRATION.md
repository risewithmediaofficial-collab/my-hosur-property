# MSG91 WhatsApp Integration & Automation Guide

This guide describes the WhatsApp integration implemented for **MyHosurProperty**.
It provides both:
1. **Automated WhatsApp Notifications**: Outbound notifications triggered by system events (welcome on signup, property submission, approval/rejection, enquiries, callback requests, payment confirmation).
2. **Interactive WhatsApp Chatbot APIs**: Endpoints designed specifically for MSG91's Chatbot / Flow Builder API Node.

---

## 1. Architectural Principles & Safety

- **Zero Breaking Changes**: Existing MSG91 WhatsApp OTP implementation (`sendWhatsAppOtp.js`), auth flows, payment gateways, and property operations are 100% preserved.
- **Non-Blocking Execution**: All notification triggers run asynchronously (`setImmediate`) inside robust `try...catch` blocks. If MSG91 is unreachable or a template is not yet approved, the core website/API operation still succeeds without error.
- **Config-Driven Activation**: Notification triggers check whether the corresponding template name environment variable is set. If unset or empty, the notification is silently skipped and logged as `skipped`.
- **Idempotency Protection**: Every notification computes an MD5 fingerprint `(eventType + entityId + userId)`. Duplicate attempts within 5 minutes are safely skipped to prevent spamming users.
- **Audit Logging**: Every notification attempt (sent, failed, or skipped) is stored in the new `whatsappmessagelogs` MongoDB collection.

---

## 2. Environment Variables Reference

Add the following variables to your `backend/.env` file:

```env
# ─── MSG91 WhatsApp Notification Templates ──────────────────────────────────
# Approved template names from your MSG91 WhatsApp dashboard.
# Leave empty until approved; the system will skip sending until configured.
MSG91_WA_WELCOME_TEMPLATE_NAME=myhosur_welcome_user
MSG91_WA_PROPERTY_SUBMITTED_TEMPLATE_NAME=myhosur_property_submitted
MSG91_WA_PROPERTY_APPROVED_TEMPLATE_NAME=myhosur_property_approved
MSG91_WA_PROPERTY_REJECTED_TEMPLATE_NAME=myhosur_property_rejected
MSG91_WA_ENQUIRY_TEMPLATE_NAME=myhosur_new_enquiry
MSG91_WA_CALLBACK_TEMPLATE_NAME=myhosur_callback_request
MSG91_WA_PAYMENT_SUCCESS_TEMPLATE_NAME=myhosur_payment_success

# ─── WhatsApp Chatbot API Security ──────────────────────────────────────────
# Secret key required in the 'x-bot-api-key' header (or 'botApiKey' query param)
# for calls from MSG91's Flow Builder API node.
WHATSAPP_BOT_API_KEY=mhp_bot_sec_918110952245_x9k2p8

# ─── Website Base URL for Deep Links ────────────────────────────────────────
WEBSITE_URL=https://myhosurproperty.com
```

> **Note on Existing MSG91 Credentials:**
> Outbound notifications reuse `MSG91_WHATSAPP_AUTH_KEY` and `MSG91_WHATSAPP_INTEGRATED_NUMBER` already present in `.env`. No duplicate API keys are needed.

---

## 3. MSG91 Template Setup & Variable Mapping

Create and submit the following templates in your MSG91 WhatsApp Dashboard (**WhatsApp > Manage Templates**):

### 1. Welcome Message
- **Event**: User completes signup / OTP verification
- **Template Name**: `mhp_welcome`
- **Category**: `MARKETING` or `UTILITY`
- **Language**: `en` (policy: `deterministic`)
- **Namespace**: `9dc986a5_2fc7_4562_8b79_9e65eb5da797`
- **Variables**:
  - `{{1}}` (`body_1`): User Name (e.g., `Sathish` or `Customer`)
  - `{{2}}` (`body_2`): Platform / Brand Name (`MyHosurProperty`, configurable via `MSG91_WA_WELCOME_BODY_2`)

### 2. Property Submitted
- **Event**: Owner posts a new property listing
- **Suggested Template Name**: `myhosur_property_submitted`
- **Category**: `UTILITY`
- **Body Sample**:
  > Hello {{1}}, your property "{{2}}" has been submitted successfully to MyHosurProperty. You can view your listing on your dashboard.
- **Variables**:
  - `{{1}}`: Owner Name
  - `{{2}}`: Property Title

### 3. Property Approved
- **Event**: Admin moderates property to "approved"
- **Suggested Template Name**: `myhosur_property_approved`
- **Category**: `UTILITY`
- **Body Sample**:
  > Congratulations {{1}}! Your property "{{2}}" has been approved and is now live on MyHosurProperty.
- **Variables**:
  - `{{1}}`: Owner Name
  - `{{2}}`: Property Title

### 4. Property Rejected
- **Event**: Admin moderates property to "rejected"
- **Suggested Template Name**: `myhosur_property_rejected`
- **Category**: `UTILITY`
- **Body Sample**:
  > Hello {{1}}, your listing "{{2}}" requires revisions before it can be listed on MyHosurProperty. Please check your dashboard for details.
- **Variables**:
  - `{{1}}`: Owner Name
  - `{{2}}`: Property Title

### 5. New Property Enquiry
- **Event**: Buyer contacts seller for a property
- **Suggested Template Name**: `myhosur_new_enquiry`
- **Category**: `UTILITY`
- **Body Sample**:
  > Hello {{1}}, you have a new inquiry for your property "{{2}}" from {{3}}. Log in to your MyHosurProperty dashboard to respond.
- **Variables**:
  - `{{1}}`: Owner Name
  - `{{2}}`: Property Title
  - `{{3}}`: Buyer Name

### 6. Callback Request
- **Event**: Buyer requests a callback or site visit
- **Suggested Template Name**: `myhosur_callback_request`
- **Category**: `UTILITY`
- **Body Sample**:
  > Hello {{1}}, a callback request was submitted for your property "{{2}}" by {{3}}. Please visit your dashboard to connect with the lead.
- **Variables**:
  - `{{1}}`: Owner Name
  - `{{2}}`: Property Title
  - `{{3}}`: Buyer Name

### 7. Payment Success
- **Event**: Subscription / QR payment approved by admin
- **Suggested Template Name**: `myhosur_payment_success`
- **Category**: `UTILITY`
- **Body Sample**:
  > Hello {{1}}, your payment for {{2}} (Amount: {{3}}) has been approved. Your subscription is now active!
- **Variables**:
  - `{{1}}`: User Name
  - `{{2}}`: Plan Name (e.g. `Premium Seller`)
  - `{{3}}`: Amount (e.g. `Rs. 999`)

---

## 4. WhatsApp Chatbot API Reference

All bot endpoints are located at `/api/whatsapp/bot/*` and require authentication.

### Authentication
Include the header:
```http
x-bot-api-key: <WHATSAPP_BOT_API_KEY>
```
*(Alternatively, for GET requests in webhook tools that cannot set custom headers, `?botApiKey=<WHATSAPP_BOT_API_KEY>` is supported as a query parameter).*

---

### Endpoint 1: Search Properties
- **Method**: `GET /api/whatsapp/bot/properties/search`
- **Description**: Searches verified, approved properties for WhatsApp users.
- **Query Parameters**:
  - `phone` (optional): Sender's phone number
  - `city` (optional, default: `Hosur`): City / locality filter
  - `propertyType` (optional): `Apartment`, `Villa`, `Plot`, `Independent House`, `Commercial`, `Land`
  - `listingType` (optional): `sale` or `rent`
  - `minPrice` / `maxPrice` (optional): Number in INR
  - `bhk` (optional): Number (e.g., `2`, `3`)
  - `limit` (optional, default: `5`, max: `10`): Number of results
- **Sample Request**:
  ```bash
  curl -H "x-bot-api-key: mhp_bot_sec_918110952245_x9k2p8" \
    "https://myhosurproperty.com/api/whatsapp/bot/properties/search?city=Hosur&propertyType=Plot&maxPrice=2500000"
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "properties": [
      {
        "id": "664fa1e2b...",
        "title": "Prime Villa Plot in Bagalur Road",
        "location": "Bagalur Road, Hosur",
        "price": "₹22,00,000",
        "numericPrice": 2200000,
        "type": "Plot",
        "listingType": "sale",
        "bhk": null,
        "url": "https://myhosurproperty.com/property/prime-villa-plot-in-bagalur-road-664fa1e2b"
      }
    ],
    "message": "Found 2 matching properties in Hosur."
  }
  ```

---

### Endpoint 2: My Properties
- **Method**: `GET /api/whatsapp/bot/my-properties`
- **Description**: Returns listings posted by the WhatsApp user identified by `phone`.
- **Query Parameters**:
  - `phone` (required): Sender's 10-digit or 12-digit phone number (e.g. `9876543210` or `919876543210`)
- **Sample Request**:
  ```bash
  curl -H "x-bot-api-key: mhp_bot_sec_918110952245_x9k2p8" \
    "https://myhosurproperty.com/api/whatsapp/bot/my-properties?phone=919876543210"
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "user": { "name": "Ravi Kumar", "phone": "919876543210" },
    "count": 1,
    "properties": [
      {
        "id": "664fa1e...",
        "title": "3 BHK House near Ring Road",
        "price": "₹65,00,000",
        "status": "approved",
        "inquiryCount": 4,
        "url": "https://myhosurproperty.com/property/3-bhk-house-near-ring-road-664fa1e"
      }
    ]
  }
  ```

---

### Endpoint 3: My Enquiries / Leads
- **Method**: `GET /api/whatsapp/bot/my-enquiries`
- **Description**: Returns recent inquiries received on the user's properties.
- **Query Parameters**:
  - `phone` (required): Sender's phone number
- **Sample Response**:
  ```json
  {
    "success": true,
    "user": { "name": "Ravi Kumar" },
    "count": 2,
    "enquiries": [
      {
        "id": "664fb...",
        "propertyTitle": "3 BHK House near Ring Road",
        "buyerName": "Suresh",
        "buyerPhone": "919812345678",
        "intentType": "contact",
        "status": "pending",
        "date": "16 Sep 2026"
      }
    ]
  }
  ```

---

### Endpoint 4: User Profile
- **Method**: `GET /api/whatsapp/bot/profile`
- **Description**: Returns sanitized profile, active subscription plan, and role for the phone number.
- **Query Parameters**:
  - `phone` (required): Sender's phone number
- **Sample Response**:
  ```json
  {
    "success": true,
    "isRegistered": true,
    "profile": {
      "name": "Ravi Kumar",
      "phone": "919876543210",
      "role": "seller",
      "plan": "Premium Seller",
      "planExpires": "30 Oct 2026"
    }
  }
  ```

---

### Endpoint 5: Post Property via WhatsApp Bot
- **Method**: `POST /api/whatsapp/bot/property`
- **Description**: Allows users to submit a property draft directly through WhatsApp conversation. Submitted properties are placed in `pending` status for admin safety.
- **Request Body (JSON)**:
  ```json
  {
    "phone": "919876543210",
    "title": "2 BHK Apartment in Sipcot Phase 1",
    "propertyType": "Apartment",
    "listingType": "sale",
    "price": 3800000,
    "area": "Sipcot Phase 1",
    "city": "Hosur",
    "bhk": 2,
    "description": "Ready to move apartment with covered parking and Kaveri water connection."
  }
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Property submitted successfully and is pending admin verification.",
    "propertyId": "664fc890..."
  }
  ```

---

### Endpoint 6: Submit Support Request
- **Method**: `POST /api/whatsapp/bot/support`
- **Description**: Saves customer messages when they ask to speak with human support or report an issue.
- **Request Body (JSON)**:
  ```json
  {
    "phone": "919876543210",
    "message": "I would like assistance with listing my commercial property in Hosur.",
    "name": "Ravi Kumar"
  }
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Support request submitted. Our team will contact you shortly.",
    "requestId": "664fd123..."
  }
  ```

---

## 5. Connecting with MSG91 Chatbot Studio (Flow Builder)

In your **MSG91 Dashboard > Chatbot Studio**:

1. **Start Trigger**: Inbound message (e.g. `hi`, `hello`, `menu`).
2. **Interactive Menu Buttons**:
   - `1. Search Properties`
   - `2. My Listings & Leads`
   - `3. Post Property`
   - `4. Talk to Support`
3. **Using the API Node**:
   - Method: `GET` / `POST`
   - URL: `https://myhosurproperty.com/api/whatsapp/bot/properties/search`
   - Headers:
     - `x-bot-api-key`: `<Your WHATSAPP_BOT_API_KEY>`
     - `Content-Type`: `application/json`
   - Parameters: Pass MSG91 variable `{sender}` or `{phone}` as the `phone` parameter.
4. **Displaying Results**:
   - Access JSON response variables such as `properties[0].title`, `properties[0].price`, `properties[0].url`.

---

## 6. Audit Logs & Monitoring

- **Collection:** `whatsappmessagelogs`
  - Query logs by recipient phone:
    ```javascript
    db.whatsappmessagelogs.find({ phoneNumber: "919876543210" }).sort({ createdAt: -1 })
    ```
  - Inspect failed sends:
    ```javascript
    db.whatsappmessagelogs.find({ status: "failed" })
    ```
- **Collection:** `whatsappsupportrequests`
  - Review open bot support queries:
    ```javascript
    db.whatsappsupportrequests.find({ status: "open" })
    ```
