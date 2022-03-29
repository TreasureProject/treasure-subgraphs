import { assert, test } from "matchstick-as";

import { stringToSlug } from "../../src/helpers/string";

test("that string is converted to slug", () => {
  let result = stringToSlug("Test");
  assert.stringEquals(result, "test");

  result = stringToSlug("Test With Spaces");
  assert.stringEquals(result, "test-with-spaces");
});
