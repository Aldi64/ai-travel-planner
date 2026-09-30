export type PipelineErrorCode = "NO_FIT" | "AI_INVALID" | "UPSTREAM" | "UNKNOWN";

export class PipelineError extends Error {
  code: PipelineErrorCode;
  constructor(code: PipelineErrorCode, userMessage: string) {
    super(userMessage);
    this.code = code;
  }
}