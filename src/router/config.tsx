import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import VprSpotlight from "../pages/vpr-spotlight/page";
import StartPage from "../pages/start/page";
import PeptidePage from "../pages/peptide/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/start",
    element: <StartPage />,
  },
  {
    path: "/peptide/:slug",
    element: <PeptidePage />,
  },
  {
    path: "/vpr-spotlight",
    element: <VprSpotlight />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;