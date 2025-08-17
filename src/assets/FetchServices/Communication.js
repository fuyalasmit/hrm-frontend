const baseUrl = require("./BaseUrl.json");
const withCredentials = require("./withCredentials.json");

module.exports = {
  // Send mass email
  sendMassEmail: async (emailData) => {
    try {
      const response = await fetch(`${baseUrl.value}/api/mass-email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
        credentials: withCredentials.credentials,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error sending mass email:", error);
      throw error;
    }
  },

  // Fetch email history
  fetchEmailHistory: async () => {
    try {
      const response = await fetch(`${baseUrl.value}/api/mass-email/history`, {
        method: "GET",
        credentials: withCredentials.credentials,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error("Error fetching email history:", error);
      throw error;
    }
  },

  // Fetch specific email details
  fetchEmailDetails: async (emailId) => {
    try {
      const response = await fetch(`${baseUrl.value}/api/mass-email/${emailId}`, {
        method: "GET",
        credentials: withCredentials.credentials,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Error fetching email details:", error);
      throw error;
    }
  },
};
