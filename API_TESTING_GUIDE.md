# 🧪 ANNTRA API Testing Guide

## ✅ System Status
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **Database**: MongoDB (anntra)

---

## 🔐 Testing Authentication

### 1. Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@anntra.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "role": "admin"
  }
}
```

Save the token for subsequent requests!

---

## 🍱 Testing Automated Assignment (CORE FEATURE)

### 2. Login as Donor
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor1@hotel.com",
    "password": "donor123"
  }'
```

### 3. Create Food Batch (This will AUTO-ASSIGN a volunteer!)
```bash
curl -X POST http://localhost:5000/api/food \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DONOR_TOKEN" \
  -d '{
    "foodType": "Vegetable Curry",
    "quantity": "25 meals",
    "category": "Veg",
    "preparationTime": "2026-02-14T18:00:00Z",
    "pickupWindow": {
      "start": "2026-02-14T18:30:00Z",
      "end": "2026-02-14T20:00:00Z"
    },
    "expiryTime": "2026-02-14T22:00:00Z",
    "coordinates": [80.2720, 13.0850],
    "address": "Grand Hotel, Beach Road"
  }'
```

**What Happens Automatically:**
1. ✅ System calculates urgency based on expiry time
2. ✅ Finds nearest volunteers with matching tier
3. ✅ Auto-assigns to best volunteer
4. ✅ Updates volunteer's assigned count
5. ✅ Sends Socket.IO notification to volunteer
6. ✅ Logs assignment with timestamp

**Check backend logs** - you should see:
```
Assigned FoodBatch <id> to Volunteer <volunteer_id>
Volunteer <id> reliability updated: XX.X% (Tier X)
```

---

## 🚴 Testing Volunteer Workflow

### 4. Login as Volunteer
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "volunteer1@email.com",
    "password": "volunteer123"
  }'
```

### 5. Get Active Tasks
```bash
curl http://localhost:5000/api/food/volunteer/active \
  -H "Authorization: Bearer YOUR_VOLUNTEER_TOKEN"
```

### 6. View Reliability Stats & Tier
```bash
curl http://localhost:5000/api/volunteer/stats \
  -H "Authorization: Bearer YOUR_VOLUNTEER_TOKEN"
```

**Expected Response:**
```json
{
  "reliabilityScore": 98,
  "completedDeliveries": 45,
  "assignedDeliveries": 46,
  "tier": 1,
  "totalMealsServed": 450,
  "totalCO2Saved": 180
}
```

### 7. Update Delivery Status to "Picked Up"
```bash
curl -X PUT http://localhost:5000/api/food/<FOOD_BATCH_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VOLUNTEER_TOKEN" \
  -d '{
    "status": "picked_up",
    "coordinates": [80.2700, 13.0820]
  }'
```

### 8. Update to "In Transit"
```bash
curl -X PUT http://localhost:5000/api/food/<FOOD_BATCH_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VOLUNTEER_TOKEN" \
  -d '{
    "status": "in_transit",
    "coordinates": [80.2720, 13.0840]
  }'
```

### 9. Complete Delivery (Triggers Impact Calculation!)
```bash
curl -X PUT http://localhost:5000/api/food/<FOOD_BATCH_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VOLUNTEER_TOKEN" \
  -d '{
    "status": "delivered",
    "coordinates": [80.2740, 13.0860]
  }'
```

**What Happens Automatically:**
1. ✅ Creates Distribution Record
2. ✅ Calculates CO2 saved (meals × 0.4kg × 2.5)
3. ✅ Updates Impact Metrics (total meals, CO2)
4. ✅ Updates Volunteer reliability score
5. ✅ Updates Donor trust score
6. ✅ Awards badges if milestones reached

**Check backend logs:**
```
Distribution record created for FoodBatch <id>
Impact updated: +25 meals, +25.00 kg CO2
Volunteer <id> reliability updated: 98.0% (Tier 1)
```

---

## 📊 Testing Admin Dashboard

### 10. Get System Analytics
```bash
curl http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "metrics": {
    "totalMealsSaved": 975,
    "totalCO2Reduced": 405,
    "donorsCount": 2,
    "volunteersCount": 3,
    "ngosCount": 1,
    "beneficiariesCount": 2
  },
  "activeDeliveries": 2,
  "urgentBatches": 1,
  "criticalBatches": 0,
  "totalDonors": 2,
  "totalVolunteers": 3,
  "totalNGOs": 1,
  "volunteerHours": 39,
  "methaneAvoided": "4.05"
}
```

### 11. Get Hall of Fame (Leaderboard)
```bash
curl http://localhost:5000/api/admin/leaderboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected:** Top 10 volunteers sorted by deliveries + reliability

### 12. Get Exception Alerts (RED-ZONE)
```bash
curl http://localhost:5000/api/admin/alerts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 13. Get Hunger Zone Heatmap
```bash
curl http://localhost:5000/api/admin/hunger-zones \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🏢 Testing NGO Features

### 14. Login as NGO
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ngo@hope.org",
    "password": "ngo123"
  }'
```

### 15. Approve a Donor
```bash
curl -X POST http://localhost:5000/api/ngo/approve/donor/<DONOR_USER_ID> \
  -H "Authorization: Bearer YOUR_NGO_TOKEN"
```

### 16. Approve a Volunteer
```bash
curl -X POST http://localhost:5000/api/ngo/approve/volunteer/<VOLUNTEER_USER_ID> \
  -H "Authorization: Bearer YOUR_NGO_TOKEN"
```

### 17. Monitor Local Deliveries (Geo-based)
```bash
curl http://localhost:5000/api/ngo/deliveries/local \
  -H "Authorization: Bearer YOUR_NGO_TOKEN"
```

### 18. Emergency Broadcast (3km radius)
```bash
curl -X POST http://localhost:5000/api/ngo/emergency/broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_NGO_TOKEN" \
  -d '{
    "foodBatchId": "<FOOD_BATCH_ID>",
    "radius": 3000
  }'
```

---

## 🤝 Testing Beneficiary Features

### 19. Login as Beneficiary
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "beneficiary1@community.org",
    "password": "beneficiary123"
  }'
```

### 20. Request Food Support
```bash
curl -X POST http://localhost:5000/api/beneficiary/request \
  -H "Authorization: Bearer YOUR_BENEFICIARY_TOKEN"
```

### 21. Track My Deliveries
```bash
curl http://localhost:5000/api/beneficiary/deliveries \
  -H "Authorization: Bearer YOUR_BENEFICIARY_TOKEN"
```

### 22. Submit Feedback
```bash
curl -X POST http://localhost:5000/api/beneficiary/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BENEFICIARY_TOKEN" \
  -d '{
    "foodBatchId": "<FOOD_BATCH_ID>",
    "rating": 5,
    "foodQuality": 5,
    "deliveryTime": 5,
    "volunteerBehavior": 5,
    "comments": "Excellent service, food was fresh!"
  }'
```

---

## 🏆 Testing Donor Impact Features

### 23. Get Donor Profile (Trust Badge)
```bash
curl http://localhost:5000/api/donor/profile \
  -H "Authorization: Bearer YOUR_DONOR_TOKEN"
```

**Expected Response:**
```json
{
  "user": "...",
  "organizationType": "restaurant",
  "totalDonations": 26,
  "successfulDeliveries": 24,
  "trustScore": 95.5,
  "badges": [
    { "name": "First Steps", "icon": "🌱" },
    { "name": "Committed Giver", "icon": "⭐" }
  ],
  "approvalStatus": "approved"
}
```

### 24. Get Donor Analytics
```bash
curl http://localhost:5000/api/donor/analytics \
  -H "Authorization: Bearer YOUR_DONOR_TOKEN"
```

### 25. Get AI Suggestions
```bash
curl http://localhost:5000/api/donor/suggestions \
  -H "Authorization: Bearer YOUR_DONOR_TOKEN"
```

**Expected:**
```json
{
  "suggestion": "Your donations are typically picked up within 15 minutes...",
  "avgPickupTime": "15 minutes"
}
```

---

## 🧪 Testing Auto-Reassignment

### 26. Create a Critical Batch
Create a batch with expiry < 2 hours

### 27. Simulate Volunteer Cancellation
```bash
curl -X PUT http://localhost:5000/api/volunteer/reject/<ASSIGNMENT_ID> \
  -H "Authorization: Bearer YOUR_VOLUNTEER_TOKEN"
```

**What Happens:**
1. ✅ Assignment marked as cancelled
2. ✅ FoodBatch reset to pending
3. ✅ Auto-triggers new assignment
4. ✅ Finds next best volunteer
5. ✅ Updates reliability score (downgrade)

---

## 📍 Testing Geo-Based Features

All geo queries use MongoDB's `$near` operator with 2dsphere indexing:

- Volunteer assignment → Finds nearest volunteer within radius
- NGO monitoring → Shows deliveries within operating radius
- Emergency broadcast → Notifies volunteers within 3km
- Hunger zones → Clusters beneficiary locations

**Coordinates Format:** `[longitude, latitude]`
**Example (Chennai):** `[80.2707, 13.0827]`

---

## ⚡ Testing Real-Time (Socket.IO)

### Socket Events Emitted:
1. **`new_task`** - When volunteer gets assigned
2. **`emergency_broadcast`** - When NGO activates emergency
3. **`delivery_update`** - When status changes

### Connect to Socket:
```javascript
import io from 'socket.io-client';
const socket = io('http://localhost:5000');
socket.emit('join_room', 'user_<USER_ID>');
socket.on('new_task', (data) => console.log('New task:', data));
```

---

## 🎯 Complete End-to-End Test Scenario

1. **Donor** creates urgent food batch → Auto-assigned to Tier-1 volunteer
2. **Volunteer** picks up → Updates status with GPS
3. **Volunteer** delivers → System auto-calculates impact
4. **Admin** sees updated metrics in dashboard
5. **Beneficiary** gives 5-star feedback
6. **Donor** sees trust score increase + badge earned
7. **Volunteer** sees reliability maintained at 98%+

---

## 🚨 Testing RED-ZONE Scenarios

### Critical Expiry (<2 hours)
- Only Tier-1 volunteers assigned
- 3km max distance for speed
- Admin gets alert

### No Available Volunteers
- System logs "No eligible volunteers found"
- Admin sees in alerts
- NGO can trigger emergency broadcast

### Volunteer Inactivity (10 mins)
- Background job auto-reassigns
- Original volunteer's tier may drop
- New volunteer notified

---

## 📝 Quick Test Checklist

✅ Authentication (all 5 roles)  
✅ Food batch creation → auto-assignment  
✅ Volunteer reliability scoring  
✅ Tier classification (1, 2, 3)  
✅ Delivery status updates  
✅ Impact calculation (meals, CO2)  
✅ Distribution record creation  
✅ Donor trust scores & badges  
✅ NGO approvals  
✅ Beneficiary feedback  
✅ Admin analytics  
✅ Hall of Fame leaderboard  
✅ Emergency broadcasts  
✅ Geo-based matching  
✅ Auto-reassignment  
✅ Real-time Socket.IO  

---

## 🎉 Success Indicators

Your system is working if you see:

1. **Backend logs show**: Auto-assignment complete
2. **Volunteer stats update** after every assignment
3. **Impact metrics increase** after delivery
4. **Donor trust score changes** based on outcomes
5. **Tier classification** affects assignment priority
6. **Socket.IO events** trigger on actions
7. **Geo queries** find nearest volunteers
8. **Admin dashboard** shows real-time data

---

**All features are PRODUCTION-READY and FULLY AUTOMATED! 🚀**
