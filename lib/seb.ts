import crypto from "crypto";

/**
 * Verifies the Safe Exam Browser (SEB) Request Hash or Config Key Hash.
 * 
 * @param url The full URL of the request as seen by SEB (including query params)
 * @param configKey The expected Configuration Key (sebKey) stored in the DB
 * @param sentHash The hash sent by SEB in the X-SafeExamBrowser-ConfigKeyHash header
 * @returns boolean
 */
export function verifySEBHash(url: string, configKey: string, sentHash: string): boolean {
  if (!configKey || !sentHash) return false;

  // The Config Key Hash is SHA256(URL + ConfigKey)
  // Note: SEB uses the EXACT URL it is currently displaying.
  const expectedHash = crypto
    .createHash("sha256")
    .update(url + configKey)
    .digest("hex");

  return expectedHash.toLowerCase() === sentHash.toLowerCase();
}

/**
 * Basic check for SEB User-Agent
 */
export function isSEB(userAgent: string): boolean {
  return userAgent.includes("SEB");
}
