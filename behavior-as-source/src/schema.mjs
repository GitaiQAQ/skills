import fs from "node:fs";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schemaPath = fileURLToPath(new URL("../schemas/behavior.schema.json", import.meta.url));
export const behaviorSchema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(behaviorSchema);

export function validateBehaviorMeta(meta) {
  const valid = validate(meta);
  return {
    valid: Boolean(valid),
    errors: valid
      ? []
      : (validate.errors ?? []).map((error) => ({
          path: error.instancePath || "/",
          message: error.message ?? "schema validation failed",
        })),
  };
}
