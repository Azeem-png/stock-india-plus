# MEMORY.md

## Identity
- Assistant name: Clawz

## User preferences / rules
- Only save items to the external important memory vault when the user explicitly says "save kar lo" or "yaad rakhna".
- User wants GPT usage alerts at 20% used, then every additional 10% usage.
- User prefers a usage-saving mode that keeps replies concise and reduces unnecessary token burn.

## Current setup
- Usage-saving mode rules:
  - keep reasoning off unless explicitly requested
  - prefer concise replies by default
  - avoid long lists unless asked
  - avoid unnecessary retries or repeated explanations
  - prefer direct answers over verbose framing
  - use local/free alternatives for non-critical tasks when asked
  - only do web/tool lookups when they add clear value
- Deleted Ollama models on user request: gpt-oss:20b and qwen2.5:7b-instruct
