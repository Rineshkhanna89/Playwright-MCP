# Leaftaps Login Functionality Test Plan

## Application Overview

Black-box test plan for the Leaftaps login page at https://leaftaps.com/opentaps/control/main. The observed login UI has heading "Leaftaps Login", textboxes labeled "Username" and "Password", and a "Login" button. The username input is type=text; password is type=password; both are not marked required at HTML level. The form submits via POST to /opentaps/control/login. Observed responses: empty both shows "The Following Errors Occurred:" plus "username was empty reenter" and "password was empty reenter"; empty username alone shows "username was empty reenter"; empty password alone shows "password was empty reenter"; a non-existent username with a non-empty password shows "following error occurred during login: User not found." Enter in the password field submits the form. A common demo account was found disabled during inspection, so no successful login or landing page was observed. Supply an active authorized test account and confirm the expected landing page baseline before executing the positive and mixed-validity credential cases. To reduce shared-environment risk, use a dedicated test account for bad-password attempts and do not repeat invalid-password attempts in a way that can trigger account lockout. Scenarios assume independent fresh signed-out browser state; no application data should be created or changed.

## Test Scenarios

### 1. Login Functionality

**Seed:** `tests/seed.spec.ts`

#### 1.1. LTF-001 Verify login page loads successfully

**File:** `tests/leaftaps-login/ltf-001-login-page-loads.spec.ts`

**Steps:**
  1. Start from a fresh signed-out browser context and navigate to https://leaftaps.com/opentaps/control/main.
    - expect: The page loads successfully and displays the heading "Leaftaps Login".
  2. Inspect the visible login form without submitting it.
    - expect: A textbox labeled "Username", a textbox labeled "Password", and a button labeled "Login" are visible and usable.

#### 1.2. LTF-002 Verify login with valid username and password

**File:** `tests/leaftaps-login/ltf-002-valid-login.spec.ts`

**Steps:**
  1. Precondition: obtain an active, unlocked, authorized test username and its valid password; do not use the currently disabled shared demo account. Start from a fresh signed-out browser context at the login URL.
    - expect: The login page is displayed and no prior authenticated session is present.
  2. Enter the valid username in the Username textbox and the matching password in the Password textbox, then activate Login.
    - expect: Authentication succeeds and the application displays its authenticated experience rather than a login error.

#### 1.3. LTF-003 Verify invalid username with valid password

**File:** `tests/leaftaps-login/ltf-003-invalid-username-valid-password.spec.ts`

**Steps:**
  1. Start from a fresh signed-out browser context. Use a known active test credential's password with a deliberately non-existent username; do not use a real user's username.
    - expect: The test data cannot authenticate a user.
  2. Enter the non-existent username and the known test password, then activate Login.
    - expect: Login is rejected, an actionable user-facing error is displayed, and the user remains unauthenticated on the login flow. Do not require a password-specific message unless the environment has a documented stable message.

#### 1.4. LTF-004 Verify valid username with invalid password

**File:** `tests/leaftaps-login/ltf-004-valid-username-invalid-password.spec.ts`

**Steps:**
  1. Precondition: use a dedicated active test account that may safely incur a failed login and whose lockout policy is known. Start from a fresh signed-out browser context.
    - expect: The account is active and not locked before the test.
  2. Enter the valid test username and one deliberately incorrect password, then activate Login once.
    - expect: Login is rejected, an error is shown, and the user remains unauthenticated. Avoid repeated retries that could lock the account.

#### 1.5. LTF-005 Verify invalid username and invalid password

**File:** `tests/leaftaps-login/ltf-005-invalid-credentials.spec.ts`

**Steps:**
  1. Start from a fresh signed-out browser context. Use a unique non-existent username and an arbitrary non-empty probe password that are not real credentials.
    - expect: The test data cannot authenticate a user.
  2. Enter both values and activate Login.
    - expect: The login page remains available and displays a failure message. Inspection observed "following error occurred during login: User not found." for this case; assert that exact message only if it remains stable in the target environment.

#### 1.6. LTF-006 Verify empty username and password

**File:** `tests/leaftaps-login/ltf-006-both-fields-empty.spec.ts`

**Steps:**
  1. Start from a fresh signed-out browser context and leave both textboxes empty.
    - expect: Both fields are empty before submission.
  2. Activate Login.
    - expect: The login page displays "The Following Errors Occurred:", "username was empty reenter", and "password was empty reenter". The user remains unauthenticated.

#### 1.7. LTF-007 Verify empty username

**File:** `tests/leaftaps-login/ltf-007-empty-username.spec.ts`

**Steps:**
  1. Start from a fresh signed-out browser context. Leave Username empty and enter a harmless non-empty probe value in Password.
    - expect: Username is empty and Password is non-empty before submission.
  2. Activate Login.
    - expect: The login page displays "username was empty reenter" and the user remains unauthenticated.

#### 1.8. LTF-008 Verify empty password

**File:** `tests/leaftaps-login/ltf-008-empty-password.spec.ts`

**Steps:**
  1. Start from a fresh signed-out browser context. Enter a non-existent probe username and leave Password empty.
    - expect: Username is non-empty and Password is empty before submission.
  2. Activate Login.
    - expect: The login page displays "password was empty reenter" and the user remains unauthenticated.

#### 1.9. LTF-009 Verify successful login reaches the expected landing page

**File:** `tests/leaftaps-login/ltf-009-success-landing-page.spec.ts`

**Steps:**
  1. Precondition: confirm the expected authenticated landing page URL/title or stable page heading with the application owner, and obtain an active authorized test account. Start from a fresh signed-out browser context at the login URL.
    - expect: The pre-login page is the Leaftaps login page.
  2. Enter the active test account credentials and activate Login.
    - expect: The browser navigates to the approved authenticated landing page and its expected stable heading or primary navigation is visible. No login error is displayed. Capture the actual URL/title baseline during the first authorized successful run; it could not be verified during inspection because the available demo account was disabled.

#### 1.10. LTF-010 Verify user-facing errors on unsuccessful login

**File:** `tests/leaftaps-login/ltf-010-login-error-messages.spec.ts`

**Steps:**
  1. Start from a fresh signed-out browser context and enter a non-existent username with a non-empty arbitrary password.
    - expect: The inputs contain the probe values and no authenticated state is present.
  2. Activate Login and inspect the error region above the form.
    - expect: A visible error heading "The Following Errors Occurred:" and the observed message "following error occurred during login: User not found." are displayed. The login controls remain available for correction, and no authenticated page is shown.

#### 1.11. LTF-011 Verify password masking

**File:** `tests/leaftaps-login/ltf-011-password-masking.spec.ts`

**Steps:**
  1. Start from a fresh signed-out browser context and enter a harmless probe string into Password without submitting the form.
    - expect: The Password textbox accepts input and its characters are visually masked; the entered string is not displayed as readable text. Inspection confirmed the control uses password input semantics.
  2. Inspect the username and password controls while the probe value remains entered.
    - expect: Username remains a plain-text textbox and Password remains masked. No authentication request is required for this check.

#### 1.12. LTF-012 Verify Enter-key form submission

**File:** `tests/leaftaps-login/ltf-012-enter-key-submission.spec.ts`

**Steps:**
  1. Start from a fresh signed-out browser context. Enter a unique non-existent username and an arbitrary non-empty probe password.
    - expect: Both fields contain probe data and no real account is targeted.
  2. Focus the Password textbox and press Enter.
    - expect: The form submits without requiring a click on Login. Inspection confirmed Enter submits the form; the resulting response is an unauthenticated login failure, not a successful sign-in.
