import fail from "#fail";
import json from "@rcompat/http/mime/application/json";
import binary from "@rcompat/http/mime/application/octet-stream";
import www_form from "@rcompat/http/mime/application/x-www-form-urlencoded";
import form_data from "@rcompat/http/mime/multipart/form-data";
import text from "@rcompat/http/mime/text/plain";
import type Dict from "@rcompat/type/Dict";
import type JSONValue from "@rcompat/type/JSONValue";
import type Schema from "@rcompat/type/Schema";

type Form = Dict<string>;

type Parsed =
  | { type: "binary"; value: Blob }
  | { type: "form"; value: Dict<string> }
  | { type: "json"; value: JSONValue }
  | { type: "none"; value: null }
  | { type: "text"; value: string }
  ;

type ParseReturn<S> =
  S extends { parse: (v: unknown) => infer R } ? R : never;

async function anyform(request: Request) {
  const form: Dict<string> = Object.create(null);
  const files: Dict<File> = Object.create(null);

  for (const [key, value] of (await request.formData()).entries()) {
    if (typeof value === "string") {
      form[key] = value;
    } else {
      files[key] = value;
    }
  }

  return { form, files };
};

export default class RequestBody {
  #parsed: Parsed;
  #files: Dict<File>;

  static async parse(request: Request, url: URL): Promise<RequestBody> {
    const raw = request.headers.get("content-type") ?? "none";
    const type = raw.split(";")[0].trim().toLowerCase();
    const path = url.pathname;

    try {
      switch (type) {
        case binary:
          return new RequestBody({ type: "binary", value: await request.blob() });
        case www_form:
        case form_data: {
          const { form, files } = await anyform(request);
          return new RequestBody({ type: "form", value: form }, files);
        }
        case json:
          return new RequestBody({ type: "json", value: await request.json() });
        case text:
          return new RequestBody({ type: "text", value: await request.text() });
        case "none":
          return RequestBody.none();
        default:
          throw fail("{0}: unsupported content type {1}", path, type);
      }
    } catch (cause) {
      const message = "{0}: unparseable content type {1} - cause:\n[2]";
      throw fail(message, path, type, cause);
    }
  }

  static none() {
    return new RequestBody({ type: "none", value: null });
  }

  constructor(parsed: Parsed, files: Dict<File> = {}) {
    this.#parsed = parsed;
    this.#files = files;
  }

  get type() {
    return this.#parsed.type;
  }

  #value<T extends Parsed["value"]>() {
    return this.#parsed.value as T;
  }

  #throw(expected: string) {
    throw fail("request body: expected {0}, got {1}", expected, this.type);
  }

  json(): JSONValue;
  json<S extends Schema<unknown>>(schema: S): ParseReturn<S>;
  json(schema?: Schema<unknown>) {
    if (this.type !== "json") {
      this.#throw("JSON");
    }

    const value = this.#value<JSONValue>();
    return schema ? schema.parse(value) : value;
  }

  form(): Form;
  form<S extends Schema<unknown>>(schema: S): ParseReturn<S>;
  form(schema?: Schema<unknown>) {
    if (this.type !== "form") {
      this.#throw("form");
    }

    const value = this.#value<Form>();
    return schema ? schema.parse(value) : value;
  }

  files(): Dict<File> {
    if (this.type !== "form") {
      this.#throw("form");
    }

    return this.#files;
  }

  text() {
    if (this.type !== "text") {
      this.#throw("plaintext");
    }

    return this.#value<string>();
  }

  binary() {
    if (this.type !== "binary") {
      this.#throw("binary");
    }
    return this.#value<Blob>();
  }

  none() {
    if (this.type !== "none") {
      this.#throw("none");
    }
    return null;
  }
}
