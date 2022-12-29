import "./App.css";
import { QueryClientProvider, QueryClient } from "react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

//
import RegisterForm from "./components/Authenication/RegisterForm";
import ProtectedRoutes from "./components/Authenication/ProtectedRoutes";
import LoginForm from "./components/Authenication/LoginForm";
import UserConfirm from "./components/Authenication/UserConfirm";
import Home from "./components/Home";
import PageNotFound from "./components/Authenication/PageNotFound";
import GroupInfo from "./components/Group/GroupInfo";
import GroupLink from "./components/Group/GroupLink";
import UserProfile from "./components/User/UserProfile";
import Presentation from "./components/Presentation/Presentation";
import PresentationEdit from "./components/Presentation/PresentationEdit";
import SlidePresent from "./components/Presentation/SlidePresent";
import LandingPage from "./components/LandingPage";
import PresentationCoList from "./components/Presentation/PresentationCoList";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <div>
                <div>
                    {/* <ToastContainer
                        position="top-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover={false}
                        theme="colored"
                    /> */}
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginForm />} />
                            <Route
                                path="/register"
                                element={<RegisterForm />}
                            />
                            <Route
                                path="/user/confirm"
                                element={<UserConfirm />}
                            />
                            <Route
                                path="/home/groups/join/:groupLink"
                                element={<GroupLink />}
                            />
                            <Route
                                path="/home/presentation/:presentId/vote"
                                element={<SlidePresent />}
                            />
                            <Route element={<ProtectedRoutes />}>
                                <Route path="/home" element={<Home />} />
                                <Route
                                    path="/home/presentation"
                                    element={<Presentation />}
                                />
                                <Route
                                    path="/home/presentation/:presentId"
                                    element={<PresentationEdit />}
                                />
                                <Route
                                    path="/home/presentation/:presentId/coList"
                                    element={<PresentationCoList />}
                                />
                                <Route
                                    path="/home/profile"
                                    element={<UserProfile />}
                                />
                                <Route
                                    path="/home/groups/:groupId"
                                    element={<GroupInfo />}
                                />
                            </Route>
                            <Route path="*" element={<PageNotFound />} />
                        </Routes>
                    </BrowserRouter>
                </div>
            </div>
        </QueryClientProvider>
    );
}

export default App;
