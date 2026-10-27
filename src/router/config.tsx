import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import VprSpotlight from "../pages/vpr-spotlight/page";
import StartPage from "../pages/start/page";
import PeptidePage from "../pages/peptide/page";
import WelcomePage from "../pages/welcome/page";
import TrackerPage from "../pages/tracker/page";
import ShopPage from "../pages/shop/page";
import ReconstitutionGuide from "../pages/guides/reconstitution/page";
import ConcentrationChart from "../pages/reference/concentration-chart/page";
import VendorsPage from "../pages/vendors/page";

const routes: RouteObject[] = [
  {
    path: "/welcome",
    element: <WelcomePage />,
  },
  {
    path: "/tracker",
    element: <TrackerPage />,
  },
  {
    path: "/shop",
    element: <ShopPage />,
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
    path: "/guides/reconstitution",
    element: <ReconstitutionGuide />,
  },
  {
    path: "/reference/concentration-chart",
    element: <ConcentrationChart />,
  },
  {
    path: "/vendors",
    element: <VendorsPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;