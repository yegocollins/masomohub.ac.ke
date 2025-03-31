import { Outlet, Link } from "react-router-dom";

export default function Navbar() {
    return (
        <>
            <nav className="flex justify-between items-center bg-white p-4 px-6 shadow-md  w-full">
                {/* Logo or Brand Name */}
                <div className="text-xl font-bold text-gray-800">
                    <Link to="/">educonnect</Link>
                </div>

                {/* Navigation Links */}
                <div className="space-x-4">
                    <Link to="/login" className="text-gray-800 hover:text-blue-500">Login</Link>
                    <Link to="/signup" className="text-gray-800 hover:text-blue-500">Sign up</Link>
                </div>
            </nav>
            <Outlet />
        </>
    );
}
