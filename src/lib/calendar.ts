import { gapi } from 'gapi-script';

const CLIENT_ID = 'ai-calendar-assistant-454106';  // Substitua pelo CLIENT_ID correto
const API_KEY = 'AIzaSyDMcVMryMOe4o2oCzSWMmIkdzvNhWngaAk';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInited = false;
let gisInited = false;

export const initializeGoogleCalendar = () => {
  gapi.load('client', initializeGapiClient);
  loadGoogleIdentityServices();
};

async function initializeGapiClient() {
  try {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
  } catch (err) {
    console.error('Erro ao inicializar o gapi client:', err);
  }
}

function loadGoogleIdentityServices() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        gapi.client.setToken(tokenResponse);
        document.dispatchEvent(new Event('auth-success'));
      } else {
        console.error('Falha ao obter token de acesso.');
      }
    },
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.dispatchEvent(new Event('gapi-loaded'));
  }
}

export const handleAuthClick = () => {
  if (!tokenClient) {
    console.error('Token Client não inicializado');
    return;
  }
  tokenClient.requestAccessToken();
};

export const handleSignoutClick = () => {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token, () => {
      gapi.client.setToken(null);
      console.log('Usuário desconectado');
    });
  }
};

export const listUpcomingEvents = async () => {
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime',
    });

    return response.result.items;
  } catch (err) {
    console.error('Erro ao buscar eventos do calendário:', err);
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
    console.error('Erro ao criar evento no calendário:', err);
    throw err;
  }

