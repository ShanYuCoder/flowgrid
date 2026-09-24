import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerTools as registerCodegenTools } from "../src/codegen/mcp/tools.js";
import { registerTools as registerDocsTools } from "../src/docs/mcp/tools.js";
import { registerTools as registerGraphTools } from "../src/graph/mcp/tools.js";
import { registerTools as registerTestTools } from "../src/test/mcp/tools.js";

export function createServer() {
  const server = new McpServer({ name: 'flowgrid', version: '0.1.0' })
  
  registerCodegenTools(server);
  registerDocsTools(server);
  registerGraphTools(server);
  registerTestTools(server);

  return server;
}

export async function main() {
  const server = createServer();
  console.error("FlowGrid MCP Server connecting on stdio...");
  await server.connect(new StdioServerTransport());
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
