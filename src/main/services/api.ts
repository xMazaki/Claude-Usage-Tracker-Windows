import { net } from 'electron';
import { ClaudeUsage, ClaudeStatus, Profile } from '../../shared/types';

const CLAUDE_BASE_URL = 'https://claude.ai';
const STATUS_URL = 'https://status.claude.com/api/v2/status.json';

interface UsageBucket {
  utilization?: number | string;
  resets_at?: string;
}

interface UsageResponse {
  five_hour?: UsageBucket;
  seven_day?: UsageBucket;
  seven_day_opus?: UsageBucket;
  seven_day_sonnet?: UsageBucket;
  seven_day_sonnet_3_5?: UsageBucket;
}

interface OrgResponse {
  uuid: string;
  name: string;
}

function parseUtilization(val?: number | string): number {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace('%', '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export async function validateSessionKey(sessionKey: string): Promise<{ valid: boolean; orgId?: string; orgName?: string }> {
  try {
    const response = await fetchWithSession(
      `${CLAUDE_BASE_URL}/api/organizations`,
      sessionKey
    );
    if (!response.ok) return { valid: false };

    const orgs: OrgResponse[] = JSON.parse(response.body);
    if (orgs.length === 0) return { valid: false };

    return {
      valid: true,
      orgId: orgs[0].uuid,
      orgName: orgs[0].name,
    };
  } catch {
    return { valid: false };
  }
}

export async function fetchUsage(profile: Profile): Promise<ClaudeUsage | null> {
  if (!profile.sessionKey || !profile.organizationId) return null;

  try {
    const response = await fetchWithSession(
      `${CLAUDE_BASE_URL}/api/organizations/${profile.organizationId}/usage`,
      profile.sessionKey
    );

    if (!response.ok) return null;

    const data: UsageResponse = JSON.parse(response.body);

    const fiveHour = parseUtilization(data.five_hour?.utilization);
    const sevenDay = parseUtilization(data.seven_day?.utilization);
    const sevenDayOpus = parseUtilization(data.seven_day_opus?.utilization);
    const sevenDaySonnet = parseUtilization(
      data.seven_day_sonnet?.utilization ?? data.seven_day_sonnet_3_5?.utilization
    );
    const resetTime = data.five_hour?.resets_at ?? data.seven_day?.resets_at;

    // Fetch overage spend limit for extra usage
    let extraUsage = 0;
    try {
      const overageResp = await fetchWithSession(
        `${CLAUDE_BASE_URL}/api/organizations/${profile.organizationId}/overage_spend_limit`,
        profile.sessionKey
      );
      if (overageResp.ok) {
        const overage = JSON.parse(overageResp.body);
        if (overage.is_enabled && overage.monthly_credit_limit && overage.monthly_credit_limit > 0) {
          const used = overage.used_credits ?? 0;
          extraUsage = Math.round((used / overage.monthly_credit_limit) * 100);
        }
      }
    } catch { /* ignore */ }

    return {
      fiveHour: Math.round(fiveHour),
      sevenDay: Math.round(sevenDay),
      sevenDayOpus: Math.round(sevenDayOpus),
      sevenDaySonnet: Math.round(sevenDaySonnet),
      extraUsage,
      resetTime,
    };
  } catch {
    return null;
  }
}

export async function fetchClaudeStatus(): Promise<ClaudeStatus> {
  try {
    const response = await fetchRaw(STATUS_URL);
    if (!response.ok) {
      return { status: 'operational', description: 'Unable to fetch status' };
    }
    const data = JSON.parse(response.body);
    const indicator = data?.status?.indicator ?? 'none';
    const description = data?.status?.description ?? 'Unknown';

    let status: ClaudeStatus['status'] = 'operational';
    if (indicator === 'minor') status = 'degraded';
    else if (indicator === 'major' || indicator === 'critical') status = 'major_outage';
    else if (indicator === 'maintenance') status = 'maintenance';

    return { status, description };
  } catch {
    return { status: 'operational', description: 'Unable to fetch status' };
  }
}

interface FetchResult {
  ok: boolean;
  status: number;
  body: string;
}

function fetchWithSession(url: string, sessionKey: string): Promise<FetchResult> {
  return new Promise((resolve) => {
    const request = net.request(url);
    request.setHeader('Cookie', `sessionKey=${sessionKey}`);
    request.setHeader('Accept', 'application/json');
    request.setHeader('User-Agent', 'Claude-Usage-Tracker-Windows/1.0.0');

    let body = '';
    request.on('response', (response) => {
      response.on('data', (chunk) => {
        body += chunk.toString();
      });
      response.on('end', () => {
        resolve({
          ok: response.statusCode >= 200 && response.statusCode < 300,
          status: response.statusCode,
          body,
        });
      });
    });
    request.on('error', () => {
      resolve({ ok: false, status: 0, body: '' });
    });
    request.end();
  });
}

function fetchRaw(url: string): Promise<FetchResult> {
  return new Promise((resolve) => {
    const request = net.request(url);
    request.setHeader('Accept', 'application/json');

    let body = '';
    request.on('response', (response) => {
      response.on('data', (chunk) => {
        body += chunk.toString();
      });
      response.on('end', () => {
        resolve({
          ok: response.statusCode >= 200 && response.statusCode < 300,
          status: response.statusCode,
          body,
        });
      });
    });
    request.on('error', () => {
      resolve({ ok: false, status: 0, body: '' });
    });
    request.end();
  });
}
