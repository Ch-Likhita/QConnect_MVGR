import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

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
  functions.https.onCall(async (data, context) => {
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

    // Send email (using Firebase Auth email service)

    try {
    // Note: In production, use a proper email service like SendGrid
    // or Firebase Extensions (or another transactional provider)
    // For now, we'll simulate sending the email
      const sentMsg = `Verification email sent to ${email} with token ${token}`;
      console.log(sentMsg);

      return {
        success: true,
        message: "Verification email sent",
        token: token,
      };
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send verification email"
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

// 7. Engagement: Like Answer
export const likeAnswer = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Auth required"
    );
  }
  const {questionId, answerId} = data;

  // In production, maintain a 'likes' subcollection to prevent duplicates
  // Here we just increment
  await db
    .collection("questions")
    .doc(questionId)
    .collection("answers")
    .doc(answerId)
    .update({
      likeCount: admin.firestore.FieldValue.increment(1),
    });

  return {success: true};
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
