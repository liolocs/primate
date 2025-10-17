import type View from "#frontend/View";
import type RequestFacade from "#request/RequestFacade";
import type ServeApp from "#ServeApp";
import type Dict from "@rcompat/type/Dict";
import type MaybePromise from "@rcompat/type/MaybePromise";

type ResponseFunction =
  (app: ServeApp, transfer: Dict, request: RequestFacade)
    => MaybePromise<View | null | Response | undefined>;

export { ResponseFunction as default };
