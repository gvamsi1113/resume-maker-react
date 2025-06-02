// webapp_auth_listener.js

console.log("ResumeBuilder Auth Listener Script Injected and Active on localhost:3000");

/**
 * Sends the found authentication token to the extension's background script.
 * @param {string} token The JWT access token.
 */
function sendTokenToExtension(token) {
  if (token) {
    chrome.runtime.sendMessage({
      action: "storeAuthToken", // This action name will be handled by background.js
      token: token,
      source: "webapp_auth_listener"
    }, response => {
      if (chrome.runtime.lastError) {
        console.error("WebAppAuthListener: Error sending token to background script:", chrome.runtime.lastError.message);
      } else if (response && response.status === "success") {
        console.log("WebAppAuthListener: Auth token successfully sent to background script.");
      } else {
        console.warn("WebAppAuthListener: Background script may not have received token properly, response:", response);
      }
    });
  } else {
    console.log("WebAppAuthListener: No token provided to sendTokenToExtension function.");
  }
}

/**
 * Checks localStorage for the access token and sends it if found.
 */
function checkForAndSendToken() {
  const accessTokenKey = "access_token"; // CORRECT KEY based on your useAuth.ts

  const accessToken = localStorage.getItem(accessTokenKey);

  if (accessToken) {
    console.log(`WebAppAuthListener: Access token found in localStorage (key: ${accessTokenKey}).`);
    sendTokenToExtension(accessToken);
  } else {
    console.log(`WebAppAuthListener: Access token NOT found in localStorage (key: ${accessTokenKey}). User might not be logged in.`);
  }
}

// --- Main Execution ---

// 1. Initial check when the script loads
checkForAndSendToken();

// 2. Listen for Custom Events from your Web App
// In extension/public/webapp_auth_listener.js
window.addEventListener('myWebAppAuthSuccess', (event) => {
    console.log("WebAppAuthListener: 'myWebAppAuthSuccess' event DETECTED. Event source:", event.detail?.source);
    const tokenFromEvent = event.detail?.token; // Get token directly from event
    if (tokenFromEvent) {
      console.log("WebAppAuthListener: Token found in event.detail from myWebAppAuthSuccess.");
      sendTokenToExtension(tokenFromEvent, "event_myWebAppAuthSuccess_withToken"); // Pass it directly
    } else {
      console.warn("WebAppAuthListener: 'myWebAppAuthSuccess' event, but no token in event.detail. Fallback to localStorage check.");
      checkForAndSendToken("event_myWebAppAuthSuccess_fallback");
    }
});

window.addEventListener('myWebAppLogout', () => {
    console.log("WebAppAuthListener: 'myWebAppLogout' event detected.");
    chrome.runtime.sendMessage({
        action: "clearAuthToken",
        source: "webapp_auth_listener"
    }, response => {
        if (chrome.runtime.lastError) {
            console.error("WebAppAuthListener: Error sending clear token message:", chrome.runtime.lastError.message);
        } else {
            console.log("WebAppAuthListener: Clear token message sent to background script.");
        }
    });
});

console.log("WebAppAuthListener: Event listeners for login/logout and initial token check are set up.");