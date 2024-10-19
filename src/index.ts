import { App, AppInfo, AppSlide } from "tickerowl-app-base";

export default class HydrozenioApp implements App {
  getInfo(): AppInfo {
    return {
      id: "hydrozenio-app",
      name: "Hydrozen.io",
      description: "Show uptime status of Hydrozen.io monitors",
      version: 1,
      author: "Raghu Chinnannan",
      authorXUrl: "https://twitter.com/@raghuchinnannan",
      authorGitHubUrl: "https://github.com/raghuchinnannan",
    };
  }

  getSlides(): Record<string, AppSlide> {
    return {
      "uptime-monitor-status": {
        title: "Hydrozen.io Uptime Monitor Status",
        description: "Shows uptime status of a monitor",
        inputs: {
          "apiKey": {
            type: "text",
            label: "API Key",
            required: true,
            placeholder: "Enter your Hydrozen.io API Key. Ex: ca72c1bd69efcbe69456d3f59aa050ea",
          },
          "monitor-id": {
            type: "text",
            label: "Monitor ID",
            required: true,
            placeholder: "Enter your Uptime Monitor ID. Ex: 243",
          }
        },
        getData: async ({ inputs }) => {
          const monitor_id = inputs["monitor-id"];
          const apiKey = inputs["apiKey"];
          if (!apiKey.value.value || !monitor_id.value.value) {
            return {
              slides: [],
            };
          }

          try {
            const response = await fetch(
              `https://app.hydrozen.io/api/monitors/${monitor_id.value.value}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${apiKey.value.value}`,
              },
            }
            );

            if (!response.ok) {
              console.error(`HTTP error! status: ${response.status}`);
              console.error('Response:', await response.text());
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();

            if (!responseData || typeof responseData !== 'object' || !responseData.data) {
              throw new Error('Invalid data received from API');
            }

            const data = responseData.data;
            const monitorStatus = data.is_ok ? "UP" : "DOWN";

            // Format the target URL
            const formattedTarget = data.target
              .replace(/^https?:\/\//, '') // Remove http:// or https://
              .replace(/\/$/, '');         // Remove trailing slash

            return {
              slides: [
                {
                  type: "TEXT",
                  text: formattedTarget + " is " + monitorStatus + "! Uptime: " + `${data.uptime.toFixed(3)}%` + " Avg. Response Time: " + `${data.average_response_time.toFixed(2)} ms`,
                }
              ],
            };
          } catch (error) {
            console.error('Error fetching data:', error);
            return {
              slides: [
                {
                  type: "KEY_VALUE",
                  key: "Error",
                  value: "Failed to fetch monitor status",
                },
              ],
            };
          }
        },
      }
    };
  }
}