import { createApp } from '../src/app.js';
import { contextService } from '../src/services/contextService.js';
import { parseModelResponse } from '../src/services/responseParser.js';
import { buildPathologyUserPrompt } from '../src/prompts/leafAnalysis.prompt.js';
import { SERVER_STRINGS } from '../src/constants/serverStrings.js';

async function runTestSuite() {
  console.log('--- STARTING VISTARA BACKEND VERIFICATION SUITE ---');

  // Test 1: Verify Response Parser and DiagnosticData Extraction
  console.log('[TEST 1] Testing parseModelResponse with clinical Markdown and JSON block...');
  const sampleModelOutput = `### Clinical Plant Pathology Assessment

#### Primary Findings & Pathogen Analysis
* **Identified Disease**: **Early Blight (*Alternaria solani*)**
* **Confidence Level**: **97.4%**
* **Severity Rating**: **Moderate (22% canopy leaf area affected)**
* **Characteristic Markers**: Brown concentric ring target-board lesions delimited by chlorotic halos.

#### Actionable Agronomic Countermeasures
1. **Chemical Treatment Protocol**: Spray Azoxystrobin (23% SC) at 1.0 mL/L or Chlorothalonil (75% WP) at 2.0 g/L.
2. **Organic Alternative**: Trichoderma viride bio-fungicide (10 g/L) at 5-day intervals.
3. **Preventive Canopy Hygiene**: Remove infected lower leaves within 15 cm of soil.

\`\`\`json
{
  "crop": "Solanum lycopersicum (Tomato)",
  "disease": "Early Blight (Alternaria solani)",
  "pathogenType": "Fungal",
  "confidence": 97.4,
  "severity": "Moderate",
  "symptoms": [
    "Concentric target-board ring lesions",
    "Chlorotic halos surrounding necrotic spots",
    "Basal canopy leaf desiccation"
  ],
  "organicTreatment": "Trichoderma viride bio-fungicide at 10 g/L",
  "chemicalTreatment": "Azoxystrobin 23% SC at 1.0 mL/L or Chlorothalonil 75% WP at 2.0 g/L",
  "preventativeAction": "Lower canopy pruning, drip irrigation conversion, 3-year crop rotation"
}
\`\`\``;

  const parsed = parseModelResponse(sampleModelOutput);
  if (!parsed.diagnosticData) {
    throw new Error('Expected parseModelResponse to extract diagnosticData, but received null');
  }
  if (!parsed.diagnosticData.crop.includes('Tomato')) {
    throw new Error(`Crop mismatch in parser: ${parsed.diagnosticData.crop}`);
  }
  if (parsed.diagnosticData.confidence !== 97.4) {
    throw new Error(`Confidence mismatch: ${parsed.diagnosticData.confidence}`);
  }
  if (parsed.diagnosticData.severity !== 'Moderate') {
    throw new Error(`Severity mismatch: ${parsed.diagnosticData.severity}`);
  }
  if (parsed.markdownReport.includes('```json')) {
    throw new Error('Markdown report should have stripped raw JSON code block');
  }
  console.log('PASS: parseModelResponse successfully extracted clean Markdown and structured DiagnosticData.');

  // Test 2: Multi-turn Context Service - Prompt Array & Last Response tracking
  console.log('[TEST 2] Testing Context Service multi-turn array storage and last response feedback...');
  const testSessionId = `test-sess-${Date.now()}`;

  // Turn 1: User sends first prompt
  const prompt1 = 'Evaluate this tomato leaf with dark concentric ring spots.';
  contextService.recordUserPrompt(testSessionId, prompt1, true);

  let storedPrompts = contextService.getStoredPrompts(testSessionId);
  if (storedPrompts.length !== 1 || storedPrompts[0] !== prompt1) {
    throw new Error(`Stored prompt array failure after Turn 1: ${JSON.stringify(storedPrompts)}`);
  }

  // Model delivers first response
  contextService.updateModelResponse(testSessionId, parsed.markdownReport, parsed.diagnosticData);
  const lastResp1 = contextService.getLastModelResponse(testSessionId);
  if (!lastResp1 || !lastResp1.includes('Alternaria solani')) {
    throw new Error('Last model response was not correctly recorded.');
  }

  // Turn 2: User asks follow-up query
  const prompt2 = 'What if rain is forecasted 2 hours after spraying Azoxystrobin?';
  const composedTurn2Prompt = buildPathologyUserPrompt(
    prompt2,
    contextService.getStoredPrompts(testSessionId),
    contextService.getLastModelResponse(testSessionId),
    false
  );

  if (!composedTurn2Prompt.includes('=== HISTORICAL CONTEXT & PRIOR USER PROMPTS ===')) {
    throw new Error('Composed prompt missing historical context header.');
  }
  if (!composedTurn2Prompt.includes(prompt1)) {
    throw new Error('Composed prompt missing Turn 1 stored prompt.');
  }
  if (!composedTurn2Prompt.includes('=== LAST MODEL RESPONSE / PREVIOUS PATHOLOGY DIAGNOSIS ===')) {
    throw new Error('Composed prompt missing last model response section.');
  }
  if (!composedTurn2Prompt.includes(prompt2)) {
    throw new Error('Composed prompt missing current user inquiry.');
  }

  // Record Turn 2 prompt
  contextService.recordUserPrompt(testSessionId, prompt2, false);
  storedPrompts = contextService.getStoredPrompts(testSessionId);
  if (storedPrompts.length !== 2) {
    throw new Error(`Expected 2 stored prompts, found: ${storedPrompts.length}`);
  }
  console.log('PASS: Context Service correctly accumulated prompt array and injected last model response.');

  // Test 3: Express HTTP Server & Endpoints (Health, Session, Chat Validation)
  console.log('[TEST 3] Testing Express App endpoints...');
  const app = createApp();
  let testPort = 0;

  const server = await new Promise<import('http').Server>((resolve) => {
    const s = app.listen(0, () => {
      const addr = s.address() as import('net').AddressInfo;
      testPort = addr.port;
      resolve(s);
    });
  });

  try {
    // 3A: Health Endpoint
    const healthRes = await fetch(`http://localhost:${testPort}${SERVER_STRINGS.ROUTE_HEALTH}`);
    if (healthRes.status !== 200) {
      throw new Error(`Health check returned status ${healthRes.status}`);
    }
    const healthJson = await healthRes.json() as Record<string, unknown>;
    if (healthJson.status !== SERVER_STRINGS.STATUS_HEALTHY) {
      throw new Error(`Health response status incorrect: ${JSON.stringify(healthJson)}`);
    }
    console.log('PASS: GET /api/health returned 200 with healthy status.');

    // 3B: Session Inspection Endpoint
    const sessionRes = await fetch(`http://localhost:${testPort}${SERVER_STRINGS.ROUTE_SESSION}/${testSessionId}`);
    if (sessionRes.status !== 200) {
      throw new Error(`Session inspection returned ${sessionRes.status}`);
    }
    const sessionJson = (await sessionRes.json()) as { prompts: string[] };
    if (!Array.isArray(sessionJson.prompts) || sessionJson.prompts.length !== 2) {
      throw new Error(`Session inspection prompts array mismatch: ${JSON.stringify(sessionJson.prompts)}`);
    }
    console.log('PASS: GET /api/chat/session/:id accurately returned 2 stored prompts.');

    // 3C: Chat Payload Validation (Empty Prompt Rejection)
    const invalidChatRes = await fetch(`http://localhost:${testPort}${SERVER_STRINGS.ROUTE_CHAT}`, {
      method: 'POST',
      headers: { [SERVER_STRINGS.HEADER_CONTENT_TYPE]: SERVER_STRINGS.MIME_APPLICATION_JSON },
      body: JSON.stringify({ prompt: '' }),
    });
    if (invalidChatRes.status !== 400) {
      throw new Error(`Expected 400 for empty prompt, got: ${invalidChatRes.status}`);
    }
    console.log('PASS: POST /api/chat rejected empty prompt with 400.');

    // 3D: Chat Payload Validation (Unauthorized Model ID Rejection - SEV-3)
    const invalidModelRes = await fetch(`http://localhost:${testPort}${SERVER_STRINGS.ROUTE_CHAT}`, {
      method: 'POST',
      headers: { [SERVER_STRINGS.HEADER_CONTENT_TYPE]: SERVER_STRINGS.MIME_APPLICATION_JSON },
      body: JSON.stringify({
        prompt: 'Diagnose crop foliage',
        modelId: 'unauthorized/arbitrary-expensive-model',
      }),
    });
    if (invalidModelRes.status !== 400) {
      throw new Error(`Expected 400 for unauthorized modelId, got: ${invalidModelRes.status}`);
    }
    const invalidModelJson = (await invalidModelRes.json()) as { error: string; details: string };
    if (!invalidModelJson.details || !invalidModelJson.details.includes('modelId')) {
      throw new Error(`Expected validation error details for modelId, got: ${JSON.stringify(invalidModelJson)}`);
    }
    console.log('PASS: POST /api/chat rejected unauthorized modelId with 400 and validation message.');

    // 3E: Session Deletion Endpoint
    const deleteRes = await fetch(`http://localhost:${testPort}${SERVER_STRINGS.ROUTE_SESSION}/${testSessionId}`, {
      method: 'DELETE',
    });
    if (deleteRes.status !== 200) {
      throw new Error(`Delete session returned ${deleteRes.status}`);
    }
    const sessionAfterDelete = contextService.getSession(testSessionId);
    if (sessionAfterDelete !== null) {
      throw new Error('Session context was not cleared after DELETE call.');
    }
    console.log('PASS: DELETE /api/chat/session/:id cleared context.');
  } finally {
    server.close();
  }

  console.log('--- ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY ---');
}

runTestSuite().catch((err) => {
  console.error('[FAIL] Backend verification suite failed:', err);
  process.exit(1);
});
