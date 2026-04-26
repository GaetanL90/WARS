***WARS API CONTRACT***



Water Access \& Reporting System (WARS)

Version: 1.0 (MVP)

Stack: Django REST Framework (Backend) + FastAPI (ML Service)





***🔐 1. AUTHENTICATION***



***Base URL***





/api/v1





***Auth Method***



\* JWT (Bearer Token)



***Headers***





Authorization: Bearer <access\_token>

Content-Type: application/json





***👤 2. USER ROLES***



| Role       | Permissions                       |

| ---------- | --------------------------------- |

| Citizen    | Submit reports, view own reports  |

| Technician | View alerts, update report status |

| Manager    | View analytics, reports, alerts   |

| Admin      | Full access + user management     |





***🔑 3. AUTH ENDPOINTS***



**POST /auth/register**



Create new user



**Request**



JSON:

{

&#x20; "name": "John Doe",

&#x20; "email": "john@gmail.com",

&#x20; "password": "123456",

&#x20; "role": "citizen"

}





**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "id": 1,

&#x20;   "email": "john@gmail.com",

&#x20;   "role": "citizen"

&#x20; }

}





POST /auth/login



**Request**



JSON:

{

&#x20; "email": "john@gmail.com",

&#x20; "password": "123456"

}





**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "access\_token": "jwt\_token",

&#x20;   "refresh\_token": "refresh\_token",

&#x20;   "user": {

&#x20;     "id": 1,

&#x20;     "role": "admin"

&#x20;   }

&#x20; }

}



***📡 4. SENSOR READINGS***



POST /sensor-readings



(Mock IoT posts data)



**Request**



JSON:

{

&#x20; "water\_point\_id": 1,

&#x20; "ph": 7.1,

&#x20; "turbidity": 2.5,

&#x20; "tds": 400,

&#x20; "temperature": 25,

&#x20; "conductivity": 300

}



**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "id": 101,

&#x20;   "status": "stored"

&#x20; }

}



GET /sensor-readings/latest



**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": \[

&#x20;   {

&#x20;     "water\_point\_id": 1,

&#x20;     "ph": 7.1,

&#x20;     "turbidity": 2.5,

&#x20;     "status": "Safe",

&#x20;     "timestamp": "2026-02-15T10:00:00Z"

&#x20;   }

&#x20; ]

}



***🚨 5. AI PREDICTION (FASTAPI)***



POST /predict  (ML SERVICE)



**Request**



JSON:

{

&#x20; "ph": 7.1,

&#x20; "turbidity": 2.5,

&#x20; "tds": 400,

&#x20; "temperature": 25,

&#x20; "conductivity": 300

}



**Response**



JSON:

{

&#x20; "prediction": "Unsafe",

&#x20; "confidence": 0.92,

&#x20; "top\_features": \["turbidity", "ph"]

}



***📢 6. ALERTS***



POST /alerts



(Auto-created by backend)



**Request**



JSON:

{

&#x20; "water\_point\_id": 1,

&#x20; "prediction": "Unsafe",

&#x20; "confidence": 0.92

}



**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "id": 55,

&#x20;   "status": "active"

&#x20; }

}



GET /alerts



**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": \[

&#x20;   {

&#x20;     "id": 55,

&#x20;     "water\_point\_id": 1,

&#x20;     "prediction": "Unsafe",

&#x20;     "confidence": 0.92,

&#x20;     "status": "active"

&#x20;   }

&#x20; ]

}



***📝 7. REPORTS (CITIZEN)***



POST /reports



**Request**



JSON:

{

&#x20; "water\_point\_id": 1,

&#x20; "issue\_type": "contamination",

&#x20; "description": "Water looks dirty"

}





**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "id": 201,

&#x20;   "status": "pending"

&#x20; }

}



GET /reports



**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": \[

&#x20;   {

&#x20;     "id": 201,

&#x20;     "issue\_type": "contamination",

&#x20;     "status": "pending",

&#x20;     "created\_at": "2026-02-15T10:00:00Z"

&#x20;   }

&#x20; ]

}



PATCH /reports/{id}/status



**Request**



JSON:

{

&#x20; "status": "resolved"

}



**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "id": 201,

&#x20;   "status": "resolved"

&#x20; }

}



***📊 8. ANALYTICS (MANAGER / ADMIN)***



GET /analytics/summary



**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "total\_reports": 10,

&#x20;   "active\_alerts": 3,

&#x20;   "safe\_percentage": 78,

&#x20;   "unsafe\_percentage": 22

&#x20; }

}



***⚙️ 9. USER MANAGEMENT (ADMIN)***



GET /users



**Response**



JSON:

{

&#x20; "success": true,

&#x20; "data": \[

&#x20;   {

&#x20;     "id": 1,

&#x20;     "email": "admin@example.com",

&#x20;     "role": "admin"

&#x20;   }

&#x20; ]

}



PATCH /users/{id}



**Request**



JSON:

{

&#x20; "role": "technician"

}



***🔁 10. STANDARD RESPONSE FORMAT***



All endpoints (except ML) follow:



JSON:

{

&#x20; "success": true,

&#x20; "data": {},

&#x20; "error": null

}





Error example:



JSON:

{

&#x20; "success": false,

&#x20; "error": "Invalid credentials"

}



***⏱️ 11. PERFORMANCE RULES (MVP)***



\* API response time < 1s

\* ML prediction < 2s

\* Dashboard polling: every 10 seconds







***⚠️ 12. FAILSAFE RULES***



\* If ML API fails → return last known prediction

\* If no data → mark status = "Unknown"

\* Alerts triggered only after 2 unsafe readings



***📌 13. NOTES***



\* No real IoT (mock generator used)

\* No SMS integration (UI only)

\* Focus: end-to-end demo reliability



