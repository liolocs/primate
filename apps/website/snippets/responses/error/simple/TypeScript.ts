import response from "primate/response";
import route from "primate/route";

route.get(() => response.error({
  body: "Not Found", // default
}));
