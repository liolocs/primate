import response from "primate/response";
import route from "primate/route";

route.get(() => response.view("index.html", { hello: "world" }));
