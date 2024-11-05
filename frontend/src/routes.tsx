import App from "./App.tsx";
import SessionListPage from "../pages/SessionListPage.tsx";
export const routes = [
  {
    element: <App />,
    path: "/",
  },
  {
    element: <>화상회의 페이지</>,
    path: '/session/:sessionId'
  },
  {
    element: <SessionListPage/>,
    path: '/sessions'
  },
  {
    element: <>로그인 페이지</>,
    path: '/login',
  },
  {
    element: <>세션 생성 페이지</>,
    path: '/sessions/create'
  },
  {
    element: <>에러 페이지</>,
    path: '/*'
  }
];
