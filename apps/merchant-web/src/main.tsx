import { createRoot } from "react-dom/client";
import { Workspace } from "@segno/web-ui";
createRoot(document.getElementById("root")!).render(
  <Workspace area="merchant" />,
);
