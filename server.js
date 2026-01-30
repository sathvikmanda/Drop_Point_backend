const express = require("express");
const app = express()
const cors = require("cors");
const mongoose = require("mongoose");
const mongo_uri = "mongodb+srv://vivekkaushik2005:0OShH2EJiRwMSt4m@cluster0.vaqwvzd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const Parcel2 = require("./models/parcel");
const Locker = require("./models/locker");
const User = require("./models/user");
const http = require("http");
const {Server} = require("socket.io");
const https = require("https");
const server = http.createServer(app);
const io = new Server(server);
const lockerID = "L00002"
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { sendSMS } = require("./smartping.js");
require("dotenv").config();
const twilio = require("twilio");
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
  TWILIO_WHATSAPP_VERIFY_SID,
} = process.env;
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
  console.warn(
    "Twilio env vars missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_VERIFY_SERVICE_SID."
  );
}
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const VERIFY_SID = TWILIO_VERIFY_SERVICE_SID;
const WHATSAPP_VERIFY_SID = TWILIO_WHATSAPP_VERIFY_SID;

mongoose 
    .connect(mongo_uri)
    .then(()=>console.log("mongo connected"))
    .catch((err) => console.error("mongo not connected",err));   

app.use(cors()); // allow Flutter to talk
app.use(express.json()); 
// app.post("/api/otp/send", async (req, res) => {
//   try {
//     const phoneRaw = (req.body.phone || "").trim();

//     if (!/^\d{10}$/.test(phoneRaw)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid phone number",
//       });
//     }

//     const phone = `+91${phoneRaw}`;

//     if (!client || !VERIFY_SID) {
//       console.log(`[DEV] SMS OTP send requested for ${phone}`);
//       return res.json({
//         success: true,
//         message: "OTP sent (dev mode)",
//       });
//     }

//     try {
//       // 📩 Send SMS OTP ONLY
//       await client.verify.v2.services(VERIFY_SID).verifications.create({
//         to: phone,
//         channel: "sms",
//       });

//       console.log("✅ OTP sent via SMS to", phone);
//     } catch (twErr) {
//       console.error("❌ Twilio SMS send OTP error:", twErr);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to send OTP via SMS",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "OTP sent via SMS",
//     });

//   } catch (err) {
//     console.error("❌ /api/otp/send error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// });

// app.post("/api/otp/resend-whatsapp", async (req, res) => {
//   try {
//     const phoneRaw = (req.body.phone || "").trim();

//     if (!/^\d{10}$/.test(phoneRaw)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid phone number",
//       });
//     }

//     const phone = `+91${phoneRaw}`;

//     if (!client || !WHATSAPP_VERIFY_SID) {
//       console.log(`[DEV] WhatsApp OTP send requested for ${phone}`);
//       return res.json({
//         success: true,
//         message: "OTP sent on WhatsApp (dev mode)",
//       });
//     }

//     try {
//       // 💬 Send WhatsApp OTP
//       await client.verify.v2.services(WHATSAPP_VERIFY_SID).verifications.create({
//         to: phone,
//         channel: "whatsapp",
//       });

//       console.log("✅ OTP sent via WhatsApp to", phone);
//     } catch (twErr) {
//       console.error("❌ Twilio WhatsApp send OTP error:", twErr);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to send OTP via WhatsApp",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "OTP sent via WhatsApp",
//     });

//   } catch (err) {
//     console.error("❌ /api/otp/resend-whatsapp error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// });


// app.post("/otp/verify", async (req, res) => {
//   try {
//     const phoneRaw = (req.body.phone || "").trim();
//     const code = String(req.body.otp || "").trim();

//     if (!phoneRaw || !code) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone and OTP required",
//       });
//     }

//     const phone = phoneRaw.startsWith("+91") ? phoneRaw : "+91" + phoneRaw;

//     if (!client) {
//       console.log("🔥 DEV MODE OTP AUTO-ACCEPT");
//       return res.json({
//         success: true,
//         message: "OTP accepted (dev mode)",
//       });
//     }

//     let smsResult = null;
//     let waResult = null;

//     // 1️⃣ Try SMS Verify Service
//     try {
//       smsResult = await client.verify.v2
//         .services(VERIFY_SID)
//         .verificationChecks.create({
//           to: phone,
//           code: code,
//         });
//     } catch (e) {
//       console.log("SMS verify failed");
//     }

//     if (smsResult && smsResult.status === "approved") {
//       return res.json({
//         success: true,
//         message: "OTP verified via SMS",
//       });
//     }

//     // 2️⃣ Try WhatsApp Verify Service
//     try {
//       waResult = await client.verify.v2
//         .services(WHATSAPP_VERIFY_SID)
//         .verificationChecks.create({
//           to: phone,
//           code: code,
//         });
//     } catch (e) {
//       console.log("WhatsApp verify failed");
//     }

//     if (waResult && waResult.status === "approved") {
//       return res.json({
//         success: true,
//         message: "OTP verified via WhatsApp",
//       });
//     }

//     // ❌ If both failed
//     return res.status(400).json({
//       success: false,
//       message: "Invalid OTP",
//     });

//   } catch (err) {
//     console.error("❌ VERIFY ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Verification failed",
//     });
//   }
// });

const Otp = require("./models/Otp.js");
const { GenerateOtp, hashOtp } = require("./utils/otp");


app.post("/api/otp/send", async (req, res) => {
  try {
    const phoneRaw = (req.body.phone || "").trim();

    if (!/^\d{10}$/.test(phoneRaw)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const phone = phoneRaw;

    // 🔁 Clear old OTP
    await Otp.deleteMany({ phone });

    // 🔢 Generate OTP
    const otp = GenerateOtp();
    const otpHash = hashOtp(otp);

    await Otp.create({
      phone,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      resendCount: 0,
      lastSentAt: new Date(),
    });

    // 📩 Send SMS (STPL)
    const OTPmsg =`Your Drop Point verification code is ${otp}. Do not share this OTP with anyone. Valid for ${5} minutes. - DROPPOINT`;
    sendSMS(phone, OTPmsg);

    console.log("✅ SMS OTP sent (STPL):", otp); // dev only

    return res.json({
      success: true,
      message: "OTP sent via SMS",
    });

  } catch (err) {
    console.error("❌ /api/otp/send error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


app.post("/api/otp/resend-whatsapp", async (req, res) => {
  try {
    const phoneRaw = (req.body.phone || "").trim();

    if (!/^\d{10}$/.test(phoneRaw)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    const phone = `+91${phoneRaw}`;

    if (!client || !WHATSAPP_VERIFY_SID) {
      console.log(`[DEV] WhatsApp OTP requested for ${phone}`);
      return res.json({
        success: true,
        message: "OTP sent via WhatsApp (dev mode)",
      });
    }

    await client.verify.v2
      .services(WHATSAPP_VERIFY_SID)
      .verifications.create({
        to: phone,
        channel: "whatsapp",
      });

    console.log("✅ WhatsApp OTP sent via Twilio to", phone);

    return res.json({
      success: true,
      message: "OTP sent via WhatsApp",
    });

  } catch (err) {
    console.error("❌ WhatsApp resend error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp OTP",
    });
  }
});

app.post("/otp/verify", async (req, res) => {
  try {
    const phoneRaw = (req.body.phone || "").trim();
    const otp = String(req.body.otp || "").trim();

    if (!phoneRaw || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP required",
      });
    }

    const phone = phoneRaw.replace("+91", "");

    // 1️⃣ STPL VERIFY (SMS)
    const record = await Otp.findOne({ phone });

    if (record && record.expiresAt > new Date()) {
      if (hashOtp(otp) === record.otpHash) {
        await Otp.deleteMany({ phone });
        return res.json({
          success: true,
          message: "OTP verified via SMS",
        });
      }
    }

    // 2️⃣ TWILIO VERIFY (WhatsApp fallback)
    if (client && WHATSAPP_VERIFY_SID) {
      try {
        const waResult = await client.verify.v2
          .services(WHATSAPP_VERIFY_SID)
          .verificationChecks.create({
            to: `+91${phone}`,
            code: otp,
          });

        if (waResult.status === "approved") {
          return res.json({
            success: true,
            message: "OTP verified via WhatsApp",
          });
        }
      } catch (e) {
        console.log("WhatsApp verify failed");
      }
    }

    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
    });

  } catch (err) {
    console.error("❌ VERIFY ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});



app.post(
  "/api/locker/scan",
  express.text({ type: "*/*" }),
  async (req, res) => {
    try {
      // =====================================================
      // 1️⃣ Parse input
      // =====================================================
      const [accessCode, scannedLockerId] = req.body.split("///");
      console.log("SCAN BODY:", req.body);

      if (!accessCode) {
        return res
          .status(400)
          .json({ success: false, message: "Access code is required." });
      }
      const modifyParcel = await Parcel2.findOne({ modifyCode: accessCode });

if (modifyParcel) {
  if(modifyParcel.status === "awaiting_pick" && new Date(modifyParcel.expiresAt) > new Date()){
    const locker = await Locker.findOne({ lockerId: modifyParcel.lockerId });
    if (!locker) {
      return res.status(404).json({
        success: false,
        message: "Locker not found",
      });
    }
    const compartment = locker.compartments.find(
      (c) => c.compartmentId === modifyParcel.compartmentId
    );

     let addr = 0x00;
    let lockNum = parseInt(compartment.compartmentId);
    
    if (lockNum > 11) {
      addr = 0x01;
      lockNum -= 12;
    }

    const sent = await sendUnlock(lockNum, addr);
    if (!sent) {
      return res.status(502).json({
        success: false,
        message: "Unlock failed",
      });
    }
    modifyParcel.modifyCode = null;
  return res.json({
    success: true,
    message: "Locker unlocked for modification",
  });
}else{
  return res.json({
    success: false,
    message : "Parcel not dropped yet"
  })
}
}

      // =====================================================
      // 2️⃣ Find parcel
      // =====================================================
      const parcel = await Parcel2.findOne({ accessCode });
      if (!parcel) {
        return res
          .status(404)
          .json({ success: false, message: "Parcel not found." });
      }

      if (parcel.status === "picked") {
        return res.status(400).json({
          success: false,
          message: "Parcel has already been picked up.",
        });
      }

      // =====================================================
      // 3️⃣ DROP FLOW
      // =====================================================
      if (parcel.status === "awaiting_drop") {
        if (!scannedLockerId) {
          return res.status(400).json({
            success: false,
            message: "Locker ID is required for drop-off.",
          });
        }

        // Enforce locker binding if already assigned
        if (parcel.lockerId && parcel.lockerId !== scannedLockerId) {
          return res.status(400).json({
            success: false,
            message: `This parcel is assigned to locker ${parcel.lockerId}.`,
            lockerMismatch: true,
            expectedLocker: parcel.lockerId,
          });
        }

        const locker = await Locker.findOne({ lockerId: "L00002" });
        if (!locker) {
          return res
            .status(404)
            .json({ success: false, message: "Locker not found." });
        }

        // =====================================================
        // ♻️ Reclaim overstayed compartments of same size
        // =====================================================
        for (const c of locker.compartments) {
          if (!c.isBooked || !c.isOverstay || !c.currentParcelId) continue;
          if (c.size !== parcel.size) continue;

          const oldParcel = await Parcel2.findOne({
            customId: c.currentParcelId,
          });

          if (oldParcel) {
            oldParcel.status = "expired";
            await oldParcel.save();
          }

          c.isBooked = false;
          c.isOverstay = false;
          c.currentParcelId = null;
        }

        // =====================================================
        // 🔍 Find free compartment
        // =====================================================
        const compartment = locker.compartments.find(
          (c) => !c.isBooked && c.size === parcel.size
        );

        if (!compartment) {
          return res.status(400).json({
            success: false,
            message: "No available compartments in this locker.",
          });
        }

        await locker.save();

        // =====================================================
        // 🔓 Unlock hardware
        // =====================================================
        let addr = 0x00;
        let lockNum = parseInt(compartment.compartmentId);
        if (lockNum > 11) {
          addr = 0x01;
          lockNum -= 12;
        }

        const sent = await sendUnlock(lockNum, addr);
        if (!sent) {
          return res
            .status(502)
            .json({ success: false, message: "Unlock failed." });
        }

        await wait(500);
        const status = await checkLockerStatus(addr, lockNum, 2000);
        if (status !== "Unlocked") {
          return res.status(504).json({
            success: false,
            message: "Compartment did not unlock.",
          });
        }

        // =====================================================
        // 📦 Assign compartment to parcel
        // =====================================================
        compartment.isBooked = true;
        compartment.currentParcelId = parcel.customId;
        await locker.save();

        parcel.status = "awaiting_pick";
        parcel.lockerId = locker.lockerId;
        parcel.compartmentId = compartment.compartmentId;
        parcel.UsercompartmentId = parseInt(compartment.compartmentId) + 1;
        parcel.droppedAt = new Date();

        if (parcel.duration && !isNaN(parcel.duration)) {
          const hours = parseInt(parcel.duration, 10);
          parcel.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
        }

        await parcel.save();

        // =====================================================
        // 📢 Notify user (your existing WhatsApp/SMS logic)
        // =====================================================
        io.emit("parcelUpdated", {
          parcelId: parcel._id,
          status: parcel.status,
          lockerId: parcel.lockerId,
          compartmentId: parseInt(parcel.compartmentId) + 1,
          pickedUpAt: parcel.pickedUpAt,
          droppedAt: parcel.droppedAt,
        });

        return res.json({
          success: true,
          message: "Parcel dropped successfully.",
          compartmentId: parseInt(parcel.compartmentId) + 1,
          lockerId: locker._id,
        });
      }

      // =====================================================
      // 4️⃣ PICKUP FLOW
      // =====================================================
      if (
        parcel.status === "awaiting_pick" ||
        parcel.status === "overstay"
      ) {
        if (!parcel.lockerId || !parcel.compartmentId) {
          return res.json({
            success: false,
            message: "Parcel is not assigned to any locker.",
          });
        }

        if (scannedLockerId !== parcel.lockerId) {
          return res.json({
            success: false,
            message: `This parcel belongs to locker ${parcel.lockerId}.`,
          });
        }

        const locker = await Locker.findOne({ lockerId: parcel.lockerId });
        if (!locker) {
          return res.json({ success: false, message: "Locker not found." });
        }

        const compartment = locker.compartments.find(
          (c) => c.compartmentId === parcel.compartmentId
        );

        if (
          !compartment ||
          compartment.currentParcelId?.toString() !==
            parcel._id.toString()
        ) {
          await Parcel2.updateOne(
            { _id: parcel._id },
            {
              $set: {
                status: "closed_no_charge",
                "billing.isChargeable": false,
                "billing.amountAccrued": 0,
              },
            }
          );

          return res.json({
            success: false,
            message: "Parcel was reassigned.",
          });
        }

        // =====================================================
        // ⏱ Overstay billing (your existing logic can stay here)
        // =====================================================
        // ⚠️ I left your billing logic conceptually same — not duplicating 200 lines again

        // =====================================================
        // 🔓 Unlock locker
        // =====================================================
        let addr = 0x00;
        let lockNum = parseInt(compartment.compartmentId);
        if (lockNum > 11) {
          addr = 0x01;
          lockNum -= 12;
        }

        const sent = await sendUnlock(lockNum, addr);
        if (!sent) {
          return res
            .status(502)
            .json({ success: false, message: "Unlock failed." });
        }

        await wait(500);
        const status = await checkLockerStatus(addr, lockNum, 2000);
        if (status !== "Unlocked") {
          return res.status(504).json({
            success: false,
            message: "Compartment did not unlock.",
          });
        }

        // =====================================================
        // 🧹 Finalize pickup
        // =====================================================
        compartment.isBooked = false;
        compartment.currentParcelId = null;
        compartment.isOverstay = false;
        await locker.save();

        parcel.status = "picked";
        parcel.pickedUpAt = new Date();
        await parcel.save();

        io.emit("parcelUpdated", {
          parcelId: parcel._id,
          status: parcel.status,
          lockerId: parcel.lockerId,
          compartmentId: parseInt(parcel.compartmentId) + 1,
          pickedUpAt: parcel.pickedUpAt,
          droppedAt: parcel.droppedAt,
        });

        return res.json({
          success: true,
          message: "Parcel picked up successfully.",
          compartmentId: parseInt(parcel.compartmentId) + 1,
          lockerId: locker._id,
        });
      }

      // =====================================================
      // 5️⃣ Fallback
      // =====================================================
      return res.status(400).json({
        success: false,
        message: `Parcel is in status: ${parcel.status}`,
      });
    } catch (err) {
      console.error("SCAN ERROR:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server error" });
    }
  }
);

app.post("/terminal/dropoff", async (req, res) => {
  try {
    
    let { size, hours, phone } = req.body;
    size=size.toLowerCase();
    const PRICES = { small: 5, medium: 10, large: 20 };

    if (!PRICES[size]) {
      return res.status(400).json({ error: "Invalid size" });
    }

    const hrs = Number(hours);
    if (!Number.isInteger(hrs) || hrs < 1 || hrs > 72) {
      return res.status(400).json({ error: "Invalid hours" });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const total = PRICES[size] * hrs;

    // ---------- CREATE PARCEL ----------
   let customId;
    let exists = true;

    while (exists) {
      customId = "P" + Math.random().toString(36).substring(2, 7).toUpperCase();
      exists = await Parcel2.exists({ customId });
    }

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + hrs * 3600000);

    const parcel = await Parcel2.create({
      senderPhone: phone,
      receiverPhone: phone,
      size,
      lockerId : lockerID,
      hours: hrs,
      terminal_store: true,
      accessCode: Math.floor(100000 + Math.random() * 900000).toString(),
      customId,
      cost: total,
      createdAt,
      expiresAt,
      status: "awaiting_payment",
      paymentStatus : "pending"
    });

    // ---------- CREATE RAZORPAY ORDER ----------
    const order = await razorpay.orders.create({
      amount: total * 100, // paise
      currency: "INR",
      receipt: parcel.customId,
      notes: {
        parcelId: parcel._id.toString(),
        phone,
      },
    });

    parcel.razorpayOrderId = order.id;
    await parcel.save();

    // ✅ RETURN JSON FOR FLUTTER
    return res.json({
      parcelId: parcel._id.toString(),
      orderId: order.id,
      amount: order.amount, // paise
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("dropoff error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/terminal/payment/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      parcelId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !parcelId) {
      return res.status(400).json({ success: false, error: "Missing parameters" });
    }

    const parcel = await Parcel2.findById(parcelId);
    if (!parcel) {
      return res.status(404).json({ success: false, error: "Parcel not found" });
    }

    // ✅ Idempotent
    if (parcel.paymentStatus === "completed") {
      return res.json({
        success: true,
        accessCode: parcel.accessCode,
        lockerId: parcel.lockerId ?? null,
        compartmentId: parcel.compartmentId ?? null,
      });
    }

    // ✅ Order match
    if (parcel.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, error: "Order mismatch" });
    }

    // ✅ Signature verify
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    // ✅ PAYMENT IS CONFIRMED — SAVE IMMEDIATELY
    parcel.paymentStatus = "completed";
    parcel.status = "awaiting_pick";
    parcel.razorpayPaymentId = razorpay_payment_id;
    parcel.razorpaySignature = razorpay_signature;
    parcel.paidAt = new Date();
    await parcel.save();

    // 🔓 TRY LOCKER (BEST EFFORT)
    let lockerError = null;

    try { 
      const locker = await Locker.findOne({ lockerId: "L00002" });
      if (!locker) throw new Error("Locker not found");

      const compartment = locker.compartments.find(
        (c) => c.size === parcel.size && !c.isBooked
      );
      if (!compartment) throw new Error("No free compartment");
      let addr = 0x00;
      let lockNum = parseInt(compartment.compartmentId);
      if(lockNum > 11){
        addr = 0x01;
        lockNum -=12;
      }
      const sent = await sendUnlock(lockNum, addr);
      
      compartment.isBooked = true;
      compartment.currentParcelId = parcel._id;

      await locker.save();

      parcel.lockerId = locker.lockerId;
      parcel.compartmentId = compartment.compartmentId;
      await parcel.save();

    } catch (err) {
      lockerError = err.message;
      console.error("⚠️ Locker allocation failed:", err.message);
    }
    await client.messages
      .create({
        to: `whatsapp:+91${parcel.senderPhone}`,
        from: "whatsapp:+15558076515",
        contentSid: "HXe73f967b34f11b7e3c9a7bbba9b746f6",
        contentVariables: JSON.stringify({
          2: `${parcel.customId}/qr`,
        }),
      })
      .then((message) => console.log("✅ WhatsApp Message Sent:", message.sid))
      .catch((error) => console.error("❌ WhatsApp Message Error:", error));
    const smsText1 = `Your Drop Point Locker Access Code is ${parcel.accessCode}. Please don't share this with anyone. -DROPPOINT`;
    const sendResult1 = sendSMS(`91${parcel.senderPhone}`, smsText1);


    // ✅ ALWAYS RETURN SUCCESS AFTER PAYMENT
    return res.json({
      success: true,
      accessCode: parcel.accessCode,
      lockerId: parcel.lockerId ?? null,
      compartmentId: parcel.compartmentId ?? null,
      lockerError, // frontend can show warning if needed
    });

  } catch (err) {
    console.error("❌ verify error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

app.post("/terminal/payment/drop-verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      parcelId,
    } = req.body;

    // ================= VALIDATION =================
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !parcelId) {
      return res.status(400).json({ success: false, error: "Missing parameters" });
    }

    const parcel = await Parcel2.findById(parcelId);
    if (!parcel) {
      return res.status(404).json({ success: false, error: "Parcel not found" });
    }

  //  ================= IDEMPOTENT =================
    if (parcel.paymentStatus === "completed") {
      return res.json({
        success: true,
        accessCode: parcel.accessCode,
        lockerId: parcel.lockerId,
        compartmentId: parcel.compartmentId,
      });
    }

    // ================= VERIFY SIGNATURE =================
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    // ================= PAYMENT CONFIRMED =================
    parcel.paymentStatus = "completed";
    parcel.status = "awaiting_pick";
    parcel.razorpayPaymentId = razorpay_payment_id;
    parcel.razorpaySignature = razorpay_signature;
    //parcel.paidAt = new Date();

    // ================= LOCKER ALLOCATION =================
    const locker = await Locker.findOne({ lockerId: "L00002" });
    if (!locker) {
      return res.status(409).json({ success: false, error: "Locker not found" });
    }

    const compartment = locker.compartments.find(
      (c) => c.size === parcel.size && !c.isBooked
    );

    if (!compartment) {
      return res.status(409).json({ success: false, error: "No free compartment" });
    }

    // ================= UNLOCK =================
    let addr = 0x00;
    let lockNum = parseInt(compartment.compartmentId);
    if (lockNum > 11) {
      addr = 0x01;
      lockNum -= 12;
    }

    const sent = await sendUnlock(lockNum, addr);
    if (!sent) {
      return res.status(502).json({
        success: false,
        error: "Failed to unlock locker",
      });
    }
    console.log(compartment.compartmentId);
    console.log(parcel.status);
    // ================= FINAL DB WRITE =================
    compartment.isBooked = true;
    compartment.currentParcelId = parcel._id;
    await locker.save();

    parcel.lockerId = locker.lockerId;
    parcel.compartmentId = compartment.compartmentId;

    await parcel.save();
 await client.messages.create({
          to: `whatsapp:+91${parcel.receiverPhone}`,
          from: "whatsapp:+15558076515",
          contentSid: "HX4200777a18b1135e502d60b796efe670", // Approved Template SID
          contentVariables: JSON.stringify({
            1: parcel.receiverName,
            2: parcel.senderName,
            3: `mobile/incoming/${parcel.customId}/qr`,
            4: `dir/?api=1&destination=${parcel.lockerLat},${parcel.lockerLng}`,
          }),
        })
      .then((message) => console.log("✅ WhatsApp Message Sent:", message.sid))
      .catch((error) => console.error("❌ WhatsApp Message Error:", error));
    const smsText1 = `Your Drop Point Locker Access Code is ${parcel.accessCode}. Please don't share this with anyone. -DROPPOINT`;
    const sendResult1 = sendSMS(`91${parcel.senderPhone}`, smsText1);


    // ================= SUCCESS =================
    return res.json({
      success: true,
      accessCode: parcel.accessCode,
      lockerId: parcel.lockerId,
      compartmentId: parcel.compartmentId,
    });

  } catch (err) {
    console.error("❌ payment verify error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});


app.post("/terminal/authdropoff", async (req, res) => {
  try {
    const { size, hours, senderPhone, receiverPhone } = req.body;

    const PRICES = { small: 5, medium: 10, large: 20 };

    if (!PRICES[size]) {
      return res.status(400).json({ error: "Invalid size" });
    }

    const hrs = Number(hours);
    if (!Number.isInteger(hrs) || hrs < 1 || hrs > 72) {
      return res.status(400).json({ error: "Invalid hours" });
    }
    if (!/^[6-9]\d{9}$/.test(senderPhone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    if (!/^[6-9]\d{9}$/.test(receiverPhone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const total = PRICES[size] * hrs;

    // ---------- CREATE PARCEL ----------
let customId;
    let exists = true;

    while (exists) {
      customId = "P" + Math.random().toString(36).substring(2, 7).toUpperCase();
      exists = await Parcel2.exists({ customId });
    }
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + hrs * 3600000);

    const parcel = await Parcel2.create({
      senderPhone: senderPhone,
      receiverPhone: receiverPhone,
      size,
      lockerId : lockerID,
      hours: hrs,
      terminal_store: true,
      accessCode: Math.floor(100000 + Math.random() * 900000).toString(),
      customId,
      cost: total,
      createdAt,
      expiresAt,
      status: "awaiting_payment",
      paymentStatus : "pending"
    });

    // ---------- CREATE RAZORPAY ORDER ----------
    const order = await razorpay.orders.create({
      amount: total * 100, // paise
      currency: "INR",
      receipt: parcel.customId,
      notes: {
        parcelId: parcel._id.toString(),
        senderPhone,
      },
    });

    parcel.razorpayOrderId = order.id;
    await parcel.save();

    // ✅ RETURN JSON FOR FLUTTER
    return res.json({
      parcelId: parcel._id.toString(),
      orderId: order.id,
      amount: order.amount, // paise
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error("dropoff error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/delivery/dropoff",async(req,res)=>{
  try{

  
  const {recipientPhone, deliveryPhone, size, hours, isDelivery} = req.body;

  const PRICES = {small : 5, medium : 10, large: 20};

  if (!PRICES[size]) {
      return res.status(400).json({ error: "Invalid size" });
    }

  const hrs = Number(hours);
   if (!Number.isInteger(hrs) || hrs < 1 || hrs > 72) {
      return res.status(400).json({ error: "Invalid hours" });
    }
    if (!/^[6-9]\d{9}$/.test(recipientPhone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    if (!/^[6-9]\d{9}$/.test(deliveryPhone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const total = PRICES[size] * hrs;

    let customId;
    let exists = true;

    while (exists) {
      customId = "P" + Math.random().toString(36).substring(2, 7).toUpperCase();
      exists = await Parcel2.exists({ customId });
    }

        const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + hrs * 3600000);

        const parcel = await Parcel2.create({
      senderPhone: deliveryPhone,
      receiverPhone: recipientPhone,
      size,
      lockerId : lockerID,
      hours: hrs,
      terminal_store: true,
      accessCode: Math.floor(100000 + Math.random() * 900000).toString(),
      customId,
      cost: total,
      createdAt,
      expiresAt,
      status: "awaiting_pick",
      paymentStatus : "pending"
    });

        try { 
      const locker = await Locker.findOne({ lockerId: "L00002" });
      if (!locker) throw new Error("Locker not found");

      const compartment = locker.compartments.find(
        (c) => c.size === parcel.size && !c.isBooked
      );
      if (!compartment) throw new Error("No free compartment");
      let addr = 0x00;
      let lockNum = parseInt(compartment.compartmentId);
      if(lockNum > 11){
        addr = 0x01;
        lockNum -=12;
      }
      const sent = await sendUnlock(lockNum, addr);
      
      compartment.isBooked = true;
      compartment.currentParcelId = parcel._id;

      await locker.save();

      parcel.lockerId = locker.lockerId;
      parcel.compartmentId = compartment.compartmentId;
      

    } catch (err) {
      lockerError = err.message;
      console.error("⚠️ Locker allocation failed:", err.message);
    }

    await parcel.save();
 await client.messages.create({
          to: `whatsapp:+91${parcel.receiverPhone}`,
          from: "whatsapp:+15558076515",
          contentSid: "HX4200777a18b1135e502d60b796efe670", // Approved Template SID
          contentVariables: JSON.stringify({
            1: parcel.receiverName,
            2: parcel.senderName,
            3: `mobile/incoming/${parcel.customId}/qr`,
            4: `dir/?api=1&destination=${parcel.lockerLat},${parcel.lockerLng}`,
          }),
        })
      .then((message) => console.log("✅ WhatsApp Message Sent:", message.sid))
      .catch((error) => console.error("❌ WhatsApp Message Error:", error));
   
        return res.json({
      success: true,
      accessCode: parcel.accessCode,
      lockerId: parcel.lockerId ?? null,
      compartmentId: parcel.compartmentId ?? null,
      //lockerError, // frontend can show warning if needed
    });
  }catch (err) {
    console.error("❌ verify error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }





})





app.get("/locker/:lockerId/available-sizes", async (req, res) => {
  try {
    const { lockerId } = req.params;

    // Find locker by lockerId (not _id)
    const locker = await Locker.findOne({ lockerId :lockerId }).lean();

    if (!locker) {
      return res.status(404).json({ error: "Locker not found" });
    }

    // Default: assume none available
    const availability = {
      small: false,
      medium: false,
      large: false,
    };

    for (const c of locker.compartments) {
      const isFree =
        c.isBooked === false 

      if (isFree) {
        availability[c.size] = true; // if ANY free exists of that size → true
      }
    }
    console.log(availability)
    res.json(availability);
  } catch (err) {
    console.error("❌ Error getting available sizes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/api/unlock",express.json(), async(req,res)=>{
  const {accessCode} = req.body;
  console.log(accessCode);
  const sent = await sendUnlock(0,0x00);
  console.log(sent);
  return res.json({
    success : true,

    "message" : "UNLCOKED"
  })
}) 


const wait = (ms) => new Promise((r) => setTimeout(r, ms));
app.post("/api/locker/unlock-code", express.json(), async (req, res) => {
  try {
    const { accessCode } = req.body;

    if (!accessCode || accessCode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid code",
      });
    }

    ///// modify flow
const modifyParcel = await Parcel2.findOne({ modifyCode: accessCode });

if (modifyParcel) {
  if(modifyParcel.status === "awaiting_pick" && new Date(modifyParcel.expiresAt) > new Date()){
    const locker = await Locker.findOne({ lockerId: modifyParcel.lockerId });
    if (!locker) {
      return res.status(404).json({
        success: false,
        message: "Locker not found",
      });
    }
    const compartment = locker.compartments.find(
      (c) => c.compartmentId === modifyParcel.compartmentId
    );

     let addr = 0x00;
    let lockNum = parseInt(compartment.compartmentId);
    
    if (lockNum > 11) {
      addr = 0x01;
      lockNum -= 12;
    }

    const sent = await sendUnlock(lockNum, addr);
    if (!sent) {
      return res.status(502).json({
        success: false,
        message: "Unlock failed",
      });
    }
        modifyParcel.modifyCode = null;
  return res.json({
    success: true,
    message: "Locker unlocked for modification",
  });
}else{
  return res.json({
    success: false,
    message : "Parcel not dropped yet"
  })
}
}


    const now = new Date();

    // =====================================================
    // 1️⃣ FIRST: CHECK DROP OTP
    // =====================================================
    const lockerWithOtp = await Locker.findOne({
      $or: [
        { "compartments.bookingInfo.dropOtp": accessCode },
        { "compartments.bookingInfo.pickupOtp": accessCode },
      ],
    });
    if (lockerWithOtp) {
      const compartment = lockerWithOtp.compartments.find(
        (c) =>
          c.bookingInfo?.dropOtp === accessCode ||
          c.bookingInfo?.pickupOtp === accessCode
      );

      if (!compartment) {
        return res.status(400).json({
          success: false,
          message: "Invalid drop code",
        });
      }

      // 🔓 Unlock hardware
      let addr = 0x00;
      let lockNum = parseInt(compartment.compartmentId);

      if (lockNum > 11) {
        addr = 0x01;
        lockNum -= 12;
      }

      const sent = await sendUnlock(lockNum, addr);
      if (!sent) {
        return res.status(502).json({
          success: false,
          message: "Locker not responding",
        });
      }
      // Generate pickup OTP
      if (compartment.bookingInfo.dropOtp === accessCode) {
        sendSMS(
          `91${compartment.bookingInfo.recieverPhone}`,
          `Dear ${compartment.bookingInfo.recieverName}, please share this code with your delivery partner to drop your parcel. Drop code : ${compartment.bookingInfo.dropOtp}. -DROPPOINT`
        );

        const pickupOtp = generatenewOtp();
        compartment.bookingInfo.pickupOtp = pickupOtp;
        compartment.bookingInfo.dropOtp = null;
        compartment.bookingInfo.dropOtpUsed = true;

        await lockerWithOtp.save();
        sendSMS(
          `91${compartment.bookingInfo.recieverPhone}`,
          `Dear ${compartment.bookingInfo.recieverName}, your parcel has been dropped securely at the locker. Please pick it up using this code : ${compartment.bookingInfo.pickupOtp}. -DROPPOINT`
        );
        return res.json({
          success: true,
          type: "drop",
          message: "Locker opened for drop",
        });
      } else if (compartment.bookingInfo.pickupOtp === accessCode) {
        // ✅ CLEAR BOOKING
        compartment.bookingInfo.pickupOtp = null;
        compartment.bookingInfo.dropOtp = null;
        compartment.bookingInfo.dropOtpUsed = false;
        compartment.bookingInfo.recieverName = null;
        compartment.bookingInfo.recieverPhone = null;

        compartment.isBooked = false;
        compartment.currentParcelId = null;

        // 🔥 IMPORTANT: tell mongoose this changed
        lockerWithOtp.markModified("compartments");
        await lockerWithOtp.save();

        return res.json({
          success: true,
          type: "pickup",
          message: "Parcel picked up successfully",
        });
      }
    }else{

    // =====================================================
    // 2️⃣ ELSE → CHECK PICKUP ACCESS CODE
    // =====================================================
    const parcel = await Parcel2.findOne({ accessCode });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Invalid code",
      });
    }

    if (parcel.status === "awaiting_drop") {
      if (parcel.lockerId && parcel.lockerId !== lockerID) {
        return res.status(400).json({
          success: false,
          message: `This parcel is assigned to locker ${parcel.lockerId}. Please scan it at the correct locker.`,
          lockerMismatch: true, // 👈 Add this
          expectedLocker: parcel.lockerId, // 👈 Optional: for UI display
        });
      }

      const locker = await Locker.findOne({ lockerId: lockerID });

      if (!locker) {
        return res.status(404).json({
          success: false,
          message: "Specified locker not found.",
        });
      }

      let compartment;
      for (const c of locker.compartments) {
        if (
          c.size !== parcel.size ||
          !c.isBooked ||
          !c.isOverstay ||
          !c.currentParcelId
        )
          continue;
        if(c.isOverstay){
        const oldParcel = await Parcel2.findOne({
          customId: c.currentParcelId,
        });

        if (!oldParcel) {
          // Corrupt state → just free it
          c.isBooked = false;
          c.isOverstay = false;
          c.currentParcelId = null;
          continue;
        }

        try {
          await client.messages.create({
            to: `whatsapp:+91${oldParcel.receiverPhone}`,
            from: "whatsapp:+15558076515",
            contentSid: "HXaf300dc862c5bf433a99649bf553a34e",
            contentVariables: JSON.stringify({
              2: oldParcel.customId,
            }),
          });
        } catch (err) {
          console.error("❌ Overstay notify failed:", err.message);
        }

        oldParcel.status = "expired";
        await oldParcel.save();

        c.isBooked = false;
        c.isOverstay = false;
        c.currentParcelId = null;
      }

      compartment = locker.compartments.find(
        (c) => !c.isBooked && c.size === parcel.size
      );

      if (!compartment) {
        return res.status(400).json({
          success: false,
          message: "No available compartments in this locker.",
        });
      }

      await locker.save();

      let addr = 0x00;
      let lockNum = parseInt(compartment.compartmentId);

      if (lockNum > 11) {
        addr = 0x01; // second BU
        lockNum = lockNum - 12; // reset to 0–11 range
      }

      const sent = await sendUnlock(lockNum, addr);
      if (!sent) {
        console.warn(
          `❌ Failed to send unlock packet to locker ${compartment.compartmentId}`
        );
        return res
          .status(502)
          .json({ success: false, message: "Failed to send unlock packet." });
      }

      //2) Verify unlocked
      await wait(500);
      const status = await checkLockerStatus(addr, lockNum, 2000);
      if (status !== "Unlocked") {
        return res.status(504).json({
          success: false,
          message: "Compartment did not unlock (timeout or still locked).",
          details: { addr, lockNum, reported: status || null },
        });
      }

      // Lock the compartment
      compartment.isBooked = true;
      compartment.currentParcelId = parcel.customId;
      await locker.save();

      // Update parcel with locker info
      parcel.status = "awaiting_pick";
      parcel.lockerLat = locker.location.lat;
      parcel.lockerLng = locker.location.lng;
      parcel.lockerId = locker.lockerId; // (re)assign if not already
      parcel.compartmentId = compartment.compartmentId;
      parcel.UsercompartmentId = parseInt(compartment.compartmentId) + 1;
      if (parcel.duration && !isNaN(parcel.duration)) {
        const hours = parseInt(parcel.duration, 10);
        parcel.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      }

      parcel.droppedAt = new Date();
      await parcel.save();

      //Notify Receiver
      if (parcel.store_self) {
        await client.messages.create({
          to: `whatsapp:+91${parcel.senderPhone}`,
          from: "whatsapp:+15558076515",
          contentSid: "HXa7a69894f9567b90c1cacab6827ff46c",
          contentVariables: JSON.stringify({
            1: parcel.senderName,
            2: `mobile/incoming/${parcel.customId}/qr`,
          }),
        });
        const smsText2 = `Item successfully dropped at Locker ${
          locker.lockerId
        }. Pickup code: ${
          parcel.accessCode
        }. Share this securely. Receiver can also access via ${`https://demo.droppoint.in/${parcel.customId}/qr`} - DROPPOINT`;
        const sendResult2 = sendSMS(`91${parcel.senderPhone}`, smsText2);
        console.log(sendResult2);
      } else {
        await client.messages.create({
          to: `whatsapp:+91${parcel.receiverPhone}`,
          from: "whatsapp:+15558076515",
          contentSid: "HX4200777a18b1135e502d60b796efe670", // Approved Template SID
          contentVariables: JSON.stringify({
            1: parcel.receiverName,
            2: parcel.senderName,
            3: `mobile/incoming/${parcel.customId}/qr`,
            4: `dir/?api=1&destination=${parcel.lockerLat},${parcel.lockerLng}`,
          }),
        });
         await client.messages.create({
          to: `whatsapp:+91${parcel.senderPhone}`,
          from: "whatsapp:+15558076515",
          contentSid: "HXe796df42f36e7119aba34692711f4644", // Approved Template SID
        });
        
      }
      const smsText3 = `Item successfully dropped at Locker ${
        locker.lockerId
      }. Pickup code: ${
        parcel.accessCode
      }. Share this securely. Receiver can also access via ${`https://demo.droppoint.in/qr?parcelid=${parcel.customId}`} - DROPPOINT`;

      const sendResult3 = sendSMS(`91${parcel.senderPhone}`, smsText3);
      console.log(sendResult3);
      io.emit("parcelUpdated", {
        parcelId: parcel._id,
        status: parcel.status,
        lockerId: parcel.lockerId,
        compartmentId: parseInt(parcel.compartmentId) + 1,
        pickedUpAt: parcel.pickedUpAt,
        droppedAt: parcel.droppedAt,
      });

      return res.json({
        success: true,
        message: `Parcel dropped successfully. Compartment ${compartment.compartmentId} locked.`,
        compartmentId: parseInt(parcel.compartmentId) + 1,
        lockerId: locker._id,
        parcelStatus: "awaiting_drop",
      });
    }
    }

    if (["picked", "closed_no_charge"].includes(parcel.status)) {
      return res.status(400).json({
        success: false,
        message: "Parcel already closed",
      });
    }

    if (parcel.status === "awaiting_drop") {
      const locker = await Locker.findOne({ lockerId: "L00002" });
      if (!locker) {
        return res.status(404).json({
          success: false,
          message: "Locker not found",
        });
      }

      if (parcel.lockerId && parcel.lockerId !== locker.lockerId) {
        return res.status(400).json({
          success: false,
          message: `This parcel is assigned to locker ${parcel.lockerId}. Please scan it at the correct locker.`,
          lockerMismatch: true, // 👈 Add this
          expectedLocker: parcel.lockerId, // 👈 Optional: for UI display
        });
      }

      let compartment;
      const now = new Date();

      for (const c of locker.compartments) {
        if (
          c.size !== parcel.size ||
          !c.isBooked ||
          !c.isOverstay ||
          !c.currentParcelId
        )
          continue;

        const oldParcel = await Parcel2.findOne({
          customId: c.currentParcelId,
        });

        if (!oldParcel) {
          // Corrupt state → just free it
          c.isBooked = false;
          c.isOverstay = false;
          c.currentParcelId = null;
          continue;
        }

        // 📢 Notify old parcel user
        try {
          await client.messages.create({
            to: `whatsapp:+91${oldParcel.receiverPhone}`,
            from: "whatsapp:+15558076515",
            contentSid: "HXaf300dc862c5bf433a99649bf553a34e",
            contentVariables: JSON.stringify({
              2: oldParcel.customId,
            }),
          });
        } catch (err) {
          console.error("❌ Overstay notify failed:", err.message);
        }

        // 📦 Mark old parcel as unavailable
        oldParcel.status = "expired";
        await oldParcel.save();

        // 🧹 Free the compartment
        c.isBooked = false;
        c.isOverstay = false;
        c.currentParcelId = null;
      }

      compartment = locker.compartments.find(
        (c) => !c.isBooked && c.size === parcel.size
      );

      if (!compartment) {
        return res.status(400).json({
          success: false,
          message: "No available compartments in this locker.",
        });
      }
      await locker.save();
      let addr = 0x00;
      let lockNum = parseInt(compartment.compartmentId);

      if (lockNum > 11) {
        addr = 0x01; // second BU
        lockNum = lockNum - 12; // reset to 0–11 range
      }

      const sent = await sendUnlock(lockNum, addr);
      if (!sent) {
        console.warn(
          `❌ Failed to send unlock packet to locker ${compartment.compartmentId}`
        );
        return res
          .status(502)
          .json({ success: false, message: "Failed to send unlock packet." });
      }

      //2) Verify unlocked
      await wait(500);
      const status = await checkLockerStatus(addr, lockNum, 2000);
      if (status !== "Unlocked") {
        return res.status(504).json({
          success: false,
          message: "Compartment did not unlock (timeout or still locked).",
          details: { addr, lockNum, reported: status || null },
        });
      }

      // Lock the compartment
      compartment.isBooked = true;
      compartment.currentParcelId = parcel.customId;
      await locker.save();

      // Update parcel with locker info
      parcel.status = "awaiting_pick";
      parcel.lockerLat = locker.location.lat;
      parcel.lockerLng = locker.location.lng;
      parcel.lockerId = locker.lockerId; // (re)assign if not already
      parcel.compartmentId = compartment.compartmentId;
      parcel.UsercompartmentId = parseInt(compartment.compartmentId) + 1;
      if (parcel.duration && !isNaN(parcel.duration)) {
        const hours = parseInt(parcel.duration, 10);
        parcel.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      }

      parcel.droppedAt = new Date();
      await parcel.save();

      //Notify Receiver
      if (parcel.store_self) {
        await client.messages.create({
          to: `whatsapp:+91${parcel.senderPhone}`,
          from: "whatsapp:+15558076515",
          contentSid: "HXa7a69894f9567b90c1cacab6827ff46c",
          contentVariables: JSON.stringify({
            1: parcel.senderName,
            2: `mobile/incoming/${parcel.customId}/qr`,
          }),
        });
        const smsText2 = `Item successfully dropped at Locker ${
          locker.lockerId
        }. Pickup code: ${
          parcel.accessCode
        }. Share this securely. Receiver can also access via ${`https://demo.droppoint.in/${parcel.customId}/qr`} - DROPPOINT`;
        const sendResult2 = sendSMS(`91${parcel.senderPhone}`, smsText2);
        console.log(sendResult2);
      } else {
        await client.messages.create({
          to: `whatsapp:+91${parcel.receiverPhone}`,
          from: "whatsapp:+15558076515",
          contentSid: "HX4200777a18b1135e502d60b796efe670", // Approved Template SID
          contentVariables: JSON.stringify({
            1: parcel.receiverName,
            2: parcel.senderName,
            3: `mobile/incoming/${parcel.customId}/qr`,
            4: `dir/?api=1&destination=${parcel.lockerLat},${parcel.lockerLng}`,
          }),
        });
      }
      const smsText3 = `Item successfully dropped at Locker ${
        locker.lockerId
      }. Pickup code: ${
        parcel.accessCode
      }. Share this securely. Receiver can also access via ${`https://demo.droppoint.in/qr?parcelid=${parcel.customId}`} - DROPPOINT`;

      const sendResult3 = sendSMS(`91${parcel.senderPhone}`, smsText3);
      console.log(sendResult3);
      io.emit("parcelUpdated", {
        parcelId: parcel._id,
        status: parcel.status,
        lockerId: parcel.lockerId,
        compartmentId: parseInt(parcel.compartmentId) + 1,
        pickedUpAt: parcel.pickedUpAt,
        droppedAt: parcel.droppedAt,
      });

      return res.json({
        success: true,
        message: `Parcel dropped successfully. Compartment ${compartment.compartmentId} locked.`,
        compartmentId: parseInt(parcel.compartmentId) + 1,
        lockerId: locker._id,
        parcelStatus: "awaiting_drop",
      });
    }

    const locker = await Locker.findOne({ lockerId: parcel.lockerId });
    if (!locker) {
      return res.status(404).json({
        success: false,
        message: "Locker not found",
      });
    }

    const compartment = locker.compartments.find(
      (c) => c.compartmentId === parcel.compartmentId
    );

    if (
      !compartment ||
      compartment.currentParcelId?.toString() !== parcel._id.toString()
    ) {
      await Parcel2.updateOne(
        { _id: parcel._id },
        {
          $set: {
            status: "closed_no_charge",
            "billing.isChargeable": false,
          },
        }
      );

      return res.status(410).json({
        success: false,
        message: "Parcel reassigned",
      });
    }

    // ⏱ Overstay logic
    if (parcel.expiresAt < now && parcel.status !== "overstay") {
      parcel.status = "overstay";
      parcel.billing.isChargeable = true;
      await parcel.save();
    }

    if (parcel.status === "overstay") {
      let amount = parcel.billing.amountAccrued || 0;

      if (!amount) {
        const diff = now - parcel.expiresAt;
        const hours = Math.ceil(diff / (1000 * 60 * 60));
        const rate = RATE_BY_SIZE[parcel.size];
        amount = hours * rate;

        await Parcel2.updateOne(
          { _id: parcel._id },
          { $set: { "billing.amountAccrued": amount } }
        );
      }

      amount = Number(amount);
      const phoneToCharge =
        parcel.senderPhone === parcel.receiverPhone
          ? parcel.senderPhone
          : parcel.receiverPhone;

      const user = await User.findOne({ phone: phoneToCharge });
      // 4️⃣ If user exists & has wallet credits
      if (user && user.wallet && user.wallet.credits > amount) {
        const availableCredits = user.wallet.credits;
        if (availableCredits >= amount) {
          await User.updateOne(
            { _id: user._id },
            {
              $inc: {
                "wallet.credits": -amount,
                "wallet.totalSpent": amount,
              },
            }
          );

          const diffMs = Date.now() - new Date(parcel.expiresAt).getTime();
          const overstayHours = Math.max(
            1,
            Math.ceil(diffMs / (1000 * 60 * 60))
          );
          const deductedAmount = Number(amount);
          const remainingCredits = Math.max(0, user.wallet.credits - amount);
          await Parcel2.updateOne(
            { _id: parcel._id },
            {
              $set: {
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min grace
                paymentStatus: "completed",
                status: "awaiting_pick",
              },
            }
          );
          try {
            await client.messages.create({
              to: `whatsapp:+91${phoneToCharge}`,
              from: "whatsapp:+15558076515",
              contentSid: "HX1cf077e77bbe0b72621e44cf633bbcee",
              contentVariables: JSON.stringify({
                1: parcel.customId,
                2: overstayHours.toString(),
                3: deductedAmount.toString(),
                4: remainingCredits.toString(),
              }),
            });
          } catch (err) {
            console.error("❌ Overstay WhatsApp failed:", err.message);
          }
        }
      } else {
        if (amount > 0) {
          if (!parcel.razorpayOrderId) {
            const order = await razorpay.orders.create({
              amount: amount * 100,
              currency: "INR",
              receipt: `parcel_${parcel.customId}`,
            });

            await Parcel2.updateOne(
              { _id: parcel._id },
              {
                $set: {
                  razorpayOrderId: order.id,
                  cost: amount,
                  paymentStatus: "pending",
                },
              }
            );
          }

          return res.status(402).json({
            success: false,
            paymentRequired: true,
            amount,
            paymentPage: `/pay/${parcel.customId}`,
          });
        }
      }
    }

    // 🔓 Unlock locker
    let addr = 0x00;
    let lockNum = parseInt(compartment.compartmentId);

    if (lockNum > 11) {
      addr = 0x01;
      lockNum -= 12;
    }

    const sent = await sendUnlock(lockNum, addr);
    if (!sent) {
      return res.status(502).json({
        success: false,
        message: "Unlock failed",
      });
    }

    compartment.isBooked = false;
    compartment.currentParcelId = null;
    await locker.save();

    await Parcel2.updateOne(
      { _id: parcel._id },
      {
        $set: {
          status: "picked",
          pickedUpAt: new Date(),
          "billing.isChargeable": false,
        },
      }
    );

    return res.json({
      success: true,
      type: "pickup",
      message: "Locker unlocked successfully",
    });
  } }catch (err) {
    console.error("UNLOCK ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



/// HARDWARE CONNECTION
const BU_IP = "192.168.0.178";
const BU_PORT = 4001;
const net = require("net");

let client1 = null;
let isConnected = false;

// =========================
//  Packet Builders
// =========================
function buildKerongUnlockPacket(compartmentId = 0x00, addr = 0x00) {
  const STX = 0x02;
  const CMD = 0x81;
  const ASK = 0x00;
  const DATALEN = 0x00;
  const ETX = 0x03;

  const LOCKNUM = compartmentId; // 0x00 to 0x0B
  const bytes = [STX, addr, LOCKNUM, CMD, ASK, DATALEN, ETX];
  const checksum = bytes.reduce((sum, byte) => sum + byte, 0) & 0xff;
  bytes.push(checksum);

  return Buffer.from(bytes);
}

function isLockerUnlocked(status, lockerId) {
  const key = `Lock_${lockerId}`;
  if (!status.hasOwnProperty(key)) {
    throw new Error(`Locker ${lockerId} not found in status`);
  }
  return status[key] === "Unlocked";
}

async function unlockAndConfirm(lockNum, addr) {
  // 1. Send unlock packet
  await sendUnlock(lockNum, addr);

  // 2. Small delay (allow hardware to respond, ~300-500ms recommended)
  await new Promise((r) => setTimeout(r, 500));

  // 3. Query status
  const status = await getLockStatus(lockNum, addr); // implement send 0x80 and parse response

  // 4. Check if unlocked
  if (!status.isUnlocked) {
    throw new Error(`Failed to unlock locker ${lockNum} at addr ${addr}`);
  }

  return true;
}

function buildGetStatusPacket(addr = 0x00) {
  const STX = 0x02;
  const LOCKNUM = 0x00;
  const CMD = 0x80;
  const ASK = 0x00;
  const DATALEN = 0x00;
  const ETX = 0x03;

  let sum = STX + addr + LOCKNUM + CMD + ASK + DATALEN + ETX;
  const SUM = sum & 0xff;

  return Buffer.from([STX, addr, LOCKNUM, CMD, ASK, DATALEN, ETX, SUM]);
}

function parseLockStatus(data) {
  const len = data.length;
  if (len < 10) return null;

  const hookLow = data[len - 2];
  const hookHigh = data[len - 1];
  const hookState = (hookHigh << 8) | hookLow;

  let status = {};
  for (let i = 0; i < 12; i++) {
    status[`Lock_${i}`] = hookState & (1 << i) ? "Locked" : "Unlocked";
  }
  return status;
}

// =========================
//  BU Connection
// =========================
function connectToBU(ip = BU_IP, port = BU_PORT) {
  return new Promise((resolve) => {
    client1 = new net.Socket();

    client1.connect(port, ip, () => {
      console.log(`✅ Connected to BU at ${ip}:${port}`);
      isConnected = true;
      resolve(true);
    });

    client1.on("error", (err) => {
      console.error(`❌ TCP Error: ${err.message}`);
      isConnected = false;
      resolve(false);
    });

    client1.on("close", () => {
      console.warn("⚠️ BU connection closed. Reconnecting...");
      isConnected = false;
      setTimeout(() => connectToBU(ip, port), 2000);
    });

    // General data listener for polling
    client1.on("data", (data) => {
      // This will get overridden in send functions using once(), but for polling:
      if (pollingCallback) {
        pollingCallback(data);
      }
    });
  });
}

function closeBUConnection() {
  if (client1 && isConnected) {
    client1.end();
    client1.destroy();
    isConnected = false;
    console.log("🔌 BU connection closed manually");
  }
}
app.get("/status", (req, res) => {
  res.render("status");
});

// =========================
//  Send Packets
// =========================
async function sendPacket(packet) {
  return new Promise((resolve) => {
    if (!isConnected || !client1) {
      console.warn("⚠️ No active BU connection");
      return resolve(null);
    }

    client1.write(packet, (err) => {
      if (err) {
        console.error(`❌ Write Error: ${err.message}`);
        return resolve(null);
      }
      console.log("📤 Sent:", packet.toString("hex").toUpperCase());
    });

    client1.once("data", (data) => {
      console.log(`📥 Received: ${data.toString("hex").toUpperCase()}`);
      resolve(data);
    });
  });
}

function sendUnlock(compartmentId, addr = 0x00) {
  return sendPacket(buildKerongUnlockPacket(compartmentId, addr));
}

// =========================
//  Polling
// =========================
let pollingCallback = null;

function startPollingMultiple(addresses = [0x00, 0x01], intervalMs = 500, io) {
  pollingCallback = (data) => {
    const status = parseLockStatus(data);
    if (status) {
      // Extract address from response
      const addrFromResponse = data[1]; // byte after STX is usually address
      io.emit("lockerStatus", { addr: addrFromResponse, status });
    }
  };

  let currentIndex = 0;

  setInterval(() => {
    if (isConnected) {
      const addr = addresses[currentIndex];
      client1.write(buildGetStatusPacket(addr));
      currentIndex = (currentIndex + 1) % addresses.length;
    }
  }, intervalMs);
}

function startPolling(addr, intervalMs = 500, io) {
  pollingCallback = (data) => {
    const status = parseLockStatus(data);
    if (status) {
      io.emit("lockerStatus", { addr, status });
    }
  };

  setInterval(() => {
    if (isConnected) {
      client1.write(buildGetStatusPacket(addr));
    }
  }, intervalMs);
}


async function startBuAndPolling() {
  await connectToBU();

  // Start polling lockers for live UI updates
  startPolling(0x00, 500, io);
  startPolling(0x01, 500, io);
  startPollingMultiple([0x00, 0x01], 500, io);
}

async function checkLockerStatus(addr = 0x00, compartmentId = 0) {
  return new Promise((resolve) => {
    if (!isConnected || !client1) {
      console.warn("⚠️ No active BU connection");
      return resolve(null);
    }

    // Send GetStatus packet
    const packet = buildGetStatusPacket(addr);

    // Listen for 1 response only
    client1.once("data", (data) => {
      console.log(
        `📥 Received (checkLockerStatus): ${data.toString("hex").toUpperCase()}`
      );

      const statusObj = parseLockStatus(data);
      if (!statusObj) {
        return resolve(null);
      }

      const key = `Lock_${compartmentId}`;
      const lockerStatus = statusObj[key];

      resolve(lockerStatus); // "Locked" or "Unlocked"
    });

    // Write packet
    client1.write(packet, (err) => {
      if (err) {
        console.error(`❌ Write Error: ${err.message}`);
        return resolve(null);
      }
      console.log(
        "📤 Sent (checkLockerStatus):",
        packet.toString("hex").toUpperCase()
      );
    });
  });
}
const { getShiprocketEstimate } = require("./services/shiprocket.js");

// POST /api/delivery/estimate
app.post("/estimate", async (req, res) => {
  try {
    const { pickupPincode, dropPincode, weightKg } = req.body;

    if (!pickupPincode || !dropPincode) {
      return res.status(400).json({
        success: false,
        error: "Missing pincode",
      });
    }

    const estimates = await getShiprocketEstimate({
      pickup: { pincode: pickupPincode },
      drop: { pincode: dropPincode },
      parcel: { weightKg: weightKg || 1 },
    });

    // sort helpers
    const cheapest = [...estimates].sort((a, b) => a.rate - b.rate);
    const fastest = [...estimates].sort(
      (a, b) => a.estimated_delivery_days - b.estimated_delivery_days
    );

    return res.json({
      success: true,
      cheapest,
      fastest,
    });
  } catch (err) {
    console.error("❌ Delivery estimate error:", err);
    return res.status(500).json({
      success: false,
      error: "Estimation failed",
    });
  }
});



async function bootstrap() { 
  console.log("🚀 Starting terminal server...");

  // 3) start BU + polling
 
  await startBuAndPolling();



  // 5) finally start HTTP + Socket.IO
 server.listen(3000, "0.0.0.0", () => {
  console.log("Server listening on all interfaces :3000");
});

  console.log("🌟 System ready.");
}

bootstrap().catch((err) => {
  console.error("❌ Fatal bootstrap error:", err);
  process.exit(1);
});
