declare module "webc:views" {
  import type Component from "@primate/webc/Component";
  import type Dict from "@rcompat/type/Dict";
  const map: Dict<typeof Component>;
  export = map;
}
