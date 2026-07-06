/**
 * This is a configuration interface for the Transparency UI:
 * This allows us to control the visibility of the transparency tooltips vs the Privacy Page UI for each screen
 */
export interface TransparencyUIConfig {
  journalTooltipEnabled: boolean;
  sleepPageTooltipEnabled: boolean;
  sleepModeTooltipEnabled: boolean;
}

export const TRANSPARENCY_UI_CONFIG: TransparencyUIConfig = {
  journalTooltipEnabled: true,
  sleepPageTooltipEnabled: true,
  sleepModeTooltipEnabled: true,
};

/**
 * If this is false, deployed backend server is used and the app behaves like a real app (no privacy violations will be detected)
   If this is true, the transparencyDemoConfig below will be applied and can be used to test out different violations etc. 
*/
export const IN_DEMO_MODE = true;

/**
 * This is is used for demo purposes, allowing us to override actual consent settings for demos
   this config is only applied when IN_DEMO_MODE is true
 */
export const transparencyDemoConfig = {
  collectAudio: false,
  collectLight: false,
  collectAccelerometer: false,
  encryptedAtRest: false,
  encryptedInTransit: false // if this is false, locally running backend is used, otherwise deployed backend server (https url) is used
}