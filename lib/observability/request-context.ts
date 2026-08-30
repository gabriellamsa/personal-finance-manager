import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";

export { isValidRequestId, resolveRequestId } from "@/lib/observability/request-id";

export type RequestContext = {
  method: string;
  path: string;
  requestId: string;
  route: string;
};

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext() {
  return requestContextStorage.getStore();
}

export function runWithRequestContext<T>(
  context: RequestContext,
  callback: () => T,
) {
  return requestContextStorage.run(context, callback);
}
