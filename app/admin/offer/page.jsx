'use strict';
'use client';

import React from 'react';
import { useState, useEffect, useContext, Fragment } from 'react';
import { BellIcon, HomeIcon, UsersIcon, ArrowRightStartOnRectangleIcon, CogIcon, ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import Link from 'next/link';
import { AuthContext } from '../../context/AuthContext';

const User_admin = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [offers, setOffers] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminAvatar, setAdminAvatar] = useState(''); // State to store the admin's avatar
    const token = Cookies.get('token');
    const { logOut } = useContext(AuthContext);
    // const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
      axios.get('http://localhost:8000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}` // replace `token` with your admin token
        }
      })
      .then((response) => {
        console.log('Users fetched successfully:', response.data); // Log the data to the console
        // Assuming the admin's data is the first one in the response
        // and the avatar filename is stored in the 'avatar' field
        const adminData = response.data.users.find(user => user.role === 'admin');
        setAdminAvatar(adminData.avatar); // Update the admin avatar in state
        setUsers(response.data.users); // Update the users in state
        setLoading(false); // Hide the loading state
        setError(null); // Clear the error message
      })
      .catch(error => {
        console.error('Failed to fetch users:', error.message);
        setError(error.message);
      });
    }, [token]); // Add token as a dependency

    useEffect(() => {
      const fetchData = async (retry = 0) => { // Retry fetching the offers up to 5 times
          try { // Try to fetch the offers
              const response = await axios.get('http://localhost:8000/api/offers');
              console.log('Offers fetched successfully', response.data);
              setOffers(response.data.offers);
              setLoading(false);
              setError(null);
          } catch (error) { // If an error occurs
              if (error.response && error.response.status === 429 && retry < 5) { // If status is 429 and we've tried less than 5 times, retry after delay
                  // If status is 429 and we've tried less than 5 times, retry after delay
                  setTimeout(() => fetchData(retry + 1), Math.pow(2, retry) * 1000); // Exponential backoff
              } else {
                  console.error('Failed to fetch offers:', error.message);
                  setError(error.message);
                  setLoading(false);
              }
          }
      };
      fetchData(); // Fetch the offers
    }, []);

    const deleteOffer = (offerId) => {
        axios.delete(`http://localhost:8000/api/deleteOffer/${offerId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then((response) => {
            console.log('Offer deleted successfully:', response.data);
            const newOffers = offers.filter((offer) => offer.id !== offerId); // Remove the offer from the offers state
            setOffers(newOffers); // Update the offers state
            window.alert('Offer deleted successfully');
        })
        .catch((error) => {
            console.error('Failed to delete offer:', error.message);
            window.alert('Failed to delete offer !', error.message);
        });
    };

    const confirmOffer = (offerId) => {
        axios.put(`http://localhost:8000/api/offers/accept/${offerId}`, {}, {
            headers: {
              'Authorization': `Bearer ${token}` // Send the token in the headers
            }
        })
        .then((response) => {
            console.log('Offer accepted successfully:', response.data);
            const newOffers = offers.map((offer) => { // Update the status of the offer in the offers state
                if (offer.id === offerId) {
                    offer.status = 'accepted';
                }
                return offer;
            });
            setOffers(newOffers); // Update the offers state
            window.alert('Offer accepted successfully');
        })
        .catch((error) => {
            console.error('Failed to accept offer:', error.message);
            window.alert('Failed to accept offer !', error.message);
        });
    };

    const rejectOffer = (offerId) => {
        axios.put(`http://localhost:8000/api/offers/reject/${offerId}`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
        })
        .then((response) => {
            console.log('Offer rejected successfully:', response.data);
            const newOffers = offers.map((offer) => { // Update the status of the offer in the offers state
                if (offer.id === offerId) {
                    offer.status = 'inaccepted';
                }
                return offer;
            });
            setOffers(newOffers); // Update the offers state
            window.alert('Offer rejected successfully');
        })
        .catch((error) => {
            console.error('Failed to reject offer:', error.message);
            window.alert('Failed to reject offer !', error.message);
        });
    };

    const archiveOffer = (offerId) => {
        axios.delete(`http://localhost:8000/api/offers/archive/${offerId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
        })
        .then((response) => {
            console.log('Offer archived successfully:', response.data);
            const newOffers = offers.filter((offer) => offer.id !== offerId); // Remove the offer from the offers state
            setOffers(newOffers); // Update the offers state
            window.alert('Offer archived successfully');
        })
        .catch((error) => {
          console.error('Failed to archive offer:', error.message);
          console.error('Error response body:', error.response.data);
          window.alert('Failed to archive offer !', error.message);
        });
    };

  return (
    <>
      <div className="bg-orange-100 min-h-screen">
        <div className="fixed bg-white text-blue-800 px-10 py-1 z-10 w-full">
          <div className="flex items-center justify-between py-2 text-5x1">
          <div className="font-bold text-blue-900 text-xl flex items-center">
            Admin<span className="text-orange-600">Panel</span>
          </div>
            <div className="flex items-center text-gray-500">
            <BellIcon className="h-10 w-20 p-2 "/>
            <div className="relative">
              <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="rounded-md text-black-300 bg-white-700 pl-10 pr-4 py-2 w-full"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="gray" className="w-6 h-6 absolute left-2 top-1/2 transform -translate-y-1/2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              {/* <MagnifyingGlassIcon className="h-5 w-5 mr-2 inline-block text-gray-600" /> */}
            </div>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <Image src={`http://localhost:8000/users/avatar/${adminAvatar}`} alt="Admin Avatar" width={60} height={60} className="h-8 w-8 rounded-full" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1 ">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/admin/profile"
                            className={`${
                              active ? 'bg-gray-100' : 'text-gray-900'
                            } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                          >
                            <UserCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="#"
                            className={`${
                              active ? 'bg-gray-100' : 'text-gray-900'
                            } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                          >
                            <CogIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => ( // Add the active state to the Menu.Item component
                          <Link
                            href="#"
                            onClick={() => {
                              logOut();
                              alert("You're logged out."); // Display a window alert
                            }}
                            className={`${ // Add the active class to the className attribute
                              active ? 'bg-gray-100' : 'text-red-900'
                            } group flex rounded-md items-center w-full px-2 py-2 text-sm`} // Add the active class to the className attribute
                          >
                            <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Logout
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
        <div className="flex flex-row pt-24 px-10 pb-4">
          <div className="w-1/12 mr-6">
            <div className="bg-white rounded-xl shadow-lg mb-6 px-6 py-4">
              <a href="/admin" className="inline-block text-gray-600 hover:text-black my-4 w-full">
              <HomeIcon className="h-5 w-5 mr-2 inline-block" />
              </a>
              <a href="/admin/user" className="inline-block text-gray-600 hover:text-black my-4 w-full">
              <UsersIcon className="h-5 w-5 mr-2 inline-block" />
              </a>
              <a href="#" className="inline-block text-gray-600 hover:text-black my-4 w-full">
               <ShoppingBagIcon className="h-5 w-5 mr-2 inline-block" />
              </a>
            </div>
            <div className="bg-white rounded-xl shadow-lg mb-6 px-6 py-4">
              <a href="/admin/profile" className="inline-block text-gray-600 hover:text-black my-4 w-full">
                <UserCircleIcon className="h-5 w-5 mr-2 inline-block" />
              </a>
              <a href="" className="inline-block text-gray-600 hover:text-black my-4 w-full">
                <CogIcon className="h-5 w-5 mr-2 inline-block" />
              </a>
              <a href="" className="inline-block text-gray-600 hover:text-black my-4 w-full">
                <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2 inline-block" />
              </a>
            </div>
          </div>
          <div className="w-8/12 mx-auto">
            {loading ? (
                <div
                  aria-label="Loading..."
                  className="flex items-center space-x-2 content-center justify-center h-screen w-screen fixed top-0 left-0 z-50"
                  role="status"
                  >
                  <svg
                    className="h-20 w-20 animate-spin stroke-gray-500"
                    viewBox="0 0 256 256"
                  >
                    <line
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="24"
                      x1="128"
                      x2="128"
                      y1="32"
                      y2="64"
                    />
                    <line
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="24"
                      x1="195.9"
                      x2="173.3"
                      y1="60.1"
                      y2="82.7"
                    />
                    <line
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="24"
                      x1="224"
                      x2="192"
                      y1="128"
                      y2="128"
                    >
                    </line>
                    <line
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="24"
                      x1="195.9"
                      x2="173.3"
                      y1="195.9"
                      y2="173.3"
                    />
                    <line
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="24"
                      x1="128"
                      x2="128"
                      y1="224"
                      y2="192"
                    >
                    </line>
                    <line
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="24"
                      x1="60.1"
                      x2="82.7"
                      y1="195.9"
                      y2="173.3"
                    />
                    <line
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="24"
                      x1="32"
                      x2="64"
                      y1="128"
                      y2="128"
                    />
                    <line
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="24"
                      x1="60.1"
                      x2="82.7"
                      y1="60.1"
                      y2="82.7"
                    >
                    </line>
                  </svg>
                  <span className="text-4xl font-medium text-gray-500">
                    Loading...
                  </span>
                </div>
            ) : error ? ( 
              <div className="text-red-500 text-center font-bold text-2xl">
                {error}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center'>
                  <table className="w-full divide-y divide-gray-200 overflow-x-auto">
                  <thead className="bg-gray-50">
                      <tr>
                      <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                      >
                          Title
                      </th>
                      <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                      >
                          Description
                      </th>
                      <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                      >
                          Price
                      </th>
                      <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                      >
                          Status
                      </th>
                      <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                      >
                          Confirmation
                      </th>
                      <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          scope="col"
                      >
                          Actions
                      </th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {offers.map((offer) => (
                      <tr key={offer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                              <Image className="h-10 w-10 rounded-full" src={`http://localhost:8000/offers/images/${offer.image}`} alt={offer.title} width={60} height={60} />  
                          </div>
                          <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                              {offer.title}
                              </div>
                              <div className="text-xs text-blue-500 hover:text-blue-900">
                                  <Link href="/admin/offer_details">
                                    show details
                                  </Link>
                              </div>
                          </div>
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {offer.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {offer.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex leading-5 hover:text-white front-semibold rounded-full text-xs ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)} {/*Capitalize the first letter*/}
                          </span> 
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {offer.status === 'accepted' && ( // If the offer is accepted, don't show the buttons
                          <div className="flex space-x-2">
                            <button
                              onClick={() => rejectOffer(offer.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Deny
                            </button>
                          </div>
                        )}
                        {offer.status === 'inaccepted' && ( // If the offer is rejected, don't show the buttons
                          <div className="flex space-x-2">
                            <button
                              onClick={() => confirmOffer(offer.id)}
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectOffer(offer.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Deny
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap  text-sm font-medium">
                        <button>
                          <span className="ml-2 text-blue-600 hover:text-blue-900" onClick={() => archiveOffer(offer.id)}>Archive</span>
                        </button>
                        <button>
                          <span className="ml-2 text-red-600 hover:text-red-900" onClick={() => deleteOffer(offer.id)}>Delete</span>
                        </button>
                      </td>
                      </tr>
                      ))
                  }
                  </tbody>
                  </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default User_admin;