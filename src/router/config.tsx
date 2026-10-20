import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import VprSpotlight from "../pages/vpr-spotlight/page";
import StartPage from "../pages/start/page";
import PeptidePage from "../pages/peptide/page";
import WelcomePage from "../pages/welcome/page";

const routes: RouteObject[] = [
  {
    path: "/welcome",
    element: <WelcomePage />,
  },
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