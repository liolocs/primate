import test from "primate/test";

test.get("/db/get", assert => {
  assert.body.equals({ name: "Donald", age: 30 });
});
