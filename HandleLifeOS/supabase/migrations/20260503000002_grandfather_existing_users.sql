-- Grandfather all existing users as email-verified.
-- Run ONCE immediately after deploying the email verification feature.
-- Users who were already in the DB before this deployment are trusted and
-- should not be forced through the new verification gate.
-- New signups from this point forward start with email_verified = false
-- and must click the verification link before accessing the app.

UPDATE users
SET email_verified = true
WHERE email_verified = false;
