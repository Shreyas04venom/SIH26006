/**
 * ASTRA - Real-Time Python ML & MILP Inference Service
 * 
 * Bridges Node.js Express backend with the trained Python ML models & SciPy MILP solver.
 * Loads predictions from:
 *   - Model 1: LightGBM Freight Forecaster
 *   - Model 2: GBDT Port Waiting Regressor
 *   - Model 3: GBDT Congestion Risk Classifier
 *   - Method 4: SciPy HiGHS Exact MILP Solver
 * 
 * Zero frontend changes required: delivers data directly to existing Express endpoints.
 */

import { execFile } from 'child_process';
import util from 'util';
import path from 'path';

const execFilePromise = util.promisify(execFile);

export async function runRealModelInference({ 
  action = "all", 
  origin = "Newcastle", 
  destination = "Paradip", 
  vessel = "Panamax", 
  cargo = 70000 
}) {
  try {
    const scriptPath = path.resolve('scripts/predict_service.py');
    const { stdout } = await execFilePromise('python', [
      scriptPath,
      '--action', action,
      '--origin', origin,
      '--destination', destination,
      '--vessel', vessel,
      '--cargo', String(cargo)
    ], { timeout: 3500 });

    const result = JSON.parse(stdout);
    return result;
  } catch (err) {
    console.warn("[ModelInferenceService] Python bridge note:", err.message);
    return null;
  }
}
