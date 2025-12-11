
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Ditt Google Cloud Project ID behövs för att hitta rätt secrets.
// Detta hämtas från en befintlig miljövariabel som Firebase oftast sätter.
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

let secretClient: SecretManagerServiceClient | null = null;
const cachedSecrets: Map<string, string> = new Map();

/**
 * Initialiserar Secret Manager-klienten.
 * Autentisering sker automatiskt om koden körs i en Google Cloud-miljö.
 */
const getSecretClient = (): SecretManagerServiceClient => {
  if (!secretClient) {
    secretClient = new SecretManagerServiceClient();
  }
  return secretClient;
};

/**
 * Hämtar en hemlighet från Google Secret Manager.
 * Resultatet cache-lagras för att undvika onödiga API-anrop.
 *
 * @param secretName Namnet på hemligheten du skapade i Secret Manager (t.ex. "GEMINI_API_KEY").
 * @returns Hemlighetens värde som en sträng, eller null om den inte kunde hämtas.
 */
export const getSecret = async (secretName: string): Promise<string | null> => {
  if (cachedSecrets.has(secretName)) {
    return cachedSecrets.get(secretName) || null;
  }

  if (!projectId) {
    console.error('🔴 Project ID är inte konfigurerat. Kan inte hämta API-nycklar från Secret Manager.');
    return null;
  }

  try {
    const client = getSecretClient();
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });

    const payload = version.payload?.data?.toString();
    if (payload) {
      cachedSecrets.set(secretName, payload);
      return payload;
    }

    console.warn(`⚠️ Hemligheten "${secretName}" hittades men var tom.`);
    return null;

  } catch (error: any) {
    console.error(`🔴 Ett fel uppstod vid hämtning av hemligheten "${secretName}":`, error);
    // Ge ett mer användbart felmeddelande vid vanliga behörighetsproblem.
    if (error.code === 7) { // PERMISSION_DENIED
        console.error(`🔴 BEHÖRIGHET NEKAD: Säkerställ att den service-account som kör applikationen har rollen "Secret Manager Secret Accessor" i Google Cloud IAM.`);
    }
    return null;
  }
};

interface ApiKeys {
  geminiApiKey: string | null;
  grokApiKey: string | null;
}

// Global promise för att säkerställa att nycklar bara laddas en gång.
let loadingPromise: Promise<ApiKeys> | null = null;

/**
 * Hämtar och cache-lagrar alla nödvändiga API-nycklar.
 * Denna funktion ska anropas en gång när applikationen startar.
 * @returns Ett löfte som resolverar till ett objekt med API-nycklarna.
 */
export const loadApiKeys = (): Promise<ApiKeys> => {
  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    console.log("🔑 Laddar API-nycklar från Google Secret Manager...");
    const [geminiApiKey, grokApiKey] = await Promise.all([
        getSecret('GEMINI_API_KEY'), // Antagande att hemligheten heter "GEMINI_API_KEY"
        getSecret('GROK_API_KEY')    // Antagande att hemligheten heter "GROK_API_KEY"
    ]);

    if (geminiApiKey) {
        console.log("✅ Gemini API-nyckel laddad.");
    } else {
        console.warn("⚠️ Gemini API-nyckel kunde inte laddas från Secret Manager.");
    }

    if (grokApiKey) {
        console.log("✅ Grok API-nyckel laddad.");
    } else {
        console.warn("⚠️ Grok API-nyckel kunde inte laddas från Secret Manager.");
    }

    return { geminiApiKey, grokApiKey };
  })();

  return loadingPromise;
};

// Exponera en funktion för att hämta de redan laddade nycklarna.
export const getLoadedApiKeys = (): Promise<ApiKeys> => {
    if (!loadingPromise) {
        // Detta är en fallback om `loadApiKeys` inte har anropats explicit vid start.
        console.warn("`getLoadedApiKeys` anropades innan `loadApiKeys`. Initierar laddning nu.");
        return loadApiKeys();
    }
    return loadingPromise;
};
