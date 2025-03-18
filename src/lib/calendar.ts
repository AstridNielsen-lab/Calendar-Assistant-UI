import { gapi } from 'gapi-script';

const CLIENT_ID = 'YOUR_CLIENT_ID';
const API_KEY = 'YOUR_API_KEY';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';

let tokenClient: google.accounts.oauth2.TokenClient;
let gapiInited = false;
let gisInited = false;

export const initializeGoogleCalendar = () => {
  gapi.load('client', initializeGapiClient);
};

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.dispatchEvent(new Event('gapi-loaded'));
  }
}

export const handleAuthClick = () => {
  tokenClient.requestAccessToken();
};

export const handleSignoutClick = () => {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
  }
};

export const listUpcomingEvents = async () => {
  try {
    const response = await gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime',
    });

    return response.result.items;
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    throw err;
  }
};

export const createEvent = async (summary: string, description: string, startDateTime: Date, endDateTime: Date) => {
  try {
    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return response.result;
  } catch (err) {
    console.error('Error creating calendar event:', err);
    throw err;
  }
};
