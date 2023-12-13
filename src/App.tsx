import {
  createBrowserRouter,
  RouterProvider,
  LoaderFunction,
  ActionFunction,
  Navigate,
} from "react-router-dom";

interface RouteCommon {
  loader?: LoaderFunction;
  action?: ActionFunction;
  ErrorBoundary?: React.ComponentType<any>;
}

interface IRoute extends RouteCommon {
  path: string;
  Element: React.ComponentType<any>;
}

interface Pages {
  [key: string]: {
    default: React.ComponentType<any>;
  } & RouteCommon
}

const pages: Pages = import.meta.glob("./pages/**/*.tsx", { eager: true });

const routes: IRoute[] = [];
for (const path of Object.keys(pages)) {
  const fileName = path.match(/\.\/pages\/(.*)\.tsx$/)?.[1];
  if (!fileName) {
    continue;
  }

  const normalizedPathName = fileName.includes("$")
    ? fileName.replace("$", ":")
    : fileName.replace(/\/index/, "");

  routes.push({
    path: fileName === "index" ? "/" : `/${normalizedPathName.toLowerCase()}`,
    Element: pages[path].default,
    loader: pages[path]?.loader as LoaderFunction | undefined,
    action: pages[path]?.action as ActionFunction | undefined,
    ErrorBoundary: pages[path]?.ErrorBoundary,
  });
}


export const ProtectedRoot = ({ children }: { children: React.ReactNode }) => {
  // if (localStorage.getItem("token")) {
  //   return <>{children}</>;
  // } else {
  //   return <Navigate to={`/login?redirect=${window.location.pathname}`} replace />;
  // }
  return <>{children}</>;
}

const restricted: string[] = [
  "/dashboard",
  "/dashboard/analytics",
  "/dashboard/:id",
];

const router = createBrowserRouter(
  routes.map(({ Element, ErrorBoundary, ...rest }) => {
    return {
      ...rest,
      element: restricted.includes(rest.path) ? (
        <ProtectedRoot>
          <Element />
        </ProtectedRoot>
      ) : <Element />,
      ...(ErrorBoundary && { errorElement: <ErrorBoundary /> }),
    };
  })
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
