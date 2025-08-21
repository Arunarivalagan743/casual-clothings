import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import { clearCart } from '../store/cartProduct'
import toast from 'react-hot-toast'
import AxiosTostError from '../utils/AxiosTostError'

function AdminMenue({close}) {
    const user = useSelector((state)=> state?.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [showAdminOptions, setShowAdminOptions] = useState(true)
    
    // Add Inter and Playfair Display fonts
    useEffect(() => {
        const linkInter = document.createElement('link');
        linkInter.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
        linkInter.rel = 'stylesheet';
        document.head.appendChild(linkInter);
        
        const linkPlayfair = document.createElement('link');
        linkPlayfair.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap';
        linkPlayfair.rel = 'stylesheet';
        document.head.appendChild(linkPlayfair);
        
        return () => {
            document.head.removeChild(linkInter);
            document.head.removeChild(linkPlayfair);
        };
    }, []);

    const handleLogOut = async()=>{
        try {
            const response = await Axios({...SummaryApi.userLogOut})
            console.log("Logout Response:",response)
            if(response.data.success){
                if(close){
                    close()
                }
                toast.success("Logged out successfully")
                dispatch(logout())
                dispatch(clearCart())
                // Make sure to specifically remove userId along with clearing storage
                localStorage.removeItem("userId")
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                localStorage.removeItem("userSession")
                localStorage.clear() // Clear any remaining items
                navigate("/")
            }
        } catch (error) {
            AxiosTostError(error)       
        }
    }

    const handleClose = () =>{
        if(close){
            close()
        }
    }

    return (
        <div className="bg-transparent font-['Inter'] w-full transition-all duration-300">
            {/* Admin Info Header - Simplified */}
            <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-black tracking-tight font-['Playfair_Display']">Admin Panel</h3>
                    <p className="text-xs text-gray-600 truncate font-['Inter']">
                        {user?.name || user?.email}
                    </p>
                </div>
                <span className="text-xs bg-black text-white px-2 py-1 rounded-full font-medium">
                    Admin
                </span>
            </div>

            {/* Admin Menu Links - Simplified */}
            <div className='space-y-1'>
                <Link onClick={handleClose} to="/dashboard/admin" className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded transition-all group w-full'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="text-sm font-medium group-hover:text-black font-['Inter']">Dashboard</span>
                </Link>

                <Link onClick={handleClose} to="/dashboard/product" className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded transition-all group w-full'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium group-hover:text-black font-['Inter']">Products</span>
                </Link>

                <Link onClick={handleClose} to="/dashboard/orders-admin" className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded transition-all group w-full'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium group-hover:text-black font-['Inter']">Orders</span>
                </Link>

                <Link onClick={handleClose} to="/dashboard/user-management" className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded transition-all group w-full'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="text-sm font-medium group-hover:text-black font-['Inter']">Users</span>
                </Link>

                <Link onClick={handleClose} to="/dashboard/payment-management" className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded transition-all group w-full'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium group-hover:text-black font-['Inter']">Payments</span>
                </Link>

                <Link onClick={handleClose} to="/dashboard/profile" className='flex items-center gap-3 p-3 hover:bg-gray-50 rounded transition-all group w-full'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium group-hover:text-black font-['Inter']">Profile</span>
                </Link>
            </div>

            {/* Logout Button */}
            <div className="pt-3 border-t border-gray-100">
                <button onClick={handleLogOut} className='flex items-center justify-center gap-2 w-full p-2.5 text-red-600 hover:text-white hover:bg-red-600 rounded transition-all duration-300 font-medium bg-white border border-red-100 hover:border-red-600 font-["Inter"]'>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </div>
    )
}

export default AdminMenue
