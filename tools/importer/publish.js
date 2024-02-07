const CLIENT_ID = '204479105294-618u79bfg204c268td71s1vduj0mg75g.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCztsh8bcQtyUft-EJKfJS7lmszT1jrECE';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

let tokenClient;
let drive = null;
let gapiInited = false;
let gisInited = false;
let authenticated = false

/**
 *  Sign in the user upon button click.
 */
function driveAuth() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        } else {
            document.querySelector('.publish-btn').removeAttribute('disabled');
            document.querySelector('.file-scan-btn').removeAttribute('disabled');
            drive = gapi.client.drive;
            authenticated = true;
        }
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({prompt: ''});
    }
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeAuth() {
    if (gapiInited && gisInited) {
        driveAuth();
    }
}
    
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeAuth();
}

function gapiLoaded() {
    // console.log('gapi loaded');
    gapi.load('client', initializeGapiClient);
}

function gisLoaded() {
    // console.log('gis loaded');
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeAuth();
}

function authCheck() {
    if (!authenticated) {
        alert("Refresh page to access Google Drive.");
    }
    return authenticated;
}

async function scanFiles(folderId, callback, deep = false, path = '') {
    if (!authCheck()) return;
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`, 
            fields: "files(id, name, mimeType, size, parents)"
        });
        let files = (response.data) ? response.data.files : response.result.files;
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const currentPath = (path.length > 0) ? (path==='/' ? `/${files[i].name}` : `${path}/${files[i].name}`) : `${files[i].name}`
                if (files[i].mimeType === 'application/vnd.google-apps.folder') {
                    if (deep) {
                        await this.scanFiles(files[i].id, callback, deep, currentPath);
                    }
                } else {
                    await callback(files[i], currentPath);
                }
            }
        }
    } catch (e) {
        console.log(`unable to list files in folder ${path}. Folder id ${folderId}: ${e.message}`, e);
    }
}