# Privacy

agenttrace is local-first. It reads AI coding-agent session logs from paths you choose, computes metrics on your machine, and does not upload prompts, code, logs, reports, or telemetry to any hosted service.

Generated reports are written only to the output path you request with `-o`. Review reports before sharing them, because they can contain filenames, command names, model names, token counts, costs, and excerpts derived from local session logs.

`agenttrace --update-pricing` downloads public model pricing metadata from the LiteLLM community pricing source. It does not send your local session logs.
