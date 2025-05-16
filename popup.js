document.addEventListener('DOMContentLoaded', function() {
  const accessTokenInput = document.getElementById('accessToken');
  const fetchProfileBtn = document.getElementById('fetchProfileBtn');
  const profileInfoDiv = document.getElementById('profileInfo');

  // Load saved token if any
  chrome.storage.local.get(['accessToken'], function(result) {
    if (result.accessToken) {
      accessTokenInput.value = result.accessToken;
    }
  });

  fetchProfileBtn.addEventListener('click', function() {
    const token = accessTokenInput.value.trim();
    // Ensure this is the correct URL for your local backend
    const backendUrl = 'http://localhost:8080/api/auth/profile';

    if (!token) {
      profileInfoDiv.textContent = 'Please enter an access token.';
      return;
    }

    // Save the token
    chrome.storage.local.set({accessToken: token}, function() {
      console.log('Access token saved.');
    });

    profileInfoDiv.textContent = 'Fetching profile...';

    fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        // Try to get more specific error text if available from the response
        // This is a common pattern, but your backend might return errors differently
        return response.text().then(text => {
          let errorDetails = '';
          try {
            const errorJson = JSON.parse(text);
            errorDetails = errorJson.message || errorJson.error || JSON.stringify(errorJson);
          } catch (e) {
            errorDetails = text;
          }
          throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
        });
      }
      return response.json();
    })
    .then(data => {
      profileInfoDiv.textContent = JSON.stringify(data, null, 2);
    })
    .catch(error => {
      profileInfoDiv.textContent = `Error: ${error.message}`;
      console.error('Error fetching profile:', error);
    });
  });
});
