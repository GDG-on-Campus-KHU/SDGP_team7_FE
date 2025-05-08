import { Outlet } from 'react-router-dom';

export const RootLayout = () => {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="relative w-full max-w-[430px] h-[100dvh] overflow-hidden bg-white shadow-lg mx-auto">
                <div className="h-full overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
