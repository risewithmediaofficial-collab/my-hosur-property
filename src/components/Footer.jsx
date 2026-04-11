import { NavLink } from "react-router-dom";
import { primaryNavLinks } from "../constants/navigation";
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const Footer = () => (
  <footer className="mt-auto border-t border-slate-200 bg-gradient-to-b from-white/95 to-slate-50/80 pt-12 pb-6">
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-4">
        {/* Company Info */}
        <div className="space-y-3">
          <h3 className="inline-flex items-center gap-2 font-bold text-slate-900">
            <BuildingOffice2Icon className="h-5 w-5 text-blue-600" />
            MyHosurProperty
          </h3>
          <p className="text-sm text-slate-600">Minimal, reliable, and professional property discovery and listing platform.</p>
          <div className="flex gap-3 pt-2">
            <a href="#" aria-label="Facebook" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 002.856-3.915a10.002 10.002 0 01-2.856 1.095a5.001 5.001 0 00-8.322-4.563a5.001 5.001 0 00-1.642 6.41a14.051 14.051 0 01-10.186-5.14a5 5 0 001.549 6.659a5.004 5.004 0 01-2.265-.617v.061a5 5 0 004.008 4.905a5 5 0 01-2.258.085a5.001 5.001 0 004.678 3.488a10.006 10.006 0 01-6.177 2.125A14.034 14.034 0 0027 20.457a10 10 0 003.953-2.487z"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.05-8.81 0-9.728h3.554v1.375c.425-.655 1.187-1.587 2.882-1.587 2.105 0 3.685 1.375 3.685 4.331v5.609zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.956.77-1.71 1.914-1.71 1.144 0 1.915.754 1.915 1.71 0 .951-.771 1.71-1.915 1.71zm1.575 11.597H3.762V9.579h3.15v10.873zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Navigation</h4>
          <nav className="flex flex-col space-y-2">
            {primaryNavLinks.map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                className="text-sm text-slate-600 hover:text-blue-600 transition font-medium"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Services */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Services</h4>
          <nav className="flex flex-col space-y-2 text-sm">
            <a href="#" className="text-slate-600 hover:text-blue-600 transition font-medium">Buy Property</a>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition font-medium">Rent Property</a>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition font-medium">Sell Property</a>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition font-medium">Post Property</a>
          </nav>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Contact & Address</h4>
          <div className="space-y-2 text-sm">
            <p className="inline-flex items-center gap-2 text-slate-600">
              <EnvelopeIcon className="h-4 w-4 text-blue-600" />
              <a href="mailto:support@myhosurproperty.com" className="hover:text-blue-600 transition font-medium">support@myhosurproperty.com</a>
            </p>
            <p className="inline-flex items-start gap-2 text-slate-600">
              <MapPinIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="font-medium">Hosur, Krishnagiri District, Tamil Nadu, India</span>
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-slate-200"></div>

      {/* Copyright */}
      <div className="flex flex-col items-center justify-between gap-2 text-xs font-medium text-slate-600 sm:flex-row">
        <p>© 2026 MyHosurProperty. All Rights Reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-900 transition">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900 transition">Terms of Service</a>
          <a href="#" className="hover:text-slate-900 transition">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
