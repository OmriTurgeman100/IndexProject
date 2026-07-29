import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { About } from "./pages/About";
import { Systems } from "./pages/Systems";
import { Services } from "./pages/Services";
import { DisplayService } from "./pages/DisplayService";
import { DisplaySystem } from "./pages/DisplaySystem";
import { TreeDiagram } from "./pages/TreeDiagram";
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuthContext";
import { Users } from "./pages/Users";
import { NotFound } from "./pages/NotFound";
import { ActiveLocations } from "./pages/ActiveLocations";
import { NetworkDiagram } from "./pages/NetworkDiagram";
import { TidyTree } from "./pages/TidyTree";
import { Architecture } from "./pages/Architecture";
import { IndentedTree } from "./pages/IndentedTree";
import { ViewSystem } from "./pages/ViewSystem";
import { ViewService } from "./pages/ViewService";
import { Forbidden } from "./pages/Forbidden";
import Tiptap from "./pages/TipTap";
import { Docs } from "./pages/Docs";
import { TidyTreeLocations } from "./pages/TidyTreeLocations";
import { Locations } from "./pages/Locations";
import { LocationsTable } from "./pages/LocationsTable";
import { AutomationsLayout } from "./components/AutomationsLayout";
import { AutomationHome } from "./pages/AutomationHome";
import { CreateAutomation } from "./pages/CreateAutomation";
import { Profile } from "./pages/Profile";
import { ManageAutomation } from "./pages/ManageAutomation";
import { Contributors } from "./pages/Contributors";
import Developers from "./pages/Developers";

function App() {
  const { token } = useAuth();
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Navbar />}>
          <Route index element={token ? <Home /> : <Navigate to={"/login"} />}></Route>
          <Route path="/systems" element={token ? <Systems /> : <Navigate to={"/login"} />}></Route>
          <Route path="/services" element={token ? <Services /> : <Navigate to={"/login"} />}></Route>
          <Route path="/services/:id" element={token ? <DisplayService /> : <Navigate to={"/login"} />}></Route>
          <Route path="/systems/:id" element={token ? <DisplaySystem /> : <Navigate to={"/login"} />}></Route>
          <Route path="/network/:id" element={token ? <NetworkDiagram /> : <Navigate to={"/login"} />}></Route>
          <Route path="/tree/:id/:type" element={token ? <TreeDiagram /> : <Navigate to={"/login"} />}></Route>
          <Route path="/tidy/tree/:id/:type" element={token ? <TidyTree /> : <Navigate to={"/login"} />}></Route>
          <Route path="/indented/tree/:id/:type" element={token ? <IndentedTree /> : <Navigate to={"/login"} />}></Route>
          <Route path="/about" element={token ? <About /> : <Navigate to={"/login"} />}></Route>
          <Route path="/users" element={token ? <Users /> : <Navigate to={"/login"} />}></Route>
          <Route path="/locations/table" element={token ? <ActiveLocations /> : <Navigate to={"/login"} />}></Route>
          <Route path="/architecture" element={token ? <Architecture /> : <Navigate to={"/login"} />}></Route>
          <Route path="/services/view/:id" element={token ? <ViewService /> : <Navigate to={"/login"} />}></Route>
          <Route path="/systems/view/:id" element={token ? <ViewSystem /> : <Navigate to={"/login"} />}></Route>
          <Route path="/docs" element={token ? <Docs /> : <Navigate to={"/login"} />}></Route>
          <Route path="/docs/:id" element={token ? <Tiptap /> : <Navigate to={"/login"} />}></Route>
          <Route path="/tidy/tree/active_locations" element={token ? <TidyTreeLocations /> : <Navigate to={"/login"} />} ></Route>
          <Route path="/locations/aggregation" element={token ? <Locations /> : <Navigate to={"/login"} />} ></Route>
          <Route path="/locations/aggregation/table" element={token ? <LocationsTable /> : <Navigate to={"/login"} />} ></Route>
          <Route path="/contributors" element={token ? <Contributors /> : <Navigate to={"/login"} />} ></Route>
          <Route path="/developers" element={token ? <Developers /> : <Navigate to={"/login"} />} ></Route>

          <Route path="automations" element={token ? <AutomationsLayout /> : <Navigate to="/login" />}>
            <Route index element={<AutomationHome />} />
            <Route path="create" element={<CreateAutomation />} />
            <Route path="profile" element={<Profile />} />
            <Route path="manage" element={<ManageAutomation />} />
          </Route>

        </Route>

        <Route path="/register" element={!token ? <Register /> : <Navigate to={"/"} />}></Route>
        <Route path="/login" element={!token ? <Login /> : <Navigate to={"/"} />}></Route>

        <Route path="*" element={<NotFound />} />
        <Route path="forbidden" element={<Forbidden />} />
      </>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;

