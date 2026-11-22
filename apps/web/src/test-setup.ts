import { act, cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Allow asynchronous UI assertions to settle on shared runners.
configure({ asyncUtilTimeout: 3000 });

afterEach(async () => {
  await act(async () => { cleanup(); });
});
