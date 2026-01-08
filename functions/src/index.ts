import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import sgMail from "@sendgrid/mail";
import { defineSecret } from "firebase-functions/params";


const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
''
admin.initializeApp();
const db = admin.firestore();

// 1. Auth Trigger: Create User Document
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const {uid, email, displayName} = user;
  await db.collection("users").doc(uid).set({
    uid,
    email,
    displayName: displayName || "New User",
    role: null, // Will be set during role selection
    verificationStatus: "unverified",
    profileCompleted: false,
    personalEmail: email,
    verificationMethod: "none",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

// 2. Student Email Verification: Send Email
export const sendStudentVerificationEmail =
  functions
    .runWith({ secrets: [SENDGRID_API_KEY] })
    .https.onCall(async (data, context) => {

    console.log("Received data:", JSON.stringify(data));
    console.log("Context auth:", context.auth?.uid);
    
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Auth required"
      );
    }

    const {email} = data;
    
    const userId = context.auth.uid;

    // Validate email domain
    if (!email.endsWith("@mvgrce.edu.in")) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid college email domain"
      );
    }

    // Check rate limit (max 3 per hour)
    const oneHourAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 60 * 60 * 1000)
    );
    const recentTokens = await db.collection("verificationTokens")
      .where("userId", "==", userId)
      .where("createdAt", ">", oneHourAgo)
      .get();

    if (recentTokens.size >= 3) {
      const rateLimitMsg =
        "Too many verification emails sent. " +
        "Try again later.";
      throw new functions.https.HttpsError(
        "resource-exhausted",
        rateLimitMsg
      );
    }

    // Generate secure token
    const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

    const expiry = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    ); // 24 hours

    // Store token
    await db.collection("verificationTokens").doc(token).set({
      userId,
      email,
      token,
      used: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: expiry,
    });

    // Fetch user's display name
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const displayName = userData?.displayName || "Student";

    // Send email using SendGrid
    try {
      // Validation before sending
      if (!email || typeof email !== 'string') {
        throw new Error('Invalid recipient email');
      }
      if (!displayName || typeof displayName !== 'string') {
        throw new Error('Invalid display name
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      console.log('Setting SendGrid API key...');
      sgMail.setApiKey(SENDGRID_API_KEY.value());

      const verificationLink = `https://69515b291d20c70d0be6c7b3--qconnectmvgr.netlify.app/verify/email-confirm?token=${token}`;
      console.log('Verification link:', verificationLink);

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - QConnect MVGR</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background-color: #007bff;
              color: #ffffff;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
              text-align: center;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #28a745;
              color: #ffffff;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer {
              padding: 20px;
              text-align: center;
              color: #666666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>QConnect MVGR</h1>
            </div>
            <div class="content">
              <h2>Hello ${displayName},</h2>
              <p>Welcome to QConnect MVGR! Please verify your college email address to complete your registration.</p>
              <a href="${verificationLink}" class="button">Verify Email</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p><a href="${verificationLink}">${verificationLink}</a></p>
              <p><strong>This link will expire in 24 hours.</strong></p>
            </div>
            <div class="footer">
              <p>If you didn't request this verification, please ignore this email.</p>
              <p>&copy; 2023 QConnect MVGR. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Hello ${displayName},

        Welcome to QConnect MVGR! Please verify your college email address to complete your registration.

        Verify your email: ${verificationLink}

        This link will expire in 24 hours.

        If you didn't request this verification, please ignore this email.

        © 2023 QConnect MVGR. All rights reserved.
      `.trim();

      // Validate content is not empty
      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new Error('HTML content is empty');
      }
      if (!textContent || textContent.trim().length === 0) {
        throw new Error('Text content is empty');
      }

      console.log('Sending email with params:', {
        to: email,
        from: "noreply.qconnect01@gmail.com",
        subject: "Verify Your Email - QConnect MVGR",
        htmlLength: htmlContent.length,
        textLength: textContent.length
      });

      const emailPayload = {
        to: email,
        from: "noreply.qconnect01@gmail.com",
        subject: "Verify Your Email - QConnect MVGR",
        html: htmlContent,
        text: textContent,
      };

      console.log('Email payload structure:', JSON.stringify(emailPayload, null, 2));

      const sendResult = await sgMail.send(emailPayload);

      console.log('SendGrid send result:', sendResult);

      // Update user document
      await db.collection("users").doc(userId).update({
        collegeEmail: email,
        verificationStatus: "pending",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "Verification email sent",
        token: token,
      };
    } catch (error: any) {
        console.log("SendGrid Error Details:");
        console.log("Full error object:", JSON.stringify(error, null, 2));
        console.log("Error message:", error?.message);
        console.log("Error code:", error?.code);
        console.log("Response body:", JSON.stringify(error?.response?.body, null, 2));
        console.log("Response headers:", JSON.stringify(error?.response?.headers, null, 2));
        console.log("Stack trace:", error?.stack);

        throw new functions.https.HttpsError(
          "internal",
          `Failed to send email: ${error?.message || "Unknown error"}`
        );
      }
  });

// 3. Student Email Verification: Verify Token
export const verifyStudentEmail =
  functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Auth required"
      );
    }

    const {token} = data;
    const userId = context.auth.uid;

    console.log(`[verifyStudentEmail] invoked by user=${userId} token=${token}`);

    try {
      // Get token document
      const tokenDoc = await db.collection("verificationTokens").doc(token).get();
      if (!tokenDoc.exists) {
        console.log(`[verifyStudentEmail] token doc not found for token=${token}`);
        throw new functions.https.HttpsError(
          "not-found",
          "Invalid verification token"
        );
      }

      const tokenData = tokenDoc.data();
      if (!tokenData) {
        console.log(`[verifyStudentEmail] token data missing for token=${token}`);
        throw new functions.https.HttpsError(
          "not-found",
          "Invalid verification token"
        );
      }

      const tokenInvalid =
        tokenData.used ||
        tokenData.userId !== userId ||
        tokenData.expiresAt.toDate() < new Date();

      if (tokenInvalid) {
        console.log(`[verifyStudentEmail] token invalid for token=${token} user=${userId}`, tokenData);
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Token is invalid or expired"
        );
      }

      // Mark token as used
      await db.collection("verificationTokens").doc(token).update({ used: true });

      // Update user
      await db.collection("users").doc(userId).update({
        verificationStatus: "verified",
        collegeEmail: tokenData.email,
        verificationMethod: "auto",
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[verifyStudentEmail] success for user=${userId} token=${token}`);
      return { success: true };
    } catch (err) {
      console.error(`[verifyStudentEmail] error for user=${userId} token=${token}`, err);
      throw err;
    }
  });

// 4. Manual Verification: Submit Request
export const submitVerificationRequest =
  functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Auth required"
      );
    }

    const userId = context.auth.uid;
    const {role, ...submittedData} = data;

    // Validate role
    const validRoles = ["alumni", "recruiter"];
    if (!validRoles.includes(role)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid role"
      );
    }

    // Check if request already exists
    const existingRequest = await db
      .collection("verificationRequests")
      .doc(userId)
      .get();
    if (existingRequest.exists) {
      const alreadyMsg = "Verification request already submitted";
      throw new functions.https.HttpsError(
        "already-exists",
        alreadyMsg
      );
    }

    // Create request
    await db.collection("verificationRequests").doc(userId).set({
      userId,
      role,
      status: "pending",
      submittedData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notify admins (in production, send email or push notification)
    const reqLog =
    `New verification request: ${userId} -> ` +
    `${role}`;
    console.log(reqLog);

    return {success: true, requestId: userId};
  });

// 5. Verification: Approve
export const approveVerification =
  functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Auth required"
      );
    }

    // Check if admin
    const adminDoc = await db.collection("users").doc(context.auth.uid).get();
    if (adminDoc.data()?.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Must be admin"
      );
    }

    const {userId} = data;

    const batch = db.batch();

    // Update User
    batch.update(db.collection("users").doc(userId), {
      verificationStatus: "verified",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update Request
    batch.update(db.collection("verificationRequests").doc(userId), {
      status: "approved",
      reviewedBy: context.auth.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log
    const logRef = db.collection("adminLogs").doc();
    batch.set(logRef, {
      adminId: context.auth.uid,
      action: "approve_verification",
      targetUserId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
    return {success: true};
  });

// 6. Verification: Reject
export const rejectVerification =
  functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Auth required"
      );
    }

    // Check if admin
    const adminDoc = await db.collection("users").doc(context.auth.uid).get();
    if (adminDoc.data()?.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Must be admin"
      );
    }

    const {userId, reason} = data;

    const batch = db.batch();

    // Update Request
    batch.update(db.collection("verificationRequests").doc(userId), {
      status: "rejected",
      reviewedBy: context.auth.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      rejectionReason: reason,
    });

    // Log
    const logRef = db.collection("adminLogs").doc();
    batch.set(logRef, {
      adminId: context.auth.uid,
      action: "reject_verification",
      targetUserId: userId,
      reason,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
    return {success: true};
  });

// 7. Engagement: Toggle Like Answer
export const toggleLike = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Auth required"
    );
  }

  const {questionId, answerId} = data;
  const uid = context.auth.uid;

  // Validate that IDs are not empty
  if (!questionId || !answerId) {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with a valid questionId and answerId.");
  }

  const answerRef = admin.firestore().doc(`questions/${questionId}/answers/${answerId}`);
  const userLikeRef = answerRef.collection("likes").doc(uid);

  return await admin.firestore().runTransaction(async (transaction) => {
    const likeDoc = await transaction.get(userLikeRef);

    if (likeDoc.exists) {
      // UNLIKE: Remove record and decrement
      transaction.delete(userLikeRef);
      transaction.update(answerRef, {
        likeCount: admin.firestore.FieldValue.increment(-1)
      });
      return { status: 'unliked' };
    } else {
      // LIKE: Add record and increment
      transaction.set(userLikeRef, { createdAt: admin.firestore.FieldValue.serverTimestamp() });
      transaction.update(answerRef, {
        likeCount: admin.firestore.FieldValue.increment(1)
      });
      return { status: 'liked' };
    }
  });
});

// 8. Engagement: Update Question Status on Answer
export const onAnswerCreate = functions.firestore
  .document("questions/{questionId}/answers/{answerId}")
  .onCreate(async (snap, context) => {
    const {questionId} = context.params;

    // Update question status to 'answered' and increment count
    await db.collection("questions").doc(questionId).update({
      status: "answered",
      answerCount: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
