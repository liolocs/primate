import assert from "@rcompat/assert";
import p from "pema";
import response from "primate/response";
import route from "primate/route";

const posts = [{
  id: 1,
  title: "First post",
}];

route.get(request => {
  const id = p.int.coerce.parse(request.path.try("id"));
  const post = posts.find(_post => _post.id === id);
  assert(post !== undefined);

  return response.view("ViewPost.vue", { post });
});
