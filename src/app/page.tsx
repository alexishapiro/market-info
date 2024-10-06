'use client'

import { type NextPage } from "next";
import { Card } from "@/components/ui/card";
import Link from "next/link";
const App : NextPage = async () => {

  return (
    <>
        <div className="relative">
          <div className="max-w-3xl mx-auto mt-8 p-6 bg-opacity-90 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">About Marketplace Info</h2>
            <Card className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-300">About Marketplace Info</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 max-w-2xl mx-auto">
                Marketplace Info is a comprehensive healthcare management solution designed to revolutionize the way healthcare facilities operate. Our integrated platform combines critical functions including:
              </p>
              <ul className="list-none space-y-2 mb-6 text-gray-700 dark:text-gray-300">
                <li>Product and Service Search</li>
                <li>Catalog Management</li>
                <li>Catergory Management</li>
                <li>File Upload</li>
                <li>User Management</li>
                <li>Role Management</li>
                <li>Matching Definitions and Retrieval</li>
              </ul>
            </Card>
            
            <Card className="bg-blue-50  p-6 rounded-lg mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-300">Our Mission</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By streamlining these essential processes into a single, user-friendly platform, Marketplace Info enhances operational efficiency, improves data gathering processes, and optimizes pricing, empowering providers to focus on what truly matters: delivering exceptional product and service outcomes.
              </p>
            </Card>
            
            <Card className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-300">Join Our Journey</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Join us in our journey to transform product and service delivery and management, creating a more efficient, effective, and product and service-centered ecosystem.
              </p>
              <p className="flex justify-center mb-4"/>
              <Link href="/login" className="bg-blue-600 text-white  py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300 dark:hover:bg-blue-600">
                  Get Started
              </Link>
            </Card>
          </div>
        </div>
    </>
  );
};

export default App;