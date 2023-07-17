import fs from "fs"
import path from "path"
import { capitalizeWord } from "../(utils)/capitalize";

const API_ROOT = "src/routes/api"
const OUTPUT_FILE = process.argv[2].replace("--out=", "") || "src/routes/api/docs.md"

let md = "# EdSpace API Documentation\n";
md += "\n## HTTP Error Format\n"
md += `\`\`\`typescript\n${JSON.stringify(JSON.parse("{ \"name\": \"string\", \"message\": \"string\", \"fieldErrors?\": \"FieldErrors\" }"), null, 2)}\n\`\`\`\n\n`

md += "\n## Authentication\n"
md += "\n### Via the HTTP Cookie Header\n"
md += "`Cookie: next-auth.session-token=<session_token>;`\n\n"

md += "\n## Notes\n"
md += "- In the API routes, parts inside square brackets are path variables. (Ex: /users/[id])\n"
md += "- The types used in this document are Typescript types and any non-primitive types are defined inside `src/app.d.ts`\n"
md += "\n<br>\n\n<hr>\n<br>\n\n"


type EndpointMethodHandler = {
    route: string,
    method: string,
    jsonBody: string | null,
    formDataBody: string | null,
    query: string | null,
    responseBody: string | null,
    requiresAuthn: boolean
}

function _getBetweenOrNull(content: string, start: string, stop: string): string | null {
    if (content.indexOf(start) !== -1) {
        const startIndex = content.indexOf(start) + start.length;
        const stopIndex = content.indexOf(stop, startIndex);
        return content.slice(startIndex, stopIndex).trim();
    }
    return null
}

function _applyRegex(str: string): string {
    return str.trim().replaceAll(";", ",").replace(/:\s*(.*?)(?:,| )/g, ':"$1",').replace(/(\w+\??)\s*:/g, '"$1":').replace(/(?<=[}\]"']),(?!\s*[{["'])/gm, '')
}

function recursiveRoutesInspector(directoryPath: string) {
    const files = fs.readdirSync(directoryPath, { withFileTypes: true });

    for (const file of files) {
        if (file.isDirectory() && !/\([^()]*\)/.test(file.name)) {
            if (directoryPath.replace("\\", "/").split("/").length === 3) {
                md += `# **${capitalizeWord(file.name)}**\n`
            }
            recursiveRoutesInspector(path.join(directoryPath, file.name));
        } else if (file.name === '+server.ts') {
            const filePath = path.join(directoryPath, file.name)
            const route = path.join(directoryPath, file.name)
                .replaceAll("\\", "/").replace("/+server.ts", "")
                .replace(API_ROOT, "")

            let endpointFileContent = fs.readFileSync(filePath, { encoding: 'utf-8' })
            endpointFileContent = endpointFileContent.substring(endpointFileContent.indexOf("export const "))
            const endpointsMethodsContent = endpointFileContent.split("export const ").filter(ep => ep.length > 0)

            for (const endpointMethodContent of endpointsMethodsContent) {
                const { method, requiresAuthn, query, jsonBody, formDataBody, responseBody } = parseEndpoint(route, endpointMethodContent)

                md += ` ## \`${method}\` ${route}\n`
                if (requiresAuthn)
                    md += "- ### Autentication Required\n\n"
                if (query)
                    md += `- ### Query Parameters\n \`\`\`typescript\n${query}\n\`\`\`\n\n`
                if (jsonBody)
                    md += `- ### Body (JSON) \n \`\`\`typescript\n${jsonBody}\n\`\`\`\n\n`
                if (formDataBody) {
                    md += "- ### Body (FormData) \n"
                    md += "`Files can be uploaded as values of keys with 'file' in their name`\n\n"
                    md += `\`\`\`typescript\n${formDataBody}\n\`\`\`\n\n`
                }
                if (responseBody) {
                    md += `- ### Response Body\n \`\`\`typescript\n${responseBody}\n\`\`\`\n\n`
                }

                md += "<hr>\n\n<br>\n\n"
            }
        }
    }
}

function parseEndpoint(route: string, endpointMethodContent: string): EndpointMethodHandler {
    let jsonBody: EndpointMethodHandler["jsonBody"] = _getBetweenOrNull(endpointMethodContent, "await getJsonBody<", ">(")
    if (jsonBody) {
        jsonBody = JSON.stringify(JSON.parse(_applyRegex(jsonBody)), null, 2)
    }

    let formdataBody: EndpointMethodHandler["formDataBody"] = _getBetweenOrNull(endpointMethodContent, "await getFormDataBody<", ">(")
    if (formdataBody) {
        formdataBody = JSON.stringify(JSON.parse(_applyRegex(formdataBody)), null, 2)
    }

    let query: EndpointMethodHandler["query"] = _getBetweenOrNull(endpointMethodContent, "getQueryString<", ">(")
    if (query) {
        query = JSON.stringify(JSON.parse(_applyRegex(query)), null, 2)
    }

    let resBody: EndpointMethodHandler["responseBody"] = _getBetweenOrNull(endpointMethodContent, "return respondJSON<", ">(")

    return {
        route: route,
        method: endpointMethodContent.split(" ")[0].replace(":", ""),
        query: query,
        jsonBody: jsonBody,
        formDataBody: formdataBody,
        responseBody: resBody,
        requiresAuthn: endpointMethodContent.includes("await getSessionOrThrow")
    } satisfies EndpointMethodHandler
}

const key = `API Documentation Generated to ${OUTPUT_FILE}`
console.time(key)
recursiveRoutesInspector(API_ROOT)
fs.writeFileSync(OUTPUT_FILE, md, { encoding: "utf-8" })
console.timeEnd(key)
