import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { Send } from "lucide-react";
import asset from "@/public";

const Footer = () => {
  return (
    <footer>
      <div className="container mx-auto grid md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <Image src={asset.ACR_white} alt="ACR Logo" width={230} height={95} />
          <p className="mt-4 text-sm">
            Leave accounting to us, so you can focus on growing your business.
          </p>
          <div className="social-icons">
            <FaInstagram />
            <FaFacebookF />
            <FaTwitter />
            <FaYoutube />
          </div>
        </div>

        {/* Useful Links */}
        <div>
          <h3>Useful links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="#">ACR-Accounting Academy</Link>
            </li>
            <li>
              <Link href="#">Outlook Mail</Link>
            </li>
            <li>
              <Link href="#">Zoho Inventory</Link>
            </li>
            <li>
              <Link href="#">Zoho Books</Link>
            </li>
          </ul>
        </div>

        {/* Office Address */}
        <div>
          <h3>Our office address</h3>
          <p className="mt-4">Gasabo, Kimironko, 2 KG 167 St</p>
          <p>Near Simba Supermarket</p>
          <p>Mobile: +250787028385</p>
          <p>Email: info@accountants.co.rw</p>
          <div className="mt-4">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d643.2320627305279!2d30.124604829996805!3d-1.9508099287665062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca564d26bdb27%3A0x69fdb37db2dd62a!2sACR-ONLINE%20ACCOUNTING%20SERVICES%20LTD!5e0!3m2!1sen!2srw!4v1744965167223!5m2!1sen!2srw"
              width="300"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            >
            </iframe>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3>Stay up to date</h3>
          <div className="mt-4">
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="First name"
                className="w-1/2 px-3 py-2 text-black rounded-md focus:outline-none"
              />
              <input
                type="text"
                placeholder="Last name"
                className="w-1/2 px-3 py-2 text-black rounded-md focus:outline-none"
              />
            </div>
            <div className="relative">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-3 py-2 text-black rounded-md focus:outline-none"
              />
              <Send className="absolute right-2 top-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-white/20 mt-8 pt-4 flex flex-col md:flex-row justify-between text-sm">
        <p>© 2025 ACR-ONLINE ACCOUNTING SERVICES LTD. All rights reserved</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <Link href="#">Home</Link>
          <Link href="#">News</Link>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Services</Link>
          <Link href="#">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
